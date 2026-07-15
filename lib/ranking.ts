/**
 * EVIQ AI — Charger Ranking Engine
 *
 * Produces a composite score (0–100) for each station using 7 weighted signals:
 *   1. Reliability        (25 %) – uptime / telemetry quality
 *   2. Charging speed     (20 %) – power output matched to vehicle capability
 *   3. Availability       (15 %) – open ports ratio
 *   4. Queue / wait time  (15 %) – predicted congestion
 *   5. Route proximity    (10 %) – distance from origin
 *   6. Connector match    (10 %) – exact connector compatibility
 *   7. Charging cost      ( 5 %) – normalized tariff (lower = better)
 *
 * The top 10 by composite score become `recommendedChargers`.
 */

export const TOP_N = 10;

export interface StationInput {
  id: string;
  reliabilityScore: number;        // 0–100
  powerKw: number;                 // station max power
  vehicleMaxKw: number;            // vehicle max accept speed
  portsAvailable: number;
  portsTotal: number;
  predictedQueueMinutes: number;
  distanceMiles: number;           // haversine to station from origin
  connectorType: string;           // station connector
  vehicleConnector: string;        // vehicle connector
  pricePerKwh: number;
}

export interface RankingResult {
  id: string;
  rank: number;                    // 1-based
  compositeScore: number;          // 0–100
  selectionReason: string;         // one-liner for the card
  breakdown: {
    reliability: number;
    speed: number;
    availability: number;
    queue: number;
    proximity: number;
    connector: number;
    cost: number;
  };
}

// ─── Connector compatibility map ─────────────────────────────────────────────
const CONNECTOR_COMPAT: Record<string, string[]> = {
  NACS:    ["NACS", "CCS1"],
  CCS1:    ["CCS1", "NACS"],
  CCS2:    ["CCS2"],
  CHAdeMO: ["CHAdeMO"],
  Type2:   ["Type2", "CCS2"],
};

function connectorScore(vehicleConnector: string, stationConnector: string): number {
  const compat = CONNECTOR_COMPAT[vehicleConnector] ?? [vehicleConnector];
  if (compat.includes(stationConnector)) return 100;
  if (stationConnector === "Unknown" || stationConnector === "") return 40;
  return 10; // incompatible but still counted minimally
}

function costScore(pricePerKwh: number, minPrice: number, maxPrice: number): number {
  if (maxPrice === minPrice) return 80;
  return Math.round(100 - ((pricePerKwh - minPrice) / (maxPrice - minPrice)) * 100);
}

function queueScore(predictedMinutes: number): number {
  return Math.max(0, Math.round(100 - (predictedMinutes / 30) * 100));
}

function proximityScore(distanceMiles: number, maxDistance: number): number {
  if (maxDistance === 0) return 80;
  return Math.max(0, Math.round(100 - (distanceMiles / maxDistance) * 100));
}

function speedScore(powerKw: number, vehicleMaxKw: number): number {
  const effectiveKw = Math.min(powerKw, vehicleMaxKw);
  return Math.min(100, Math.round((effectiveKw / Math.max(vehicleMaxKw, 1)) * 100));
}

function availabilityScore(portsAvailable: number, portsTotal: number): number {
  if (portsTotal === 0) return 50;
  return Math.round((portsAvailable / portsTotal) * 100);
}

const W = {
  reliability:  0.25,
  speed:        0.20,
  availability: 0.15,
  queue:        0.15,
  proximity:    0.10,
  connector:    0.10,
  cost:         0.05,
} as const;

function buildReason(
  rank: number,
  breakdown: RankingResult["breakdown"],
  connectorMatch: boolean,
  pricePerKwh: number,
  predictedQueue: number,
  powerKw: number,
): string {
  if (rank === 1) {
    if (breakdown.speed >= 90 && breakdown.queue >= 80)
      return `Fastest charging at ${powerKw} kW with lowest predicted wait (${predictedQueue} min).`;
    if (breakdown.reliability >= 95)
      return `Highest reliability score with excellent overall balance.`;
    return `Best composite score across all 7 ranking factors.`;
  }
  if (!connectorMatch) return `Fallback option — connector may need an adapter.`;
  if (breakdown.cost >= 90) return `Best price at $${pricePerKwh.toFixed(2)}/kWh.`;
  if (breakdown.queue >= 90) return `Minimal wait — ${predictedQueue} min predicted queue.`;
  if (breakdown.speed >= 85) return `High-speed charging at ${powerKw} kW.`;
  if (breakdown.reliability >= 95) return `Top-tier reliability (${breakdown.reliability}% uptime).`;
  if (breakdown.availability >= 80) return `Multiple open ports available right now.`;
  return `Strong balance of speed, price, and availability.`;
}

export function rankStations(stations: StationInput[]): RankingResult[] {
  if (stations.length === 0) return [];

  const minPrice = Math.min(...stations.map((s) => s.pricePerKwh));
  const maxPrice = Math.max(...stations.map((s) => s.pricePerKwh));
  const maxDist  = Math.max(...stations.map((s) => s.distanceMiles));

  const scored = stations.map((s) => {
    const rel   = s.reliabilityScore;
    const spd   = speedScore(s.powerKw, s.vehicleMaxKw);
    const avail = availabilityScore(s.portsAvailable, s.portsTotal);
    const queue = queueScore(s.predictedQueueMinutes);
    const prox  = proximityScore(s.distanceMiles, maxDist);
    const conn  = connectorScore(s.vehicleConnector, s.connectorType);
    const cost  = costScore(s.pricePerKwh, minPrice, maxPrice);

    const composite = Math.round(
      rel   * W.reliability  +
      spd   * W.speed        +
      avail * W.availability +
      queue * W.queue        +
      prox  * W.proximity    +
      conn  * W.connector    +
      cost  * W.cost
    );

    return {
      id: s.id,
      compositeScore: composite,
      connectorMatch: conn === 100,
      pricePerKwh: s.pricePerKwh,
      predictedQueue: s.predictedQueueMinutes,
      powerKw: s.powerKw,
      breakdown: { reliability: rel, speed: spd, availability: avail, queue, proximity: prox, connector: conn, cost },
    };
  });

  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  return scored.slice(0, TOP_N).map((s, idx) => ({
    id: s.id,
    rank: idx + 1,
    compositeScore: s.compositeScore,
    selectionReason: buildReason(
      idx + 1,
      s.breakdown,
      s.connectorMatch,
      s.pricePerKwh,
      s.predictedQueue,
      s.powerKw,
    ),
    breakdown: s.breakdown,
  }));
}
