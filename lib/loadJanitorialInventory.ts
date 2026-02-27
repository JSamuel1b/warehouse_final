import data from "../app/assets/janitorialInventory.json";

export type JanitorialJsonItem = {
  SKU: string | number;
  product_name: string;
  location: string;
};

export const janitorialFromJson = data as JanitorialJsonItem[];