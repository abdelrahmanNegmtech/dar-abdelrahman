export type AccountType = "guest" | "owner";
export type OAuthProvider = "facebook" | "google";

export type SignUpInput = {
  accountType: AccountType;
  countryCode: string;
  countryName: string;
  dialingCode: string;
  email: string;
  fullName: string;
  password: string;
  phone?: string;
};

export type LoginInput = {
  email: string;
  password: string;
  remember?: boolean;
};
