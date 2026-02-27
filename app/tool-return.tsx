import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

export default function ToolReturnScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ toolId?: string; mode?: string }>();
  const toolId = params.toolId || "";
  const mode = params.mode || "user";

  const { user, isHydrated } = useUser();
  const { tools, initiateReturn, confirmReturn } = useTools();

  const tool = useMemo(() => tools.find((t) => t.id === toolId) || null, [tools, toolId]);

  const [clean, setClean] = useState<boolean>(true);

  if (!isHydrated) return <Text style={{ padding: 24 }}>Loading...</Text>;
  if (!user) return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  if (!tool) return <Text style={{ padding: 24 }}>Tool not found.</Text>;

  const isStaff = user.role === "staff" || user.role === "supervisor";
  const staffMode = mode === "staff";

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
      <Text style={{ fontSize: 24, fontWeight: "900" }}>Return tool</Text>
      <Text style={{ marginTop: 8, color: "#6e6e73" }}>
        {tool.name} • {tool.id}
      </Text>

      <View
        style={{
          marginTop: 14,
          backgroundColor: "#fff",
          borderRadius: 14,
          padding: 14,
        }}
      >
        <Text style={{ fontWeight: "900" }}>Reminder</Text>
        <Text style={{ marginTop: 6, color: "#6e6e73" }}>
          Please clean the tool before returning it.
        </Text>
      </View>

      {/* User action: initiate return */}
      {tool.status === "checked_out" ? (
        <TouchableOpacity
         onPress={() => {
  initiateReturn(tool.id, user);
  router.replace("/toolcage");
}}
          style={{
            marginTop: 18,
            backgroundColor: "#111",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>I returned it</Text>
        </TouchableOpacity>
      ) : null}

      {/* Staff action: confirm cleanliness */}
      {tool.status === "return_pending" && staffMode && isStaff ? (
        <>
          <View
            style={{
              marginTop: 18,
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 14,
            }}
          >
            <Text style={{ fontWeight: "900" }}>Staff confirmation</Text>

            <TouchableOpacity
              onPress={() => setClean(true)}
              style={{
                marginTop: 12,
                backgroundColor: clean ? "#111" : "#EEE",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: clean ? "#fff" : "#111", fontWeight: "900" }}>
                Clean
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setClean(false)}
              style={{
                marginTop: 10,
                backgroundColor: !clean ? "#111" : "#EEE",
                paddingVertical: 12,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: !clean ? "#fff" : "#111", fontWeight: "900" }}>
                Not clean
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
  confirmReturn(tool.id, user, clean);
  router.replace("/toolcage");
}}
            style={{
              marginTop: 18,
              backgroundColor: "#007AFF",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>
              Confirm return
            </Text>
          </TouchableOpacity>
        </>
      ) : null}

      <TouchableOpacity
        onPress={() => router.replace("/toolcage")}
        style={{
          marginTop: 10,
          backgroundColor: "#fff",
          paddingVertical: 12,
          borderRadius: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#ddd",
        }}
      >
        <Text style={{ fontWeight: "900" }}>Back</Text>
      </TouchableOpacity>
    </View>
  );
}