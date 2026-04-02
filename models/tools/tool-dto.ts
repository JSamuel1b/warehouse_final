export interface ToolDto {
    id: number;
    name: string;
    toolCategoryId: number;
    toolCategoryName: string;
    status: string;
    currentHolderUsername: string | null;
    currentHolderName: string;
    kioskId: string | null;
    kioskName: string | null;
    ownerUsername: string | null;
    ownerName: string;
    ownerDepartmentId: number | null;
    ownerDepartmentName: string;
    checkedOutAt: string | null;
    dueAt: string | null;
    locationOfUse: string | null;
    expectedDuration: string | null;
    isKioskCheckout: boolean | null;
    histories: ToolHistoryDto[];
}

export interface ToolHistoryDto {
    id: number;
    toolId: number;
    type: string;
    at: string;
    byUserUsername: string | null;
    byName: string | null;
    locationOfUse: string | null;
    expectedDuration: string | null;
    clean: boolean | null;
    staffUserUsername: string | null;
    staffUserName: string | null;
    borrowerUserUsername: string | null;
    borrowerName: string | null;
    isKioskCheckout: boolean | null;
    kioskId: string | null;
    kioskName: string | null;
}