export interface OrderDto {
    id: number;
    createdAt: string;
    updatedAt: string;
    kind: string;
    status: string;
    requestedId: string | null;
    requesterName: string;
    requesterRole: string;
    requesterDepartment: string;
    requesterDepartmentId: number;
    assignedToId: string | null;
    assignedToName: string | null;
    receivedByName: string | null;
    receivedAt: string | null;
    pickedByName: string | null;
    items: OrderItemDto[];
}

export interface OrderItemDto {
    id: number;
    orderId: number;
    inventoryItemId: number;
    inventoryItemSKU: string;
    inventoryItemName: string;
    quantity: number;
}