"use client";

import { Splash } from "@/components/Splash";
import { AuthQueries } from "@/services/service.auth";
import { useRouter } from "next/navigation";

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  const router = useRouter();
  const { data: me, isPending } = AuthQueries.useMyAccount();

  if (isPending) return <Splash />;

  if (!!me?.id) return children;

  if (!me?.id) return router.replace("/login");

  return <></>;
}
