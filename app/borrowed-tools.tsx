import { useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

function formatDueLine(tool: any) {
  // Prefer dueAt if available
  const dueAtRaw = tool?.dueAt;
  const dueAt = dueAtRaw ? new Date(String(dueAtRaw)) : null;

  if (!dueAt || isNaN(dueAt.getTime())) {
    return "Due date: (not set)";
  }

  const now = new Date();
  const diffMs = dueAt.getTime() - now.getTime();
  const absMs = Math.abs(diffMs);

  const minutes = Math.floor(absMs / (60 * 1000));
  const hours = Math.floor(absMs / (60 * 60 * 1000));
  const days = Math.floor(absMs / (24 * 60 * 60 * 1000));

  if (diffMs >= 0) {
    if (days >= 1) return `Due in ${days} day(s)`;
    if (hours >= 1) return `Due in ${hours} hour(s)`;
    return `Due in ${Math.max(1, minutes)} minute(s)`;
  } else {
    if (days >= 1) return `Past due ${days} day(s) ago`;
    if (hours >= 1) return `Past due ${hours} hour(s) ago`;
    return `Past due ${Math.max(1, minutes)} minute(s) ago`;
  }
}

export default function BorrowedToolsScreen() {
  const router = useRouter();
  const { user, isHydrated } = useUser();
  const { tools } = useTools();

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  // ✅ dept_head + supervisor can see this screen
if (user.role !== "dept_head" && user.role !== "supervisor") {
  router.replace("/janitorial");
  return <Text style={{ padding: 24 }}>Redirecting...</Text>;
}

  const myDept = String(user.department || "").trim().toLowerCase();

  const mine = useMemo(() => {
  const borrowed = tools.filter((t: any) => String(t.status).trim() !== "available");

  // ✅ Supervisor sees all borrowed tools
  if (user.role === "supervisor") return borrowed;

  // ✅ Dept head sees only those borrowed under their department
  return borrowed.filter((t: any) => {
    const ownerId = String(t.ownerDeptHeadId || "").trim();
    const ownerDept = String(t.ownerDepartment || "").trim().toLowerCase();

    const belongs =
      (ownerId && ownerId === user.id) ||
      (myDept && ownerDept && ownerDept === myDept);

    return belongs;
  });
}, [tools, user.role, user.id, myDept]);

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Borrowed tools</Text>
        <Text style={{ marginTop: 6, color: "#6e6e73" }}>
          These are tools currently checked out under your department.
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/janitorial")}
          style={{
            marginTop: 12,
            backgroundColor: "#fff",
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontWeight: "900" }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {!mine.length ? (
          <View
            style={{
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ fontWeight: "900" }}>No borrowed tools ✅</Text>
            <Text style={{ marginTop: 6, color: "#6e6e73" }}>
              When a tool is checked out under your department, it will show here.
            </Text>
          </View>
        ) : (
          mine.map((t: any) => (
            <View
              key={String(t.id)}
              style={{
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 14,
                marginBottom: 12,
              }}
            >
              <Text style={{ fontWeight: "900" }}>{t.name}</Text>
              <Text style={{ marginTop: 2, color: "#6e6e73" }}>
                {t.id} • {t.category}
              </Text>

              <Text style={{ marginTop: 10, fontWeight: "900", color: "#111" }}>
                {formatDueLine(t)}
              </Text>

              {t.checkedOutByName ? (
                <Text style={{ marginTop: 6, color: "#6e6e73" }}>
                  Checked out by: {t.checkedOutByName}
                </Text>
              ) : null}

              {t.locationOfUse ? (
                <Text style={{ marginTop: 2, color: "#6e6e73" }}>
                  Location: {t.locationOfUse}
                </Text>
              ) : null}

              <View
                style={{
                  marginTop: 10,
                  backgroundColor: "#FFF7E6",
                  padding: 10,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#FFE2A8",
                }}
              >
                <Text style={{ fontWeight: "900" }}>Please return it clean.</Text>
                <Text style={{ marginTop: 2, color: "#8A6A00" }}>
                  Returns happen in Tool Cage (physical scan).
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}