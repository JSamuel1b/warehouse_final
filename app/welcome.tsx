import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { UserRole, useUser } from "../lib/userStore";
import { DeptHead, searchDeptHeads } from "../lib/usersDirectory";

export default function Welcome() {
  const router = useRouter();
  const { setUser } = useUser();

  const [role, setRole] = useState<UserRole>("physical_consumer");

  // Common fields
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  // Kiosk selection
  const [dhQuery, setDhQuery] = useState("");
  const [selectedDeptHead, setSelectedDeptHead] = useState<DeptHead | null>(null);
  const [deptHeadIdInput, setDeptHeadIdInput] = useState("");

  const isKiosk = role === "physical_consumer";
  const needsDept = role === "dept_head";

  const deptHeadResults = useMemo<DeptHead[]>(() => {
  const res = searchDeptHeads(dhQuery);
  return Array.isArray(res) ? res.slice(0, 8) : [];
}, [dhQuery]);

  // Button behavior you requested:
  // - Grey only when ID input is empty (kiosk)
  // - Black as soon as they typed something
  const buttonEnabled = useMemo(() => {
    if (!isKiosk) return true;
    return deptHeadIdInput.trim().length > 0;
  }, [isKiosk, deptHeadIdInput]);

const goNext = async () => {
  if (isKiosk) {
    if (!name.trim()) {
      alert("Enter your name (pickup name).");
      return;
    }
    if (!selectedDeptHead) {
      alert("Select a department head.");
      return;
    }

    const matches =
      deptHeadIdInput.trim().toLowerCase() ===
      selectedDeptHead.id.trim().toLowerCase();

    if (!matches) {
      return;
    }
    await setUser({
      id: `kiosk_${Date.now()}`,
      role: "physical_consumer",
      name: name.trim(), // pickedByName

      actingDeptHeadId: selectedDeptHead.id,
      actingDeptHeadName: selectedDeptHead.name,
      actingDeptHeadDepartment: selectedDeptHead.department,
    });

    router.replace("/janitorial");
    return;
  }

  // Normal roles
  if (!name.trim()) {
    alert("Enter your name.");
    return;
  }
  if (needsDept && !department.trim()) {
    alert("Enter your department.");
    return;
  }

  await setUser({
    id: `u_${Date.now()}`,
    role,
    name: name.trim(),
    department: needsDept ? department.trim() : "",
  });

  if (role === "dept_head") router.replace("/janitorial");
  else if (role === "staff") router.replace("/staff");
  else if (role === "supervisor") router.replace("/supervisor");
  else router.replace("/janitorial");
};

const Pill = ({ label, value }: { label: string; value: UserRole }) => (
    <TouchableOpacity
      onPress={() => {
        setRole(value);
        // reset kiosk selection each switch
        setDhQuery("");
        setSelectedDeptHead(null);
        setDeptHeadIdInput("");
      }}
      style={{
        backgroundColor: role === value ? "#111" : "#fff",
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Text style={{ fontWeight: "800", color: role === value ? "#fff" : "#111" }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7", padding: 24 }}>
      <Text style={{ fontSize: 28, fontWeight: "900" }}>Welcome</Text>
      <Text style={{ marginTop: 6, color: "#6e6e73" }}>
        Choose your role.
      </Text>

      <View style={{ marginTop: 16, flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        <Pill label="Physical consumer (kiosk)" value="physical_consumer" />
        <Pill label="Dept head (online)" value="dept_head" />
        <Pill label="Staff" value="staff" />
        <Pill label="Supervisor" value="supervisor" />
      </View>

      {isKiosk ? (
        <>
          <Text style={{ marginTop: 18, fontWeight: "800" }}>Your name (pickup)</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: Carlos M."
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#fff",
            }}
          />

          <Text style={{ marginTop: 18, fontWeight: "800" }}>Order for Dept Head</Text>
          <TextInput
            value={dhQuery}
            onChangeText={(t) => {
              setDhQuery(t);
              setSelectedDeptHead(null);
              setDeptHeadIdInput("");
            }}
            placeholder="Search dept head..."
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#fff",
            }}
          />

          <View style={{ marginTop: 10 }}>
            {deptHeadResults.map((d) => {
              const selected = selectedDeptHead?.id === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => {
                    setSelectedDeptHead(d);
                    setDeptHeadIdInput("");
                  }}
                  style={{
                    marginTop: 8,
                    backgroundColor: selected ? "#111" : "#fff",
                    padding: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: "#ddd",
                  }}
                >
                  <Text style={{ fontWeight: "900", color: selected ? "#fff" : "#111" }}>
                    {d.name}
                  </Text>
                  <Text style={{ marginTop: 2, color: selected ? "#ddd" : "#6e6e73" }}>
                    Dept: {d.department}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedDeptHead ? (
            <>
              <Text style={{ marginTop: 12, color: "#007AFF", fontWeight: "700" }}>
                Selected: {selectedDeptHead.name} ({selectedDeptHead.department})
              </Text>

              <Text style={{ marginTop: 14, fontWeight: "800" }}>
                Enter Dept Head ID
              </Text>
              <TextInput
                value={deptHeadIdInput}
                onChangeText={setDeptHeadIdInput}
                placeholder="Ex: dh_1001"
                autoCapitalize="none"
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              />

            </>
          ) : (
            <Text style={{ marginTop: 12, color: "#6e6e73" }}>
              Select one dept head to continue.
            </Text>
          )}
        </>
      ) : (
        <>
          <Text style={{ marginTop: 18, fontWeight: "800" }}>Your name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ex: John Smith"
            style={{
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#fff",
            }}
          />

          {needsDept ? (
            <>
              <Text style={{ marginTop: 14, fontWeight: "800" }}>Department</Text>
              <TextInput
                value={department}
                onChangeText={setDepartment}
                placeholder="Ex: Maintenance"
                style={{
                  marginTop: 8,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 12,
                  padding: 12,
                  backgroundColor: "#fff",
                }}
              />
            </>
          ) : null}
        </>
      )}

            <TouchableOpacity
        onPress={goNext}
        style={{
          marginTop: 18,
          backgroundColor: buttonEnabled ? "#111" : "#999",
          paddingVertical: 14,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "900" }}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}