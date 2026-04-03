import { InventoryItem } from "@/models/inventory-item";
import { iResponse } from "@/models/reponse";
import { API_URL } from "@/utils/api-config";
import axios from "axios";

export const GetInventoryItemsRequest = async (): Promise<InventoryItem[] | string> => {
    try {
        const response = await axios.get<iResponse<InventoryItem[]>>(`${API_URL}InventoryItem`);

        if (response.data.succeded) {
            return response.data.data ?? [];
        }
        else {
            return response.data.message ?? "Error getting inventory items";
        }
    } catch (error: any) {
        return error?.response?.data?.message ?? "Error getting inventory items";
    }
}