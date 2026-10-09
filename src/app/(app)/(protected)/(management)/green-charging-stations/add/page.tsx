"use client";

import styled from "styled-components";
import PageHeading from "../_page-heading";
import { GreenChargingStationsMutations } from "@/services/service.green-charging-stations";
import { StorageMutations } from "@/services/service.storage";
import { Col, Row } from "antd";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import { Formik, FormikProps } from "formik";
import { useRef, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import { useRouter } from "next/navigation";
import Column from "antd/es/table/Column";
import Table from "@/components/Table";
import Button from "@/components/Button";

interface IUploadedImage {
  id: string;
  name: string;
  bucketUrl: string;
  localUrl: string;
}

export default function AddGreenChargingStation() {
  const router = useRouter();

  const { mutate, isPending: isCreating } =
    GreenChargingStationsMutations.useCreateStation();
  const { mutateAsync: uploadImage, isPending: isUploading } =
    StorageMutations.useUploadFile();

  type FormValues = GreenChargingStationsMutations.ICreateStationPayload;
  const formRef = useRef<FormikProps<FormValues>>(null);

  const [uploadedImages, setUploadedImages] = useState<IUploadedImage[]>([]);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const localUrl = URL.createObjectURL(file);
    try {
      const response = await uploadImage({ file });
      const newImage: IUploadedImage = {
        id: crypto.randomUUID(),
        name: file.name,
        bucketUrl: response.bucketUrl,
        localUrl,
      };
      setUploadedImages((prev) => [...prev, newImage]);
      notifySuccess(`"${file.name}" uploaded successfully`);
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      notifyError(
        (error as unknown as Error)?.message || "Failed to upload image",
      );
    }
  };

  const handleDeleteImage = (id: string) => {
    setUploadedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.localUrl) URL.revokeObjectURL(target.localUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleViewImage = (image: IUploadedImage) => {
    window.open(image.localUrl, "_blank");
  };

  const onSubmit = (values: FormValues) => {
    const payload: FormValues = {
      ...values,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      renewableEnergyPercent: Number(values.renewableEnergyPercent),
      imageUrls: uploadedImages.map((img) => img.bucketUrl),
    };

    mutate(payload, {
      onSuccess: () => {
        notifySuccess("Green Charging Station created successfully");
        router.push(`/green-charging-stations`);
      },
      onError: (error) => {
        notifyError(error.message);
      },
    });
  };

  const handleAdd = () => {
    formRef.current?.submitForm();
  };

  return (
    <S.GreenChargingStations>
      <PageHeading
        title="Add New Charging Station"
        variant="add"
        onAdd={handleAdd}
        disabled={isCreating || isUploading}
        loading={isCreating || isUploading}
      />
      <S.FormContainer>
        <Formik<FormValues>
          innerRef={formRef}
          initialValues={{
            name: "",
            latitude: 0,
            longitude: 0,
            renewableEnergyPercent: 0,
          }}
          onSubmit={onSubmit}>
          <Row>
            <Col span={12}>
              {/* Name ------------------------------------------------------- */}
              <S.FormGroup>
                <S.LabelCol
                  span={9}
                  style={{ alignItems: "center", display: "flex" }}>
                  <Typo variant="body1">Name:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input name="name" placeholder="NRMA CS543 UOW Campus" />
                </Col>
              </S.FormGroup>
              {/* Mobile NO -------------------------------------------------- */}
              <S.FormGroup>
                <S.LabelCol
                  span={9}
                  style={{ alignItems: "center", display: "flex" }}>
                  <Typo variant="body1">Renewable %:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="renewableEnergyPercent"
                    type="number"
                    placeholder="85"
                  />
                </Col>
              </S.FormGroup>
            </Col>
            <Col span={12}>
              {/* Lat ----------------------------------- */}
              <S.FormGroup>
                <S.LabelCol
                  span={9}
                  style={{ alignItems: "center", display: "flex" }}>
                  <Typo variant="body1">Latitude:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input name="latitude" placeholder="-35.707740" />
                </Col>
              </S.FormGroup>
              {/* Lon ----------------------------------- */}
              <S.FormGroup>
                <S.LabelCol
                  span={9}
                  style={{ alignItems: "center", display: "flex" }}>
                  <Typo variant="body1">Longitude:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="longitude"
                    type="number"
                    placeholder="150.178320"
                  />
                </Col>
              </S.FormGroup>
            </Col>
          </Row>
        </Formik>
      </S.FormContainer>

      <div style={{ height: "var(--s-4)" }} />

      <S.ImagesManagerContainer>
        <Col span={12}>
          <S.FormGroup>
            <S.LabelCol span={4}>
              <Typo variant="body1">Images:</Typo>
            </S.LabelCol>
            <Col span={16}>
              {/* File input ------------------------------------------ */}
              <S.UploadBtn $loading={isUploading}>
                <label
                  style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
                  <input
                    hidden
                    type="file"
                    onChange={onFileSelect}
                    accept="image/*"
                    disabled={isUploading}
                  />
                  <Typo variant="body1">
                    {isUploading ? "Uploading..." : "Upload Image"}
                  </Typo>
                </label>
              </S.UploadBtn>
            </Col>
          </S.FormGroup>
        </Col>

        {/* Uploaded Files Table --------------------------------- */}
        <S.TableContainer span={24}>
          <Table
            pagination={false}
            dataSource={uploadedImages}
            rowKey="id"
            loading={isUploading}>
            <Column<IUploadedImage>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IUploadedImage>
              title="File Name"
              dataIndex="name"
              render={(name: string, record) => (
                <S.FileNameLink onClick={() => handleViewImage(record)}>
                  {name}
                </S.FileNameLink>
              )}
            />
            <Column<IUploadedImage>
              title="Action"
              width={160}
              render={(_, record) => (
                <S.ActionButtons>
                  <S.ViewBtn
                    type="button"
                    onClick={() => handleViewImage(record)}>
                    View
                  </S.ViewBtn>
                  <S.RemoveBtn
                    type="button"
                    onClick={() => handleDeleteImage(record.id)}>
                    Delete
                  </S.RemoveBtn>
                </S.ActionButtons>
              )}
            />
          </Table>
        </S.TableContainer>
      </S.ImagesManagerContainer>
    </S.GreenChargingStations>
  );
}

namespace S {
  export const GreenChargingStations = styled.div`
    width: 100%;
  `;

  export const FormContainer = styled.div`
    background-color: var(--c-white);
    border-radius: var(--br-3);
    padding: var(--s-4);
    padding-top: var(--s-7);
  `;

  export const ImagesManagerContainer = styled(Row)`
    background-color: var(--c-white);
    border-radius: var(--br-3);
    padding: var(--s-4);
    padding-top: var(--s-6);
    padding-bottom: var(--s-7);
  `;

  export const FormGroup = styled(Row)`
    margin-bottom: var(--s-3);
    padding: 0 var(--s-5);
  `;

  export const LabelCol = styled(Col)`
    display: flex;
    align-items: center;
  `;

  interface IUploadBtnProps {
    $loading?: boolean;
  }

  export const UploadBtn = styled.div<IUploadBtnProps>`
    background-color: var(--c-blue-1);
    padding: var(--s-1) var(--s-3);
    width: fit-content;
    border-radius: var(--br-1);
    border: 1px dashed var(--c-blue);
    color: var(--c-blue);
    opacity: ${({ $loading }) => ($loading ? 0.5 : 1)};
  `;

  export const TableContainer = styled(Col)`
    padding: 0 var(--s-5);
  `;

  export const FileNameLink = styled.span`
    color: var(--c-blue);
    cursor: pointer;
    text-decoration: underline;
    &:hover {
      opacity: 0.8;
    }
  `;

  export const ActionButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: var(--s-1);
  `;

  export const DownloadBtn = styled(Button)`
    padding: var(--s-1) var(--s-2);
    background-color: var(--c-green-1);
  `;

  export const ViewBtn = styled(Button)`
    padding: var(--s-1) var(--s-2);
    background-color: var(--c-blue-3);
    color: var(--c-blue);
    cursor: pointer;
  `;

  export const RemoveBtn = styled(Button)`
    padding: var(--s-1) var(--s-2);
    background-color: var(--c-red);
  `;
}
