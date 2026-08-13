import type { ComponentType, SVGProps } from "react";
import {
  SiFacebook,
  SiInstagram,
  SiTiktok,
  SiYoutube,
  SiPinterest,
  SiX,
  SiWhatsapp,
  SiTelegram,
  SiSnapchat,
  SiThreads,
  SiMedium,
  SiBehance,
  SiDribbble,
  SiCalendly,
  SiDiscord,
  SiTwitch,
  SiSpotify,
  SiBluesky,
  SiMastodon,
} from "@icons-pack/react-simple-icons";
import type { SocialKey } from "@/lib/signature-store";

/**
 * Brand-accurate social icons.
 *
 * LinkedIn and Slack were removed from Simple Icons at the brands' request,
 * so we ship hand-written inline SVGs for those two.
 */

function LinkedinGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h1.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

function SlackGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      {...props}
    >
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.525 2.525H2.525A2.528 2.528 0 0 1 0 15.165a2.528 2.528 0 0 1 2.525-2.525h.005a2.528 2.528 0 0 1 2.512 2.525zM2.525 12.645a2.528 2.528 0 0 1-2.525-2.525 2.528 2.528 0 0 1 2.525-2.525 2.528 2.528 0 0 1 2.525 2.525v2.525H2.525zm2.525-5.05a2.528 2.528 0 0 1-2.525 2.525H2.525A2.528 2.528 0 0 1 0 5.088 2.528 2.528 0 0 1 2.525 2.563a2.528 2.528 0 0 1 2.525 2.525v2.51zm5.045-2.525a2.528 2.528 0 0 1-2.525 2.525h-.005a2.528 2.528 0 0 1-2.525-2.525V2.563a2.528 2.528 0 0 1 2.525-2.525 2.528 2.528 0 0 1 2.525 2.525v2.51zm-2.525 5.05a2.528 2.528 0 0 1 2.525 2.525 2.528 2.528 0 0 1-2.525 2.525h-2.51a2.528 2.528 0 0 1-2.525-2.525 2.528 2.528 0 0 1 2.525-2.525h2.51zm12.62 2.525a2.528 2.528 0 0 1-2.525 2.525 2.528 2.528 0 0 1-2.525-2.525v-2.525h2.525a2.528 2.528 0 0 1 2.525 2.525zm2.525-5.05a2.528 2.528 0 0 1-2.525 2.525H15.16a2.528 2.528 0 0 1-2.525-2.525 2.528 2.528 0 0 1 2.525-2.525h2.525a2.528 2.528 0 0 1 2.525 2.525zm-5.05-2.525a2.528 2.528 0 0 1-2.525-2.525V2.563a2.528 2.528 0 0 1 2.525-2.525 2.528 2.528 0 0 1 2.525 2.525v2.51a2.528 2.528 0 0 1-2.525 2.525zm-2.525 7.575a2.528 2.528 0 0 1 2.525-2.525h2.525a2.528 2.528 0 0 1 2.525 2.525 2.528 2.528 0 0 1-2.525 2.525H15.16a2.528 2.528 0 0 1-2.525-2.525z" />
    </svg>
  );
}

function GlobeGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm7.938 7h-3.02a15.6 15.6 0 0 0-1.35-3.48A10.03 10.03 0 0 1 19.938 7zM12 2.06c.83 1.06 1.79 2.79 2.36 4.94H9.64C10.21 4.85 11.17 3.12 12 2.06zM2.06 13a9.95 9.95 0 0 1 0-2h3.4a19.6 19.6 0 0 0 0 2H2.06zm.79 2h3.02c.32 1.24.77 2.42 1.35 3.48A10.03 10.03 0 0 1 2.85 15zm3.02-8H2.85a10.03 10.03 0 0 1 4.37-3.48A15.6 15.6 0 0 0 5.87 7zM12 21.94c-.83-1.06-1.79-2.79-2.36-4.94h4.72c-.57 2.15-1.53 3.88-2.36 4.94zM14.82 15H9.18a17.6 17.6 0 0 1 0-6h5.64a17.6 17.6 0 0 1 0 6zm1.95 3.48c.58-1.06 1.03-2.24 1.35-3.48h3.02a10.03 10.03 0 0 1-4.37 3.48zM18.54 13a19.6 19.6 0 0 0 0-2h3.4a9.95 9.95 0 0 1 0 2h-3.4z" />
    </svg>
  );
}

export const socialGlyphMap: Record<SocialKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  linkedin: LinkedinGlyph as ComponentType<SVGProps<SVGSVGElement>>,
  twitter: SiX as ComponentType<SVGProps<SVGSVGElement>>,
  facebook: SiFacebook as ComponentType<SVGProps<SVGSVGElement>>,
  instagram: SiInstagram as ComponentType<SVGProps<SVGSVGElement>>,
  youtube: SiYoutube as ComponentType<SVGProps<SVGSVGElement>>,
  tiktok: SiTiktok as ComponentType<SVGProps<SVGSVGElement>>,
  whatsapp: SiWhatsapp as ComponentType<SVGProps<SVGSVGElement>>,
  telegram: SiTelegram as ComponentType<SVGProps<SVGSVGElement>>,
  pinterest: SiPinterest as ComponentType<SVGProps<SVGSVGElement>>,
  snapchat: SiSnapchat as ComponentType<SVGProps<SVGSVGElement>>,
  threads: SiThreads as ComponentType<SVGProps<SVGSVGElement>>,
  medium: SiMedium as ComponentType<SVGProps<SVGSVGElement>>,
  behance: SiBehance as ComponentType<SVGProps<SVGSVGElement>>,
  dribbble: SiDribbble as ComponentType<SVGProps<SVGSVGElement>>,
  calendly: SiCalendly as ComponentType<SVGProps<SVGSVGElement>>,
  discord: SiDiscord as ComponentType<SVGProps<SVGSVGElement>>,
  twitch: SiTwitch as ComponentType<SVGProps<SVGSVGElement>>,
  spotify: SiSpotify as ComponentType<SVGProps<SVGSVGElement>>,
  slack: SlackGlyph as ComponentType<SVGProps<SVGSVGElement>>,
  bluesky: SiBluesky as ComponentType<SVGProps<SVGSVGElement>>,
  mastodon: SiMastodon as ComponentType<SVGProps<SVGSVGElement>>,
  website: GlobeGlyph as ComponentType<SVGProps<SVGSVGElement>>,
};

export const socialBrandColor: Record<SocialKey, string> = {
  linkedin: "#0A66C2",
  twitter: "#000000",
  facebook: "#0866FF",
  instagram: "#E4405F",
  youtube: "#FF0000",
  tiktok: "#000000",
  whatsapp: "#25D366",
  telegram: "#26A5E4",
  pinterest: "#BD081C",
  snapchat: "#FFFC00",
  threads: "#000000",
  medium: "#000000",
  behance: "#1769FF",
  dribbble: "#EA4C89",
  calendly: "#006BFF",
  discord: "#5865F2",
  twitch: "#9146FF",
  spotify: "#1ED760",
  slack: "#4A154B",
  bluesky: "#1185FE",
  mastodon: "#6364FF",
  website: "#5B2EFF",
};
