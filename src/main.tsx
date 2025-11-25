import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import router from "./router";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/domains/login/store/useAuthStore";
import AlertProvider from "@/shared/providers/AlertProvider";

const queryClient = new QueryClient();

// 앱 초기화 시 인증 상태 복원
useAuthStore.getState().restoreAuth();

// async function enableMocking() {
//   if (import.meta.env.MODE !== 'development') {
//     return;
//   }
//   const { worker } = await import('./mocks/browser');

//   return worker.start({
//     onUnhandledRequest: 'bypass',
//   });
// }

// enableMocking().then(() => {
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AlertProvider>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
          }}
        />
      </AlertProvider>
    </QueryClientProvider>
  </StrictMode>
);
// });
