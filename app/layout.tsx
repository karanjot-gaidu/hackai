import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import Script from "next/script";
import localFont from "next/font/local";
import { templateMetadata } from "./_template/content/metadata";
import { UserProvider } from "./contexts/UserContext";
import GlobalAICoach from "./components/GlobalAICoach";

export const metadata = {
  title: "CreatorStudio",
  description: "From Zero to Creator - Let AI guide you through content creation with step-by-step assistance",
};

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

/**
 * This object can be customized to change Clerk's built-in appearance. To learn more: https://clerk.com/docs/customization/overview
 */
const clerkAppearanceObject = {
  variables: { colorPrimary: "#000000" },
  elements: {
    socialButtonsBlockButton:
      "bg-white border-gray-200 hover:bg-transparent hover:border-black text-gray-600 hover:text-black",
    socialButtonsBlockButtonText: "font-semibold",
    formButtonReset:
      "bg-white border border-solid border-gray-200 hover:bg-transparent hover:border-black text-gray-500 hover:text-black",
    membersPageInviteButton:
      "bg-black border border-black border-solid hover:bg-white hover:text-black",
    card: "bg-[#fafafa]",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <ClerkProvider appearance={clerkAppearanceObject}>
        <UserProvider>
          <body className={`min-h-screen flex flex-col antialiased bg-[#1A1A1A] text-white`}>
            {children}
            <GlobalAICoach />
          </body>
        </UserProvider>
      </ClerkProvider>

      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/components/prism-core.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/prismjs@1/plugins/autoloader/prism-autoloader.min.js" />
    </html>
  );
}
