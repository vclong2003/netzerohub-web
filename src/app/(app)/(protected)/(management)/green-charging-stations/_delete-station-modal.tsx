import Typo from "@/components/Typo";
import {
  GreenChargingStationsMutations,
  IStation,
} from "@/services/service.green-charging-stations";
import { Modal } from "antd";

interface IDeleteModalProps {
  station?: IStation;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteStationModal({
  station,
  onClose,
  onDelete,
}: IDeleteModalProps) {
  const { mutate, isPending } = GreenChargingStationsMutations.useDeleteStation(
    station?.id || -1,
  );

  const destroy = () => {
    mutate(undefined, {
      onSuccess: () => {
        onDelete();
        onClose();
      },
    });
  };

  if (!station) return null;
  return (
    <Modal
      title="Confirm deletion"
      open={true}
      onOk={destroy}
      confirmLoading={isPending}
      onCancel={onClose}>
      <Typo variant="body1">
        Do you want to delete station <b>{station?.name}</b>
      </Typo>
    </Modal>
  );
}
