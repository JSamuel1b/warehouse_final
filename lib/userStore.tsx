import { LoginRequestDto } from "@/models/auth/login-request";
import { LoginRequest } from "@/services/auth-service";
import { ShowErrorMessage } from "@/utils/toast-message.service";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
export type UserRole = "physical_consumer" | "dept_head" | "staff" | "supervisor" | "tool_cage_operator";

export type AppUser = {
  id: string;
  name: string;
  roleId?: number;
  role: UserRole;
  departmentId?: number;
  department?: string;
  firstName?: string;
  lastName?: string;
  jwtToken?: string;
  actingDeptHeadId?: string;
  actingDeptHeadName?: string;
  actingDeptHeadDepartment?: string;
};

type UserContextValue = {
  user: AppUser | null;
  setUser: (u: AppUser | null) => Promise<void>;
  isHydrated: boolean;
  login: (x: LoginRequestDto) => Promise<AppUser | null>;
  logout: () => void;
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

        if (parsed?.role && parsed?.name) 
        {
          setUserState(parsed);
        }
      } catch {

      }
      
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

  const login = async (request: LoginRequestDto) : Promise<AppUser | null> => {
    const response = await LoginRequest(request);

    if(typeof(response) != "string")
    {
      let user: AppUser = {
        id: response.userName,
        jwtToken: response.jwtToken,
        name: `${response.firstName} ${response.lastName}`,
        role: getRole(response.roleId),
        actingDeptHeadDepartment: "",
        actingDeptHeadId: "",
        actingDeptHeadName: "",
        department: response.departmentName ?? "",
        departmentId: response.departmentId ?? 0,
        roleId: response.roleId,
        firstName: response.firstName ?? "",
        lastName: response.lastName ?? ""
      }

      setUser(user);

      return user;
    }
    else{
      ShowErrorMessage(response);
      return null;
    }
  } 

  const getRole = (roleId: number) : UserRole => {
    if (roleId == 1)
    {
      return "supervisor";
    }

    if (roleId == 2)
    {
      return "staff";
    }

    if (roleId == 3)
    {
      return "dept_head";
    }

    return "tool_cage_operator";
  }

  const logout = () : void => {
    setUser(null);
  }

  const value = useMemo<UserContextValue>(
    () => ({ user, setUser, isHydrated, login, logout}),
    [user, isHydrated]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}