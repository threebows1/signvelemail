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
  address: string;
  website: string;
  // Media
  photoUrl?: string;
  logoUrl?: string;
  // Extras
  tagline?: string;
  quote?: string;
  disclaimer?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  // Style
  primaryColor: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  fontFamily: string;
  showIcons: boolean;
  showDisclaimer: boolean;
  showSocials: boolean;
  // Social
  socials: SocialLinks;
};

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
  address: "The Curve Building - Office M 47, Dubai - UAE",
  website: "alriyadygroup.ae",
  photoUrl: "",
  logoUrl: "",
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
  fontFamily: "Arial, Helvetica, sans-serif",
  showIcons: true,
  showDisclaimer: true,
  showSocials: true,
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
