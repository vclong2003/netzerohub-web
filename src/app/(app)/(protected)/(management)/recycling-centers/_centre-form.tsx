"use client";

import { useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Formik, type FormikProps } from "formik";
import { Alert, Checkbox, Col, Modal, Row, Spin, type TableProps } from "antd";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Table from "@/components/Table";
import Typo from "@/components/Typo";
import { notifyError, notifySuccess } from "@/utils/utils.notification";
import { CreatedCentreError, RecyclingCentreClientContext, RecyclingCentersMutations, RecyclingCentersQueries, type Attachment, type Centre } from "@/services/service.recycling-centers";
import PageHeading from "./_page-heading";
import * as S from "./_styles";

export function validateCentreForm(centre: Centre): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!centre.name.trim()) errors.name = "Enter a center name.";
  if (!centre.address.trim()) errors.address = "Enter a street address.";
  if (!Number.isFinite(centre.latitude) || Math.abs(centre.latitude) > 90) errors.latitude = "Enter a latitude between -90 and 90.";
  if (!Number.isFinite(centre.longitude) || Math.abs(centre.longitude) > 180) errors.longitude = "Enter a longitude between -180 and 180.";
  if (!centre.materialIds?.length) errors.materialIds = "Select at least one accepted material.";
  for (const key of ["openingTime", "closingTime"] as const) {
    if (!centre[key] || !/^([01]\d|2[0-3]):[0-5]\d$/.test(centre[key])) errors[key] = "Enter a valid time.";
  }
  return errors;
}

const emptyCentre = (): Centre => ({ id: 0, name: "", address: "", latitude: NaN, longitude: NaN, materials: [], materialIds: [], photos: [], infoSheets: [], openingTime: "08:00", closingTime: "17:00" });

export default function CentreForm({ centreId, basePath = "/recycling-centers" }: { centreId?: number; basePath?: string }) {
  const router = useRouter();
  const client = useContext(RecyclingCentreClientContext);
  const formRef = useRef<FormikProps<Centre>>(null);
  const [requestError, setRequestError] = useState("");
  const [persisted, setPersisted] = useState<Centre | null>(null);
  const [fileBusy, setFileBusy] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);
  const [discard, setDiscard] = useState(false);
  const details = RecyclingCentersQueries.useGetCentreById(centreId || 0);
  const materials = RecyclingCentersQueries.useGetWasteTypes();
  const create = RecyclingCentersMutations.useCreateCentre();
  const update = RecyclingCentersMutations.useUpdateCentre(centreId || persisted?.id || 0);
  const centre = persisted || details.data;
  const types = materials.data || [];
  const readOnly = !!centre && (centre.photos.length > 0 || centre.infoSheets.length > 0);
  const busy = create.isPending || update.isPending || fileBusy;
  const invalidId = centreId !== undefined && (!Number.isInteger(centreId) || centreId <= 0);
  const isNew = centreId === undefined && !persisted;

  const back = () => {
    if (busy || formRef.current?.isSubmitting) return;
    if (formRef.current?.dirty) setDiscard(true);
    else router.push(basePath);
  };

  async function onSubmit(values: Centre) {
    if (busy || readOnly) return;
    setRequestError("");
    const payload: Centre = { ...values, id: centre?.id || 0, materials: (values.materialIds || []).map(id => types.find(type => type.id === id)?.name || "") };
    try {
      if (isNew) await create.mutateAsync({ centre: payload, wasteTypes: types });
      else await update.mutateAsync({ centre: payload, before: centre!, wasteTypes: types });
      notifySuccess(isNew ? "Recycling center created successfully" : "Recycling center updated successfully");
      router.push(basePath);
    } catch (error) {
      if (error instanceof CreatedCentreError) setPersisted(error.centre);
      const message = error instanceof Error ? error.message : "Could not save this center.";
      setRequestError(message);
      notifyError(message);
    }
  }

  async function openFile(file: Attachment, download = false) {
    if (busy) return;
    setFileBusy(true); setRequestError("");
    try {
      const url = await client.fileUrl(file.url);
      if (!download) setPreview({ ...file, url });
      else {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Could not download this file.");
        const localUrl = URL.createObjectURL(await response.blob());
        const link = document.createElement("a"); link.href = localUrl; link.download = file.name;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(localUrl), 1000);
      }
    } catch (error) { setRequestError(error instanceof Error ? error.message : "Could not open this file."); }
    finally { setFileBusy(false); }
  }

  function filesSection(kind: "image" | "pdf") {
    const pdf = kind === "pdf";
    const files = centre?.[pdf ? "infoSheets" : "photos"] || [];
    const columns: TableProps["columns"] = [
      { title: "No", width: 60, render: (_, __, index) => index + 1 },
      { title: "File Name", dataIndex: "name", render: (name, file) => <S.FileLink disabled={busy} onClick={() => void openFile(file as Attachment)}>{name}</S.FileLink> },
      { title: "Action", width: 240, render: (_, file) => <S.FileActions>
        <S.ViewButton disabled={busy} onClick={() => void openFile(file as Attachment)}>View</S.ViewButton>
        <S.DownloadLink as="button" type="button" disabled={busy} onClick={() => void openFile(file as Attachment, true)}>Download</S.DownloadLink>
        <S.RemoveButton disabled>Delete</S.RemoveButton>
      </S.FileActions> },
    ];
    return <S.AttachmentPanel aria-label={pdf ? "Info Sheets" : "Images"}>
      <Row><Col span={12}><S.FormGroup><S.LabelCol span={4}><Typo variant="body1">{pdf ? "Info Sheets:" : "Images:"}</Typo></S.LabelCol><Col span={20}>
        <S.UploadButton><label>{pdf ? "Upload PDF" : "Upload Image"}<S.FileInput type="file" disabled accept={pdf ? ".pdf,application/pdf" : "image/jpeg,image/png,image/webp"} aria-label={pdf ? "Choose PDF info sheets" : "Choose center images"} /></label></S.UploadButton>
        <S.FileHint>Saving and removing attachments is temporarily unavailable.</S.FileHint>
      </Col></S.FormGroup></Col></Row>
      <S.FileTable><Table pagination={false} dataSource={files} rowKey="id" columns={columns} locale={{ emptyText: pdf ? "No info sheets" : "No images" }} /></S.FileTable>
    </S.AttachmentPanel>;
  }

  if (invalidId) return <S.Page><Alert type="error" title="Invalid recycling center ID." /><S.CancelButton onClick={() => router.push(basePath)}>Back to list</S.CancelButton></S.Page>;
  if (details.isLoading || materials.isLoading) return <S.Page><Spin /><Typo variant="body1">Loading recycling center...</Typo></S.Page>;
  if (details.error || materials.error) return <S.Page><Alert type="error" title={(details.error || materials.error)!.message} showIcon /><S.CancelButton onClick={() => router.push(basePath)}>Back to list</S.CancelButton><Button onClick={() => { void details.refetch(); void materials.refetch(); }}>Retry</Button></S.Page>;
  if (centreId !== undefined && !centre) return <Alert type="error" title="Recycling center not found." />;

  return <S.Page>
    <S.CancelButton disabled={busy} onClick={back}>Back to list</S.CancelButton>
    {requestError && <S.Feedback role="alert"><Alert type="error" title={requestError} showIcon /></S.Feedback>}
    {persisted && <S.Feedback><Alert type="warning" title={`Center ${persisted.id} has already been created. Saving again will update this center.`} showIcon /></S.Feedback>}
    {readOnly && <S.Feedback><Alert type="warning" title="This center has saved attachments. Editing is temporarily unavailable; you can still view and download files." showIcon /></S.Feedback>}
    <Formik<Centre> innerRef={formRef} initialValues={centre || emptyCentre()} validate={validateCentreForm} onSubmit={onSubmit}>
      {form => <>
        <PageHeading title={isNew ? "Add New Recycling Center" : "Recycling Center Details"} variant={isNew ? "add" : "update"} onAdd={() => void form.submitForm()} onUpdate={() => void form.submitForm()} loading={busy || form.isSubmitting} disabled={busy || form.isSubmitting || readOnly} />
        {form.submitCount > 0 && Object.keys(form.errors).length > 0 && <S.Feedback role="alert"><Alert type="error" title="Please complete the required fields." /></S.Feedback>}
        <S.FormPanel as="fieldset" disabled={busy || form.isSubmitting || readOnly}>
          <Row>{(["name", "address", "openingTime", "closingTime", "latitude", "longitude"] as const).map(key => {
            const numeric = key === "latitude" || key === "longitude";
            const labels = { name: "Name", address: "Address", openingTime: "Opening Time", closingTime: "Closing Time", latitude: "Latitude", longitude: "Longitude" };
            const error = form.touched[key] || form.submitCount > 0 ? form.errors[key] : undefined;
            return <Col span={12} key={key}><S.FormGroup><S.LabelCol span={9}><label htmlFor={`center-${key}`}><Typo variant="body1">{labels[key]}: *</Typo></label></S.LabelCol><Col span={15}>
              <Input id={`center-${key}`} name={key} type={numeric ? "number" : key.endsWith("Time") ? "time" : "text"} step={numeric ? "any" : undefined} value={numeric ? Number.isFinite(form.values[key]) ? form.values[key] : "" : form.values[key] || ""} error={error} aria-invalid={!!error} />
            </Col></S.FormGroup></Col>;
          })}</Row>
          <Row><Col span={24}><S.FormGroup><S.LabelCol span={4}><Typo variant="body1">Accepted Materials: *</Typo></S.LabelCol><Col span={20}>
            <Checkbox.Group<number> aria-label="Accepted materials" disabled={busy || form.isSubmitting || readOnly} options={types.map(type => ({ label: type.name, value: type.id }))} value={form.values.materialIds || []} onChange={ids => { if (!busy && !form.isSubmitting && !readOnly) void form.setFieldValue("materialIds", ids); }} />
            {!types.length && <S.FileHint>No accepted materials are configured on the server.</S.FileHint>}
            {(form.touched.materialIds || form.submitCount > 0) && form.errors.materialIds && <S.FileHint role="alert">{form.errors.materialIds}</S.FileHint>}
          </Col></S.FormGroup></Col></Row>
        </S.FormPanel>
      </>}
    </Formik>
    {filesSection("image")}{filesSection("pdf")}
    <Modal open={discard} title="Discard changes?" onCancel={() => setDiscard(false)} onOk={() => router.push(basePath)} okText="Discard changes"><Typo variant="body1">Your unsaved changes will be discarded.</Typo></Modal>
    <Modal open={!!preview} title={preview?.name} onCancel={() => setPreview(null)} footer={<Button onClick={() => setPreview(null)}>Close</Button>} width={900} destroyOnHidden>
      {preview && (/\.pdf$/i.test(preview.name) ? <><S.FileHint>If the PDF does not display, <a href={preview.url} target="_blank" rel="noopener noreferrer">open it in a new tab</a> or use Download from the file list.</S.FileHint><S.PdfPreview title={`PDF preview: ${preview.name}`} src={preview.url} /></> : <S.ImagePreview src={preview.url} alt={preview.name} />)}
    </Modal>
  </S.Page>;
}
