"use client";

import { useQueryClient } from "@/services/_config.queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";

export default function AppLayout({ children }: LayoutProps<"/">) {
  const { queryClient } = useQueryClient();

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </>
  );
}
