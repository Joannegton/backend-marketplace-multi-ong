"use client";

import { useAppInitialization } from "@/hooks/app-initialization.hook";

export function AppInitializer() {
  useAppInitialization();
  return null;
}
