"use client";

import styled from "styled-components";
import PageHeading from "../_page-heading";
import { RecyclingCentersMutations } from "@/services/service.recycling-centers";
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

interface IUploadedFile {
  id: string;
  name: string;
  bucketUrl: string;
  localUrl: string;
}

export default function AddRecyclingCentre() {
  const router = useRouter();

  const { mutate: createCentre, isPending: isCreating } =
    RecyclingCentersMutations.useCreateCentre();
  const { mutateAsync: uploadFile, isPending: isUploading } =
    StorageMutations.useUploadFile();

  type FormValues = RecyclingCentersMutations.ICreateCentrePayload;
  const formRef = useRef<FormikProps<FormValues>>(null);

  // Separate states for images and PDF info sheets
  const [uploadedImages, setUploadedImages] = useState<IUploadedFile[]>([]);
  const [uploadedInfoSheets, setUploadedInfoSheets] = useState<IUploadedFile[]>(
    [],
  );

  // 1. Generic file uploader handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (newFile: IUploadedFile) => void,
    typeLabel: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // Allow re-selecting the same file

    const localUrl = URL.createObjectURL(file);
    try {
      const response = await uploadFile({ file });
      const newFile: IUploadedFile = {
        id: crypto.randomUUID(),
        name: file.name,
        bucketUrl: response.bucketUrl,
        localUrl,
      };
      onSuccess(newFile);
      notifySuccess(`"${file.name}" uploaded successfully`);
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      notifyError(
        (error as unknown as Error)?.message || `Failed to upload ${typeLabel}`,
      );
    }
  };

  // Image Upload Handlers
  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(
      e,
      (newFile) => setUploadedImages((prev) => [...prev, newFile]),
      "image",
    );
  };

  const handleDeleteImage = (id: string) => {
    setUploadedImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target?.localUrl) URL.revokeObjectURL(target.localUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  // Info Sheet (PDF) Upload Handlers
  const onInfoSheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(
      e,
      (newFile) => setUploadedInfoSheets((prev) => [...prev, newFile]),
      "info sheet",
    );
  };

  const handleDeleteInfoSheet = (id: string) => {
    setUploadedInfoSheets((prev) => {
      const target = prev.find((sheet) => sheet.id === id);
      if (target?.localUrl) URL.revokeObjectURL(target.localUrl);
      return prev.filter((sheet) => sheet.id !== id);
    });
  };

  const handleViewFile = (file: IUploadedFile) => {
    window.open(file.localUrl, "_blank");
  };

  // 2. Submit payload with both imageUrls and infoSheetUrls
  const onSubmit = (values: FormValues) => {
    const payload: FormValues = {
      ...values,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      imageUrls: uploadedImages.map((img) => img.bucketUrl),
      infoSheetUrls: uploadedInfoSheets.map((sheet) => sheet.bucketUrl),
    };

    createCentre(payload, {
      onSuccess: () => {
        notifySuccess("Recycling Centre created successfully");
        router.push(`/recycling-centers`);
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
    <S.AddRecyclingCentre>
      <PageHeading
        title="Add New Recycling Centre"
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
            address: "",
            latitude: 0,
            longitude: 0,
            openingTime: "08:00",
            closingTime: "17:00",
          }}
          onSubmit={onSubmit}>
          <Row>
            <Col span={12}>
              {/* Name ------------------------------------ */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Name:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="name"
                    placeholder="e.g. Wollongong Recycling Hub"
                  />
                </Col>
              </S.FormGroup>

              {/* Address --------------------------------- */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Address:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="address"
                    placeholder="e.g. 10 Kembla St, Wollongong NSW 2500"
                  />
                </Col>
              </S.FormGroup>

              {/* Opening Time ---------------------------- */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Opening Time:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input name="openingTime" type="time" placeholder="08:00" />
                </Col>
              </S.FormGroup>
            </Col>

            <Col span={12}>
              {/* Latitude -------------------------------- */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Latitude:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="latitude"
                    placeholder="-34.42507"
                    type="number"
                  />
                </Col>
              </S.FormGroup>

              {/* Longitude ------------------------------- */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Longitude:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input
                    name="longitude"
                    type="number"
                    placeholder="150.89315"
                  />
                </Col>
              </S.FormGroup>

              {/* Closing Time ---------------------------- */}
              <S.FormGroup>
                <S.LabelCol span={9}>
                  <Typo variant="body1">Closing Time:</Typo>
                </S.LabelCol>
                <Col span={15}>
                  <Input name="closingTime" type="time" placeholder="17:00" />
                </Col>
              </S.FormGroup>
            </Col>
          </Row>
        </Formik>
      </S.FormContainer>

      <div style={{ height: "var(--s-4)" }} />

      {/* ========================================================= */}
      {/* 1. Images Manager Section (accept="image/*")              */}
      {/* ========================================================= */}
      <S.FileManagerContainer>
        <Col span={12}>
          <S.FormGroup>
            <S.LabelCol span={4}>
              <Typo variant="body1">Images:</Typo>
            </S.LabelCol>
            <Col span={16}>
              <S.UploadBtn $loading={isUploading}>
                <label
                  style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
                  <input
                    hidden
                    type="file"
                    onChange={onImageSelect}
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

        <S.TableContainer span={24}>
          <Table
            pagination={false}
            dataSource={uploadedImages}
            rowKey="id"
            loading={isUploading}>
            <Column<IUploadedFile>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IUploadedFile>
              title="File Name"
              dataIndex="name"
              render={(name: string, record) => (
                <S.FileNameLink onClick={() => handleViewFile(record)}>
                  {name}
                </S.FileNameLink>
              )}
            />
            <Column<IUploadedFile>
              title="Action"
              width={160}
              render={(_, record) => (
                <S.ActionButtons>
                  <S.ViewBtn
                    type="button"
                    onClick={() => handleViewFile(record)}>
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
      </S.FileManagerContainer>

      <div style={{ height: "var(--s-4)" }} />

      {/* ========================================================= */}
      {/* 2. Info Sheets Manager Section (accept="application/pdf") */}
      {/* ========================================================= */}
      <S.FileManagerContainer>
        <Col span={12}>
          <S.FormGroup>
            <S.LabelCol span={5}>
              <Typo variant="body1">Info Sheets:</Typo>
            </S.LabelCol>
            <Col span={15}>
              <S.UploadBtn $loading={isUploading}>
                <label
                  style={{ cursor: isUploading ? "not-allowed" : "pointer" }}>
                  <input
                    hidden
                    type="file"
                    onChange={onInfoSheetSelect}
                    accept="application/pdf,.pdf"
                    disabled={isUploading}
                  />
                  <Typo variant="body1">
                    {isUploading ? "Uploading..." : "Upload PDF Sheet"}
                  </Typo>
                </label>
              </S.UploadBtn>
            </Col>
          </S.FormGroup>
        </Col>

        <S.TableContainer span={24}>
          <Table
            pagination={false}
            dataSource={uploadedInfoSheets}
            rowKey="id"
            loading={isUploading}>
            <Column<IUploadedFile>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IUploadedFile>
              title="Document Name"
              dataIndex="name"
              render={(name: string, record) => (
                <S.FileNameLink onClick={() => handleViewFile(record)}>
                  {name}
                </S.FileNameLink>
              )}
            />
            <Column<IUploadedFile>
              title="Action"
              width={160}
              render={(_, record) => (
                <S.ActionButtons>
                  <S.ViewBtn
                    type="button"
                    onClick={() => handleViewFile(record)}>
                    View PDF
                  </S.ViewBtn>
                  <S.RemoveBtn
                    type="button"
                    onClick={() => handleDeleteInfoSheet(record.id)}>
                    Delete
                  </S.RemoveBtn>
                </S.ActionButtons>
              )}
            />
          </Table>
        </S.TableContainer>
      </S.FileManagerContainer>
    </S.AddRecyclingCentre>
  );
}

namespace S {
  export const AddRecyclingCentre = styled.div`
    width: 100%;
  `;

  export const FormContainer = styled.div`
    background-color: var(--c-white);
    border-radius: var(--br-3);
    padding: var(--s-4);
    padding-top: var(--s-7);
  `;

  export const FileManagerContainer = styled(Row)`
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

  export const ViewBtn = styled(Button)`
    padding: var(--s-1) var(--s-2);
    background-color: var(--c-blue-3);
    color: var(--c-blue);
    cursor: pointer;
  `;

  export const RemoveBtn = styled(Button)`
    padding: var(--s-1) var(--s-2);
    background-color: var(--c-pink);
    color: var(--c-red);
  `;
}
