import { GetInventoryItemsRequest } from "@/services/inventory-items-service";
import data from "../app/assets/janitorialInventory.json";
import { InventoryItem } from "@/models/inventory-item";
import { ShowInfoMessage } from "@/utils/toast-message.service";
import { getPathWithConventionsCollapsed } from "expo-router/build/fork/getPathFromState-forks";

export type JanitorialJsonItem = {
  SKU: string | number;
  product_name: string;
  location: string;
};

export const janitorialFromJson = data as JanitorialJsonItem[];

export const janitorialFromAPI = async (): Promise<JanitorialJsonItem[]> => {
  const itemsResponse = await GetInventoryItemsRequest();

  if (typeof(itemsResponse) != "string")
  {
    let data = itemsResponse.map((x: InventoryItem) => {
      let janitorialItem: JanitorialJsonItem = {
        location: x.location,
        product_name: x.name,
        SKU: x.sku
      }
      
      return janitorialItem;
    })

    return data;
  }
  else{
    ShowInfoMessage(itemsResponse);
    return [];
  }
}