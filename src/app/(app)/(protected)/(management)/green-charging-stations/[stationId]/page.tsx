"use client";

import { useParams, useRouter } from "next/navigation";
import styled from "styled-components";
import PageHeading from "../_page-heading";
import {
  GreenChargingStationsMutations,
  GreenChargingStationsQueries,
} from "@/services/service.green-charging-stations";
import { useFormik } from "formik";

export default function GreenChargingStationDetail() {
  const params = useParams<{ stationId: string }>();
  const router = useRouter();

  if (!params.stationId || isNaN(Number(params.stationId))) {
    router.replace("/green-charging-stations");
  }

  const stationId = Number(params.stationId);
  const { data, isLoading } =
    GreenChargingStationsQueries.useGetStationById(stationId);

  const {} = useFormik<GreenChargingStationsMutations.IUpdateStationPayload>({
    initialValues: { ...data },
    onSubmit: () => {},
  });
  console.log("station detail data", data);

  return (
    <S.GreenChargingStationDetail>
      <PageHeading title="NRMA Green Charging Stations" variant="update" />
    </S.GreenChargingStationDetail>
  );
}

namespace S {
  export const GreenChargingStationDetail = styled.div`
    width: 100%;
  `;
}
