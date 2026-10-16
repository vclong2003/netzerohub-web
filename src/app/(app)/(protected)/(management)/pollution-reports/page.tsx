"use client";

import Button from "@/components/Button";
import Table from "@/components/Table";
import { TableProps, Tag, Pagination } from "antd";
import styled from "styled-components";
import { useState } from "react";
import useDebounce from "@/hooks/hooks.debounce";
import PageHeading from "./_page-heading";
import {
  EPollutionReportStatus,
  EPollutionType,
  IPollutionReport,
  PollutionReportQueries,
} from "@/services/service.pollution-report"; // 👈 Update to your service file path
import { generateSingleReportPdf } from "./_pdf-helpers";
import { UpdateStatusModal } from "./_update-status-modal";

const statusColors: Record<EPollutionReportStatus, string> = {
  [EPollutionReportStatus.Pending]: "gold",
  [EPollutionReportStatus.Acknowledged]: "blue",
  [EPollutionReportStatus.Processed]: "cyan",
  [EPollutionReportStatus.Resolved]: "green",
  [EPollutionReportStatus.Rejected]: "red",
};

const typeColors: Record<EPollutionType, string> = {
  [EPollutionType.Litter]: "orange",
  [EPollutionType.Water]: "blue",
  [EPollutionType.Land]: "volcano",
  [EPollutionType.Air]: "purple",
  [EPollutionType.Noise]: "magenta",
};

const PAGE_SIZE = 10;

export default function PollutionReports() {
  const [page, setPage] = useState(1);
  const [searchValue, setSearchValue] = useDebounce<string>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // 1. Fetch real reports from API
  const { data, isLoading } = PollutionReportQueries.useGetPollutionReports({
    page: page - 1, // 0-indexed for backend pagination
    pageSize: PAGE_SIZE,
    search: searchValue,
  });

  const reports = data?.data || [];
  const totalReports = data?.totalElements ? data?.totalElements : 0;

  // 2. Download PDF / ZIP
  const handleDownloadReports = async () => {
    const selectedItems = reports.filter((item) =>
      selectedRowKeys.includes(item.id),
    );
    if (selectedItems.length === 0) return;

    try {
      setIsExporting(true);

      // Single report -> direct PDF
      if (selectedItems.length === 1) {
        const report = selectedItems[0];
        const doc = await generateSingleReportPdf(report);
        doc.save(`Pollution_Report_${report.id}_${report.type}.pdf`);
        return;
      }

      // Multiple reports -> Zip
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();

      await Promise.all(
        selectedItems.map(async (report) => {
          const doc = await generateSingleReportPdf(report);
          const pdfBlob = doc.output("blob");
          zip.file(`Pollution_Report_${report.id}_${report.type}.pdf`, pdfBlob);
        }),
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });

      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Pollution_Reports_Batch_${Date.now()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Failed to generate documents", err);
    } finally {
      setIsExporting(false);
    }
  };

  const tableProps: TableProps = {
    loading: isLoading,
    dataSource: reports,
    pagination: false,
    rowKey: "id",
    rowSelection: {
      type: "checkbox",
      selectedRowKeys,
      onChange: (keys) => {
        setSelectedRowKeys(keys as string[]);
      },
    },
    columns: [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 50,
        align: "center",
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (title: string, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{title}</div>
            <div
              style={{
                fontSize: 13,
                color: "var(--c-gray, #666)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 200,
              }}>
              {record.description}
            </div>
          </div>
        ),
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        width: 80,
        render: (type: EPollutionType) => (
          <Tag color={typeColors[type] || "default"}>{type}</Tag>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 130,
        render: (status: EPollutionReportStatus) => (
          <Tag color={statusColors[status] || "default"}>{status}</Tag>
        ),
      },
      {
        title: "Location",
        dataIndex: "address",
        key: "address",
      },
      {
        title: "Photo",
        dataIndex: "imageUrl",
        key: "imageUrl",
        width: 100,
        align: "center",
        render: (imageUrl?: string) =>
          imageUrl ? (
            <S.Thumbnail
              src={imageUrl}
              alt="report"
              onClick={(e) => {
                e.stopPropagation();
                window.open(imageUrl, "_blank");
              }}
            />
          ) : (
            <span style={{ color: "#999", fontSize: 12 }}>None</span>
          ),
      },
      {
        title: "Reported",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 80,
        render: (date: string) =>
          date ? new Date(date).toLocaleDateString("en-AU") : "-",
      },
    ],
  };

  return (
    <S.PollutionReports>
      <PageHeading
        title="NSW EPA - Pollution Reports"
        initSearchValue={searchValue}
        onSearch={(val) => {
          setSearchValue(val);
          setPage(1); // Reset to page 1 on search
        }}
      />
      <S.TableContainer>
        {/* Table header buttons */}
        <S.BtnsContainer>
          <S.StatusBtn
            disabled={selectedRowKeys.length === 0}
            onClick={() => setIsStatusModalOpen(true)}>
            Update Status{" "}
            {selectedRowKeys.length > 0 && `(${selectedRowKeys.length})`}
          </S.StatusBtn>

          <S.DownloadBtn
            disabled={selectedRowKeys.length === 0 || isExporting}
            onClick={handleDownloadReports}>
            {isExporting
              ? "Packaging..."
              : selectedRowKeys.length > 1
                ? `Download ZIP (${selectedRowKeys.length} PDFs)`
                : selectedRowKeys.length === 1
                  ? "Download PDF"
                  : "Download"}
          </S.DownloadBtn>

          {selectedRowKeys.length > 0 && (
            <S.CancelBtn onClick={() => setSelectedRowKeys([])}>
              Clear
            </S.CancelBtn>
          )}
        </S.BtnsContainer>
        <S.Divider />

        {/* Table */}
        <Table {...tableProps} />
        <S.Divider />

        {/* Server-side Pagination */}
        <Pagination
          current={page}
          total={totalReports}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          showSizeChanger={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
        />
      </S.TableContainer>

      {/* Update status modal */}
      {selectedRowKeys.length > 0 && (
        <UpdateStatusModal
          isOpen={isStatusModalOpen}
          reportIds={selectedRowKeys.map((id) => parseInt(id, 10))}
          onClose={() => setIsStatusModalOpen(false)}
          onDelete={() => {
            setSelectedRowKeys([]);
            setIsStatusModalOpen(false);
          }}
        />
      )}
    </S.PollutionReports>
  );
}

namespace S {
  export const PollutionReports = styled.div`
    width: 100%;
  `;

  export const TableContainer = styled.div`
    padding: var(--s-5);
    background-color: var(--c-white);
    border-radius: var(--br-3);
  `;

  export const Divider = styled.div`
    width: 100%;
    height: 1px;
    background-color: var(--c-white-4);
    margin: var(--s-3) 0;
  `;

  export const BtnsContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: var(--s-1);
  `;

  export const StatusBtn = styled(Button)`
    background-color: var(--c-blue-1);
    color: var(--c-blue);
    display: flex;
    align-items: center;
  `;

  export const DownloadBtn = styled(Button)`
    background-color: var(--c-green-1, #e6f7f0);
    color: var(--c-green, #0b6267);
    display: flex;
    align-items: center;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;

  export const CancelBtn = styled(Button)`
    background-color: var(--c-white-1);
    color: var(--c-black);
  `;

  export const Thumbnail = styled.img`
    width: 36px;
    height: 36px;
    border-radius: 4px;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s;
    &:hover {
      transform: scale(1.1);
    }
  `;
}
