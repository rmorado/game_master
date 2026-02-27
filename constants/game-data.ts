// constants/game-data.ts
import { TUTORIAL } from './dialogues';
import { Level } from '../types/game';

export const LEVELS: Level[] = [
    { id: 1, name: "Laranja",   goal: 300000,   bagSize: 500000,   bagInterval: 45, suspRate: 0.2 },
    { id: 2, name: "Gerente",   goal: 3000000,  bagSize: 1500000,  bagInterval: 40, suspRate: 0.3 },
    { id: 3, name: "Doleiro",   goal: 20000000, bagSize: 5000000,  bagInterval: 30, suspRate: 0.4 },
    { id: 4, name: "O Mestre",  goal: null,     bagSize: 10000000, bagInterval: 20, suspRate: 0.5 },
];

// Import tutorial steps from dialogues
export const TUTORIAL_STEPS = TUTORIAL;
