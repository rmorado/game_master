// constants/game-data.ts
import { Level } from '../types/game';

export const MS_PER_DAY = 2_000;              // real milliseconds per game day
export const CPF_COST       = 1_000;           // dirty money paid to hacker per CPF
export const CPF_LOAN_VALUE = 5_000;           // face value per CPF in a derivativo
export const BAG_DIRTY_THRESHOLD = 1_000_000;  // PCC sends next bag when dirty ≤ this
export const SUSP_RATE  = 0.02;                // fixed suspicion rate — does NOT vary by level
export const SUSP_CURVE = 0.05;                 // superlinear exponent: large batches cost more per CPF
//   formula: cpfCount^(1+SUSP_CURVE) * SUSP_RATE / 100^SUSP_CURVE
//   100 CPFs → 5 susp · 500 CPFs → 35 susp (at any level)

export const BATCH_DAYS   = 90;   // days before unpaid batch defaults
export const BATCH_PCT    = 0.7;  // debt = bag × this fraction
export const PRES_DEFAULT = 30;   // pressure spike per defaulted batch
export const PRES_CRIT    = 0.0;  // pressure/day when any batch < 30d left
export const PRES_MANY    = 0.0;  // pressure/day when > 2 open batches
export const PRES_DRAIN   = 0.1;  // pressure drain/day when no critical state
export const LAWYER_SUSP  = 10;   // suspicion removed per lawyer hire

// Game calendar — day 1 = 1 dec 2025
const GAME_EPOCH = new Date(2025, 11, 1);      // month is 0-indexed: 11 = December
const PT_MONTHS = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const EN_MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

export function gameDate(day: number, lang: 'pt' | 'en' = 'pt'): string {
    const d = new Date(GAME_EPOCH);
    d.setDate(d.getDate() + (day - 1));
    const dd = String(d.getDate()).padStart(2, '0');
    const mon = (lang === 'en' ? EN_MONTHS : PT_MONTHS)[d.getMonth()];
    return `${dd}-${mon}`;
}

export const LOAN_OPTIONS = [
    { cpfCount: 100, durationMs: 5_000 },
    { cpfCount: 500, durationMs: 15_000 },
] as const;

export const AUCTION_DURATIONS = [
    { label: 'curto',  days: 5, minPct: 0.50, maxPct: 0.70 },
    { label: 'médio',  days: 10, minPct: 0.60, maxPct: 0.80 },
    { label: 'longo',  days: 20, minPct: 0.70, maxPct: 0.90 },
] as const;

export const LEVELS: Level[] = [
    { id: 1, name: "Laranja",   goal:   15_000_000,  bagSize:    20_000_000 },
    { id: 2, name: "Gerente",   goal:   50_000_000,  bagSize:    50_000_000 },
    { id: 3, name: "Doleiro",   goal:  500_000_000,  bagSize:   150_000_000 },
    { id: 4, name: "O Mestre",  goal: null,          bagSize: 1_000_000_000 },
];
