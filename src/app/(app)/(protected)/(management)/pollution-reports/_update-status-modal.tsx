"use client";

import Typo from "@/components/Typo";
import { Modal, Select, Tag } from "antd";
import { useState } from "react";
import {
  EPollutionReportStatus,
  PollutionReportMutations,
} from "@/services/service.pollution-report";
import { notifyError, notifySuccess } from "@/utils/utils.notification";

const statusColors: Record<EPollutionReportStatus, string> = {
  [EPollutionReportStatus.Pending]: "gold",
  [EPollutionReportStatus.Acknowledged]: "blue",
  [EPollutionReportStatus.Processed]: "cyan",
  [EPollutionReportStatus.Resolved]: "green",
  [EPollutionReportStatus.Rejected]: "red",
};

interface IUpdateStatusModalProps {
  isOpen: boolean;
  reportIds: number[]; // 👈 Updated to string[] to match API
  onClose: () => void;
  onSuccess?: () => void;
  onDelete?: () => void; // Maintained for backward compatibility
}

export function UpdateStatusModal({
  isOpen,
  reportIds,
  onClose,
  onSuccess,
  onDelete,
}: IUpdateStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<EPollutionReportStatus>(
    EPollutionReportStatus.Acknowledged,
  );

  const { mutate: updateStatus, isPending } =
    PollutionReportMutations.useUpdatePollutionReportStatus();

  const handleUpdateStatus = () => {
    if (!reportIds.length) return;

    updateStatus(
      {
        ids: reportIds,
        status: selectedStatus,
      },
      {
        onSuccess: () => {
          notifySuccess(
            `Successfully updated ${reportIds.length} report(s) to ${selectedStatus}`,
          );
          onSuccess?.();
          onDelete?.();
        },
        onError: (error) => {
          notifyError(
            (error as unknown as Error)?.message ||
              "Failed to update report status",
          );
        },
      },
    );
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      confirmLoading={isPending}
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
