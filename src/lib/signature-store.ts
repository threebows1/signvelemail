import { useEffect, useState } from "react";

export type SocialKey =
  | "linkedin"
  | "twitter"
  | "facebook"
  | "instagram"
  | "youtube"
  | "tiktok"
  | "website"
  | "whatsapp"
  | "telegram"
  | "pinterest"
  | "snapchat"
  | "threads"
  | "medium"
  | "behance"
  | "dribbble"
  | "calendly"
  | "discord"
  | "twitch"
  | "spotify"
  | "slack"
  | "bluesky"
  | "mastodon";

export type SocialLinks = Partial<Record<SocialKey, string>>;

export type IconStyle = "solid" | "outline" | "plain" | "none";
export type SocialIconStyle = "color" | "solid" | "outline" | "plain";
export type Spacing = "compact" | "medium" | "large";
export type PhoneType = "main" | "mobile" | "office" | "fax" | "direct" | "home" | "other";
export type PhoneEntry = { type: PhoneType; value: string };

export type SignatureData = {
  // Identity
  name: string;
  title: string;
  department?: string;
  pronouns?: string;
  company: string;
  // Contact
  email: string;
  mobile: string;
  phone: string;
  phones?: PhoneEntry[];
  address: string;
  mapUrl?: string;
  personalAddress?: string;
  website: string;
  schedulingUrl?: string;
  // Media
  photoUrl?: string;
  logoUrl?: string;
  logoWidth?: number;
  cropPhotoCircle?: boolean;
  showPlaceholderPhoto?: boolean;
  // Extras
  tagline?: string;
  quote?: string;
  disclaimer?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  // Colors
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  titleColor?: string;
  linkColor?: string;
  iconColor?: string;
  socialIconColor?: string;
  themeColor?: string;
  dividingLineColor?: string;
  // Typography
  fontFamily: string;
  fontSize?: number;
  titleFontSize?: number;
  separateTitleFontSize?: boolean;
  lineHeight?: number;
  spacing?: Spacing;
  // Icon / social icon rendering
  iconStyle?: IconStyle;
  iconSize?: number;
  socialIconStyle?: SocialIconStyle;
  socialIconSize?: number;
  // Layout toggles
  showIcons: boolean;
  showDisclaimer: boolean;
  showSocials: boolean;
  showDividingLines?: boolean;
  dividingLineSize?: number;
  separateWebsite?: boolean;
  // Social
  socials: SocialLinks;
  socialOrder?: SocialKey[];
};

export const ALL_SOCIAL_KEYS: SocialKey[] = [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "pinterest",
  "twitter",
  "whatsapp",
  "telegram",
  "snapchat",
  "threads",
  "medium",
  "behance",
  "dribbble",
  "calendly",
  "discord",
  "twitch",
  "spotify",
  "slack",
  "bluesky",
  "mastodon",
  "website",
];

export const FEATURED_SOCIAL_KEYS: SocialKey[] = [
  "facebook",
  "instagram",
  "linkedin",
  "tiktok",
  "youtube",
  "pinterest",
];

export type SavedSignature = {
  id: string;
  name: string;
  templateId: string;
  status: "Active" | "Draft";
  updatedAt: number;
  data: SignatureData;
};

export const defaultData: SignatureData = {
  name: "Farrukh Shahzad",
  title: "Marketing Manager",
  department: "Growth",
  pronouns: "he/him",
  company: "Al Riyady Group",
  email: "farrukh@alriyady.ae",
  mobile: "+971 50 274 9769",
  phone: "+971 4 591 8185",
  phones: [
    { type: "main", value: "+971 4 591 8185" },
    { type: "mobile", value: "+971 50 274 9769" },
  ],
  address: "The Curve Building - Office M 47, Dubai - UAE",
  mapUrl: "",
  personalAddress: "",
  website: "alriyadygroup.ae",
  schedulingUrl: "",
  photoUrl: "",
  logoUrl: "",
  logoWidth: 150,
  cropPhotoCircle: true,
  showPlaceholderPhoto: false,
  tagline: "Building signature moments.",
  quote: "",
  disclaimer:
    "The content of this email is confidential and intended for the recipient specified in message only. It is strictly forbidden to share any part of this message with any third party without a written consent of the sender.",
  ctaLabel: "Book a meeting",
  ctaUrl: "https://cal.com/farrukh",
  primaryColor: "#5B2EFF",
  accentColor: "#00E5A0",
  textColor: "#14121F",
  mutedColor: "#6B7280",
  titleColor: "#14121F",
  linkColor: "#5B2EFF",
  iconColor: "#F59E0B",
  socialIconColor: "#F59E0B",
  themeColor: "#0A2A5E",
  dividingLineColor: "#0A2A5E",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 13,
  titleFontSize: 15,
  separateTitleFontSize: false,
  lineHeight: 1.3,
  spacing: "large",
  iconStyle: "solid",
  iconSize: 18,
  socialIconStyle: "color",
  socialIconSize: 30,
  showIcons: true,
  showDisclaimer: true,
  showSocials: true,
  showDividingLines: true,
  dividingLineSize: 2,
  separateWebsite: false,
  socials: {
    linkedin: "https://linkedin.com/in/farrukh",
    twitter: "",
    facebook: "https://facebook.com/alriyady",
    instagram: "https://instagram.com/alriyady",
    youtube: "https://youtube.com/@alriyady",
    whatsapp: "",
    tiktok: "",
    website: "https://alriyadygroup.ae",
  },
};

const KEY = "signvel:signatures:v1";

function read(): SavedSignature[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSignature[];
  } catch {
    return [];
  }
}

function write(list: SavedSignature[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

export function useSignatures() {
  const [list, setList] = useState<SavedSignature[]>(() => read());
  useEffect(() => {
    const on = () => setList(read());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);
  return list;
}

export function getSignature(id: string): SavedSignature | undefined {
  return read().find((s) => s.id === id);
}

export function saveSignature(sig: SavedSignature) {
  const list = read();
  const idx = list.findIndex((s) => s.id === sig.id);
  if (idx >= 0) list[idx] = sig;
  else list.unshift(sig);
  write(list);
}

export function deleteSignature(id: string) {
  write(read().filter((s) => s.id !== id));
}

export function newSignatureId() {
  return `SIG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
