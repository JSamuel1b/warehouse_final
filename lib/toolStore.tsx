import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import type { AppUser } from "./userStore";

const TOOLS_KEY = "warehouse_tools_v1";

export type ToolStatus = "available" | "checked_out" | "return_pending";

export type ToolHistoryEvent =
  | {
      type: "checkout";
      at: string;
      byUserId: string;
      byName: string;
      locationOfUse: string;
      expectedDuration: string;
    }
  | {
      type: "return_initiated";
      at: string;
      byUserId: string;
      byName: string;
    }
  | {
      type: "return_confirmed";
      at: string;
      staffUserId: string;
      staffName: string;
      borrowerUserId: string;
      borrowerName: string;
      clean: boolean;
    };

export type Tool = {
  id: string;
  name: string;
  category: string;
  status: ToolStatus;

  // person who physically has it
  currentHolderUserId?: string;
  currentHolderName?: string;

  // owner = dept head / department this tool is borrowed under
  ownerDeptHeadId?: string;
  ownerDeptHeadName?: string;
  ownerDepartment?: string;

  checkedOutAt?: string;
  dueAt?: string;

  locationOfUse?: string;
  expectedDuration?: string;

  history: ToolHistoryEvent[];
};

type ToolsContextValue = {
  tools: Tool[];

  checkoutTool: (
    toolId: string,
    user: AppUser,
    locationOfUse: string,
    expectedDuration: string
  ) => void;

  initiateReturn: (toolId: string, user: AppUser) => void;

  confirmReturn: (toolId: string, staff: AppUser, clean: boolean) => void;

  // reputation: borrowerId -> strikes
  reputation: Record<string, number>;
};

const ToolsContext = createContext<ToolsContextValue | null>(null);

const SEED_TOOLS: Tool[] = [
  { id: "TC-0001", name: "Impact Drill (DeWalt)", category: "Power Tools", status: "available", history: [] },
  { id: "TC-0002", name: "Angle Grinder", category: "Power Tools", status: "available", history: [] },
  { id: "TC-0003", name: "Ladder 6ft", category: "Ladders", status: "available", history: [] },
  { id: "TC-0004", name: "Safety Harness", category: "Safety", status: "available", history: [] },
];

async function storageGet(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return window.sessionStorage.getItem(key);
    }
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function storageSet(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.sessionStorage.setItem(key, value);
      return;
    }
    await AsyncStorage.setItem(key, value);
  } catch {}
}

export function ToolsProvider({ children }: { children: React.ReactNode }) {
  const [tools, setTools] = useState<Tool[]>(SEED_TOOLS);
  const [isHydrated, setIsHydrated] = useState(false);

  // hydrate
  useEffect(() => {
    (async () => {
      const raw = await storageGet(TOOLS_KEY);
      try {
        const parsed = raw ? JSON.parse(raw) : null;
        if (Array.isArray(parsed) && parsed.length) {
          setTools(parsed);
        }
      } catch {}
      setIsHydrated(true);
    })();
  }, []);

  // persist
  useEffect(() => {
    if (!isHydrated) return;
    storageSet(TOOLS_KEY, JSON.stringify(tools));
  }, [tools, isHydrated]);

  const reputation = useMemo<Record<string, number>>(() => {
    const strikes: Record<string, number> = {};
    for (const t of tools) {
      for (const e of t.history) {
        if (e.type === "return_confirmed" && e.clean === false) {
          const id = e.borrowerUserId || "";
          if (!id) continue;
          strikes[id] = (strikes[id] || 0) + 1;
        }
      }
    }
    return strikes;
  }, [tools]);

  const value = useMemo<ToolsContextValue>(
    () => ({
      tools,

      checkoutTool: (toolId, user, locationOfUse, expectedDuration) => {
        const now = new Date().toISOString();
        setTools((prev) =>
          prev.map((t) => {
            if (t.id !== toolId) return t;
            if (t.status !== "available") return t;

            const durationText = expectedDuration.trim();
const parsedDays = (() => {
  const m = durationText.match(/(\d+)\s*(day|days|d)\b/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

const parsedHours = (() => {
  const m = durationText.match(/(\d+)\s*(hour|hours|h)\b/i);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
})();

const fallbackDays = 1;
const ms =
  parsedDays !== null
    ? parsedDays * 24 * 60 * 60 * 1000
    : parsedHours !== null
    ? parsedHours * 60 * 60 * 1000
    : fallbackDays * 24 * 60 * 60 * 1000;

const dueAt = new Date(Date.now() + ms).toISOString();

const ownerDeptHeadId =
  user.role === "physical_consumer" ? (user.actingDeptHeadId || "") : user.id;

const ownerDeptHeadName =
  user.role === "physical_consumer" ? (user.actingDeptHeadName || "") : user.name;

const ownerDepartment =
  user.role === "physical_consumer"
    ? (user.actingDeptHeadDepartment || "")
    : (user.department || "");

const next: Tool = {
  ...t,
  status: "checked_out",

  currentHolderUserId: user.id,
  currentHolderName: user.name,

  ownerDeptHeadId,
  ownerDeptHeadName,
  ownerDepartment,

  checkedOutAt: now,
  dueAt,

  locationOfUse: locationOfUse.trim(),
  expectedDuration: expectedDuration.trim(),

  history: [
    {
      type: "checkout",
      at: now,
      byUserId: user.id,
      byName: user.name,
      locationOfUse: locationOfUse.trim(),
      expectedDuration: expectedDuration.trim(),
    },
    ...t.history,
  ],
};

            return next;
          })
        );
      },

      initiateReturn: (toolId, user) => {
        const now = new Date().toISOString();
        setTools((prev) =>
          prev.map((t) => {
            if (t.id !== toolId) return t;
            if (t.status !== "checked_out") return t;
            if (t.currentHolderUserId !== user.id) return t;

            return {
              ...t,
              status: "return_pending",
              history: [
                { type: "return_initiated", at: now, byUserId: user.id, byName: user.name },
                ...t.history,
              ],
            };
          })
        );
      },

      confirmReturn: (toolId, staff, clean) => {
        const now = new Date().toISOString();
        setTools((prev) =>
          prev.map((t) => {
            if (t.id !== toolId) return t;
            if (t.status !== "return_pending") return t;

            const borrowerUserId = t.currentHolderUserId || "";
            const borrowerName = t.currentHolderName || "";

            return {
              ...t,
             status: "available",
currentHolderUserId: undefined,
currentHolderName: undefined,
checkedOutAt: undefined,
dueAt: undefined,
ownerDeptHeadId: undefined,
ownerDeptHeadName: undefined,
ownerDepartment: undefined,
locationOfUse: undefined,
expectedDuration: undefined,
history: [
                {
                  type: "return_confirmed",
                  at: now,
                  staffUserId: staff.id,
                  staffName: staff.name,
                  borrowerUserId,
                  borrowerName,
                  clean: !!clean,
                },
                ...t.history,
              ],
            };
          })
        );
      },

      reputation,
    }),
    [tools, reputation]
  );

  return <ToolsContext.Provider value={value}>{children}</ToolsContext.Provider>;
}

export function useTools() {
  const ctx = useContext(ToolsContext);
  if (!ctx) throw new Error("useTools must be used within ToolsProvider");
  return ctx;
}