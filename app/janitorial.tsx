import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { clearDraft, loadDraft, saveDraft } from "../lib/draftStorage";
import { janitorialFromAPI, JanitorialJsonItem } from "../lib/loadJanitorialInventory";
import { useOrders } from "../lib/ordersStore";
import { useTools } from "../lib/toolStore";
import { useUser } from "../lib/userStore";

export default function JanitorialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ clear?: string }>();

  const { orders, reorderDraft, clearReorderDraft } = useOrders();
  const { tools } = useTools();
  const { user, isHydrated } = useUser();

  const [query, setQuery] = useState("");
  const [lastRequest, setLastRequest] = useState("");
  const [pendingItem, setPendingItem] = useState<any | null>(null);
  const [qty, setQty] = useState("1");
  const [inventoryItems, setInventoryItems] = useState<JanitorialJsonItem[]>([]);
  const [refreshing, setRefreshing ] = useState<boolean>(false);

  const [requests, setRequests] = useState<
    { sku: string; name: string; qty: string }[]
  >([]);

  const loadInventoryFromApi = async () =>{
    setRefreshing(true);

    const items = await janitorialFromAPI();

    setInventoryItems(items);
    setRefreshing(false);
  }

  // ----------------------------
  // Guard: hydrate -> if no user, go welcome
  // ----------------------------
  useEffect(() => {
    if (!isHydrated) return;
    const WELCOME = "/welcome" as any;
    if (!user) router.replace(WELCOME);

    loadInventoryFromApi();
  }, [isHydrated, user, router]);

  // ----------------------------
  // Draft persistence
  // ----------------------------
  useEffect(() => {
    (async () => {
      const draft = await loadDraft();
      if (draft.length) setRequests(draft);
    })();
  }, []);

  useEffect(() => {
    saveDraft(requests);
  }, [requests]);

  // ----------------------------
  // Load draft coming back from checkout
  // ----------------------------
  useEffect(() => {
    if (!reorderDraft) return;

    setRequests(reorderDraft);
    setPendingItem(null);
    setQty("1");
    setLastRequest("Draft restored ✅");
    clearReorderDraft();
  }, [reorderDraft, clearReorderDraft]);

  // ----------------------------
  // Clear cart when coming from checkout confirm
  // ----------------------------
  useEffect(() => {
    if (params.clear === "1") {
      setRequests([]);
      setPendingItem(null);
      setQty("1");
      setLastRequest("");
      clearDraft();
    }
  }, [params.clear]);

  // ----------------------------
  // Derived data
  // ----------------------------
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return inventoryItems;
    return inventoryItems.filter((item) =>
      item.product_name.toLowerCase().includes(q)
    );
  }, [query, inventoryItems]);

  const updateRequestQty = (sku: string, nextQty: string) => {
    setRequests((prev) =>
      prev.map((x) => (x.sku === sku ? { ...x, qty: nextQty } : x))
    );
  };

  const removeRequestItem = (idx: number) => {
    setRequests((prev) => prev.filter((_, i) => i !== idx));
  };

  const requestItem = (item: any) => {
    setPendingItem(item);
    setQty("1");
  };

  // ----------------------------
  // UI states
  // ----------------------------
  if (!isHydrated) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F7",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F5F7",
        }}
      >
        <Text>Redirecting...</Text>
      </View>
    );
  }

  // ----------------------------
  // Active orders count (dept head)
  // ----------------------------
  const myOrdersActiveCount =
    user.role === "dept_head"
      ? orders
          .filter((o) => {
            const oDept = String(o.requesterDepartment || "")
              .trim()
              .toLowerCase();
            const myDept = String(user.department || "").trim().toLowerCase();

            const belongsToMe =
              o.requesterId === user.id || (myDept && oDept === myDept);

            const isActive = ["pending", "processing", "awaiting_confirmation"].includes(
              String(o.status).trim()
            );

            return belongsToMe && isActive;
          }).length
      : 0;

  const myBorrowedToolsCount =
    user.role === "dept_head"
      ? tools
          .filter((t) => t.status !== "available")
          .filter((t) => {
            const ownerId = String((t as any).ownerDeptHeadId || "").trim();
            const ownerDept = String((t as any).ownerDepartment || "")
              .trim()
              .toLowerCase();
            const myDept = String(user.department || "").trim().toLowerCase();

            return (
              (ownerId && ownerId === user.id) ||
              (myDept && ownerDept && ownerDept === myDept)
            );
          }).length
      : 0;

  const onLogoutPressed = () => {
    router.replace("/welcome");
    //logout();
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      {/* TOP BAR */}
      <View
        style={{
          paddingTop: 18,
          paddingHorizontal: 24,
          paddingBottom: 12,
          backgroundColor: "#F5F5F7",
        }}
      >
        <View style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 10
          }}>
            <Text style={{ fontSize: 24, fontWeight: "bold" }}>Janitorial Area</Text>
            <TouchableOpacity
              onPress={() => onLogoutPressed()}
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
              <Text style={{ fontWeight: "800" }}>Logout</Text>
            </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {user.role !== "supervisor" ? (
            <TouchableOpacity
              onPress={() => router.replace("/janitorial")}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Inventory</Text>
            </TouchableOpacity>
          ) : null}

          {user.role === "physical_consumer" ? (
            <TouchableOpacity
              onPress={() => router.push("/toolcage")}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Tool Cage</Text>
            </TouchableOpacity>
          ) : null}

          {user.role === "dept_head" || user.role === "supervisor" ? (
            <TouchableOpacity
              onPress={() => router.push("/history")}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "800" }}>History</Text>
            </TouchableOpacity>
          ) : null}

          {user.role === "staff" || user.role === "supervisor" ? (
            <TouchableOpacity
              onPress={() => router.push("/staff")}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Staff</Text>
            </TouchableOpacity>
          ) : null}

          {user.role === "supervisor" ? (
            <TouchableOpacity
              onPress={() => router.push("/supervisor")}
              style={{
                backgroundColor: "#fff",
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#ddd",
              }}
            >
              <Text style={{ fontWeight: "800" }}>Supervisor</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Dept head quick actions */}
        {user.role === "dept_head" ? (
          <>
            <TouchableOpacity
              onPress={() => router.push("/my-orders")}
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
              <Text style={{ fontWeight: "800" }}>
                Active Orders ({myOrdersActiveCount})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/borrowed-tools")}
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
              <Text style={{ fontWeight: "800" }}>
                Borrowed tools ({myBorrowedToolsCount})
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        {lastRequest ? (
          <Text style={{ marginTop: 6, marginBottom: 10, color: "#007AFF" }}>
            {lastRequest}
          </Text>
        ) : null}

        {user.role !== "supervisor" ? (
          <TextInput
            placeholder="What are you looking for?"
            value={query}
            onChangeText={setQuery}
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 12,
              backgroundColor: "#fff",
              marginTop: 10,
            }}
          />
        ) : null}
      </View>

      {/* CONTENT */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadInventoryFromApi()} />}
      >
        {/* Requests */}
        {requests.length ? (
          <View
            style={{
              marginTop: 12,
              marginBottom: 12,
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 14,
            }}
          >
            <Text style={{ fontWeight: "800" }}>Requests</Text>

            {requests.map((r, idx) => (
              <View
                key={`${r.sku}-${idx}`}
                style={{
                  marginTop: 8,
                  padding: 10,
                  backgroundColor: "#F9F9F9",
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: "#333", fontWeight: "700" }}>
                    {r.name}
                  </Text>
                  <Text style={{ color: "#6e6e73", marginTop: 2 }}>
                    SKU: {r.sku}
                  </Text>

                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 8,
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        const current = parseInt(r.qty || "1", 10) || 1;
                        const next = Math.max(1, current - 1);
                        updateRequestQty(r.sku, String(next));
                      }}
                      style={{
                        backgroundColor: "#EEE",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "900" }}>−</Text>
                    </TouchableOpacity>

                    <Text
                      style={{
                        fontWeight: "800",
                        minWidth: 28,
                        textAlign: "center",
                      }}
                    >
                      {r.qty}
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        const current = parseInt(r.qty || "1", 10) || 1;
                        const next = current + 1;
                        updateRequestQty(r.sku, String(next));
                      }}
                      style={{
                        backgroundColor: "#EEE",
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 10,
                      }}
                    >
                      <Text style={{ fontWeight: "900" }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => removeRequestItem(idx)}
                  style={{
                    marginLeft: 10,
                    backgroundColor: "#EEE",
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}

        {/* Inventory list */}
        {user.role !== "supervisor" && user.role !== "staff"
          ? filtered.map((item) => (
              <View
                key={String(item.SKU)}
                style={{
                  backgroundColor: "#fff",
                  padding: 14,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 16 }}>
                  {item.product_name}
                </Text>

                <Text style={{ color: "#6e6e73", marginTop: 4 }}>
                  {item.location}
                </Text>

                <TouchableOpacity
                  style={{
                    marginTop: 10,
                    alignSelf: "flex-start",
                    backgroundColor: "#007AFF",
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 10,
                  }}
                  onPress={() => requestItem(item)}
                >
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Request</Text>
                </TouchableOpacity>

                {pendingItem && String(pendingItem.SKU) === String(item.SKU) ? (
                  <View style={{ marginTop: 10 }}>
                    <TextInput
                      value={qty}
                      onChangeText={setQty}
                      keyboardType="numeric"
                      placeholder="Qty"
                      style={{
                        borderWidth: 1,
                        borderColor: "#ddd",
                        borderRadius: 10,
                        padding: 10,
                        marginTop: 8,
                        width: 120,
                        backgroundColor: "#fff",
                      }}
                    />

                    <TouchableOpacity
                      style={{
                        marginTop: 10,
                        alignSelf: "flex-start",
                        backgroundColor: "#111",
                        paddingVertical: 10,
                        paddingHorizontal: 14,
                        borderRadius: 10,
                      }}
                      onPress={() => {
                        setRequests((prev) => [
                          ...prev,
                          { sku: String(item.SKU), name: item.product_name, qty },
                        ]);

                        setLastRequest(`Requested: ${item.product_name} x ${qty}`);
                        setPendingItem(null);
                        setQty("1");
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "700" }}>
                        Confirm
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ))
          : null}
      </ScrollView>

      {/* BOTTOM BAR */}
      {user.role !== "supervisor" && user.role !== "staff" ? (
        <View
          style={{
            position: "absolute",
            left: 24,
            right: 24,
            bottom: 20,
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 12,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: requests.length ? "#111" : "#999",
              paddingVertical: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
            onPress={() => {
              if (!requests.length) return;
              router.push({
                pathname: "/checkout",
                params: {
                  orderId: "New order",
                  returnMode: "inventory",
                  itemsJson: JSON.stringify(requests),
                },
              });
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Continue to checkout ({requests.length})
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}