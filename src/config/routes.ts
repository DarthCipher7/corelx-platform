export interface NavLink {
  label: string;
  href: string;
  requiresAuth?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
}

export type FooterCategory = "Platform" | "Product" | "Company";

export type SocialPlatform = "instagram" | "linkedin" | "x" | "whatsapp";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  href: string | null;
  disabled: boolean;
}

export const SITE_URL = "https://corelx.app";
export const BRAND_NAME = "CORELX";
export const BRAND_TAGLINE =
  "The identity layer for the next generation of creators, builders, and visionaries.";

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Feed", href: "/feed", requiresAuth: true },
  { label: "Explore", href: "/explore" },
  { label: "Collab Board", href: "/collabs" },
  { label: "Pods", href: "/pods", requiresAuth: true },
  { label: "Showcase", href: "/showcase" },
] as const;

export const FOOTER_LINKS: Record<FooterCategory, readonly FooterLink[]> = {
  Platform: [
    { label: "Explore", href: "/explore" },
    { label: "Showcase", href: "/showcase" },
    { label: "Collab Board", href: "/collabs" },
    { label: "Community", href: "/community" },
    { label: "Blog", href: "/blog" },
  ],
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Changelog", href: "/changelog" },
    { label: "Roadmap", href: "/roadmap" },
    { label: "API", href: "/api" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
} as const;

export const SOCIAL_LINKS: readonly SocialLink[] = [
  {
    platform: "instagram",
    label: "Instagram",
    href: null,
    disabled: true,
  },
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: null,
    disabled: true,
  },
  {
    platform: "x",
    label: "X",
    href: null,
    disabled: true,
  },
  {
    platform: "whatsapp",
    label: "WhatsApp",
    href: null,
    disabled: true,
  },
] as const;
