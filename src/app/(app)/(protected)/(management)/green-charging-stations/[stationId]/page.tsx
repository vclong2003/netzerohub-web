"use client";

import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import PageHeading from "../_page-heading";
import {
  EStationStatus,
  GreenChargingStationsMutations,
  GreenChargingStationsQueries,
} from "@/services/service.green-charging-stations";
import { useEffect, useRef, useState } from "react";
import { Formik, FormikProps } from "formik";
import { Col, Row, Tag } from "antd";
import Button from "@/components/Button";
import { StorageMutations } from "@/services/service.storage";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import Column from "antd/es/table/Column";
import Typo from "@/components/Typo";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Select from "@/components/Select";
import { getFileNameFromUrl } from "@/utils/utils.file";
import { PlugsManager } from "./_plugs-manager";

interface IImageItem {
  id: string;
  name: string;
  type: "EXISTING" | "NEW";
  previewUrl: string;
  bucketUrl?: string;
  signedUrl?: string;
}

export default function GreenChargingStationUpdate() {
  const params = useParams<{ stationId: string }>();
  const router = useRouter();
  if (!params.stationId || isNaN(Number(params.stationId))) {
    router.replace("/green-charging-stations");
  }

  type FormValues = GreenChargingStationsMutations.IUpdateStationPayload;
  const formRef = useRef<FormikProps<FormValues>>(null);

  const stationId = Number(params.stationId);

  const { data: station, isLoading } =
    GreenChargingStationsQueries.useGetStationById(stationId);
  const { mutate, isPending: isUpdating } =
    GreenChargingStationsMutations.useUpdateStation(stationId);
  const { mutateAsync: uploadImage, isPending: isUploading } =
    StorageMutations.useUploadFile();

  const [images, setImages] = useState<IImageItem[]>([]);
  const [removalImageUrls, setRemovalImageUrls] = useState<string[]>([]);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (station?.imageUrls && !isInitializedRef.current) {
      isInitializedRef.current = true;
      const initialImages: IImageItem[] = station.imageUrls.map(
        (signedUrl) => ({
          id: crypto.randomUUID(),
          name: getFileNameFromUrl(signedUrl),
          type: "EXISTING",
          previewUrl: signedUrl,
          signedUrl: signedUrl,
        }),
      );
      setImages(initialImages);
    }
  }, [station]);

  const onFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const localUrl = URL.createObjectURL(file);
    try {
      const response = await uploadImage({ file });
      const newImage: IImageItem = {
        id: crypto.randomUUID(),
        name: file.name,
        type: "NEW",
        previewUrl: localUrl,
        bucketUrl: response.bucketUrl,
      };
      setImages((prev) => [...prev, newImage]);
      notifySuccess(`"${file.name}" uploaded successfully`);
    } catch (error) {
      URL.revokeObjectURL(localUrl);
      notifyError(
        (error as unknown as Error)?.message || "Failed to upload image",
      );
    }
  };

  const handleDeleteImage = (item: IImageItem) => {
    if (item.type === "EXISTING" && item.signedUrl) {
      setRemovalImageUrls((prev) => [...prev, item.signedUrl!]);
    }
    if (item.type === "NEW") URL.revokeObjectURL(item.previewUrl);

    setImages((prev) => prev.filter((img) => img.id !== item.id));
  };

  const handleViewImage = (item: IImageItem) => {
    window.open(item.previewUrl, "_blank");
  };

  const handleUpdate = () => {
    formRef.current?.submitForm();
  };

  const onSubmit = (values: FormValues) => {
    const additionalImageUrls = images
      .filter((img) => img.type === "NEW" && img.bucketUrl)
      .map((img) => img.bucketUrl!);
    const payload: FormValues = {
      ...values,
      additionalImageUrls,
      removalImageUrls,
    };
    mutate(payload, {
      onSuccess: () => {
        notifySuccess("Station updated successfully");
        router.push("/green-charging-stations");
      },
      onError: (error) => {
        notifyError(
          (error as unknown as Error)?.message || "Failed to update station",
        );
      },
    });
  };

  return (
    <S.UpdateGreenChargingStation>
      <PageHeading
        title="Update Charging Station"
        variant="update"
        onUpdate={handleUpdate}
        loading={isUpdating || isLoading || isUploading}
        disabled={isUpdating || isLoading || isUploading}
      />
      <S.FormContainer>
        <Formik<FormValues>
          innerRef={formRef}
          initialValues={{
            name: station?.name || "",
            latitude: station?.latitude || 0,
            longitude: station?.longitude || 0,
            renewableEnergyPercent: station?.renewableEnergyPercent || 0,
            status: station?.status || EStationStatus.Active,
          }}
          enableReinitialize
          onSubmit={onSubmit}>
          <Row>
            <Col span={12}>
              {/* Name ------------------------------------ */}
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
              {/* Renewable ------------------------------- */}
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
              {/* Status ------------------------------- */}
              <S.FormGroup>
                <S.LabelCol
                  span={9}
                  style={{ alignItems: "center", display: "flex" }}>
                  <Typo variant="body1">Status:</Typo>
                </S.LabelCol>
                <Col span={9}>
                  <Select
                    name="status"
                    options={Object.values(EStationStatus).map((status) => ({
                      label: status,
                      value: status,
                    }))}
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
            dataSource={images}
            rowKey="id"
            loading={isUploading || isLoading}>
            <Column<IImageItem>
              title="No"
              width={60}
              render={(_, __, index) => index + 1}
            />
            <Column<IImageItem>
              title="File Name"
              dataIndex="name"
              render={(name: string, record) => (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <S.FileNameLink onClick={() => handleViewImage(record)}>
                    {name}
                  </S.FileNameLink>
                  {record.type === "NEW" && <Tag color="blue">New</Tag>}
                </div>
              )}
            />
            <Column<IImageItem>
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
                    onClick={() => handleDeleteImage(record)}>
                    Delete
                  </S.RemoveBtn>
                </S.ActionButtons>
              )}
            />
          </Table>
        </S.TableContainer>
      </S.ImagesManagerContainer>

      <div style={{ height: "var(--s-4)" }} />

      <PlugsManager station={station} isLoading={isLoading} />
    </S.UpdateGreenChargingStation>
  );
}

namespace S {
  export const UpdateGreenChargingStation = styled.div`
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
