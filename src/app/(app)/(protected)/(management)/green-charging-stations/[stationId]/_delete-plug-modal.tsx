import Typo from "@/components/Typo";
import {
  GreenChargingStationsMutations,
  IPlug,
} from "@/services/service.green-charging-stations";
import { Modal } from "antd";

interface IDeleteModalProps {
  stationId: number;
  plug: IPlug;

  onClose: () => void;
  onDelete: () => void;
}

export function DeletePlugModal({
  stationId,
  plug,
  onClose,
  onDelete,
}: IDeleteModalProps) {
  const { mutate, isPending } = GreenChargingStationsMutations.useDeletePlug(
    stationId,
    plug.id,
  );

  const destroy = () => {
    mutate(undefined, {
      onSuccess: () => {
        onDelete();
        onClose();
      },
    });
  };

  if (!stationId || !plug.id) return null;
  return (
    <Modal
      title="Confirm deletion"
      open={true}
      onOk={destroy}
      confirmLoading={isPending}
      onCancel={onClose}>
      <Typo variant="body1">
        Do you want to delete plug <i>{plug?.identifier}</i>
      </Typo>
    </Modal>
  );
}
