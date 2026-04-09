import client from "./client";
import {
  ApiResponse,
  PaginatedData,
  CompetitionResponseDTO,
  EventResponseDTO,
  RegistrationResponseDTO,
  ResultResponseDTO,
} from "@/types";

export const competitionsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    season?: number;
    type?: string;
  }) => {
    const res = await client.get<
      ApiResponse<PaginatedData<CompetitionResponseDTO>>
    >("/competitions", { params });
    return res.data.data!;
  },

  getById: async (id: string) => {
    const res = await client.get<
      ApiResponse<CompetitionResponseDTO & { events: EventResponseDTO[] }>
    >(`/competitions/${id}`);
    return res.data.data!;
  },

  create: async (dto: {
    name: string;
    type: string;
    location: string;
    city: string;
    startDate: string;
    endDate: string;
    season: number;
    description?: string;
  }) => {
    const res = await client.post<ApiResponse<CompetitionResponseDTO>>(
      "/competitions",
      dto,
    );
    return res.data.data!;
  },

  updateStatus: async (id: string, status: string) => {
    const res = await client.patch<ApiResponse<CompetitionResponseDTO>>(
      `/competitions/${id}/status`,
      { status },
    );
    return res.data.data!;
  },

  createEvent: async (
    competitionId: string,
    dto: {
      distance: string;
      category: string;
      gender: string;
      scheduledAt?: string;
    },
  ) => {
    const res = await client.post<ApiResponse<EventResponseDTO>>(
      `/competitions/${competitionId}/events`,
      dto,
    );
    return res.data.data!;
  },

  getRegistrations: async (competitionId: string, eventId: string) => {
    const res = await client.get<ApiResponse<RegistrationResponseDTO[]>>(
      `/competitions/${competitionId}/events/${eventId}/registrations`,
    );
    return res.data.data!;
  },

  registerMember: async (
    competitionId: string,
    eventId: string,
    memberId: string,
  ) => {
    const res = await client.post<ApiResponse<RegistrationResponseDTO>>(
      `/competitions/${competitionId}/events/${eventId}/registrations`,
      { memberId },
    );
    return res.data.data!;
  },

  getResults: async (competitionId: string, eventId: string) => {
    const res = await client.get<ApiResponse<ResultResponseDTO[]>>(
      `/competitions/${competitionId}/events/${eventId}/results`,
    );
    return res.data.data!;
  },

  recordResult: async (
    competitionId: string,
    eventId: string,
    dto: Partial<ResultResponseDTO>,
  ) => {
    const res = await client.post<ApiResponse<ResultResponseDTO>>(
      `/competitions/${competitionId}/events/${eventId}/results`,
      dto,
    );
    return res.data.data!;
  },
  // Add these to the competitionsApi object
  deleteEvent: async (competitionId: string, eventId: string) => {
    await client.delete(`/competitions/${competitionId}/events/${eventId}`);
  },

  clearResults: async (competitionId: string, eventId: string) => {
    const res = await client.delete<ApiResponse<void>>(
      `/competitions/${competitionId}/events/${eventId}/results`,
    );
    return res.data;
  },
};
