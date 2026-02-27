import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
export type UserRole = "physical_consumer" | "dept_head" | "staff" | "supervisor";

export type AppUser = {
  id: string;
  name: string;
  role: UserRole;
  department?: string;

  actingDeptHeadId?: string;
  actingDeptHeadName?: string;
  actingDeptHeadDepartment?: string;
};

type UserContextValue = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => Promise<void>;
  isHydrated: boolean;
};

const KEY = "warehouse_user_v1";
const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.sessionStorage.getItem(KEY)
    : await AsyncStorage.getItem(KEY);
        const parsed = raw ? (JSON.parse(raw) as AppUser) : null;
        if (parsed?.role && parsed?.name) setUserState(parsed);
      } catch {}
      setIsHydrated(true);
    })();
  }, []);

  const setUser = async (u: AppUser | null) => {
  setUserState(u);
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (!u) window.sessionStorage.removeItem(KEY);
      else window.sessionStorage.setItem(KEY, JSON.stringify(u));
      return;
    }

    if (!u) await AsyncStorage.removeItem(KEY);
    else await AsyncStorage.setItem(KEY, JSON.stringify(u));
  } catch {}
};

  const value = useMemo<UserContextValue>(
    () => ({ user, setUser, isHydrated }),
    [user, isHydrated]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}