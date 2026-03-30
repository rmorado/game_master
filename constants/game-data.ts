// constants/game-data.ts
import { Level } from '../types/game';

export const BAG_DIRTY_THRESHOLD = 4_000_000;  // PCC sends next bag when dirty ≤ this

export const LEVELS: Level[] = [
    { id: 1, name: "Laranja",   goal: 20000000,    bagSize: 20000000,    suspRate: 0.05 },
    { id: 2, name: "Gerente",   goal: 50000000,    bagSize: 50000000,    suspRate: 0.04 },
    { id: 3, name: "Doleiro",   goal: 500000000,   bagSize: 150000000,   suspRate: 0.025 },
    { id: 4, name: "O Mestre",  goal: null,         bagSize: 1000000000,  suspRate: 0.015 },
];
