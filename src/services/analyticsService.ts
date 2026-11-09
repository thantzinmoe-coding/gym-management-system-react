import api from '@/services/api';

const BASE_URL = '/api/v1/analytics';

export type RiskLevel = 'high' | 'medium' | 'low';

export interface ChurnReason {
  feature: string;
  effect: number;
  text: string;
}

export interface MemberChurn {
  user_id: number;
  name?: string;
  status: 'active' | 'lapsed' | 'no_visits';
  risk: number | null;
  risk_level: RiskLevel | null;
  reasons: ChurnReason[];
  stats: Record<string, number | null>;
}

export interface ChurnSummary {
  as_of: string;
  scored_members: number;
  average_risk: number | null;
  by_level: Record<RiskLevel, number>;
  model_version: string;
  synthetic_model: boolean;
}

export interface ChurnMemberList {
  as_of: string;
  total: number;
  members: MemberChurn[];
}

export interface PackageRecommendation {
  package_id: number;
  name: string;
  theme: string;
  trainer_id: number;
  trainer_name?: string;
  price: number;
  start_date: string;
  end_date: string;
  score: number;
  components: Record<string, number>;
  reasons: string[];
}

export interface RecommendationResult {
  user_id: number;
  as_of: string;
  churn_risk: number | null;
  recommendations: PackageRecommendation[];
}

// The backend wraps every payload in ApiResponse { success, code, data, message }.
const unwrap = <T>(response: { data: { data: T } }): T => response.data.data;

export const analyticsService = {
  getChurnSummary: async (): Promise<ChurnSummary> =>
    unwrap(await api.get(`${BASE_URL}/churn/summary`)),

  getAtRiskMembers: async (limit = 100, minRisk = 0): Promise<ChurnMemberList> =>
    unwrap(await api.get(`${BASE_URL}/churn/members`, { params: { limit, minRisk } })),

  getMyMembersAtRisk: async (): Promise<ChurnMemberList> =>
    unwrap(await api.get(`${BASE_URL}/churn/my-members`)),

  getMyRecommendations: async (limit = 3): Promise<RecommendationResult> =>
    unwrap(await api.get(`${BASE_URL}/recommendations/me`, { params: { limit } })),

  retrainModel: async () => unwrap(await api.post(`${BASE_URL}/model/retrain`)),
};

export const errorMessage = (err: unknown, fallback: string): string => {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message ?? fallback;
};
