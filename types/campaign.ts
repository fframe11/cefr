export type CampaignType =
  | 'RANKED'
  | 'CHALLENGE'
  | 'EVENT'
  | 'REWARD'
  | 'ANNOUNCEMENT'
  | 'FEATURE';

export type CampaignStatus = 'ACTIVE' | 'UPCOMING' | 'EXPIRED' | 'DRAFT';

export type CampaignPriority = 'HIGH' | 'NORMAL' | 'LOW';

export interface CampaignVisualTheme {
  primaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  badgeBg: string;
  badgeText: string;
  borderAccent: string;
}

export interface Campaign {
  id: string;
  campaign_type: CampaignType;
  titleEn: string;
  titleTh: string;
  subtitleEn?: string;
  subtitleTh?: string;
  descriptionEn: string;
  descriptionTh: string;
  image: string;
  imageAltEn: string;
  imageAltTh: string;
  badgeEn?: string;
  badgeTh?: string;
  rewardEn?: string;
  rewardTh?: string;
  start_at: string;
  end_at: string;
  status: CampaignStatus;
  priority: CampaignPriority;
  display_order: number;
  cta_labelEn: string;
  cta_labelTh: string;
  target_route: string;
  show_when_upcoming?: boolean;
  theme?: Partial<CampaignVisualTheme>;
  is_external_shareable?: boolean;
  public_slug?: string;
}

export interface CampaignFilterOptions {
  now?: Date;
  includeUpcoming?: boolean;
  type?: CampaignType;
}
