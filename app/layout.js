import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["greek"] });

export const metadata = {
  title: "Assistly",
  description: "by Gayanthika Shankar",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
