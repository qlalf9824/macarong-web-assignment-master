import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/providers";

export const metadata: Metadata = {
  title: "예약 요청 관리",
  description: "마이클 사전과제 - 정비 예약 요청 관리",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
