// Shared member data calculation function
export const getMemberData = (requests: any[], memberProfile: any, dashboardData: any) => {
  const approvedRequests = requests.filter(request => request.status === 'approved');

  // Calculate total qualifying miles (for tier calculation)
  const totalQualifyingMiles = memberProfile?.totalQuantifyingMiles ?? 0;

  // Calculate total bonus miles (for redemption)
  const totalBonusMiles = memberProfile?.totalBonusMiles ?? 0;

  // Calculate total miles redeemed from vouchers (22,500 miles)
  const totalMilesRedeemed = dashboardData?.totalRedeemed ?? 0;

  // Calculate current available bonus miles (bonus miles - redeemed)
  const currentAvailableMiles = totalBonusMiles - totalMilesRedeemed;

  // Tier calculation based on qualifying miles (not bonus miles)
  const currentTierMembership = memberProfile?.memberships?.[0];
  const currentTier = currentTierMembership?.name || "Silver";
  const nextTierRequired = currentTierMembership ? (currentTierMembership.milesRequired ?? 0) * 2 : 25000; // Assuming next tier requires double the current or 25000 for Silver
  const nextTier = currentTier === "Silver" ? "Gold" : currentTier === "Gold" ? "Platinum" : "Diamond";

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
    milesExpiringEndOfYear: 4250, // Keep as a placeholder for now
    expiringDate: "Dec 31, 2024", // Keep as a placeholder for now
    // Current tier based on qualifying miles
    currentTier: currentTier,
    nextTier: nextTier,
    nextTierRequired: nextTierRequired,
    // Miles needed to reach next tier (based on qualifying miles)
    milesToNextTier: Math.max(0, nextTierRequired - totalQualifyingMiles),
    // Progress calculation based on qualifying miles
    progressPercentage: (totalQualifyingMiles / nextTierRequired) * 100,
    // Tier milestones for visualization
    tierMilestones: { silver: 0, gold: 25000, platinum: 75000 }, // Keep as a placeholder for now
    // Total completed flights count
    completedFlightsCount: approvedRequests.length
  };
};

// Export individual values for components that need them (updated to match new calculation)
export const memberDataConstants = {
  milesExpiringEndOfYear: 4250,
  expiringDate: "Dec 31, 2024"
};