import { apiRequest, errorMessages } from "@/lib/api";
import { LoginResponse, MeResponse } from "@/lib/types";

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiRequest.post<LoginResponse>(`/auth/login`, {
      body: { email, password },
    });

    if (response.status !== 200) {
      throw new Error(errorMessages[response.status] || `Erro desconhecido`);
    }

    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiRequest.post(`/auth/logout`);
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiRequest.get<MeResponse>(`/auth/me`);

    if (response.status !== 200) {
      throw new Error("Erro ao obter dados do usuário.");
    }

    return response.data;
  },
};
