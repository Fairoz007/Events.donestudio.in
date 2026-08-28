"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import React, { createContext, useContext, useEffect } from "react";
import { api } from "../../convex/_generated/api";

type UserProfile = NonNullable<ReturnType<typeof useQuery<typeof api.profiles.getCurrentProfile>>>;

interface AuthContextType {
  user: UserProfile | null;
  isSignedIn: boolean;
  isClerkSignedIn: boolean;
  isConvexAuthenticated: boolean;
  isLoaded: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCreator: boolean;
  isStreamer: boolean;
  canHostEvents: boolean;
  switchDemoRole: (role: "user" | "streamer" | "creator" | "admin" | "super_admin") => void;
  updateUserPoints: (points: number, reason: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isSignedIn: false,
  isClerkSignedIn: false,
  isConvexAuthenticated: false,
  isLoaded: false,
  isAdmin: false,
  isSuperAdmin: false,
  isCreator: false,
  isStreamer: false,
  canHostEvents: false,
  switchDemoRole: () => {},
  updateUserPoints: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useUser();
  const { isAuthenticated: convexAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
  const profile = useQuery(api.profiles.getCurrentProfile, convexAuthenticated ? {} : "skip");
  const syncProfile = useMutation(api.profiles.syncProfile);

  useEffect(() => {
    if (!clerkLoaded || !clerkSignedIn || !clerkUser || !convexAuthenticated) return;
    const userEmail =
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      "";
    const isTargetAdmin = userEmail.toLowerCase() === "fairozfaisal2001@gmail.com";

    void syncProfile({
      displayName: clerkUser.fullName || clerkUser.username || (isTargetAdmin ? "The Hook" : "D-One Member"),
      avatarUrl: clerkUser.imageUrl,
      email: userEmail || undefined,
      username: clerkUser.username || (isTargetAdmin ? "hook" : undefined),
    }).catch((error) => console.error("Unable to synchronize the signed-in profile", error));
  }, [clerkLoaded, clerkUser, convexAuthenticated, clerkSignedIn, syncProfile]);

  const user = profile ?? null;
  const role = user?.role;
  const canHostEvents = Boolean(user?.canHostEvents || role === "admin" || role === "super_admin" || role === "creator");

  return (
    <AuthContext.Provider value={{
      user,
      isSignedIn: Boolean(clerkSignedIn && convexAuthenticated),
      isClerkSignedIn: Boolean(clerkSignedIn),
      isConvexAuthenticated: Boolean(convexAuthenticated),
      isLoaded: clerkLoaded && !convexAuthLoading && (!clerkSignedIn || !convexAuthenticated || profile !== undefined),
      isAdmin: role === "admin" || role === "super_admin",
      isSuperAdmin: role === "super_admin",
      isCreator: role === "creator" || role === "super_admin" || canHostEvents,
      canHostEvents,
      isStreamer: role === "streamer" || role === "admin" || role === "super_admin",
      switchDemoRole: () => console.warn("Demo role switching is disabled; roles are enforced by Convex."),
      updateUserPoints: () => console.warn("Client-side point awards are disabled; points are awarded by Convex."),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
