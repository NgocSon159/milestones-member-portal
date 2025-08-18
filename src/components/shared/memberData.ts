import { useEarnMiles } from "../EarnMilesContext";

// Mock voucher data to calculate total miles used - reduced to be less than total earned (22,500 miles)
const mockVouchers = [
  { originalMiles: 5000, status: 'active' },
  { originalMiles: 8000, status: 'active' },
  { originalMiles: 3000, status: 'used' },
  { originalMiles: 4000, status: 'expired' },
  { originalMiles: 2500, status: 'active' }
];

// Tier calculation based on flight miles
const calculateTierFromMiles = (totalMiles: number) => {
  if (totalMiles >= 75000) {
    return {
      currentTier: "Platinum",
      nextTier: "Diamond", // Hypothetical next tier
      nextTierRequired: 150000,
      tierMilestones: { silver: 0, gold: 25000, platinum: 75000 }
    };
  } else if (totalMiles >= 25000) {
    return {
      currentTier: "Gold",
      nextTier: "Platinum",
      nextTierRequired: 75000,
      tierMilestones: { silver: 0, gold: 25000, platinum: 75000 }
    };
  } else {
    return {
      currentTier: "Silver",
      nextTier: "Gold",
      nextTierRequired: 25000,
      tierMilestones: { silver: 0, gold: 25000, platinum: 75000 }
    };
  }
};

// Shared member data calculation function
export const getMemberData = (requests: any[]) => {
  const approvedRequests = requests.filter(request => request.status === 'approved');

  // Calculate total qualifying miles (for tier calculation)
  const totalQualifyingMiles = approvedRequests
    .reduce((total, request) => total + request.calculatedMiles, 0);

  // Calculate total bonus miles (for redemption)
  const totalBonusMiles = approvedRequests
    .reduce((total, request) => total + (request.bonusMiles || request.calculatedMiles), 0);

  // Calculate total miles redeemed from vouchers (22,500 miles)
  const totalMilesRedeemed = mockVouchers.reduce((sum, voucher) => sum + voucher.originalMiles, 0);

  // Calculate current available bonus miles (bonus miles - redeemed)
  const currentAvailableMiles = totalBonusMiles - totalMilesRedeemed;

  // Tier calculation based on qualifying miles (not bonus miles)
  const tierInfo = calculateTierFromMiles(totalQualifyingMiles);

  return {
    // Total qualifying miles from completed flights (used for tier calculation)
    totalMilesEarned: totalQualifyingMiles,
    totalQualifyingMiles: totalQualifyingMiles,
    // Total bonus miles from completed flights (used for redemption)
    totalBonusMiles: totalBonusMiles,
    // Total miles redeemed from vouchers
    totalMilesRedeemed: totalMilesRedeemed,
    // Current available bonus miles (after redemptions)
    currentAvailableMiles: Math.max(0, currentAvailableMiles),
    // Miles expiring by end of current year (from available bonus miles)
    milesExpiringEndOfYear: 4250,
    expiringDate: "Dec 31, 2024",
    // Current tier based on qualifying miles
    currentTier: tierInfo.currentTier,
    nextTier: tierInfo.nextTier,
    nextTierRequired: tierInfo.nextTierRequired,
    // Miles needed to reach next tier (based on qualifying miles)
    milesToNextTier: Math.max(0, tierInfo.nextTierRequired - totalQualifyingMiles),
    // Progress calculation based on qualifying miles
    progressPercentage: (totalQualifyingMiles / tierInfo.nextTierRequired) * 100,
    // Tier milestones for visualization
    tierMilestones: tierInfo.tierMilestones,
    // Total completed flights count
    completedFlightsCount: approvedRequests.length
  };
};

// Export individual values for components that need them (updated to match new calculation)
export const memberDataConstants = {
  milesExpiringEndOfYear: 4250,
  expiringDate: "Dec 31, 2024"
};