import client from "./client";
import { ApiResponse } from "@/types";

export interface DashboardStats {
  totals: {
    members: number;
    activeClubs: number;
    openCompetitions: number;
  };
  membersByStatus: { status: string; count: number }[];
  membersByCategory: { category: string; count: number }[];
  membersByGender: { gender: string; count: number }[];
}

export const statsApi = {
  dashboard: async (): Promise<DashboardStats> => {
    const res =
      await client.get<ApiResponse<DashboardStats>>("/stats/dashboard");
    return res.data.data!;
  },
};
