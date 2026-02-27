import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

export default function ToolCheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ toolId?: string }>();
  const toolId = params.toolId || "";

  const { user, isHydrated } = useUser();
  const { tools, checkoutTool } = useTools();

  const tool = useMemo(() => tools.find((t) => t.id === toolId) || null, [tools, toolId]);

  const [locationOfUse, setLocationOfUse] = useState("");
  const [expectedDuration, setExpectedDuration] = useState("");

  if (!isHydrated) return <Text style={{ padding: 24 }}>Loading...</Text>;
  if (!user) return <Text style={{ padding: 24 }}>Redirecting...</Text>;
  if (!tool) return <Text style={{ padding: 24 }}>Tool not found.</Text>;

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: "#F5F5F7" }}>
      <Text style={{ fontSize: 24, fontWeight: "900" }}>Check out tool</Text>
      <Text style={{ marginTop: 8, color: "#6e6e73" }}>
        {tool.name} • {tool.id}
      </Text>

      <Text style={{ marginTop: 18, fontWeight: "900" }}>Location of use</Text>
      <TextInput
        value={locationOfUse}
        onChangeText={setLocationOfUse}
        placeholder="Ex: Building A - Room 201"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 12,
          backgroundColor: "#fff",
        }}
      />

      <Text style={{ marginTop: 14, fontWeight: "900" }}>Expected duration</Text>
      <TextInput
        value={expectedDuration}
        onChangeText={setExpectedDuration}
        placeholder="Ex: 2 hours"
        style={{
          marginTop: 8,
          borderWidth: 1,
          borderColor: "#ddd",
          borderRadius: 12,
          padding: 12,
          backgroundColor: "#fff",
        }}
      />

      <TouchableOpacity
        onPress={() => {
          if (tool.status !== "available") return;
          if (!locationOfUse.trim()) return;
          if (!expectedDuration.trim()) return;
if (
  user.role === "physical_consumer" &&
  (!user.actingDeptHeadId ||
    !user.actingDeptHeadName ||
    !user.actingDeptHeadDepartment)
) {
  alert("No department selected.");
  return;
}
          checkoutTool(
  tool.id,
  user,
  locationOfUse.trim(),
  expectedDuration.trim()
);

          router.replace("/toolcage");
        }}
        style={{
          marginTop: 18,
          backgroundColor:
            locationOfUse.trim() && expectedDuration.trim() ? "#111" : "#999",
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>Confirm checkout</Text>
      </TouchableOpacity>

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
        <Text style={{ fontWeight: "900" }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}