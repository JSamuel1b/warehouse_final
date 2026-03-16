export interface LoginResponseDto {
    userName: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
    roleId: number;
    roleName: string;
    departmentId: number | null;
    departmentName: string | null;
    jwtToken: string;
}