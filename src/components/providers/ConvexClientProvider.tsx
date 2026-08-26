"use client";

import React, { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
