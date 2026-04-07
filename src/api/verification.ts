import client from "./client";
import { ApiResponse, VerificationResponseDTO } from "@/types";

export const verificationApi = {
  verify: async (token: string): Promise<VerificationResponseDTO> => {
    const res = await client.get<ApiResponse<VerificationResponseDTO>>(
      `/verify/${token}`,
    );
    return res.data.data!;
  },

  logScan: async (
    token: string,
    location?: string,
  ): Promise<VerificationResponseDTO> => {
    const res = await client.post<ApiResponse<VerificationResponseDTO>>(
      "/verify/scan",
      { token, location },
    );
    return res.data.data!;
  },
};
