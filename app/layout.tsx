// /app/layout.tsx

import "../styles/global.css";
import { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <div className="p-6">{children}</div>
      </body>
    </html>
  );
}
