import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dog Food Allergy Scanner",
  description: "Filter dog foods by your dog's allergens using UPC ingredient sources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#fafafa" }}>{children}</body>
    </html>
  );
}
