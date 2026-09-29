import { Campaign, CampaignFilterOptions, CampaignPriority, CampaignStatus } from '../types/campaign';
import campaignData from '../data/campaign-registry.json';

const PRIORITY_WEIGHTS: Record<CampaignPriority, number> = {
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

/**
 * Returns all raw campaigns from the local registry.
 */
export function getAllCampaigns(): Campaign[] {
  return (campaignData as Campaign[]) || [];
}

/**
 * Checks whether a campaign is currently active based on its time window.
 */
export function isCampaignActive(campaign: Campaign, now: Date = new Date()): boolean {
  if (campaign.status === 'DRAFT' || campaign.status === 'EXPIRED') {
    return false;
  }
  const startTime = new Date(campaign.start_at).getTime();
  const endTime = new Date(campaign.end_at).getTime();
  const currentTime = now.getTime();

  return currentTime >= startTime && currentTime <= endTime;
}

/**
 * Checks whether a campaign is scheduled for the future and marked visible.
 */
export function isCampaignUpcoming(campaign: Campaign, now: Date = new Date()): boolean {
  if (campaign.status === 'DRAFT' || campaign.status === 'EXPIRED') {
    return false;
  }
  if (!campaign.show_when_upcoming) {
    return false;
  }
  const startTime = new Date(campaign.start_at).getTime();
  const currentTime = now.getTime();

  return currentTime < startTime;
}

/**
 * Evaluates the runtime time-aware status of a campaign.
 */
export function getRuntimeCampaignStatus(
  campaign: Campaign,
  now: Date = new Date()
): 'ACTIVE' | 'UPCOMING' | 'EXPIRED' {
  const currentTime = now.getTime();
  const startTime = new Date(campaign.start_at).getTime();
  const endTime = new Date(campaign.end_at).getTime();

  if (currentTime > endTime || campaign.status === 'EXPIRED') {
    return 'EXPIRED';
  }
  if (currentTime < startTime) {
    return 'UPCOMING';
  }
  return 'ACTIVE';
}

/**
 * Filters and sorts campaigns for banner presentation.
 * - Filters out expired campaigns
 * - Keeps active campaigns
 * - Conditionally includes visible upcoming campaigns
 * - Sorts by Priority (HIGH > NORMAL > LOW), then display_order ascending
 */
export function filterAndSortCampaigns(
  campaigns: Campaign[],
  options: CampaignFilterOptions = {}
): Campaign[] {
  const now = options.now || new Date();
  const includeUpcoming = options.includeUpcoming !== false;

  const filtered = campaigns.filter((camp) => {
    // 1. Explicit type filter
    if (options.type && camp.campaign_type !== options.type) {
      return false;
    }

    // 2. Drafts are never displayed
    if (camp.status === 'DRAFT') {
      return false;
    }

    // 3. Time awareness
    if (isCampaignActive(camp, now)) {
      return true;
    }
    if (includeUpcoming && isCampaignUpcoming(camp, now)) {
      return true;
    }
    return false;
  });

  return filtered.sort((a, b) => {
    // Priority: HIGH (3) > NORMAL (2) > LOW (1)
    const priorityDiff =
      (PRIORITY_WEIGHTS[b.priority] || 1) - (PRIORITY_WEIGHTS[a.priority] || 1);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    // Display order: lower numbers first
    const orderDiff = (a.display_order || 999) - (b.display_order || 999);
    if (orderDiff !== 0) {
      return orderDiff;
    }

    // Tie-break: start_at descending
    return new Date(b.start_at).getTime() - new Date(a.start_at).getTime();
  });
}

/**
 * Retrieves the currently active and visible campaigns for dashboard display.
 */
export function getActiveCampaigns(options: CampaignFilterOptions = {}): Campaign[] {
  const all = getAllCampaigns();
  return filterAndSortCampaigns(all, options);
}
