export interface InventoryItem {
    id: number;
    sku: string;
    name: string;
    stock: number;
    location: string;
    unit: string;
    lastRestocked: string | null;
}