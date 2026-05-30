import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Диплом хамгаалалтын систем",
  description: "Дипломын бүртгэл, хуваарь, оноо, шүүмжийн удирдлагын систем.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="mn">
      <body>
        <Providers>
          <div className="aurora" />
          <div className="grid-mask" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
