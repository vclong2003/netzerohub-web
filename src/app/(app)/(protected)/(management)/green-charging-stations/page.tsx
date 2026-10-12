"use client";

import Button from "@/components/Button";
import Table from "@/components/Table";
import Add from "@/assets/icons/add.png";
import Trash from "@/assets/icons/trash.png";
import { GreenChargingStationsQueries } from "@/services/service.green-charging-stations";
import { TableProps } from "antd";
import styled from "styled-components";
import { Pagination } from "antd";
import PageHeading from "./_page-heading";
import { useState } from "react";
import useDebounce from "@/hooks/hooks.debounce";
import { useRouter } from "next/navigation";
import { DeleteStationModal } from "./_delete-station-modal";

const PAGE_SIZE = 10;

export default function GreenChargingStations() {
  const [page, setPage] = useState(1);
  const [selectedRowKey, setSelectedRowKey] = useState<number>();
  const [searchValue, setSearchValue] = useDebounce<string>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const router = useRouter();

  const { data, isLoading } = GreenChargingStationsQueries.useGetStations({
    page: page - 1,
    pageSize: PAGE_SIZE,
    name: searchValue,
  });
  const stations = data?.data || [];

  const tableProps: TableProps = {
    loading: isLoading,
    dataSource: stations,
    pagination: false,
    rowKey: "id",
    rowSelection: {
      type: "radio",
      selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
      onChange: (selectedRowKeys) => {
        setSelectedRowKey(selectedRowKeys[0] as number);
      },
    },
    onRow: (record) => ({
      style: { cursor: "pointer" },
      onClick: () => {
        router.push(`/green-charging-stations/${record.id}`);
      },
    }),
    columns: [
      {
        title: "ID",
        dataIndex: "id",
        key: "id",
        width: 48,
        align: "center",
      },
      {
        title: "Station Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Renewable Energy %",
        dataIndex: "renewableEnergyPercent",
        key: "renewableEnergyPercent",
        width: 160,
      },

      {
        title: "Latitude",
        dataIndex: "latitude",
        key: "latitude",
        width: 100,
      },
      {
        title: "Longitude",
        dataIndex: "longitude",
        key: "longitude",
        width: 100,
      },
      {
        title: "Images",
        dataIndex: "imageUrls",
        key: "imageUrls",
        render: (imageUrls: string[]) => imageUrls?.length || 0,
        align: "center",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
        align: "center",
      },
    ],
  };

  return (
    <S.GreenChargingStations>
      {!!selectedRowKey && (
        <DeleteStationModal
          isOpen={showDeleteModal}
          station={stations.find((station) => station.id === selectedRowKey)}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            setSelectedRowKey(undefined);
            setShowDeleteModal(false);
          }}
        />
      )}
      <PageHeading
        title="NRMA - Green EV Charging Solutions"
        variant="search"
        initSearchValue={searchValue}
        onSearch={(val) => {
          setSearchValue(val);
          setPage(1);
        }}
      />
      <S.TableContainer>
        {/* Table header -------------------------------------------- */}
        <S.BtnsContainer>
          <S.AddBtn onClick={() => router.push("/green-charging-stations/add")}>
            <S.BtnIcon src={Add.src} />
            Add
          </S.AddBtn>

          <S.DeleteBtn
            disabled={!selectedRowKey}
            onClick={() => setShowDeleteModal(true)}>
            <S.BtnIcon src={Trash.src} />
            Delete
          </S.DeleteBtn>

          {!!selectedRowKey && (
            <S.CancelBtn onClick={() => setSelectedRowKey(undefined)}>
              Cancel
            </S.CancelBtn>
          )}
        </S.BtnsContainer>
        <S.Divider />

        {/* Table ---------------------------------------------------- */}
        <Table {...tableProps} />
        <S.Divider />

        {/* Pagination ----------------------------------------------- */}
        <Pagination
          current={page}
          total={data?.totalElements || 0}
          pageSize={PAGE_SIZE}
          onChange={setPage}
          showSizeChanger={false}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
        />
      </S.TableContainer>
    </S.GreenChargingStations>
  );
}

namespace S {
  export const GreenChargingStations = styled.div`
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
    gap: var(--s-1);
  `;

  export const AddBtn = styled(Button)`
    background-color: var(--c-blue-1);
    color: var(--c-blue);
    display: flex;
    align-items: center;
  `;

  export const DeleteBtn = styled(Button)`
    background-color: var(--c-pink);
    color: var(--c-red);
    display: flex;
    align-items: center;
  `;

  export const CancelBtn = styled(Button)`
    background-color: var(--c-white-1);
    color: var(--c-black);
  `;

  export const BtnIcon = styled.img`
    width: 16px;
    height: 16px;
    margin-right: var(--s-1);
  `;
}
