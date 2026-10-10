import Table from "@/components/Table";
import Typo from "@/components/Typo";
import {
  ECurrentType,
  EPlugStatus,
  EPlugType,
  IPlug,
  IStation,
} from "@/services/service.green-charging-stations";
import { Col, Row, Tag } from "antd";
import { ColumnsType } from "antd/es/table";
import { useState } from "react";
import styled from "styled-components";
import { CreatePlugModal } from "./_create-plug-modal";
import { EditPlugModal } from "./_edit-plug-modal";
import Button from "@/components/Button";
import { DeletePlugModal } from "./_delete-plug-modal";

const statusConfig: Record<EPlugStatus, { color: string; label: string }> = {
  [EPlugStatus.Available]: { color: "green", label: "Available" },
  [EPlugStatus.Occupied]: { color: "orange", label: "Occupied" },
  [EPlugStatus.OutOfService]: { color: "default", label: "Out of Service" },
  [EPlugStatus.Faulted]: { color: "red", label: "Faulted" },
};

const plugTypeColors: Record<EPlugType, string> = {
  [EPlugType.TYPE1]: "blue",
  [EPlugType.TYPE2]: "cyan",
  [EPlugType.CCS]: "purple",
  [EPlugType.CHAdeMO]: "magenta",
  [EPlugType.TESLA]: "volcano",
};

const currentTypeColors: Record<ECurrentType, string> = {
  [ECurrentType.AC]: "teal",
  [ECurrentType.DC]: "geekblue",
};

export function PlugsManager({
  station,
  isLoading,
}: {
  station?: IStation;
  isLoading: boolean;
}) {
  const [selectedRowKey, setSelectedRowKey] = useState<number>();
  const [showCreatePlugModal, setShowCreatePlugModal] = useState(false);
  const [showDeletePlugModal, setShowDeletePlugModal] = useState(false);
  const [selectedPlug, setSelectedPlug] = useState<IPlug>();

  const plugs = station?.plugs || [];

  const columns: ColumnsType = [
    {
      title: "No",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Identifier",
      dataIndex: "identifier",
      key: "identifier",
      render: (identifier: string) => (
        <Typo variant="body1" style={{ fontWeight: 600 }}>
          {identifier}
        </Typo>
      ),
    },
    {
      title: "Plug Type",
      dataIndex: "type",
      key: "type",
      render: (type: EPlugType) => (
        <Tag color={plugTypeColors[type] || "blue"}>{type}</Tag>
      ),
    },
    {
      title: "Current Type",
      dataIndex: "currentType",
      key: "currentType",
      render: (currentType: ECurrentType) => (
        <Tag color={currentTypeColors[currentType] || "default"}>
          {currentType}
        </Tag>
      ),
    },
    {
      title: "Power",
      dataIndex: "powerKw",
      key: "powerKw",
      render: (powerKw: number) => <Typo variant="body1">{powerKw} kW</Typo>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: EPlugStatus) => {
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Last Updated",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) =>
        date ? new Date(date).toLocaleString("en-AU") : "-",
    },
  ];

  return (
    <S.PlugsContainer>
      {showDeletePlugModal && selectedRowKey && (
        <DeletePlugModal
          stationId={station?.id || 0}
          plug={plugs.find((plug) => plug.id === selectedRowKey)!}
          onClose={() => setShowDeletePlugModal(false)}
          onDelete={() => {
            setSelectedRowKey(undefined);
            setShowDeletePlugModal(false);
          }}
        />
      )}

      {selectedPlug && (
        <EditPlugModal
          stationId={station?.id || 0}
          plug={selectedPlug}
          onClose={() => setSelectedPlug(undefined)}
        />
      )}

      {showCreatePlugModal && (
        <CreatePlugModal
          stationId={station?.id || 0}
          onClose={() => setShowCreatePlugModal(false)}
        />
      )}

      <S.HeaderCol justify="space-between" align="middle">
        <Typo variant="body1">Plugs ({plugs.length}):</Typo>
        <S.CreateBtn onClick={() => setShowCreatePlugModal(true)}>
          <Typo variant="body1">Create</Typo>
        </S.CreateBtn>
        {!!selectedRowKey && (
          <S.DeleteBtn onClick={() => setShowDeletePlugModal(true)}>
            <Typo variant="body1">Delete</Typo>
          </S.DeleteBtn>
        )}
        {!!selectedRowKey && (
          <S.CancelBtn onClick={() => setSelectedRowKey(undefined)}>
            <Typo variant="body1">Cancel</Typo>
          </S.CancelBtn>
        )}
      </S.HeaderCol>

      <S.TableCol span={24}>
        <Table
          pagination={false}
          dataSource={plugs}
          rowKey="id"
          loading={isLoading}
          columns={columns}
          locale={{ emptyText: "No plugs registered for this station" }}
          onRow={(record) => ({
            style: { cursor: "pointer" },
            onClick: () => setSelectedPlug(record as IPlug),
          })}
          rowSelection={{
            type: "radio",
            selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
            onChange: (selectedRowKeys) => {
              setSelectedRowKey(selectedRowKeys[0] as number);
            },
          }}
        />
      </S.TableCol>
    </S.PlugsContainer>
  );
}

namespace S {
  export const PlugsContainer = styled(Row)`
    background-color: var(--c-white);
    border-radius: var(--br-3);
    padding: var(--s-4);
    padding-top: var(--s-6);
    padding-bottom: var(--s-7);
  `;

  export const HeaderCol = styled(Row)`
    margin-bottom: var(--s-3);
    padding: 0 var(--s-5);
    gap: var(--s-4);
  `;

  export const TableCol = styled(Col)`
    padding: 0 var(--s-5);
  `;

  export const CreateBtn = styled.div`
    background-color: var(--c-blue-1);
    padding: var(--s-1) var(--s-3);
    width: fit-content;
    border-radius: var(--br-1);
    border: 1px dashed var(--c-blue);
    color: var(--c-blue);
    cursor: pointer;
  `;

  export const DeleteBtn = styled.div`
    background-color: var(--c-pink);
    padding: var(--s-1) var(--s-3);
    width: fit-content;
    border-radius: var(--br-1);
    border: 1px dashed var(--c-red);
    color: var(--c-red);
    cursor: pointer;
  `;

  export const CancelBtn = styled.div`
    background-color: var(--c-white-1);
    padding: var(--s-1) var(--s-3);
    width: fit-content;
    border-radius: var(--br-1);
    border: 1px dashed var(--c-black);
    color: var(--c-black);
    cursor: pointer;
  `;
}
