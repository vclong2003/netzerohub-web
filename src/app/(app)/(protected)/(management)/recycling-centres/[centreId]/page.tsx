"use client";

import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import PageHeading from "../_page-heading";
import {
  RecyclingCentersMutations,
  RecyclingCentersQueries,
} from "@/services/service.recycling-centers";
import { useMemo, useRef, useState } from "react";
import { Form, Formik, FormikProps } from "formik";
import { Col, Row, Select as AntSelect, Tag } from "antd";
import Button from "@/components/Button";
import { StorageMutations } from "@/services/service.storage";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import Column from "antd/es/table/Column";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import Table from "@/components/Table";
import { getFileNameFromUrl } from "@/utils/utils.file";

interface IFileItem {
  id: string;
  name: string;
  type: "EXISTING" | "NEW";
  previewUrl: string;
  bucketUrl?: string;
  signedUrl?: string;
}

interface IFormValues {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openingTime: string;
  closingTime: string;
  acceptedWasteTypeIds: number[];
}

export default function UpdateRecyclingCentre() {
  const params = useParams<{ centreId: string; id: string }>();
  const router = useRouter();

  const centreId = Number(params.centreId || params.id);
  if (!centreId || isNaN(centreId)) {
    router.replace("/recycling-centres");
  }

  const formRef = useRef<FormikProps<IFormValues>>(null);

  // Queries & Mutations
  const {
    data: centre,
    isLoading: isLoadingCentre,
    isFetching,
  } = RecyclingCentersQueries.useGetCentreById(centreId);

  const { data: wasteTypes, isLoading: isLoadingWasteTypes } =
    RecyclingCentersQueries.useGetWasteTypes();

  const { mutate: updateCentre, isPending: isUpdating } =
    RecyclingCentersMutations.useUpdateCentre(centreId);

  const { mutateAsync: uploadFile, isPending: isUploading } =
    StorageMutations.useUploadFile();

  const [addedImages, setAddedImages] = useState<IFileItem[]>([]);
  const [removedImageUrls, setRemovedImageUrls] = useState<string[]>([]);

  const [addedInfoSheets, setAddedInfoSheets] = useState<IFileItem[]>([]);
  const [removedInfoSheetUrls, setRemovedInfoSheetUrls] = useState<string[]>(
    [],
  );

  const displayImages = useMemo(() => {
    const existing: IFileItem[] = (centre?.imageUrls || [])
      .filter((signedUrl) => !removedImageUrls.includes(signedUrl))
      .map((signedUrl) => ({
        id: signedUrl,
        name: getFileNameFromUrl(signedUrl),
        type: "EXISTING" as const,
        previewUrl: signedUrl,
        signedUrl,
      }));

    return [...existing, ...addedImages];
  }, [centre?.imageUrls, removedImageUrls, addedImages]);

  const displayInfoSheets = useMemo(() => {
    const existing: IFileItem[] = (centre?.infoSheetUrls || [])
      .filter((signedUrl) => !removedInfoSheetUrls.includes(signedUrl))
      .map((signedUrl) => ({
        id: signedUrl,
        name: getFileNameFromUrl(signedUrl),
        type: "EXISTING" as const,
        previewUrl: signedUrl,
        signedUrl,
      }));

    return [...existing, ...addedInfoSheets];
  }, [centre?.infoSheetUrls, removedInfoSheetUrls, addedInfoSheets]);

  // Generic File Upload Handler
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (newFile: IFileItem) => void,
    label: string,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const localUrl = URL.createObjectURL(file);

    try {
      const response = await uploadFile({ file });
      const newFile: IFileItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "NEW",
        previewUrl: localUrl,
        bucketUrl: response.bucketUrl,
      };
      onSuccess(newFile);
      notifySuccess(`"${file.name}" uploaded successfully`);
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      notifyError(
        (error as unknown as Error)?.message || `Failed to upload ${label}`,
      );
    }
  };

  // Upload Handlers
  const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(
      e,
      (newFile) => setAddedImages((prev) => [...prev, newFile]),
      "image",
    );
  };

  const onInfoSheetSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(
      e,
      (newFile) => setAddedInfoSheets((prev) => [...prev, newFile]),
      "info sheet",
    );
  };

  // Delete Handlers
  const handleDeleteImage = (item: IFileItem) => {
    if (item.type === "EXISTING" && item.signedUrl) {
      setRemovedImageUrls((prev) => [...prev, item.signedUrl!]);
    } else {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      setAddedImages((prev) => prev.filter((img) => img.id !== item.id));
    }
  };

  const handleDeleteInfoSheet = (item: IFileItem) => {
    if (item.type === "EXISTING" && item.signedUrl) {
      setRemovedInfoSheetUrls((prev) => [...prev, item.signedUrl!]);
    } else {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      setAddedInfoSheets((prev) =>
        prev.filter((sheet) => sheet.id !== item.id),
      );
    }
  };

  const handleViewFile = (item: IFileItem) => {
    window.open(item.previewUrl, "_blank");
  };

  const handleUpdate = () => {
    formRef.current?.submitForm();
  };

  const onSubmit = (values: IFormValues) => {
    const additionalImageUrls = addedImages
      .map((img) => img.bucketUrl)
      .filter((url): url is string => Boolean(url));

    const additionalInfoSheetUrls = addedInfoSheets
      .map((sheet) => sheet.bucketUrl)
      .filter((url): url is string => Boolean(url));

    const payload: RecyclingCentersMutations.IUpdateCentrePayload = {
      ...values,
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
      acceptedWasteTypeIds: values.acceptedWasteTypeIds,
      additionalImageUrls,
      removedImageUrls,
      additionalInfoSheetUrls,
      removedInfoSheetUrls,
    };

    updateCentre(payload, {
      onSuccess: () => {
        notifySuccess("Recycling Centre updated successfully");
        router.push("/recycling-centres");
      },
      onError: (error) => {
        notifyError(
          (error as unknown as Error)?.message ||
            "Failed to update recycling centre",
        );
      },
    });
  };

  const isScreenBusy =
    isUpdating || isLoadingCentre || isUploading || isLoadingWasteTypes;

  // Options for multi waste types select
  const wasteTypeOptions = (wasteTypes || []).map((wt) => ({
    label: `${wt.name} (${wt.code})`,
    value: wt.id,
  }));

  return (
    <S.UpdateRecyclingCentre>
      <PageHeading
        title="Update Recycling Centre"
        variant="update"
        onUpdate={handleUpdate}
        loading={isScreenBusy}
        disabled={isScreenBusy}
      />

      <S.FormContainer>
        <Formik<IFormValues>
          innerRef={formRef}
          initialValues={{
            name: centre?.name || "",
            address: centre?.address || "",
            latitude: centre?.latitude || 0,
            longitude: centre?.longitude || 0,
            openingTime: centre?.openingTime || "08:00",
            closingTime: centre?.closingTime || "17:00",
            acceptedWasteTypeIds:
              centre?.acceptedWasteTypes?.map((wt) => wt.id) || [],
          }}
          enableReinitialize
          onSubmit={onSubmit}>
          {({ values, setFieldValue }) => (
            <Form>
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
                      <Input
                        name="openingTime"
                        type="time"
                        placeholder="08:00"
                      />
                    </Col>
                  </S.FormGroup>

                  {/* Multi-Select Accepted Waste Types ------- */}
                  <S.FormGroup>
                    <S.LabelCol span={9}>
                      <Typo variant="body1">Accepted Waste:</Typo>
                    </S.LabelCol>
                    <Col span={15}>
                      <AntSelect
                        mode="multiple"
                        allowClear
                        style={{ width: "100%" }}
                        placeholder="Select accepted waste types"
                        value={values.acceptedWasteTypeIds}
                        onChange={(ids) =>
                          setFieldValue("acceptedWasteTypeIds", ids)
                        }
                        options={wasteTypeOptions}
                        loading={isLoadingWasteTypes}
                      />
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
                      <Input
                        name="closingTime"
                        type="time"
                        placeholder="17:00"
                      />
                    </Col>
                  </S.FormGroup>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </S.FormContainer>

      <div style={{ height: "var(--s-4)" }} />

      {/* 1. Images Manager ----------------------------------------- */}
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
            dataSource={displayImages}
            rowKey="id"
            loading={isUploading || isLoadingCentre || isFetching}>
            <Column<IFileItem>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IFileItem>
              title="File Name"
              dataIndex="name"
              render={(name: string, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <S.FileNameLink onClick={() => handleViewFile(record)}>
                    {name}
                  </S.FileNameLink>
                  {record.type === "NEW" && <Tag color="blue">New</Tag>}
                </div>
              )}
            />
            <Column<IFileItem>
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
                    onClick={() => handleDeleteImage(record)}>
                    Delete
                  </S.RemoveBtn>
                </S.ActionButtons>
              )}
            />
          </Table>
        </S.TableContainer>
      </S.FileManagerContainer>

      <div style={{ height: "var(--s-4)" }} />

      {/* Info Sheets Manager --------------------------------------- */}
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
            dataSource={displayInfoSheets}
            rowKey="id"
            loading={isUploading || isLoadingCentre || isFetching}>
            <Column<IFileItem>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IFileItem>
              title="Document Name"
              dataIndex="name"
              render={(name: string, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <S.FileNameLink onClick={() => handleViewFile(record)}>
                    {name}
                  </S.FileNameLink>
                  {record.type === "NEW" && <Tag color="blue">New</Tag>}
                </div>
              )}
            />
            <Column<IFileItem>
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
                    onClick={() => handleDeleteInfoSheet(record)}>
                    Delete
                  </S.RemoveBtn>
                </S.ActionButtons>
              )}
            />
          </Table>
        </S.TableContainer>
      </S.FileManagerContainer>
    </S.UpdateRecyclingCentre>
  );
}

namespace S {
  export const UpdateRecyclingCentre = styled.div`
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
