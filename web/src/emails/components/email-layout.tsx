import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import type React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Html>
    <Tailwind
      config={{
        theme: {
          extend: {
            fontFamily: {
              sans: [
                "Geist",
                "var(--font-geist-sans)",
                "ui-sans-serif",
                "system-ui",
                "sans-serif",
                "Apple Color Emoji",
                "Segoe UI Emoji",
                "Segoe UI Symbol",
                "Noto Color Emoji",
              ],
            },
            borderRadius: {
              sm: "0.375rem",
              md: "0.5rem",
              lg: "0.625rem",
              xl: "0.875rem",
            },
            colors: {
              background: "#ffffff",
              foreground: "#0a0a0a",
              card: "#ffffff",
              "card-foreground": "#0a0a0a",
              popover: "#ffffff",
              "popover-foreground": "#0a0a0a",
              primary: "#171717",
              "primary-foreground": "#fafafa",
              secondary: "#f5f5f5",
              "secondary-foreground": "#171717",
              muted: "#f5f5f5",
              "muted-foreground": "#737373",
              accent: "#f5f5f5",
              "accent-foreground": "#171717",
              destructive: "#e7000b",
              border: "#e5e5e5",
              input: "#e5e5e5",
              ring: "#a1a1a1",
            },
          },
        },
      }}
    >
      <Head />
      <Preview>{preview}</Preview>
      <Body className="bg-muted p-2">
        <Container className="bg-background mx-auto max-w-xl rounded-xl px-6 py-12">
          <Section>
            <Img
              src="https://placehold.co/1000x200.jpg"
              alt="NextGuard Logo"
              className="mx-auto h-12"
            />
          </Section>
          <Hr className="my-6 border" />
          {children}
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
