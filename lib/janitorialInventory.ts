// Janitorial Inventory Data
export interface JanitorialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lastRestocked: Date;
}
export const janitorialInventory: JanitorialItem[] = [
  {
    id: "1",
    name: "Trash Bags",
    quantity: 120,
    unit: "box",
    lastRestocked: new Date(),
  },
  {
    id: "2",
    name: "Floor Cleaner",
    quantity: 35,
    unit: "gallon",
    lastRestocked: new Date(),
  },
];
