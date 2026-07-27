export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  FACILITY_MANAGER = "FACILITY_MANAGER",
  SUSTAINABILITY_LEAD = "SUSTAINABILITY_LEAD",
  OPERATOR = "OPERATOR",
  STUDENT = "STUDENT",
  CITIZEN = "CITIZEN",
}

export enum Permission {
  MANAGE_USERS = "MANAGE_USERS",
  VIEW_ANALYTICS = "VIEW_ANALYTICS",
  PERFORM_SCAN = "PERFORM_SCAN",
  MANAGE_CENTERS = "MANAGE_CENTERS",
  MANAGE_SMART_BINS = "MANAGE_SMART_BINS",
  EXPORT_REPORTS = "EXPORT_REPORTS",
  MANAGE_AI_MODELS = "MANAGE_AI_MODELS",
  VIEW_AUDIT_LOGS = "VIEW_AUDIT_LOGS",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: Object.values(Permission),
  [UserRole.FACILITY_MANAGER]: [
    Permission.VIEW_ANALYTICS,
    Permission.PERFORM_SCAN,
    Permission.MANAGE_CENTERS,
    Permission.MANAGE_SMART_BINS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_AUDIT_LOGS,
  ],
  [UserRole.SUSTAINABILITY_LEAD]: [
    Permission.VIEW_ANALYTICS,
    Permission.PERFORM_SCAN,
    Permission.EXPORT_REPORTS,
  ],
  [UserRole.OPERATOR]: [
    Permission.PERFORM_SCAN,
    Permission.MANAGE_SMART_BINS,
  ],
  [UserRole.STUDENT]: [Permission.PERFORM_SCAN],
  [UserRole.CITIZEN]: [Permission.PERFORM_SCAN],
};

export enum WasteTypeEnum {
  PLASTIC = "plastic",
  PAPER = "paper",
  ORGANIC = "organic",
  METAL = "metal",
  GLASS = "glass",
  E_WASTE = "e-waste",
}

export enum SocketEvent {
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  JOIN_ROOM = "join_room",
  LEAVE_ROOM = "leave_room",
  SCAN_COMPLETED = "scan_completed",
  BIN_TELEMETRY_UPDATE = "bin_telemetry_update",
  LEADERBOARD_UPDATE = "leaderboard_update",
  CONTAMINATION_ALERT = "contamination_alert",
  NOTIFICATION_RECEIVED = "notification_received",
}

export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  MONGO_ERROR = "MONGO_ERROR",
  AI_SERVICE_ERROR = "AI_SERVICE_ERROR",
}
