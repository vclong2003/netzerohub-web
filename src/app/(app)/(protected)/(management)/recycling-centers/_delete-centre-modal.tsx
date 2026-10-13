import { useState } from "react";
import { Alert, Modal } from "antd";
import Typo from "@/components/Typo";
import { RecyclingCentersMutations, type Centre } from "@/services/service.recycling-centers";

interface IDeleteModalProps { isOpen: boolean; centre?: Centre; onClose: () => void; onDelete: () => void }

export function DeleteCentreModal({ isOpen, centre, onClose, onDelete }: IDeleteModalProps) {
  const { mutateAsync, isPending } = RecyclingCentersMutations.useDeleteCentre(centre?.id || -1);
  const [error, setError] = useState("");
  const destroy = async () => {
    if (isPending) return;
    setError("");
    try { await mutateAsync(); onDelete(); }
    catch (error) { setError(error instanceof Error ? error.message : "Could not delete this center."); }
  };
  if (!centre) return null;
  return <Modal title="Confirm deletion" open={isOpen} onOk={() => void destroy()} confirmLoading={isPending} onCancel={() => { if (!isPending) { setError(""); onClose(); } }} cancelButtonProps={{ disabled: isPending }} okButtonProps={{ danger: true }}>
    <Typo variant="body1">Do you want to delete center <i>{centre.name}</i>?</Typo>
    {error && <Alert type="error" title={error} showIcon />}
  </Modal>;
}
