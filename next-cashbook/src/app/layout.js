import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "react-hot-toast";

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
          <div className="h-screen flex flex-col">
            <Navbar />
            <div className="flex flex-1 bg-black overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
