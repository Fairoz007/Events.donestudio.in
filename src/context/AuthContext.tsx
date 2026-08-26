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

const DEFAULT_SUPER_ADMIN: UserProfile = {
  clerkUserId: "user_super_admin_01",
  username: "done_admin",
  displayName: "D-One Super Admin",
  avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=done_admin",
  email: "admin@donestudio.events",
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
  user: null,
  isSignedIn: false,
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load persisted session from localStorage
    const saved = localStorage.getItem("done_active_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(DEFAULT_SUPER_ADMIN);
      }
    } else {
      // Default to Super Admin so all reviewer features are immediately testable
      setUser(DEFAULT_SUPER_ADMIN);
      localStorage.setItem("done_active_user", JSON.stringify(DEFAULT_SUPER_ADMIN));
    }
    setIsLoaded(true);
  }, []);

  const login = (profile: Partial<UserProfile>) => {
    const fullUser: UserProfile = {
      clerkUserId: profile.clerkUserId || `user_${Date.now()}`,
      username: profile.username || "player_one",
      displayName: profile.displayName || "D-One Player",
      avatarUrl: profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
      email: profile.email || "player@donestudio.events",
      country: profile.country || "IN",
      role: profile.role || "user",
      points: profile.points || 100,
      level: profile.level || 1,
      joinDate: profile.joinDate || new Date().toISOString().split("T")[0],
      isSuspended: false,
      isBanned: false,
      stats: profile.stats || {
        vadamvaliWins: 0,
        vadamvaliLosses: 0,
        quizzesTaken: 0,
        quizHighScore: 0,
        pookalamsSubmitted: 0,
        pookalamVotesReceived: 0,
      },
    };
    setUser(fullUser);
    localStorage.setItem("done_active_user", JSON.stringify(fullUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("done_active_user");
  };

  const switchDemoRole = (role: "user" | "creator" | "admin" | "super_admin") => {
    if (!user) {
      setUser({ ...DEFAULT_SUPER_ADMIN, role });
      localStorage.setItem("done_active_user", JSON.stringify({ ...DEFAULT_SUPER_ADMIN, role }));
      return;
    }
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem("done_active_user", JSON.stringify(updated));
  };

  const updateUserPoints = (addPoints: number, reason: string) => {
    if (!user) return;
    const newPoints = user.points + addPoints;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newPoints / 100)) + 1);
    const updated: UserProfile = {
      ...user,
      points: newPoints,
      level: newLevel,
    };
    setUser(updated);
    localStorage.setItem("done_active_user", JSON.stringify(updated));
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
