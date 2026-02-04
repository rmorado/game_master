// constants/game-data.ts

export const LEVELS = [
    { id: 1, name: "Laranja", goal: 500000, bagSize: 500000, bagInterval: 45, maxBatch: 10, suspRate: 0.2 },
    { id: 2, name: "Gerente", goal: 5000000, bagSize: 1500000, bagInterval: 40, maxBatch: 50, suspRate: 0.3 },
    { id: 3, name: "Doleiro", goal: 20000000, bagSize: 5000000, bagInterval: 30, maxBatch: 100, suspRate: 0.4 },
    { id: 4, name: "O Mestre", goal: 999999999, bagSize: 10000000, bagInterval: 20, maxBatch: 100, suspRate: 0.5 }
];

export const STORY = [
    { 
        id: "meet_judge", 
        trigger: (g: any) => g.suspicion > 20, 
        contact: "judge", name: "Dr. Gilmar", avatar: "judge.png",
        intro: "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
        unlock: true
    },
    { 
        id: "meet_deputy", 
        trigger: (g: any) => g.totalWashed > 5000000, 
        contact: "deputy", name: "Dep. Motta", avatar: "https://placehold.co/100/444/FFF?text=DM",
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        unlock: true
    }
];
