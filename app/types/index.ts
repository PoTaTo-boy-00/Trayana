export type AlertSeverity = "red" | "orange" | "yellow" | "green";

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
  type: "food" | "medicine" | "shelter" | "equipment";
  name: string;
  quantity: number;
  unit: string;
  location: GeoLocation;
  status: "available" | "allocated" | "depleted";
  organizationId: string;
  lastUpdated: string;
  expiryDate?: string;
  conditions?: string[];
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
  type: "food" | "medicine" | "shelter" | "equipment";
  name: string;
  quantity: number;
  unit: string;
  location: GeoLocation;
  status: "requested" | "allocated" | "depleted";
  organizationId: string;
  lastUpdated: string;
  expiryDate?: string;
  conditions?: string[];
  utilizationHistory?: ResourceUtilization[];
}

export interface ResourceUtilization {
  timestamp: string;
  quantity: number;
  purpose: string;
  alertId?: string;
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
  status: "active" | "inactive";
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
  status: "available" | "deployed" | "unavailable";
  location?: GeoLocation;
  skills: string[];
  contact: {
    phone: string;
    email: string;
  };
  deploymentHistory?: {
    alertId: string;
    startTime: string;
    endTime?: string;
    location: GeoLocation;
  }[];
  timestamp: string;
}

export interface Message {
  id: string;
  senderId: string;
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
