import "../styles/globals.css";
import { LayoutWrapper } from "@/components";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <UIProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
