import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Krish AI — Your Personal Intelligence",
  description: "A personalized AI companion for conversations, emotional support, and learning. Powered by Llama 3.3 70B via Groq.",
  keywords: ["AI chatbot", "personal assistant", "study helper", "Groq", "Llama"],
  openGraph: {
    title: "Krish AI",
    description: "Your personal AI companion — smarter, faster, more human.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="animated-gradient noise antialiased">
        {children}
      </body>
    </html>
  );
}
