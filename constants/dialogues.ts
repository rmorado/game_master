// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

// Tutorial messages (step-by-step guide for new players)
export const TUTORIAL = [
    {
        id: 0,
        text: "BEM-VINDO. O PCC confia em você para lavar o dinheiro. Não nos decepcione.",
        target: null,
        screen: 'bank'
    },
    {
        id: 1,
        text: "Este é o seu dinheiro SUJO. Você precisa transformá-lo em dinheiro LIMPO.",
        target: 'dirty_display',
        screen: 'bank'
    },
    {
        id: 2,
        text: "Para isso, você precisa de contas laranjas (CPFs). Vá ao app ZEP falar com o Hacker.",
        target: 'nav_zep',
        screen: 'bank'
    },
    {
        id: 3,
        text: "Este é o Hacker. Ele fornece os dados que precisamos. Toque nele.",
        target: 'contact_hacker',
        screen: 'zep'
    },
    {
        id: 4,
        text: "Compre 10 CPFs usando o dinheiro sujo. É um investimento necessário.",
        target: 'btn_buy_10',
        screen: 'chat'
    },
    {
        id: 5,
        text: "Ótimo. Agora volte ao Banco para usar esses CPFs.",
        target: 'btn_back',
        screen: 'chat'
    },
    {
        id: 6,
        text: "Use o botão CRIAR EMPRÉSTIMO para simular dívidas e lavar o dinheiro.",
        target: 'btn_loan',
        screen: 'bank'
    },
    {
        id: 7,
        text: "Veja! O dinheiro sujo diminuiu e o limpo aumentou. Mas CUIDADO com a Suspeita (PF).",
        target: 'clean_display',
        screen: 'bank'
    },
];

// UI Labels - Bank Screen
export const UI_BANK = {
    btnCreateLoan: "📄 CRIAR EMPRÉSTIMO",
    btnPayDebt: "💸 PAGAR DÍVIDA",
};

// UI Labels - Loan Modal
export const UI_LOAN_MODAL = {
    title: "SELECIONE O LOTE",
    labelIds: "IDs",
    labelDirtyCost: (amount: number) => `${amount}k Sujo`,
    btnConfirm: "LAVAR DINHEIRO",
    btnCancel: "Cancelar",
};

// UI Labels - Pay Modal
export const UI_PAY_MODAL = {
    title: "PAGAR MALOTE ANTIGO",
    labelBalance: (amount: string) => `Saldo Limpo: ${amount}`,
    btnConfirm: "CONFIRMAR PAGAMENTO",
    btnCancel: "Cancelar",
};

// Transaction messages
export const SYSTEM_MESSAGES = {
    transferring: "Transferindo...",
    done: "Feito.",
    insufficientFunds: "Saldo insuficiente.",
};

// ============================================================================
// CHARACTER DIALOGUES
// ============================================================================

export const CHARACTERS = {
    // Hacker - CPF provider
    hacker: {
        id: "hacker",
        name: "H4CK3R",
        avatar: "https://placehold.co/100/444/FFF?text=H4",

        // Story introduction
        intro: "Pacotes de CPFs disponíveis.",
        unlockTrigger: (gameState: any) => gameState.day > 1,

        // Chat dialogues
        greeting: "Tenho pacotes novos.",

        // Actions/offers (displayed as buttons)
        offers: [
            { qty: 10, cost: 50000, label: "10 CPFs (-50k)", minLevel: 0 },
            { qty: 50, cost: 250000, label: "50 CPFs (-250k)", minLevel: 1 },
            { qty: 100, cost: 500000, label: "100 CPFs (-500k)", minLevel: 2 },
        ],
    },

    // Lawyer - Fixes legal problems
    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        avatar: "https://placehold.co/100/444/FFF?text=LW",

        // Story introduction
        intro: "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
        unlockTrigger: (gameState: any) => gameState.suspicion > 15,

        // Chat dialogues
        greeting: "Como posso ajudar?",
    },

    // Judge - Unlocked via Lawyer
    judge: {
        id: "judge",
        name: "Dr. Gilmar",
        avatar: "https://placehold.co/100/444/FFF?text=JG",

        // Story introduction
        intro: "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
        unlockTrigger: (gameState: any) => false, // Manually unlocked via Lawyer

        // Chat dialogues
        greeting: "Como posso ajudar?",
    },

    // Deputy - Political corruption
    deputy: {
        id: "deputy",
        name: "Dep. Motta",
        avatar: "https://placehold.co/100/444/FFF?text=DM",

        // Story introduction
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        unlockTrigger: (gameState: any) => false, // Manually unlocked via Lawyer

        // Chat dialogues
        greeting: "Preciso de doações para a campanha.",
    },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get character by ID
export const getCharacter = (characterId: string) => {
    return CHARACTERS[characterId as keyof typeof CHARACTERS];
};

// Get all character introductions in story format
export const getStoryEvents = () => {
    return Object.values(CHARACTERS).map(char => ({
        id: `meet_${char.id}`,
        trigger: char.unlockTrigger,
        contact: char.id,
        name: char.name,
        avatar: char.avatar,
        intro: char.intro,
        unlock: char.id === 'hacker' || char.id === 'lawyer', // Auto-unlock hacker and lawyer
    }));
};
