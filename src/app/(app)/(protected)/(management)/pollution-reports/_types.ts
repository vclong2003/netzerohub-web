export enum EPollutionReportStatus {
  Pending = "PENDING",
  Acknowledged = "ACKNOWLEDGED",
  Processed = "PROCESSED",
  Resolved = "RESOLVED",
  Rejected = "REJECTED",
}

export enum EPollutionType {
  Litter = "LITTER",
  Land = "LAND",
  Water = "WATER",
  Air = "AIR",
  Noise = "NOISE",
}

export interface IPollutionReportItem {
  id: number;
  title: string;
  description: string;
  type: EPollutionType;
  status: EPollutionReportStatus;
  imageUrl?: string;
  address?: string;
  createdAt: string;
}
