import { OrderDto } from "@/models/orders/order";
import { AssignOrderDto } from "@/models/orders/requests/assign-order";
import { ConfirmOrderReceivedDto } from "@/models/orders/requests/confirm-order-received";
import { CreateOrderDto } from "@/models/orders/requests/create-order";
import { UnassignOrderDto } from "@/models/orders/requests/unassign-order";
import { UpdateStatusDto } from "@/models/orders/requests/update-order-status";
import { iResponse } from "@/models/reponse";
import { API_URL } from "@/utils/api-config";
import axios from "axios";

export const LoadOrdersFromAPIRequest = async () : Promise<OrderDto[] | string> => {
    try {
        const response = await axios.get<iResponse<OrderDto[]>>(`${API_URL}order`);

        if(response.data.succeded)
        {
            return response.data.data ?? [];
        }
        else{
            return response.data.message ?? "Error getting orders";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error getting orders";
    }
}

export const CreateOrderRequest = async (request: CreateOrderDto) : Promise<number | string> => {
    try {
        const response = await axios.post<iResponse<number>>(`${API_URL}order`, request);

        if(response.data.succeded)
        {
            return response.data.data ?? 0;
        }
        else{
            return response.data.message ?? "Error creating order";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error creating order";
    }
}

export const AssignOrderToUserRequest = async (request: AssignOrderDto) : Promise<boolean | string> =>
{
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}order/AssignOrder`, request);

        if(response.data.succeded)
        {
            return response.data.data ?? false;
        }
        else{
            return response.data.message ?? "Error assigning order"
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error assigning order";
    }
}

export const UnassignOrderRequest = async (request: UnassignOrderDto) : Promise<boolean | string> =>
{
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}order/UnassignOrder`, request);

        if(response.data.succeded)
        {
            return response.data.data ?? false;
        }
        else{
            return response.data.message ?? "Error unassigning order";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error unassigning order";
    }
}

export const UpdateOrderStatusRequest = async (request: UpdateStatusDto) : Promise<boolean | string> => {
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}order/UpdateStatus`, request);

        if(response.data.succeded)
        {
            return response.data.data ?? false;
        }
        else{
            return response.data.message ?? "Error updating order status";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error updating order status";
    }
}

export const ConfirmOrderReceivedRequest = async (request: ConfirmOrderReceivedDto) : Promise<boolean | string> => {
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}order/ConfirmOrderReceived`, request);

        if(response.data.succeded)
        {
            return response.data.data ?? false;
        }
        else{
            return response.data.message ?? "Error confirming order as received";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error confirming order as received";
    }
}