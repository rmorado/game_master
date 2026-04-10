// constants/game-data.ts
import { Level } from '../types/game';

export const MS_PER_DAY = 2_000;              // real milliseconds per game day
export const CPF_COST = 5_000;                 // dirty money per CPF purchased or used in a loan
export const BAG_DIRTY_THRESHOLD = 4_000_000;  // PCC sends next bag when dirty ≤ this
export const SUSP_RATE  = 0.05;                // fixed suspicion rate — does NOT vary by level
export const SUSP_CURVE = 0.2;                 // superlinear exponent: large batches cost more per CPF
//   formula: cpfCount^(1+SUSP_CURVE) * SUSP_RATE / 100^SUSP_CURVE
//   100 CPFs → 5 susp · 500 CPFs → 35 susp · 1000 CPFs → 79 susp (at any level)

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
    { cpfCount: 100,  durationMs: 5_000 },
    { cpfCount: 500,  durationMs: 15_000 },
    { cpfCount: 1000, durationMs: 25_000 },
] as const;

export const AUCTION_DURATIONS = [
    { label: 'curto',  days: 5, minPct: 0.50, maxPct: 0.70 },
    { label: 'médio',  days: 10, minPct: 0.60, maxPct: 0.80 },
    { label: 'longo',  days: 20, minPct: 0.70, maxPct: 0.90 },
] as const;

export const LEVELS: Level[] = [
    { id: 1, name: "Laranja",   goal:   20_000_000,  bagSize:    20_000_000 },
    { id: 2, name: "Gerente",   goal:   50_000_000,  bagSize:    50_000_000 },
    { id: 3, name: "Doleiro",   goal:  500_000_000,  bagSize:   150_000_000 },
    { id: 4, name: "O Mestre",  goal: null,          bagSize: 1_000_000_000 },
];
