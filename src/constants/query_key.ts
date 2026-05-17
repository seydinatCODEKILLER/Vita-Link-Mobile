export const QUERY_KEYS = {
  // Auth
  me: ["me"],

  // Alerts
  alerts: ["alerts"],
  nearbyAlerts: ["alerts", "nearby"],
  hasActiveConfirmation: ["alerts", "has-active-confirmation"],
  myAlerts: ["alerts", "my-structure"],
  alert: (id: string) => ["alerts", id],
  alertResponses: (id: string) => ["alerts", id, "responses"],
  activeEngagement: ["alerts", "engagement"], // ✅ Ajouté ici

  // Donations
  myDonations: ["donations", "me"],
  structureDonations: ["donations", "structure"],
  donation: (id: string) => ["donations", id],

  // Jambaar
  jambaarsProfile: ["jambaar", "me"],
  jambaarssBadges: ["jambaar", "me", "badges"],
  leaderboard: ["jambaar", "leaderboard"],
  leaderboardCity: (city: string) => ["jambaar", "leaderboard", "city", city],
  leaderboardDistrict: (district: string) => [
    "jambaar",
    "leaderboard",
    "district",
    district,
  ],

  // Rewards & Coupons
  rewards: ["rewards"],
  myCoupons: ["coupons", "me"],

  // Blood Stocks
  myStocks: ["blood-stocks", "me"],

  // Health Structures
  myStructure: ["health-structures", "me"],
  myStructureStaff: ["health-structures", "me", "staff"],
  myStructureStats: ["health-structures", "me", "stats"],

  // Notifications
  myNotifications: ["notifications", "me"],
} as const;