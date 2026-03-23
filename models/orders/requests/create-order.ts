export interface CreateOrderDto {
    createdAt: string;
    kind: string;
    status: string;
    requestedId: string | null;
    assignedToId: string | null;
    receivedByName: string | null;
    receivedAt: string | null;
    pickedByName: string | null;
    items: CreateOrderItemDto[];
}

export interface CreateOrderItemDto {
    sKU: string;
    quantity: number;
}