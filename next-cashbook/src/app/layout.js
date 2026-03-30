import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "My Cashbook App",
  description: "Manage your finances easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={inter.className}>
        <AuthProvider>
          <AppShell>
            {children}
          </AppShell>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
