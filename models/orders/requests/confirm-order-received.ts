export interface ConfirmOrderReceivedDto {
    orderId: number;
    updatedAt: string;
    updatedBy: string | null;
    receivedByName: string | null;
}