import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { App as AntApp } from "antd";
import App from "./App";
import "./i18n";
import i18n from "./i18n";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

function Root() {
  // const isRtl = i18n.language === "ar";

  // Re-render when language changes
  const [dir, setDir] = React.useState<"ltr" | "rtl">(
    i18n.language === "ar" ? "rtl" : "ltr",
  );

  React.useEffect(() => {
    const handler = (lng: string) => {
      setDir(lng === "ar" ? "rtl" : "ltr");
    };
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, []);

  return (
    <ConfigProvider
      direction={dir}
      theme={{
        token: {
          colorPrimary: "#0D2145",
          colorSuccess: "#52c41a",
          colorWarning: "#faad14",
          colorError: "#ff4d4f",
          borderRadius: 8,
          fontFamily: "'Inter', sans-serif",
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Root />
    </QueryClientProvider>
  </React.StrictMode>,
);
