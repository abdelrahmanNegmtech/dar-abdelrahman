"use client";

import { useCallback } from "react";
import { getShareText } from "../utils/shareUrls";
import type { SharePropertyData } from "../types";

export function useNativeShare() {
  return useCallback(async (property: SharePropertyData) => {
    if (!navigator.share) return false;

    await navigator.share({
      text: getShareText(property),
      title: property.title,
      url: property.url,
    });
    return true;
  }, []);
}
