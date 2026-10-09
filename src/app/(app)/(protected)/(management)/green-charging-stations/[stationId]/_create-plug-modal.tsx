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
} from "@/services/service.green-charging-stations";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import { Col, Modal, Row } from "antd";
import { Formik, FormikProps } from "formik";
import { useRef } from "react";
import styled from "styled-components";

export function CreatePlugModal({
  stationId,
  onClose,
}: {
  stationId: number;
  onClose: () => void;
}) {
  const { mutate, isPending } =
    GreenChargingStationsMutations.useCreatePlug(stationId);

  type FormTypes = GreenChargingStationsMutations.ICreatePlugPayload;
  const formRef = useRef<FormikProps<FormTypes>>(null);

  const onSubmit = (values: FormTypes) => {
    mutate(values, {
      onSuccess: () => {
        notifySuccess("Plug created successfully");
        onClose();
      },
      onError: (error) => {
        notifyError(error.message || "Failed to create plug");
      },
    });
  };

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      centered
      title={<Typo variant="h4">Add New Charging Plug</Typo>}>
      <Formik
        innerRef={formRef}
        initialValues={{
          identifier: "",
          status: EPlugStatus.Available,
          type: EPlugType.CCS,
          currentType: ECurrentType.DC,
          powerKw: 50,
        }}
        onSubmit={onSubmit}>
        <div style={{ marginTop: "var(--s-4)" }}>
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
              {isPending ? "Creating..." : "Create Plug"}
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
    background-color: var(--c-white-5);
    color: var(--c-black);
  `;

  export const SubmitBtn = styled(Button)`
    background-color: var(--c-blue);
    color: var(--c-white);
  `;
}
