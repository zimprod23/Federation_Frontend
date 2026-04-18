import client from "./client";
import {
  ApiResponse,
  PaginatedData,
  MemberResponseDTO,
  CreateMemberDTO,
  UpdateMemberDTO,
  CardResponseDTO,
  MemberHistoryDTO,
} from "@/types";

export interface ListMembersParams {
  page?: number;
  limit?: number;
  status?: string;
  gender?: string;
  category?: string;
  clubId?: string;
  season?: number;
  search?: string;
}

export const membersApi = {
  list: async (params?: ListMembersParams) => {
    const res = await client.get<ApiResponse<PaginatedData<MemberResponseDTO>>>(
      "/members",
      { params },
    );
    return res.data.data!;
  },

  getById: async (id: string) => {
    const res = await client.get<ApiResponse<MemberResponseDTO>>(
      `/members/${id}`,
    );
    return res.data.data!;
  },

  create: async (dto: CreateMemberDTO) => {
    const res = await client.post<ApiResponse<MemberResponseDTO>>(
      "/members",
      dto,
    );
    return res.data.data!;
  },

  update: async (id: string, dto: UpdateMemberDTO) => {
    const res = await client.patch<ApiResponse<MemberResponseDTO>>(
      `/members/${id}`,
      dto,
    );
    return res.data.data!;
  },

  delete: async (id: string) => {
    await client.delete(`/members/${id}`);
  },

  uploadPhoto: async (id: string, file: File) => {
    const form = new FormData();
    form.append("photo", file);
    const res = await client.post<ApiResponse<MemberResponseDTO>>(
      `/members/${id}/photo`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.data!;
  },

  getCard: async (id: string) => {
    const res = await client.get<ApiResponse<CardResponseDTO>>(`/cards/${id}`);
    return res.data.data!;
  },

  generateCard: async (id: string, validFrom: string, validUntil: string) => {
    const res = await client.post<ApiResponse<CardResponseDTO>>(
      `/cards/${id}/generate`,
      { validFrom, validUntil },
    );
    return res.data.data!;
  },

  getHistory: async (id: string) => {
    const res = await client.get<ApiResponse<MemberHistoryDTO>>(
      `/members/${id}/history`,
    );
    return res.data.data!;
  },
};
