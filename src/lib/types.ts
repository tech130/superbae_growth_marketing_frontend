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

// ===================================================================
// Payout Management (Part 1, full spec)
// ===================================================================
export interface PayoutManagement {
  id: string;
  affiliateId: string;
  affiliate: string;
  partnerType: "Affiliate" | "Creator" | "Brand";
  partnerCategory?: string;
  amount: number;
  method: string;
  status: "Pending" | "Approved" | "Processing" | "Completed" | "Failed";
  commissionIds: string[];
  initiatedOn: string;
  completedOn?: string;
  failureReason?: string;
  scheduledDate?: string;
  approvedOn?: string;
  approvedBy?: string;
  referenceId?: string;
  taxDeducted?: number;
  netAmount?: number;
  invoiceNumber?: string;
  invoiceGeneratedAt?: string;
}

// ===================================================================
// Fraud Detection (Part 2, full spec)
// ===================================================================
export interface FraudCase {
  id: string;
  sourceType: "Referral" | "Affiliate" | "Creator" | "Brand";
  subjectId: string;
  subjectLabel: string;
  relatedSubjectId?: string;
  relatedSubjectLabel?: string;
  fraudType: "Device" | "IP" | "Account" | "SelfReferral" | "AbnormalConversion" | "RewardAbuse" | "AffiliateAbuse" | "Generic";
  deviceId?: string;
  ip?: string;
  linkedIds?: string[];
  relatedConversionId?: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  holdType?: "Reward" | "Commission";
  holdAmount?: number;
  status: "Flagged" | "Investigating" | "On Hold" | "Confirmed Fraud" | "Legitimate";
  createdAt: string;
  resolvedAt?: string;
  notes: { id: string; text: string; author: string; at: string }[];
}

// ===================================================================
// Landing Pages & Deep Links
// ===================================================================
export interface LandingPage {
  id: string;
  name: string;
  templateId?: string;
  sourceType: "Campaign" | "Referral" | "Affiliate" | "Creator" | "Manual";
  linkedRefId?: string;
  linkedRefLabel?: string;
  headline?: string;
  body?: string;
  cta?: string;
  deepLinkId?: string;
  trackingParams: { source: string; medium: string; code?: string };
  status: "Draft" | "Active" | "Paused";
  visits: number;
  installs: number;
  signups: number;
  createdAt: string;
}
export interface LandingPageTemplate {
  id: string;
  name: string;
  bestFor: string;
  sections: string[];
  status: "Active" | "Archived";
}
export interface DeepLink {
  id: string;
  scheme: string;
  opensInApp: string;
  sourceType: string;
  deferred: boolean;
  targetRoute: string;
  fallbackUrl?: string;
  status: "Active" | "Disabled";
  clicks: number;
  opens: number;
  createdAt: string;
}
export interface QRCodeRow {
  id: string;
  linkedType: "LandingPage" | "DeepLink";
  linkedId: string;
  linkedLabel: string;
  scans: number;
  installs: number;
  status: "Active" | "Disabled";
  createdAt: string;
}

// ===================================================================
// Loyalty Program
// ===================================================================
export interface LoyaltyTier {
  id: string;
  name: string;
  order: number;
  thresholdPoints: number;
  status: "Active" | "Inactive";
}
export interface LoyaltyRule {
  id: string;
  name: string;
  trigger: string;
  rewardType: "points" | "wallet_credit";
  points?: number;
  walletAmount?: number;
  limit: string;
  status: "Active" | "Inactive";
}
export interface LoyaltyReward {
  id: string;
  name: string;
  type: "wallet_credit" | "premium_days" | "coupon";
  costPoints: number;
  minTierId: string;
  minTierName?: string;
  value?: string;
  status: "Active" | "Disabled";
}
export interface LoyaltyBenefit {
  id: string;
  name: string;
  minTierId: string;
  minTierName?: string;
  type: "discount" | "support" | "access" | "content";
  status: "Active" | "Disabled";
}
export interface UserLoyaltyRow {
  id: string;
  userEmail: string;
  userName: string;
  tierId: string;
  tierName?: string;
  nextTierName?: string;
  pointsToNextTier?: number;
  pointsBalance: number;
  pointsEarnedTotal: number;
  pointsRedeemedTotal: number;
  pointsExpired: number;
  joinedAt: string;
  lastActivityAt: string;
  status: "Active" | "Inactive";
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
