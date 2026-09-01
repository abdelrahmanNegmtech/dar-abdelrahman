export type OwnerSettingsFormValues = {
  address: string;
  city: string;
  country: string;
  displayName: string;
  fullName: string;
  phone: string;
  preferredCurrency: string;
  preferredLanguage: string;
};

export type OwnerSettingsPageData = {
  profile: {
    address: string | null;
    avatarUrl: string | null;
    city: string | null;
    country: string | null;
    countryName: string | null;
    createdAt: string;
    displayName: string | null;
    email: string;
    emailVerified: boolean;
    fullName: string;
    identityVerified: boolean;
    phone: string | null;
    phoneVerified: boolean;
    preferredCurrency: string | null;
    preferredLanguage: string | null;
    updatedAt: string;
  };
  verification: {
    approvedAt: string | null;
    href: string;
    rejectedAt: string | null;
    status: string;
    statusLabel: string;
    submittedAt: string | null;
  };
};

export type OwnerSettingsActionResult = {
  fieldErrors?: Partial<Record<keyof OwnerSettingsFormValues, string>>;
  message: string;
  ok: boolean;
};
