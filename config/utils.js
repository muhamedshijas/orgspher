export const VALID_ZONES = ["North", "South", "East", "West", "Central"];
export const VALID_MEMBERSHIPS = ["Platinum", "Gold", "Silver", "Bronze"];
export const MEMBERSHIP_UPGRADE_FEES = {
  Bronze: { next: "Silver", amount: 200 },
  Silver: { next: "Gold", amount: 300 },
  Gold: { next: "Platinum", amount: 500 },
};
