// ─── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole =
  | "super_admin"
  | "federation_admin"
  | "club_manager"
  | "scanner"
  | "member";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: AuthUser;
}

// ─── Shared ───────────────────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export type Gender = "male" | "female" | "other";
export type Category = "junior" | "u23" | "senior";

export type MemberStatus = "active" | "pending" | "suspended" | "expired";
export type ClubStatus = "active" | "pending" | "suspended";

// ─── Member ───────────────────────────────────────────────────────────────────
export interface MemberResponseDTO {
  id: string;
  licenseNumber: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth?: string;
  phone?: string;
  cin?: string;
  photoUrl?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  gender: Gender;
  category: Category;
  status: MemberStatus;
  season: number;
  clubId?: string;
  createdAt?: string;
}

export interface CreateMemberDTO {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone?: string;
  cin?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  clubId?: string;
}

export interface UpdateMemberDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  cin?: string;
  height?: number;
  armSpan?: number;
  weight?: number;
  clubId?: string;
  status?: MemberStatus;
}

// ─── Club ─────────────────────────────────────────────────────────────────────
export interface ClubResponseDTO {
  id: string;
  name: string;
  code: string;
  clubShort: string;
  region: string;
  city: string;
  status: ClubStatus;
  disciplines: string[];
  presidentName?: string;
  presidentEmail?: string;
  createdAt?: string;
}

export interface CreateClubDTO {
  name: string;
  code: string;
  clubShort: string;
  region: string;
  city: string;
  disciplines: string[];
  presidentName?: string;
  presidentEmail?: string;
  presidentPhone?: string;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export interface CardResponseDTO {
  id: string;
  memberId: string;
  licenseNumber: string;
  season: number;
  cardNumber: string;
  isValid: boolean;
  validFrom: string;
  validUntil: string;
  qrPayload: string;
  qrDataUrl?: string;
  generatedAt?: string;
}

// ─── Verification ─────────────────────────────────────────────────────────────
export type VerificationResult =
  | "valid"
  | "suspended"
  | "expired"
  | "not_found";

export interface VerificationResponseDTO {
  result: VerificationResult;
  member?: {
    fullName: string;
    licenseNumber: string;
    photoUrl?: string;
    category: Category;
    gender: Gender;
    status: MemberStatus;
    season: number;
  };
}

// ─── Competition ──────────────────────────────────────────────────────────────
export type CompetitionType = "test_fisa" | "championship" | "friendly";
export type CompetitionStatus = "draft" | "open" | "closed" | "completed";
export type EventDistance = "150m" | "2000m" | "6000m" | "10000m" | "15000m";
export type EventStatus = "scheduled" | "ongoing" | "completed";
export type RegistrationStatus =
  | "registered"
  | "scratched"
  | "dns"
  | "dnf"
  | "dq"
  | "finished";

export interface CompetitionResponseDTO {
  id: string;
  name: string;
  type: CompetitionType;
  status: CompetitionStatus;
  location: string;
  city: string;
  startDate: string;
  endDate: string;
  season: number;
  description?: string;
  createdBy: string;
  createdAt?: string;
}

export interface EventResponseDTO {
  id: string;
  competitionId: string;
  distance: EventDistance;
  category: Category;
  gender: Gender;
  status: EventStatus;
  label: string;
  scheduledAt?: string;
}

export interface RegistrationResponseDTO {
  id: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  clubId?: string;
  status: RegistrationStatus;
  lane?: number;
  bib?: number;
  registeredBy: string;
}

export interface ResultResponseDTO {
  id: string;
  competitionId: string;
  eventId: string;
  memberId: string;
  registrationId: string;
  rank?: number;
  finalTime?: string;
  splitTime500?: string;
  strokeRate?: number;
  heartRate?: number;
  watts?: number;
  notes?: string;
  recordedBy: string;
  memberFullName?: string;
  memberLicenseNumber?: string;
}
