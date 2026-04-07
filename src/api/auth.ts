import client from "./client";
import { ApiResponse, AuthResponseDTO, LoginDTO } from "@/types";

export const authApi = {
  login: async (dto: LoginDTO): Promise<AuthResponseDTO> => {
    const res = await client.post<ApiResponse<AuthResponseDTO>>(
      "/auth/login",
      dto,
    );
    return res.data.data!;
  },

  me: async (): Promise<AuthResponseDTO["user"]> => {
    const res =
      await client.get<ApiResponse<AuthResponseDTO["user"]>>("/auth/me");
    return res.data.data!;
  },
};
