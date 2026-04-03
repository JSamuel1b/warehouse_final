import { LoginRequestDto } from "@/models/auth/login-request";
import { LoginResponseDto } from "@/models/auth/login-response";
import { iResponse } from "@/models/reponse";
import { API_URL } from "@/utils/api-config";
import axios from "axios";

export const LoginRequest = async (request: LoginRequestDto): Promise<LoginResponseDto | string> => {
    try {
        const response = await axios.post<iResponse<LoginResponseDto>>(`${API_URL}auth/login`, request);

        if (response.data.succeded && response.data.data) {
            return response.data.data;
        }
        else {
            return response.data.message ?? "Error login";
        }
    } catch (error: any) {
        return error?.response?.data?.message ?? "Error login";
    }
}

export const RefreshTokenRequest = async (token: string): Promise<LoginResponseDto | string> => {
    try {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }

        const response = await axios.get<iResponse<LoginResponseDto>>(`${API_URL}auth/refresh`, config);

        if (response.data.succeded && response.data.data) {
            return response.data.data;
        }
        else {
            return response.data.message ?? "Session Timed out";
        }

    } catch (error: any) {
        return error?.response?.data?.message ?? "Session Timed out";
    }
}