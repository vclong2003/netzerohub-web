import Typo from "@/components/Typo";
import { Modal, Select, Tag } from "antd";
import { useState } from "react";
import styled from "styled-components";
import { EPollutionReportStatus } from "./_types";
import Button from "@/components/Button";

const statusColors: Record<EPollutionReportStatus, string> = {
  [EPollutionReportStatus.Pending]: "gold",
  [EPollutionReportStatus.Acknowledged]: "blue",
  [EPollutionReportStatus.Processed]: "cyan",
  [EPollutionReportStatus.Resolved]: "green",
  [EPollutionReportStatus.Rejected]: "red",
};

export function UpdateStatusModal({
  isOpen,
  reportIds,
  onClose,
  onDelete,
}: {
  isOpen: boolean;
  reportIds: number[];
  onClose: () => void;
  onDelete: () => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<EPollutionReportStatus>(
    EPollutionReportStatus.Acknowledged,
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setSelectedStatus(EPollutionReportStatus.Acknowledged);
    setIsLoading(false);
    onDelete();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      confirmLoading={isLoading}
      centered
      okText="Update"
      onOk={handleUpdateStatus}
      title={<Typo variant="h4">Update Reports Status</Typo>}>
      <div style={{ padding: "var(--s-3) 0" }}>
        <Typo variant="body1" style={{ marginBottom: "var(--s-2)" }}>
          Select a new status for <b>{reportIds.length}</b> selected report(s):
        </Typo>
        <Select
          style={{ width: "100%" }}
          value={selectedStatus}
          onChange={(val) => setSelectedStatus(val as EPollutionReportStatus)}
          options={Object.values(EPollutionReportStatus).map((status) => ({
            label: (
              <Tag color={statusColors[status]} style={{ marginRight: 6 }}>
                {status}
              </Tag>
            ),
            value: status,
          }))}
        />
      </div>
    </Modal>
  );
}
