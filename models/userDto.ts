export interface UserDto {
    username: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roleId: number;
    roleName: string;
    departmentId: number | null;
    departmentName: string | null;
    departmentPinCode: string | null;
}