import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  name: "Alex Rivera",
  title: "Brand Designer",
  department: "Design",
  pronouns: "they/them",
  company: "Sign Vel",
  email: "alex@signvel.com",
  mobile: "+1 (415) 555 0142",
  phone: "+1 (415) 555 0100",
  phones: [
    { type: "main", value: "+1 (415) 555 0100" },
    { type: "mobile", value: "+1 (415) 555 0142" },
  ],
  address: "500 Market Street, Suite 400, San Francisco, CA 94105",
  mapUrl: "",
  personalAddress: "",
  website: "signvel.com",
  schedulingUrl: "",
  photoUrl: "",
  logoUrl: "",
  logoWidth: 150,
  cropPhotoCircle: true,
  showPlaceholderPhoto: false,
  tagline: "Signatures worth signing off with.",
  quote: "",
  disclaimer:
    "This email and any attachments are confidential and intended solely for the addressee. If you have received it in error, please notify the sender and delete it from your system.",
  ctaLabel: "Book a meeting",
  ctaUrl: "https://cal.com/signvel",
  primaryColor: "#5B2EFF",
  accentColor: "#00E5A0",
  textColor: "#14121F",
  mutedColor: "#6B7280",
  titleColor: "#14121F",
  linkColor: "#5B2EFF",
  iconColor: "#5B2EFF",
  socialIconColor: "#5B2EFF",
  themeColor: "#5B2EFF",
  dividingLineColor: "#5B2EFF",
  fontFamily: "Rubik, Arial, sans-serif",
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
    linkedin: "https://linkedin.com/company/signvel",
    twitter: "https://twitter.com/signvel",
    facebook: "https://facebook.com/signvel",
    instagram: "https://instagram.com/signvel",
    youtube: "https://youtube.com/@signvel",
    whatsapp: "",
    tiktok: "",
  },
};

const KEY = "signvel:signatures:v1";

function readLocal(): SavedSignature[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSignature[];
  } catch {
    return [];
  }
}

function writeLocal(list: SavedSignature[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
}

function rowToSaved(row: any): SavedSignature {
  return {
    id: row.id,
    name: row.name,
    templateId: row.template_id,
    status: row.status as "Active" | "Draft",
    updatedAt: new Date(row.updated_at).getTime(),
    data: { ...defaultData, ...row.data } as SignatureData,
  };
}

export function useSignatures() {
  const [list, setList] = useState<SavedSignature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setList(readLocal());
    const on = () => setList(readLocal());
    window.addEventListener("storage", on);
    return () => window.removeEventListener("storage", on);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      setLoading(true);
      try {
        const { data: rows, error } = await supabase
          .from("signatures")
          .select("id, name, template_id, status, data, updated_at")
          .order("updated_at", { ascending: false });
        if (error) throw error;
        const cloud = (rows ?? []).map(rowToSaved);
        if (!cancelled) {
          setList(cloud);
          writeLocal(cloud);
        }
      } catch (e) {
        console.error("Failed to load cloud signatures", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { list, loading };
}

export async function getSignature(id: string): Promise<SavedSignature | undefined> {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    try {
      const { data: rows, error } = await supabase
        .from("signatures")
        .select("id, name, template_id, status, data, updated_at")
        .eq("id", id)
        .limit(1);
      if (error) throw error;
      if (rows && rows.length > 0) return rowToSaved(rows[0]);
    } catch (e) {
      console.error("Failed to get cloud signature", e);
    }
  }
  return readLocal().find((s) => s.id === id);
}

export async function saveSignature(sig: SavedSignature) {
  const local = readLocal();
  const idx = local.findIndex((s) => s.id === sig.id);
  if (idx >= 0) local[idx] = sig;
  else local.unshift(sig);
  writeLocal(local);

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    try {
      const { data: existing } = await supabase.from("signatures").select("id").eq("id", sig.id).limit(1);
      const row = {
        id: sig.id,
        name: sig.name,
        template_id: sig.templateId,
        status: sig.status,
        data: sig.data as any,
        updated_at: new Date(sig.updatedAt).toISOString(),
        user_id: data.session.user.id,
      };
      if (existing && existing.length > 0) {
        const { error } = await supabase.from("signatures").update(row).eq("id", sig.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("signatures").insert(row);
        if (error) throw error;
      }
    } catch (e) {
      console.error("Failed to sync signature to cloud", e);
    }
  }
}

export async function deleteSignature(id: string) {
  writeLocal(readLocal().filter((s) => s.id !== id));

  const { data } = await supabase.auth.getSession();
  if (data.session) {
    try {
      const { error } = await supabase.from("signatures").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Failed to delete cloud signature", e);
    }
  }
}

export function newSignatureId() {
  return `SIG-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}
