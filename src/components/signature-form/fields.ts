export type FieldSection = "identity" | "contact" | "website";

export type FieldKey =
  | "fullName"
  | "jobTitle"
  | "department"
  | "company"
  | "email"
  | "mobile"
  | "officePhone"
  | "address"
  | "mapUrl"
  | "website";

export type FieldConfig = {
  key: FieldKey;
  label: string;
  placeholder?: string;
  section: FieldSection;
  half?: boolean;
};

export const FIELDS: FieldConfig[] = [
  { key: "fullName", label: "Full name", placeholder: "Alex Rivera", section: "identity" },
  { key: "jobTitle", label: "Job title", placeholder: "Brand Designer", section: "identity" },
  { key: "department", label: "Department", placeholder: "Design", section: "identity", half: true },
  { key: "company", label: "Company", placeholder: "Sign Vel", section: "identity" },

  { key: "email", label: "Email", placeholder: "alex@signvel.com", section: "contact" },
  { key: "mobile", label: "Mobile", placeholder: "+1 (415) 555 0142", section: "contact", half: true },
  { key: "officePhone", label: "Office phone", placeholder: "+1 (415) 555 0100", section: "contact", half: true },
  { key: "address", label: "Address", placeholder: "500 Market Street, Suite 400", section: "contact" },
  { key: "mapUrl", label: "Address / map URL", placeholder: "https://maps.google.com/…", section: "contact" },

  { key: "website", label: "Website", placeholder: "signvel.com", section: "website" },
];

export type SignatureFormState = Record<FieldKey, string> & {
  photoUrl: string;
  logoUrl: string;
};

export const INITIAL_STATE: SignatureFormState = {
  fullName: "Alex Rivera",
  jobTitle: "Brand Designer",
  department: "Design",
  company: "Sign Vel",
  email: "alex@signvel.com",
  mobile: "+1 (415) 555 0142",
  officePhone: "+1 (415) 555 0100",
  address: "500 Market Street, Suite 400, San Francisco, CA 94105",
  mapUrl: "",
  website: "signvel.com",
  photoUrl: "",
  logoUrl: "",
};
