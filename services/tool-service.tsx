import { Tool, ToolStatus } from "@/lib/toolStore";
import { iResponse } from "@/models/reponse";
import { CheckOutToolDto } from "@/models/tools/requests/checkout-tool";
import { ConfirmToolReturnDto } from "@/models/tools/requests/confirm-return";
import { InitiateReturnDto } from "@/models/tools/requests/initial-return";
import { ToolDto } from "@/models/tools/tool-dto";
import { API_URL } from "@/utils/api-config";
import axios from "axios";

export const GetToolsRequest = async () : Promise<Tool[] | string> => {
    try {
        const response = await axios.get<iResponse<ToolDto[]>>(`${API_URL}Tool`);

        if (response.data.succeded)
        {
            let tools = response.data.data?.map(x => {
                let tool : Tool = {
                    id: x.id.toString(),
                    category: x.toolCategoryName,
                    history: x.histories.map(h => {

                        if(h.type == "checkout")
                        {
                            return {
                              type: "checkout",
                              at: h.at,
                              byUserId: h.kioskId,
                              byName: h.kioskName,
                              locationOfUse: h.locationOfUse,
                              expectedDuration: h.expectedDuration
                            } as {
                                  type: "checkout";
                                  at: string;
                                  byUserId: string;
                                  byName: string;
                                  locationOfUse: string;
                                  expectedDuration: string;
                                };
                        }

                        if(h.type == "return_initiated")
                        {
                            return {
                                type: "return_initiated",
                                at: h.at,
                                byUserId: h.kioskId,
                                byName: h.kioskName
                            } as {
                              type: "return_initiated";
                              at: string;
                              byUserId: string;
                              byName: string;
                            };
                        }

                        return {
                          type: "return_confirmed",
                          at: h.at,
                          staffUserId: h.staffUserUsername,
                          staffName: h.staffUserName,
                          borrowerUserId: h.borrowerUserUsername,
                          borrowerName: h.borrowerName,
                          clean: h.clean
                        } as {
                          type: "return_confirmed";
                          at: string;
                          staffUserId: string;
                          staffName: string;
                          borrowerUserId: string;
                          borrowerName: string;
                          clean: boolean;
                        };
                    }),
                    name: x.name,
                    status: x.status as ToolStatus,
                    checkedOutAt: x.checkedOutAt ?? undefined,
                    currentHolderName: x.kioskName ?? x.currentHolderName,
                    currentHolderUserId: x.kioskId ?? undefined,
                    dueAt: x.dueAt ?? undefined,
                    expectedDuration: x.expectedDuration ?? undefined,
                    locationOfUse: x.locationOfUse ?? undefined,
                    ownerDepartment: x.ownerDepartmentName,
                    ownerDeptHeadId: x.ownerUsername ?? undefined,
                    ownerDeptHeadName: x.ownerName
                };
                
                return tool;
            });

            return tools ?? [];
        }
        else{
            return response.data.message ?? "Error getting tools";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error getting tools";
    }
}

export const CheckoutToolRequest = async (request: CheckOutToolDto) : Promise<boolean | string> => {
    try {
        const response = await axios.post<iResponse<boolean>>(`${API_URL}Tool/CheckOut`, request);

        if(response.data.succeded)
        {
            return true;
        }
        else{
            return response.data.message ?? "Error checking out tool";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error checking out tool";
    }
}

export const InitiateReturnRequest = async (request: InitiateReturnDto) : Promise<boolean | string> =>
{
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}Tool/InitiateReturn`, request);

        if(response.data.succeded)
        {
            return true;
        }
        else{
            return response.data.message ?? "Error initiating tool return";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error initiating tool return";
    }
}

export const ConfirmToolReturnRequest = async (request: ConfirmToolReturnDto) : Promise<boolean | string> =>
{
    try {
        const response = await axios.put<iResponse<boolean>>(`${API_URL}Tool/ConfirmReturn`, request);

        if(response.data.succeded)
        {
            return true;
        }
        else{
            return response.data.message ?? "Error confirming tool return";
        }
    } catch (error: any) {
        return error.response.data.message ?? "Error confirming tool return";
    }
}