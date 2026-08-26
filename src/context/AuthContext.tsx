"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface UserProfile {
  clerkUserId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  email: string;
  country: string;
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
  isLoaded: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isCreator: boolean;
  login: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  switchDemoRole: (role: "user" | "creator" | "admin" | "super_admin") => void;
  updateUserPoints: (addPoints: number, reason: string) => void;
}

const DEFAULT_USER_FAIROZ: UserProfile = {
  clerkUserId: "user_fairoz_01",
  username: "fairoz",
  displayName: "Fairoz",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
  email: "fairoz@donestudio.events",
  country: "IN",
  role: "super_admin",
  points: 15400,
  level: 13,
  joinDate: "2026-08-01",
  isSuspended: false,
  isBanned: false,
  stats: {
    vadamvaliWins: 45,
    vadamvaliLosses: 3,
    quizzesTaken: 8,
    quizHighScore: 950,
    pookalamsSubmitted: 2,
    pookalamVotesReceived: 384,
  },
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER_FAIROZ,
  isSignedIn: true,
  isLoaded: true,
  isAdmin: true,
  isSuperAdmin: true,
  isCreator: true,
  login: () => {},
  logout: () => {},
  switchDemoRole: () => {},
  updateUserPoints: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER_FAIROZ);
  const [isLoaded, setIsLoaded] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("done_active_user");
      if (saved) {
        try {
          setUser(JSON.parse(saved));
        } catch (e) {
          setUser(DEFAULT_USER_FAIROZ);
        }
      } else {
        setUser(DEFAULT_USER_FAIROZ);
        localStorage.setItem("done_active_user", JSON.stringify(DEFAULT_USER_FAIROZ));
      }
    }
  }, []);

  const login = (profile: Partial<UserProfile>) => {
    const fullUser: UserProfile = {
      clerkUserId: profile.clerkUserId || `user_${Date.now()}`,
      username: profile.username || "fairoz",
      displayName: profile.displayName || "Fairoz",
      avatarUrl: profile.avatarUrl || DEFAULT_USER_FAIROZ.avatarUrl,
      email: profile.email || "fairoz@donestudio.events",
      country: profile.country || "IN",
      role: profile.role || "super_admin",
      points: profile.points || 15400,
      level: profile.level || 13,
      joinDate: profile.joinDate || "2026-08-01",
      isSuspended: false,
      isBanned: false,
      stats: profile.stats || DEFAULT_USER_FAIROZ.stats,
    };
    setUser(fullUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("done_active_user", JSON.stringify(fullUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("done_active_user");
    }
  };

  const switchDemoRole = (role: "user" | "creator" | "admin" | "super_admin") => {
    const base = user || DEFAULT_USER_FAIROZ;
    const updated = { ...base, role };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("done_active_user", JSON.stringify(updated));
    }
  };

  const updateUserPoints = (addPoints: number, reason: string) => {
    const base = user || DEFAULT_USER_FAIROZ;
    const newPoints = base.points + addPoints;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newPoints / 100)) + 1);
    const updated: UserProfile = {
      ...base,
      points: newPoints,
      level: newLevel,
    };
    setUser(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("done_active_user", JSON.stringify(updated));
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isCreator = user?.role === "creator" || user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoaded,
        isAdmin,
        isSuperAdmin,
        isCreator,
        login,
        logout,
        switchDemoRole,
        updateUserPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
