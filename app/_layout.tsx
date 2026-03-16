import { Stack } from "expo-router";
import { MessagesProvider } from "../lib/messagesStore";
import { OrdersProvider } from "../lib/ordersStore";
import { ToolsProvider } from "../lib/toolStore";
import { UserProvider } from "../lib/userStore";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <>
      <UserProvider>
        <OrdersProvider>
          <ToolsProvider>
            <MessagesProvider>
              <Stack screenOptions={{ headerShown: false }} />
            </MessagesProvider>
          </ToolsProvider>
        </OrdersProvider>
      </UserProvider>
      <Toast />
    </>
    
  );
}