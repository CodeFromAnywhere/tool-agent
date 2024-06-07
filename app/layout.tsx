export const metadata = {
  title: "Agent OpenAPI",
  description: "Make your agents available as tools",
};
import "./globals.css";
import "openapi-for-humans-react/css.css";
import "react-openapi-form/css.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
