export interface ClientResponse {
  id: string;
  companyName: string;
  contactEmail: string;
  contactFirstName: string;
  contactLastName: string;
  companyAddress: string;
  contactPhone: string;
  registrationNumber: string;
  country: string;
  address: string;
  taxId: string;
  industry: string;
  phoneNumber: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "ACTIVE"
    | "SUSPENDED"
    | "INACTIVE";
  createdAt: string;
  approvedAt: string | null;
  userCount: number;
}

export interface ApproveClientRequest {
  approvedRoles: string[];
}

export interface AvailabilityResponse {
  usernameAvailable: boolean;
  emailAvailable: boolean;
}

export type RoleApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

/** The complete set of roles you want to end up with - not a diff. */
export interface RoleChangeApplicationRequest {
  requestedRoles: string[];
}

export interface RoleChangeApplicationResponse {
  id: string;
  userId: string;
  username: string;
  email: string;
  /** The complete target role set - what the vendor ends up with on approval. */
  requestedRoles: string[];
  /** Only the roles the vendor did not hold at submit time (may be empty on older rows). */
  newlyRequestedRoles?: string[];
  status: RoleApplicationStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

/** One requestable platform service, read live from Keycloak. */
export interface ServiceRole {
  name: string;
  description: string;
}

/** A Keycloak user as the admin API reports it. */
export interface AdminUserResponse {
  keycloakUserId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  roles: string[];
}

/** Mutable user attributes. Omitted fields are left unchanged. */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
}

export interface UserRolesRequest {
  roles: string[];
}

/** One recorded call this service made to a downstream system. */
export interface DownstreamAuditResponse {
  id: string;
  userId: string;
  /** Service operation performed by the orchestrator. */
  operation: string;
  request: string;
  response: string;
  httpStatus: number;
  startTime: string;
  endTime: string;
}

/** Payload for changing the signed-in user's own password. */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/** Spring's page envelope as returned by `GET /api/admin/downstream-audit`. */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
