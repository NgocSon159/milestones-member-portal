import { useEarnMiles } from "../EarnMilesContext";

// Mock voucher data to calculate total miles used (increased values for higher Miles Redeemed)
const mockVouchers = [
  { originalMiles: 15000, status: 'active' },
  { originalMiles: 18000, status: 'active' },
  { originalMiles: 12000, status: 'used' },
  { originalMiles: 8000, status: 'expired' },
  { originalMiles: 7500, status: 'active' },
  { originalMiles: 22000, status: 'used' },
  { originalMiles: 9500, status: 'used' },
  { originalMiles: 6000, status: 'expired' }
];

// Shared member data calculation function
export const getMemberData = (requests: any[]) => {
  // Calculate total miles earned from approved requests
  const totalMilesEarned = requests
    .filter(request => request.status === 'approved')
    .reduce((total, request) => total + request.calculatedMiles, 0);

  // Calculate total miles redeemed from vouchers (now much higher)
  const totalMilesRedeemed = mockVouchers.reduce((sum, voucher) => sum + voucher.originalMiles, 0);

  return {
    // Total miles earned from approved requests
    totalMilesEarned: totalMilesEarned,
    // Total miles redeemed from vouchers (now 98,000 miles)
    totalMilesRedeemed: totalMilesRedeemed,
    // Miles expiring by end of current year
    milesExpiringEndOfYear: 4250,
    expiringDate: "Dec 31, 2024",
    // Current tier based on total lifetime miles
    currentTier: "Gold",
    currentTierMiles: 48750, // Available miles after redemptions
    nextTier: "Platinum",
    nextTierRequired: 75000,
    progressPercentage: (48750 / 75000) * 100
  };
};

// Export individual values for components that need them
export const memberDataConstants = {
  milesExpiringEndOfYear: 4250,
  expiringDate: "Dec 31, 2024",
  currentTier: "Gold",
  currentTierMiles: 48750,
  nextTier: "Platinum", 
  nextTierRequired: 75000,
  progressPercentage: (48750 / 75000) * 100
};