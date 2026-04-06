import { InventoryItem } from "@/models/inventory-item";
import { iResponse } from "@/models/reponse";
import { API_URL, SECRET_KEY } from "@/utils/api-config";
import axios from "axios";

export const GetInventoryItemsRequest = async (): Promise<InventoryItem[] | string> => {
    try {
        const config = {
            headers: {
                "secretKey": SECRET_KEY
            }
        }

        const response = await axios.get<iResponse<InventoryItem[]>>(`${API_URL}InventoryItem`, config);

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