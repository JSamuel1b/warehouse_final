import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

export default function ToolHistoryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ toolId?: string }>();
  const toolId = params.toolId || "";

  const { user, isHydrated } = useUser();
  const { tools } = useTools();

  const tool = useMemo(() => tools.find((t) => t.id === toolId) || null, [tools, toolId]);

  if (!isHydrated) {
    return <Text style={{ padding: 24 }}>Loading...</Text>;
  }

  if (!user) {
    return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  }

  if (!tool) {
    return (
      <View style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
        <Text style={{ fontSize: 20, fontWeight: "900" }}>Tool not found</Text>
        <TouchableOpacity
          onPress={() => router.replace("/toolcage")}
          style={{
            marginTop: 14,
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

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      <View style={{ paddingTop: 18, paddingHorizontal: 24, paddingBottom: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "900" }}>Tool History</Text>
        <Text style={{ marginTop: 6, color: "#6e6e73" }}>
          {tool.name} • {tool.id}
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/toolcage")}
          style={{
            marginTop: 10,
            backgroundColor: "#fff",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
            alignSelf: "flex-start",
          }}
        >
          <Text style={{ fontWeight: "800" }}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {tool.history.length ? (
          tool.history.map((e, idx) => {
            const at = new Date(e.at).toLocaleString();

            if (e.type === "checkout") {
              return (
                <View
                  key={`${e.type}-${e.at}-${idx}`}
                  style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Checked out</Text>
                  <Text style={{ marginTop: 6, color: "#6e6e73" }}>
                    By: {e.byName} ({e.byUserId})
                  </Text>
                  <Text style={{ marginTop: 2, color: "#6e6e73" }}>
                    Location: {e.locationOfUse}
                  </Text>
                  <Text style={{ marginTop: 2, color: "#6e6e73" }}>
                    Expected: {e.expectedDuration}
                  </Text>
                  <Text style={{ marginTop: 8, color: "#6e6e73" }}>{at}</Text>
                </View>
              );
            }

            if (e.type === "return_initiated") {
              return (
                <View
                  key={`${e.type}-${e.at}-${idx}`}
                  style={{
                    backgroundColor: "#fff",
                    padding: 14,
                    borderRadius: 14,
                    marginBottom: 12,
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Return initiated</Text>
                  <Text style={{ marginTop: 6, color: "#6e6e73" }}>
                    By: {e.byName}
                  </Text>
                  <Text style={{ marginTop: 8, color: "#6e6e73" }}>{at}</Text>
                </View>
              );
            }

            // return_confirmed
            return (
              <View
                key={`${e.type}-${e.at}-${idx}`}
                style={{
                  backgroundColor: "#fff",
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontWeight: "900" }}>Return confirmed</Text>
                <Text style={{ marginTop: 6, color: "#6e6e73" }}>
                  Staff: {e.staffName} ({e.staffUserId})
                </Text>
                <Text style={{ marginTop: 2, color: "#6e6e73" }}>
                  Condition: {e.clean ? "clean" : "not clean"}
                </Text>
                <Text style={{ marginTop: 8, color: "#6e6e73" }}>{at}</Text>
              </View>
            );
          })
        ) : (
          <Text style={{ marginTop: 12, color: "#6e6e73" }}>
            No history yet.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}