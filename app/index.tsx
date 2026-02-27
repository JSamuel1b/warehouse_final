import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useUser } from "../lib/userStore";

const WELCOME = "/welcome" as any;

export default function Index() {
  const router = useRouter();
  const { user, isHydrated } = useUser();

  useEffect(() => {
    if (!isHydrated) return;

    if (!user) {
      router.replace(WELCOME);
      return;
    }

    if (user.role === "physical_consumer") {
      router.replace("/janitorial");
      return;
    }

   if (user.role === "dept_head") {
  router.replace("/janitorial"); // ✅ dept_head can create orders
  return;
}

   if (user.role === "staff") {
  router.replace("/staff");
  return;
}

if (user.role === "supervisor") {
  router.replace("/supervisor");
  return;
}

    router.replace(WELCOME);
  }, [isHydrated, user, router]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator />
    </View>
  );
}