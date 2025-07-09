export type AlertSeverity = "red" | "orange" | "yellow" | "green";
export type ResourceStatus = "available" | "allocated" | "depleted";
export type RequestStatus = "requested" | "allocated";
export type PriorityLevel = "critical" | "high" | "medium" | "low";
export type ResourceType = "food" | "medicine" | "shelter" | "equipment";
export type DisasterType = "earthquake" | "flood" | "fire" | "other";
export type UrgencyLevel = "high" | "normal" | "low";
export type Role = "admin" | "partner";
export type EventType = "insert" | "update" | "delete" | "requested";

export type Status = "active" | "inactive" | "pending" | "unapproved";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "partner";
  organizationId?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AlertFormProps {
  onSubmit: (alert: Alert) => void;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  affected_Areas: GeoArea[];
  timestamp: string;
  isActive: boolean;
  createdBy: string;
  updates: AlertUpdate[];
  mediaUrls?: string[];
  voiceTranscription?: string;
  smsEnabled?: boolean;
  ussdCode?: string;
}

export interface AlertUpdate {
  id: string;
  alertId: string;
  message: string;
  timestamp: string;
  userId: string;
  mediaUrls?: string[];
  location?: GeoLocation;
}

export interface Resource {
  id: string;
  type: ResourceType;
  name: string;
  quantity: number;
  unit: string;
  location: GeoLocation;
  status: ResourceStatus;
  organizationId: string;
  organizationName?: string;
  lastUpdated: string;
  expiryDate?: string;
  conditions?: string[];
  is_deleted?: boolean;
  // priority: PriorityLevel;
  // disasterType: DisasterType;
  utilizationHistory?: ResourceUtilization[];
}

export interface allocateResource {
  id: string;
  resource: Resource[];
  allocatedTo: string;
  quantityAllocated: number;
  allocationDate: string;
  status: "pending" | "approved" | "rejected";
  lastUpdated: string;
}

export interface requestResources {
  id: string;
  type: ResourceType;
  name: string;
  quantity: number;
  unit: string;
  location: GeoLocation;
  status: RequestStatus;
  organizationId: string;
  organizationName?: string;
  lastUpdated: string;
  expiryDate?: string;
  conditions?: string[];
  urgency: UrgencyLevel;
  disasterType?: DisasterType;
  requestedBy?: string;
  utilizationHistory?: ResourceUtilization[];
}

export interface ResourceUtilization {
  timestamp: string;
  quantity: number;
  purpose: string;
  alertId?: string;
}

export interface ResourceHistory {
  id: string;
  timestamp: string;
  event_type: EventType;
  quantity_changed: number;
  status_after_event: string;
  location: string;
  performed_by: string;
  remarks?: string;
  quantity: number;
  resource_id: string;
}

export interface Organization {
  id: string;
  name: string;
  type:
    | "healthcare"
    | "ngo"
    | "essential"
    | "infrastructure"
    | "community"
    | "private"
    | "specialized";
  capabilities: string[];
  coverage: {
    center: GeoLocation;
    radius: number;
  };
  status: Status;
  contact: {
    email: string;
    phone: string;
    emergency: string;
  };
  address: string;
  operatingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  resources: Resource[];
  personnel: Personnel[];
  is_deleted: boolean;
  performanceMetrics?: {
    responseTime: number;
    resourceUtilization: number;
    successRate: number;
  };
}

export interface Personnel {
  id: string;
  name: string;
  role: string;
  status: "active" | "inactive" | "available" | "deployed";
  location?: string | null;
  skills: string[];
  contact: {
    phone: string;
    email: string;
  };
  deploymentHistory?: {
    alertId: string;
    startTime: string;
    endTime?: string;
    location: GeoLocation | null;
  }[];
  organization_id: string;
  timestamp: string;

  updatedAt: string;
}

export interface Message {
  id: string;
  senderId?: string | null;
  recipientId: string | null;
  type: "direct" | "group" | "broadcast" | "sms" | "ussd";
  content: string;
  timestamp: string;
  priority: "normal" | "urgent" | "emergency";
  status: "sent" | "delivered" | "read";
  attachments?: Attachment[];
  deliveryMethod?: "internet" | "sms" | "ussd";
}

export interface Attachment {
  id: string;
  type: "image" | "document" | "audio" | "video";
  url: string;
  name: string;
  size: number;
  thumbnailUrl?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface GeoArea {
  center: GeoLocation;
  radius: number;
  name: string;
  population?: number;
}

export interface AnalyticsData {
  timeframe: "day" | "week" | "month" | "year";
  metrics: {
    activeAlerts: number;
    resolvedAlerts: number;
    deployedResources: number;
    activePersonnel: number;
    responseTime: number;
    resourceUtilization: number;
  };
  trends: {
    timestamp: string;
    value: number;
  }[];
  historicalData?: {
    period: string;
    metrics: Record<string, number>;
  }[];
}

export interface Report {
  id: string;
  title: string;
  type: "incident" | "resource" | "performance" | "custom";
  dateRange: {
    start: string;
    end: string;
  };
  metrics: Record<string, number>;
  charts: {
    type: "line" | "bar" | "pie";
    data: any;
    options: any;
  }[];
  exportFormat?: "pdf" | "csv";
}
export interface DiasterPrediction {
  disasterType: string;
  probability: number;
  severity: string;
  expectedAreas: string[];
  recommendedActions: string[];
}
export interface ResourceAllocation {
  date: string;
  allocated: number;
}
export interface AdminDashboardProps {
  user: User;
}
export interface OptimizedAllocation {
  recommendation: string;
  // allocation: ResourceAllocation[];
  suggestions: string[];
}
export interface PersonnelLocation {
  id: string;
  personnel_id: string;
  name: string;
  organization_id: string;
  location_lat: number;
  location_lng: number;
  status: string;
  last_updated: string;
  personnel: {
    name: string;
    role: string;
  };
}

export interface SOSAlert {
  id: string;
  personnel_id: string;
  organization_id: string;
  location_lat: number;
  location_lng: number;
  status: string;
  description: string | null;
  created_at: string;
  personnel: {
    name: string;
    role: string;
  };
}

export interface DepletionPrediction {
  type: string;
  currentAmount: number;
  depletionTime: Date;
  depletionProbability: number;
}

export interface GapAnalysis {
  missingTypes: Array<{
    type: string;
    quantityNeeded: number;
  }>;
  immediateNeeds: string[];
  surplusResources: Array<{
    type: string;
    quantity: number;
  }>;
}

export interface PriorityScore {
  [location: string]: {
    score: number;
    confidence: number;
    trend: "increasing" | "stable" | "decreasing";
  };
}
export type SOSReport = {
  id: string;
  latitude: number;
  longitude: number;
  created_at: string;
  status?: "pending" | "dispatched" | "resolved";
  personnel?: string | null;
  severity?: "critical" | "urgent" | "moderate";
};
