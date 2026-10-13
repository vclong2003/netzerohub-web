"use client";

import { useParams } from "next/navigation";
import CentreForm from "../_centre-form";

export default function RecyclingCenterDetails() {
  const params = useParams<{ centreId: string }>();
  return <CentreForm key={params.centreId} centreId={Number(params.centreId)} />;
}
