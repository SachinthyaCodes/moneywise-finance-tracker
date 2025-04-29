// frontend/app/layout.tsx
import "../styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from '../components/Sidebar';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "700"], // Define weights if necessary
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MoneyWise - Finance Management",
  description: "Track your finances with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-screen bg-[#3b82f6]">
          <Sidebar />
          <main className="flex-1 pl-[280px] w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
