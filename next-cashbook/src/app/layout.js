import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";
import AppShell from "@/components/AppShell";

export const metadata = {
  title: "My Cashbook App",
  description: "Manage your finances easily",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <body className="font-sans antialiased">
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
