export type AffiliateTier = "Standard" | "Premium Creator" | "Brand Partner";
export type AffiliateStatus = "Pending" | "Active" | "Suspended" | "Rejected" | "Banned";

export interface SocialProfile {
  id: string;
  platform: "Instagram" | "YouTube" | "TikTok" | "Facebook" | "X" | "Other";
  handle: string;
  url: string;
  followers: number;
  verified: boolean;
  engagementRate?: number;
  lastSyncedAt: string;
}

export interface CreatorVerification {
  identityVerified: boolean;
  socialVerified: boolean;
  followerAuthenticityChecked: boolean;
  audienceRelevanceChecked: boolean;
  flaggedForReview: boolean;
  notes?: string;
}

export interface Affiliate {
  id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  website?: string;
  socials?: string[];
  category: string;
  tier: AffiliateTier;
  status: AffiliateStatus;
  referralCode?: string;
  trackingLink?: string;
  commissionType: "percentage" | "fixed";
  commissionValue: number;
  cookieWindowDays: number;
  paymentDetails?: { method: string; accountRef: string };
  taxInfo?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectedReason?: string;
  reach?: number;
  socialProfiles?: SocialProfile[];
  verification?: CreatorVerification;
  performance?: {
    totalClicks: number;
    leads: number;
    conversions: number;
    revenueGenerated: number;
    commissionEarned: number;
    commissionPaid: number;
  };
  links?: AffiliateLink[];
  campaigns?: Campaign[];
  conversions?: Conversion[];
  commissions?: Commission[];
  payouts?: Payout[];
}

export interface AffiliateLink {
  id: string;
  affiliateId: string;
  code: string;
  url: string;
  campaignId?: string;
  status: "Active" | "Disabled";
  clicks: number;
  leads: number;
  conversions: number;
  createdAt: string;
  /** Present on joined list responses (e.g. /creators/links). */
  creator?: string;
}

export interface Campaign {
  id: string;
  affiliateId: string;
  name: string;
  category: string;
  startDate: string;
  endDate?: string;
  trackingLink: string;
  budgetCap?: number;
  status: "Active" | "Paused" | "Ended";
  clicks: number;
  conversions: number;
  contentType?: "Reel" | "Video" | "Story" | "Post";
  createdAt: string;
  /** Present on joined list responses (e.g. /creators/campaigns). */
  creator?: string;
}

// ===================================================================
// Campaign Management (Part 3)
// ===================================================================

export type CampaignSourceType = "Referral" | "Affiliate" | "Influencer" | "Promo" | "Coupon";
export type CampaignRecordStatus = "Draft" | "Active" | "Paused" | "Ended";

export interface CampaignAudience {
  category?: string;
  newVsExisting?: "New Users" | "Existing Users" | "Both";
  geography?: string;
  platform?: "iOS" | "Android" | "Both";
  ageRange?: string;
}

export interface CampaignFunnel {
  impressions: number;
  clicks: number;
  installs: number;
  signups: number;
  subscriptions: number;
  revenue: number;
}

export interface CampaignRecord {
  id: string;
  name: string;
  sourceType: CampaignSourceType;
  linkedRefId?: string;
  linkedRefLabel?: string;
  category: string;
  audience: CampaignAudience;
  startDate: string;
  endDate?: string;
  landingPage?: string;
  trackingLink: string;
  budget?: number;
  spend: number;
  autoPauseOnBudgetExhausted: boolean;
  status: CampaignRecordStatus;
  funnel: CampaignFunnel;
  createdAt: string;
}

export interface Click {
  id: string;
  affiliateId: string;
  linkId: string;
  timestamp: string;
  source: string;
  device: string;
  ip: string;
  country: string;
}

export interface Lead {
  id: string;
  affiliateId: string;
  clickId?: string;
  userName: string;
  userEmail: string;
  signupDate: string;
  verified: boolean;
  stage: "Awaiting Subscription" | "Converted" | "Lost" | "Expired";
  attributionExpiresAt: string;
}

export interface Conversion {
  id: string;
  affiliateId: string;
  leadId: string;
  userName: string;
  convertedOn: string;
  subscriptionPlan: string;
  revenue: number;
  status: "Valid" | "Invalid" | "Flagged";
  commissionId?: string;
  /** Present on joined list responses (e.g. /creators/conversions). */
  creator?: string;
  commissionAmount?: number;
}

export interface Commission {
  id: string;
  affiliateId: string;
  affiliate?: string;
  creator?: string;
  conversionId: string;
  tier: AffiliateTier;
  type: "percentage" | "fixed";
  amount: number;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  calculatedOn: string;
  approvedOn?: string;
  rejectedReason?: string;
  eligibleForApproval?: boolean;
}

export interface Payout {
  id: string;
  affiliateId: string;
  affiliate?: string;
  creator?: string;
  amount: number;
  method: string;
  status: "Pending" | "Processing" | "Completed" | "Failed";
  commissionIds: string[];
  initiatedOn: string;
  completedOn?: string;
  failureReason?: string;
}

export interface FraudFlag {
  id: string;
  affiliateId: string;
  affiliate?: string;
  conversionId?: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  status: "Investigating" | "Confirmed Fraud" | "Legitimate";
  createdAt: string;
}

export interface DashboardData {
  kpis: {
    totalAffiliates: number;
    activeAffiliates: number;
    pendingApproval: number;
    totalClicks: number;
    totalConversions: number;
    totalCommissionPayable: number;
    totalCommissionPaid: number;
    overallConversionRate: number;
  };
  leaderboard: { affiliateId: string; name: string; clicks: number; conversions: number; commission: number }[];
  trends: {
    days: string[];
    newAffiliates: number[];
    clicks: number[];
    conversions: number[];
    commissionPayable: number[];
    commissionPaid: number[];
  };
}
