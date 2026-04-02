export interface CheckOutToolDto {
    id: number;
    currentHolderUsername: string | null;
    ownerUsername: string;
    kioskId: string | null;
    kioskName: string | null;
    isKioskCheckout: boolean;
    checkedOutAt: string;
    dueAt: string;
    locationOfUse: string;
    expectedDuration: string;
}