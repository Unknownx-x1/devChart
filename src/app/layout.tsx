import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
