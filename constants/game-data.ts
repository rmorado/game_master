// constants/game-data.ts
import { Level } from '../types/game';

export const LEVELS: Level[] = [
    { id: 1, name: "Laranja",   goal: 3000000,    bagSize: 5000000,   bagInterval: 45, suspRate: 0.2 },
    { id: 2, name: "Gerente",   goal: 100000000,  bagSize: 15000000,  bagInterval: 40, suspRate: 0.3 },
    { id: 3, name: "Doleiro",   goal: 200000000,  bagSize: 50000000,  bagInterval: 30, suspRate: 0.4 },
    { id: 4, name: "O Mestre",  goal: null,       bagSize: 100000000, bagInterval: 20, suspRate: 0.5 },
];
