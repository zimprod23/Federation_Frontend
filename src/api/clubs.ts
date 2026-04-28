import client from "./client";
import {
  ApiResponse,
  PaginatedData,
  ClubResponseDTO,
  CreateClubDTO,
} from "@/types";

export const clubsApi = {
  list: async (params?: { page?: number; limit?: number }) => {
    const res = await client.get<ApiResponse<PaginatedData<ClubResponseDTO>>>(
      "/clubs",
      { params },
    );
    return res.data.data!;
  },

  getById: async (id: string) => {
    const res = await client.get<ApiResponse<ClubResponseDTO>>(`/clubs/${id}`);
    return res.data.data!;
  },

  create: async (dto: CreateClubDTO) => {
    const res = await client.post<ApiResponse<ClubResponseDTO>>("/clubs", dto);
    return res.data.data!;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await client.patch<ApiResponse<ClubResponseDTO>>(
      `/clubs/${id}/status`,
      { status },
    );
    return res.data.data!;
  },
  delete: async (id: string) => {
    await client.delete(`/clubs/${id}`);
  },
};
