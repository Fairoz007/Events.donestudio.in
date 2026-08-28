"use client";

import React, { createContext, useContext, useEffect } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";

export interface UserProfile {
  clerkUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  country?: string;
  role: "visitor" | "user" | "creator" | "moderator" | "admin" | "super_admin";
  points: number;
  level: number;
  joinDate: string;
  isSuspended: boolean;
  isBanned: boolean;
  stats: {
    vadamvaliWins: number;
    vadamvaliLosses: number;
    quizzesTaken: number;
    quizHighScore: number;
    pookalamsSubmitted: number;
    pookalamVotesReceived: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  isSignedIn: boolean;
  isClerkSignedIn: boolean;
  isConvexAuthenticated: boolean;
  isLoaded: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCreator: boolean;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  switchDemoRole: (role: "user" | "creator" | "admin" | "super_admin") => void;
  updateUserPoints: (addPoints: number, reason: string) => void;
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
  login: () => {},
  logout: () => {},
  switchDemoRole: () => {},
  updateUserPoints: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { isAuthenticated: isConvexAuthenticated } = useConvexAuth();
  const { signOut } = useClerkAuth();
  const profile = useQuery(api.profiles.getCurrentProfile);
  const syncProfile = useMutation(api.profiles.syncProfile);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUser) return;

    void syncProfile({
      clerkUserId: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress || "",
      displayName: clerkUser.fullName || clerkUser.username || "D-One Player",
      avatarUrl: clerkUser.imageUrl || "",
      username: clerkUser.username || undefined,
    });
  }, [clerkUser, isLoaded, isSignedIn, syncProfile]);

  const user = (profile as UserProfile | null) || null;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isCreator = user?.role === "creator" || user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!isSignedIn,
        isClerkSignedIn: !!isSignedIn,
        isConvexAuthenticated,
        isLoaded,
        isAdmin,
        isSuperAdmin,
        isCreator,
        login: () => {},
        logout: () => void signOut(),
        switchDemoRole: () => {},
        updateUserPoints: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
