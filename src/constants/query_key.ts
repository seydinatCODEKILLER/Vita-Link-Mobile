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
  activeEngagement: ["alerts", "engagement"],

  // Donations
  myDonations: ["donations", "me"],
  structureDonations: ["donations", "structure"],
  donation: (id: string) => ["donations", id],

  // 🆕 Donation Days (Journées de don)
  donationDays: ["donation-days"],
  myStructureDays: (filters?: object) => [
    "donation-days",
    "my-structure",
    filters,
  ],
  publishedDays: (filters?: object) => ["donation-days", "published", filters],
  donationDay: (id: string) => ["donation-days", id],
  dayRegistrations: (id: string) => ["donation-days", id, "registrations"],
  myRegistrations: (filters?: object) => [
    "donation-days",
    "my-registrations",
    filters,
  ],

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
  bloodStocks: ["blood-stocks", "me"],

  // Health Structures
  myStructure: ["health-structures", "me"],
  myStructureStaff: ["health-structures", "me", "staff"],
  myStructureStats: ["health-structures", "me", "stats"],
  structureStats: ["structure", "stats"],

  // 🆕 Dashboards (CNTS & Hôpital)
  cntsDashboard: (limit?: number) => ["dashboard", "cnts", limit],
  hospitalDashboard: (limit?: number) => ["dashboard", "hospital", limit],

  // 🆕 Blood Requests (Demandes de sang hôpitaux)
  bloodRequests: (filters?: object) => ["blood-requests", filters],
  bloodRequest: (id: string) => ["blood-requests", id],

  // Notifications
  myNotifications: ["notifications", "me"],
} as const;
