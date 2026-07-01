// CIE Search Module - query selection per search mode and business line.
// The module knows what to search for; transport (Serper HTTP call) stays
// in the caller (Lead Hunter route) and will move here in CIE V2.

import type { BusinessLine, SearchMode } from "../types";

const EXCLUDE_JUNK = '-jobs -career -hiring -recruitment -driver -chauffeur-job -directory -"top 10" -"best 10" -review -reviews -wikipedia';

const COMPANY_DISCOVERY: Record<BusinessLine, string[]> = {
  yacht_sale: [
    `"yacht broker" "superyacht" "brokerage" "Monaco" ${EXCLUDE_JUNK}`,
    `"yacht broker" "sales broker" "Antibes" OR "Monaco" ${EXCLUDE_JUNK}`,
    `"superyacht broker" "for sale" "broker" ${EXCLUDE_JUNK}`,
    `"family office" "yacht acquisition" "advisor" ${EXCLUDE_JUNK}`
  ],
  yacht_charter: [
    `"yacht charter broker" "Mediterranean" "client" ${EXCLUDE_JUNK}`,
    `"luxury travel advisor" "yacht charter" "client" ${EXCLUDE_JUNK}`,
    `"concierge" "yacht charter" "Monaco" "client" ${EXCLUDE_JUNK}`,
    `"private client" "yacht charter" "Mediterranean" ${EXCLUDE_JUNK}`
  ],
  car_rental: [
    `"looking for" "luxury car rental" "Monaco" ${EXCLUDE_JUNK}`,
    `"need" "luxury car" "Cannes" "client" ${EXCLUDE_JUNK}`,
    `"VIP transfer" "client" "Nice airport" ${EXCLUDE_JUNK}`,
    `"wedding planner" "luxury car" "client" "Monaco" ${EXCLUDE_JUNK}`
  ],
  mixed: [
    `"looking to buy" "yacht" "broker" ${EXCLUDE_JUNK}`,
    `"looking to charter" "yacht" "Mediterranean" ${EXCLUDE_JUNK}`,
    `"looking for" "luxury car rental" "Monaco" ${EXCLUDE_JUNK}`,
    `"family office" "yacht acquisition" ${EXCLUDE_JUNK}`
  ]
};

export const DEFAULT_QUERIES_BY_MODE: Record<SearchMode, Record<BusinessLine, string[]>> = {
  company_discovery: COMPANY_DISCOVERY,
  demand_discovery: {
    yacht_sale: [
      `"looking to buy" "yacht" "broker" ${EXCLUDE_JUNK}`,
      `"want to buy" "motor yacht" "broker" ${EXCLUDE_JUNK}`,
      `"seeking" "superyacht" "acquisition" ${EXCLUDE_JUNK}`,
      `"family office" "yacht acquisition" "buy" ${EXCLUDE_JUNK}`,
      `"in the market for" "yacht" "purchase" ${EXCLUDE_JUNK}`
    ],
    yacht_charter: [
      `"looking to charter" "yacht" "Mediterranean" ${EXCLUDE_JUNK}`,
      `"need" "yacht charter" "Monaco" ${EXCLUDE_JUNK}`,
      `"looking for" "yacht charter" "Cannes" ${EXCLUDE_JUNK}`,
      `"charter request" "yacht" "Mediterranean" ${EXCLUDE_JUNK}`,
      `"private client" "yacht charter" "summer" ${EXCLUDE_JUNK}`
    ],
    car_rental: [
      `"looking for" "luxury car rental" "Monaco" ${EXCLUDE_JUNK}`,
      `"need" "VIP transfer" "Nice airport" ${EXCLUDE_JUNK}`,
      `"looking for" "Rolls Royce" "wedding" ${EXCLUDE_JUNK}`,
      `"need" "luxury car" "Cannes" "client" ${EXCLUDE_JUNK}`,
      `"private client" "airport transfer" "Monaco" ${EXCLUDE_JUNK}`
    ],
    mixed: [
      `"looking to buy" "yacht" "broker" ${EXCLUDE_JUNK}`,
      `"looking to charter" "yacht" "Mediterranean" ${EXCLUDE_JUNK}`,
      `"looking for" "luxury car rental" "Monaco" ${EXCLUDE_JUNK}`,
      `"need" "VIP transfer" "Nice airport" ${EXCLUDE_JUNK}`
    ]
  },
  partner_discovery: {
    yacht_sale: [
      `"yacht broker" "superyacht sales" "Monaco" ${EXCLUDE_JUNK}`,
      `"superyacht broker" "sales broker" "Antibes" ${EXCLUDE_JUNK}`,
      `"yacht brokerage" "sales broker" "Palma" ${EXCLUDE_JUNK}`,
      `"family office" "yacht acquisition" "advisor" ${EXCLUDE_JUNK}`
    ],
    yacht_charter: [
      `"yacht charter broker" "Mediterranean" ${EXCLUDE_JUNK}`,
      `"luxury travel advisor" "yacht charter" "client" ${EXCLUDE_JUNK}`,
      `"concierge" "yacht charter" "client" "Monaco" ${EXCLUDE_JUNK}`,
      `"private aviation" "yacht charter" "client" ${EXCLUDE_JUNK}`
    ],
    car_rental: [
      `"wedding planner" "luxury car" "client" "Monaco" ${EXCLUDE_JUNK}`,
      `"concierge" "luxury car rental" "client" ${EXCLUDE_JUNK}`,
      `"event planner" "VIP transfer" "client" ${EXCLUDE_JUNK}`
    ],
    mixed: [
      `"yacht broker" "client" "Monaco" ${EXCLUDE_JUNK}`,
      `"luxury travel advisor" "yacht charter" "client" ${EXCLUDE_JUNK}`,
      `"concierge" "luxury car rental" "client" ${EXCLUDE_JUNK}`
    ]
  },
  market_intelligence: {
    yacht_sale: [
      `"superyacht" "new listing" "broker" 2026 ${EXCLUDE_JUNK}`,
      `"yacht" "off-market" "sale" "broker" 2026 ${EXCLUDE_JUNK}`,
      `"yacht broker" "new central agency" 2026 ${EXCLUDE_JUNK}`
    ],
    yacht_charter: [
      `"yacht charter" "newly available" "Mediterranean" 2026 ${EXCLUDE_JUNK}`,
      `"charter broker" "new charter yacht" 2026 ${EXCLUDE_JUNK}`,
      `"yacht charter" "summer 2026" "client demand" ${EXCLUDE_JUNK}`
    ],
    car_rental: [
      `"luxury car rental" "client demand" "Monaco" 2026 ${EXCLUDE_JUNK}`,
      `"VIP transfer" "Monaco" "client" 2026 ${EXCLUDE_JUNK}`,
      `"wedding transport" "luxury car" "Cannes" 2026 ${EXCLUDE_JUNK}`
    ],
    mixed: [
      `"yacht broker" "client" 2026 ${EXCLUDE_JUNK}`,
      `"yacht charter" "client demand" 2026 ${EXCLUDE_JUNK}`,
      `"luxury car rental" "client demand" 2026 ${EXCLUDE_JUNK}`
    ]
  }
};

// Returns the query list to use for a given mode + business line.
// Caller may override with custom queries; this returns the CIE defaults otherwise.
export function selectDefaultQueries(mode: SearchMode, line: BusinessLine): string[] {
  return DEFAULT_QUERIES_BY_MODE[mode]?.[line] ?? COMPANY_DISCOVERY[line];
}