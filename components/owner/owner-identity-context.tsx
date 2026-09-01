"use client";

import { createContext, useContext } from "react";
import { fallbackOwnerIdentity, type OwnerIdentity } from "@/components/owner/owner-identity";

const OwnerIdentityContext = createContext<OwnerIdentity>(fallbackOwnerIdentity);

export function OwnerIdentityProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: OwnerIdentity;
}) {
  return (
    <OwnerIdentityContext.Provider value={value}>
      {children}
    </OwnerIdentityContext.Provider>
  );
}

export function useOwnerIdentity() {
  return useContext(OwnerIdentityContext);
}
