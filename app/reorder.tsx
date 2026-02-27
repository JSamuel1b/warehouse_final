import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { janitorialFromJson } from "../lib/loadJanitorialInventory";

type DraftItem = {
  sku: string;
  name: string;
  qty: string;
  lastQty?: string; // qty de la orden pasada (referencia)
};

export default function ReorderScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    sourceOrderId?: string;
    sourceCreatedAt?: string;
    baseItemsJson?: string;
  }>();

  const sourceOrderId = params.sourceOrderId ?? "Past order";
  const sourceCreatedAt = params.sourceCreatedAt ?? "";
  const baseItemsJson = params.baseItemsJson ?? "[]";

  const [items, setItems] = useState<DraftItem[]>([]);
  const [search, setSearch] = useState("");

  // ✅ Load base items once
  useEffect(() => {
    try {
      const parsed = JSON.parse(baseItemsJson) as Array<{
        sku?: string;
        name?: string;
        qty?: string;
      }>;

      const normalized: DraftItem[] = (parsed || []).map((x) => {
        const q = String(x.qty ?? "1");
        return {
          sku: String(x.sku ?? ""),
          name: String(x.name ?? ""),
          qty: q, // editable hoy
          lastQty: q, // referencia de la orden pasada
        };
      });

      // filtra vacíos por si acaso
      setItems(normalized.filter((x) => x.sku && x.name));
    } catch {
      setItems([]);
    }
  }, [baseItemsJson]);

  // ✅ Search results from inventory
  const inventoryResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];

    return janitorialFromJson
      .filter((p) => p.product_name.toLowerCase().includes(q))
      .slice(0, 12);
  }, [search]);

  const updateQty = (sku: string, qty: string) => {
    setItems((prev) =>
      prev.map((it) => (it.sku === sku ? { ...it, qty } : it))
    );
  };

  const removeItem = (sku: string) => {
    setItems((prev) => prev.filter((it) => it.sku !== sku));
  };

  const addItem = (sku: string, name: string) => {
    setItems((prev) => {
      const exists = prev.find((x) => x.sku === sku);
      if (exists) return prev; // no duplicar
      return [{ sku, name, qty: "1", lastQty: "" }, ...prev];
    });
    setSearch("");
  };

  const canStart = items.length > 0;

  // ✅ Formato fecha “bonito”
  const formattedDate = sourceCreatedAt
    ? new Date(sourceCreatedAt).toLocaleDateString()
    : "";

  return (
    <View style={{ flex: 1, backgroundColor: "#F5F5F7" }}>
      {/* ✅ Top bar */}
      <View
        style={{
          paddingTop: 18,
          paddingHorizontal: 24,
          paddingBottom: 12,
          backgroundColor: "#F5F5F7",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>
              Start reorder
            </Text>

            <Text style={{ marginTop: 2, color: "#6e6e73" }}>
              Based on {sourceOrderId}
              {formattedDate ? ` • ${formattedDate}` : ""}
            </Text>
          </View>

          {/* ✅ Close (volver a History) */}
          <TouchableOpacity
            onPress={() => {
              router.push({ pathname: "/janitorial", params: { mode: "history" } });
            }}
            style={{
              backgroundColor: "#fff",
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#ddd",
            }}
          >
            <Text style={{ fontWeight: "900" }}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ marginTop: 12, color: "#111", fontWeight: "700" }}>
          Select the quantity you want of each item
        </Text>

        {/* ✅ Search add */}
        <TextInput
          placeholder="Search more items to add..."
          value={search}
          onChangeText={setSearch}
          style={{
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 12,
            padding: 12,
            backgroundColor: "#fff",
          }}
        />

        {/* ✅ Search results */}
        {inventoryResults.length ? (
          <View
            style={{
              marginTop: 10,
              backgroundColor: "#fff",
              borderRadius: 14,
              padding: 12,
              borderWidth: 1,
              borderColor: "#eee",
            }}
          >
            <Text style={{ fontWeight: "800" }}>Results</Text>

            {inventoryResults.map((p) => (
              <View
                key={String(p.SKU)}
                style={{
                  marginTop: 10,
                  paddingTop: 10,
                  borderTopWidth: 1,
                  borderColor: "#f0f0f0",
                }}
              >
                <Text style={{ fontWeight: "700" }}>{p.product_name}</Text>
                <Text style={{ color: "#6e6e73", marginTop: 2 }}>
                  {p.location}
                </Text>

                <TouchableOpacity
                  style={{
                    marginTop: 8,
                    alignSelf: "flex-start",
                    backgroundColor: "#007AFF",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 10,
                  }}
                  onPress={() => addItem(String(p.SKU), p.product_name)}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>
                    Add to order
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      {/* ✅ Items list */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
      >
        {items.map((it) => (
          <View
            key={it.sku}
            style={{
              marginTop: 12,
              backgroundColor: "#fff",
              padding: 14,
              borderRadius: 14,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "800" }}>{it.name}</Text>
                <Text style={{ color: "#6e6e73", marginTop: 2 }}>
                  SKU: {it.sku}
                </Text>

                {it.lastQty ? (
                  <Text style={{ color: "#6e6e73", marginTop: 6 }}>
                    In last order {sourceOrderId}, you took {it.lastQty}/each
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => removeItem(it.sku)}
                style={{
                  backgroundColor: "#F2F2F2",
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontWeight: "900" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={it.qty}
              onChangeText={(v) => updateQty(it.sku, v)}
              keyboardType="numeric"
              placeholder="Qty"
              style={{
                marginTop: 10,
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 12,
                width: 140,
                backgroundColor: "#fff",
              }}
            />
          </View>
        ))}

        {!items.length ? (
          <Text style={{ marginTop: 16, color: "#6e6e73" }}>
            No items loaded. Add items using search above.
          </Text>
        ) : null}
      </ScrollView>

      {/* ✅ Bottom bar */}
      <View
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          bottom: 20,
          backgroundColor: "#fff",
          borderRadius: 16,
          padding: 12,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: canStart ? "#111" : "#999",
            paddingVertical: 14,
            borderRadius: 14,
            alignItems: "center",
          }}
          onPress={() => {
            if (!items.length) return;

            // ✅ mandar SOLO sku/name/qty a checkout (sin lastQty)
            const cleanItems = items.map((x) => ({
              sku: x.sku,
              name: x.name,
              qty: x.qty,
            }));

            router.push({
              pathname: "/checkout",
              params: {
                itemsJson: JSON.stringify(cleanItems),
              },
            });
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "900" }}>
            Reorder ({items.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
