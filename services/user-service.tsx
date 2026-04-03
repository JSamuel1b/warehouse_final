import { DeptHead } from "@/lib/usersDirectory";
import { iResponse } from "@/models/reponse";
import { UserDto } from "@/models/userDto";
import { API_URL } from "@/utils/api-config";
import axios from "axios";

export const GetDeptHeadsRequest = async (): Promise<DeptHead[] | string> => {
    try {
        const response = await axios.get<iResponse<UserDto[]>>(`${API_URL}users/DeptHeads`);

        if (response.data.succeded) {
            let deptHeads = response.data.data?.map((x: UserDto) => {
                let deptHead: DeptHead = {
                    id: x.username,
                    departmentId: x.departmentId ?? 0,
                    department: x.departmentName ?? "",
                    name: `${x.firstName} ${x.lastName}`,
                    pinCode: x.departmentPinCode ?? undefined
                };

                return deptHead;
            });

            return deptHeads ?? [];
        }
        else {
            return response.data.message ?? "Error getting dept heads";
        }
    } catch (error: any) {
        return error?.response?.data?.message ?? "Error getting dept heads";
    }
}