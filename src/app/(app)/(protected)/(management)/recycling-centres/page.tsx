"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, Pagination, type TableProps } from "antd";
import Table from "@/components/Table";
import useDebounce from "@/hooks/hooks.debounce";
import { RecyclingCentersQueries } from "@/services/service.recycling-centers";
import Add from "@/assets/icons/add.png";
import Trash from "@/assets/icons/trash.png";
import PageHeading from "./_page-heading";
import { DeleteCentreModal } from "./_delete-centre-modal";
import * as S from "./_styles";

const PAGE_SIZE = 10;

export default function RecyclingCentres() {
  const [page, setPage] = useState(1);
  const [selectedRowKey, setSelectedRowKey] = useState<number>();
  const [searchValue, setSearchValue] = useDebounce<string>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();
  const { data, isLoading, error, refetch } =
    RecyclingCentersQueries.useGetCentres({
      page: page - 1,
      pageSize: PAGE_SIZE,
      name: searchValue,
    });
  const centres = data?.data || [];
  const tableProps: TableProps = {
    loading: isLoading,
    dataSource: centres,
    pagination: false,
    rowKey: "id",
    rowSelection: {
      type: "radio",
      selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
      onChange: (keys) => setSelectedRowKey(keys[0] as number),
      getCheckboxProps: (record) => ({ "aria-label": `Select ${record.name}` }),
    },
    onRow: (record) => ({
      style: { cursor: "pointer" },
      onClick: () => router.push(`/recycling-centres/${record.id}`),
    }),
    columns: [
      { title: "ID", dataIndex: "id", width: 48, align: "center" },
      {
        title: "Center Name",
        dataIndex: "name",
      },
      { title: "Address", dataIndex: "address" },
      {
        title: "Images",
        dataIndex: "imageUrls",
        align: "center",
        width: 100,
        render: (imageUrls) =>
          imageUrls.length > 0 ? (
            <span>{imageUrls.length} image(s)</span>
          ) : (
            <span>None</span>
          ),
      },
      {
        title: "Info Sheets",
        dataIndex: "infoSheetUrls",
        align: "center",
        width: 100,
        render: (infoSheetUrls) =>
          infoSheetUrls.length > 0 ? (
            <span>{infoSheetUrls.length} sheet(s)</span>
          ) : (
            <span>None</span>
          ),
      },
      {
        title: "Opening Hours",
        key: "hours",
        width: 130,
        render: (_, record) =>
          [record.openingTime.slice(0, 5), record.closingTime.slice(0, 5)]
            .filter(Boolean)
            .join(" – ") || "—",
      },
    ],
  };

  return (
    <S.Page>
      {selectedRowKey && (
        <DeleteCentreModal
          isOpen={showDeleteModal}
          centre={centres.find((centre) => centre.id === selectedRowKey)}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            setSelectedRowKey(undefined);
            setShowDeleteModal(false);
            setPage(1);
          }}
        />
      )}
      <PageHeading
        title="WCC - Community Recycling Centers"
        variant="search"
        initSearchValue={searchValue}
        onSearch={(value) => {
          setSearchValue(value);
          setPage(1);
          setSelectedRowKey(undefined);
        }}
      />

      {error && (
        <S.Feedback role="alert">
          <Alert
            type="error"
            title={error.message}
            showIcon
            action={
              <S.CancelButton onClick={() => void refetch()}>
                Retry
              </S.CancelButton>
            }
          />
        </S.Feedback>
      )}

      <S.TableContainer>
        <S.Buttons>
          <S.CancelButton disabled={isLoading} onClick={() => void refetch()}>
            Refresh
          </S.CancelButton>
          <S.AddButton onClick={() => router.push(`/recycling-centres/add`)}>
            <S.ButtonIcon src={Add.src} alt="" />
            Add
          </S.AddButton>
          <S.DeleteButton
            disabled={!selectedRowKey}
            onClick={() => setShowDeleteModal(true)}>
            <S.ButtonIcon src={Trash.src} alt="" />
            Delete
          </S.DeleteButton>
          {selectedRowKey && (
            <S.CancelButton onClick={() => setSelectedRowKey(undefined)}>
              Cancel
            </S.CancelButton>
          )}
        </S.Buttons>
        <S.Divider />
        <Table {...tableProps} />
        <S.Divider />
        <Pagination
          current={page}
          total={data?.totalElements || 0}
          pageSize={PAGE_SIZE}
          onChange={(value) => {
            setPage(value);
            setSelectedRowKey(undefined);
          }}
          showSizeChanger={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
        />
      </S.TableContainer>
    </S.Page>
  );
}
