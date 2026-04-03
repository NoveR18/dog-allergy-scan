import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pet Food Allergy Scanner",
  description:
    "Check pet food products against your saved pet allergens using barcode ingredient sources.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fafafa" }}>{children}</body>
    </html>
  );
}
