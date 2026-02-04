// constants/game-data.ts

export const LEVELS = [
    { id: 1, name: "Laranja", goal: 500000, bagSize: 500000, bagInterval: 45, maxBatch: 10, suspRate: 0.2 },
    { id: 2, name: "Gerente", goal: 5000000, bagSize: 1500000, bagInterval: 40, maxBatch: 50, suspRate: 0.3 },
    { id: 3, name: "Doleiro", goal: 20000000, bagSize: 5000000, bagInterval: 30, maxBatch: 100, suspRate: 0.4 },
    { id: 4, name: "O Mestre", goal: 999999999, bagSize: 10000000, bagInterval: 20, maxBatch: 100, suspRate: 0.5 }
];

export const TUTORIAL_STEPS = [
    { id: 0, text: "BEM-VINDO. O PCC confia em você para lavar o dinheiro. Não nos decepcione.", target: null, screen: 'bank' },
    { id: 1, text: "Este é o seu dinheiro SUJO. Você precisa transformá-lo em dinheiro LIMPO.", target: 'dirty_display', screen: 'bank' },
    { id: 2, text: "Para isso, você precisa de contas laranjas (CPFs). Vá ao app ZEP falar com o Hacker.", target: 'nav_zep', screen: 'bank' },
    { id: 3, text: "Este é o Hacker. Ele fornece os dados que precisamos. Toque nele.", target: 'contact_hacker', screen: 'zep' },
    { id: 4, text: "Compre 10 CPFs usando o dinheiro sujo. É um investimento necessário.", target: 'btn_buy_10', screen: 'chat' },
    { id: 5, text: "Ótimo. Agora volte ao Banco para usar esses CPFs.", target: 'btn_back', screen: 'chat' },
    { id: 6, text: "Use o botão CRIAR EMPRÉSTIMO para simular dívidas e lavar o dinheiro.", target: 'btn_loan', screen: 'bank' },
    { id: 7, text: "Veja! O dinheiro sujo diminuiu e o limpo aumentou. Mas CUIDADO com a Suspeita (PF).", target: 'clean_display', screen: 'bank' },
];

export const STORY = [
    { 
        id: "meet_hacker", 
        trigger: (g: any) => g.day > 1, 
        contact: "hacker", name: "H4CK3R", avatar: "https://placehold.co/100/444/FFF?text=H4",
        intro: "Pacotes de CPFs disponíveis.",
        unlock: true
    },
    { 
        id: "meet_lawyer", 
        trigger: (g: any) => g.suspicion > 15, 
        contact: "lawyer", name: "Dr. Saul", avatar: "https://placehold.co/100/444/FFF?text=LW",
        intro: "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
        unlock: true
    },
    { 
        id: "meet_judge", 
        trigger: (g: any) => false, // Unlocked via Lawyer
        contact: "judge", name: "Dr. Gilmar", avatar: "https://placehold.co/100/444/FFF?text=JG",
        intro: "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
        unlock: false
    },
    { 
        id: "meet_deputy", 
        trigger: (g: any) => false, // Unlocked via Lawyer 
        contact: "deputy", name: "Dep. Motta", avatar: "https://placehold.co/100/444/FFF?text=DM",
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        unlock: false
    }
];
