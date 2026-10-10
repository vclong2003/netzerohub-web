"use client";

import Button from "@/components/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Typo from "@/components/Typo";
import {
  ECurrentType,
  EPlugStatus,
  EPlugType,
  GreenChargingStationsMutations,
  IPlug,
} from "@/services/service.green-charging-stations";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import { Col, Modal, Row } from "antd";
import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import styled from "styled-components";

export function EditPlugModal({
  stationId,
  plug,
  onClose,
}: {
  stationId: number;
  plug: IPlug;
  onClose: () => void;
}) {
  const { mutate, isPending } = GreenChargingStationsMutations.useUpdatePlug(
    stationId,
    plug.id,
  );

  type FormTypes = GreenChargingStationsMutations.ICreatePlugPayload;
  const formRef = useRef<FormikProps<FormTypes>>(null);

  const onSubmit = (values: FormTypes) => {
    mutate(values, {
      onSuccess: () => {
        notifySuccess("Plug updated");
        onClose();
      },
      onError: (error) => {
        notifyError(error.message || "Failed to update plug");
      },
    });
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      title={<Typo variant="h4">Update plug</Typo>}>
      <Formik
        innerRef={formRef}
        initialValues={{
          identifier: plug.identifier || "",
          status: plug.status || EPlugStatus.Available,
          type: plug.type || EPlugType.CCS,
          currentType: plug.currentType || ECurrentType.DC,
          powerKw: plug.powerKw || 50,
        }}
        allowReinitialize
        onSubmit={onSubmit}>
        <div style={{ marginTop: "var(--s-4)" }}>
          {/* Id ----------------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">ID:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Input disabled value={plug.id} />
            </Col>
          </S.FormGroup>

          {/* Identifier --------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">Identifier:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Input name="identifier" placeholder="e.g. PLUG-01A" required />
            </Col>
          </S.FormGroup>

          {/* Plug Type ----------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">Plug Type:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Select
                name="type"
                options={Object.values(EPlugType).map((type) => ({
                  label: type,
                  value: type,
                }))}
              />
            </Col>
          </S.FormGroup>

          {/* Current Type -------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">Current Type:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Select
                name="currentType"
                options={Object.values(ECurrentType).map((current) => ({
                  label: current,
                  value: current,
                }))}
              />
            </Col>
          </S.FormGroup>

          {/* Power (kW) ---------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">Power (kW):</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Input
                name="powerKw"
                type="number"
                placeholder="e.g. 50"
                min={1}
                required
              />
            </Col>
          </S.FormGroup>

          {/* Status -------------------------------------------- */}
          <S.FormGroup>
            <S.LabelCol span={8}>
              <Typo variant="body1">Status:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <Select
                name="status"
                options={Object.values(EPlugStatus).map((status) => ({
                  label: status,
                  value: status,
                }))}
              />
            </Col>
          </S.FormGroup>

          {/* Footer Buttons ------------------------------------ */}
          <S.ModalFooter>
            <S.CancelBtn onClick={onClose} disabled={isPending}>
              Cancel
            </S.CancelBtn>
            <S.SubmitBtn
              disabled={isPending}
              onClick={() => formRef.current?.submitForm()}>
              {isPending ? "Updating..." : "Update"}
            </S.SubmitBtn>
          </S.ModalFooter>
        </div>
      </Formik>
    </Modal>
  );
}

namespace S {
  export const FormGroup = styled(Row)`
    margin-bottom: var(--s-3);
  `;

  export const LabelCol = styled(Col)`
    display: flex;
    align-items: center;
  `;

  export const ModalFooter = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: var(--s-2);
    margin-top: var(--s-4);
  `;

  export const CancelBtn = styled(Button)`
    background-color: var(--c-white-3);
    color: var(--c-black);
  `;

  export const SubmitBtn = styled(Button)`
    background-color: var(--c-blue);
    color: var(--c-white);
  `;
}
