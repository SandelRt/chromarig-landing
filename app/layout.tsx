import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "ChromaRig by Lemniloop Studio",
  description:
    "Pick one color, preview the palette, set 1-4 lights, aim at empties, and generate a Blender lighting rig.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
