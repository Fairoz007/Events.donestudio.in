"use client";

import React, { ReactNode } from "react";
import { ClerkProvider, useAuth as useClerkAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { AuthProvider } from "@/context/AuthContext";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useClerkAuth as any}>
        <AuthProvider>{children}</AuthProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
