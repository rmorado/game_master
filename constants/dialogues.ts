// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

import { CharacterDialogue, GameState } from '../types/game';

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
    // Drug Dealer - Sends dirty money
    drugdealer: {
        id: "drugdealer",
        name: "Patrão",
        avatar: require('../assets/images/characters/drugdealer.jpg'),

        // Story introduction
        intro: "Tô mandando o malote. Não me decepcione.",
        unlockTrigger: (gameState: any) => gameState.day >= 0, // Always available

        // Chat dialogues
        greeting: "Tem trabalho pra fazer.",
    },

    // Hacker - CPF provider
    hacker: {
        id: "hacker",
        name: "H4CK3R",
        avatar: require('../assets/images/characters/hacker.jpg'),

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

    // Lawyer - Fixes legal problems (not implemented yet)
    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        avatar: require('../assets/images/characters/drugdealer.jpg'),

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
        avatar: require('../assets/images/characters/juiz.jpg'),

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
        avatar: require('../assets/images/characters/deputado.jpg'),

        // Story introduction
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        unlockTrigger: (gameState: any) => false, // Manually unlocked via Lawyer

        // Chat dialogues
        greeting: "Preciso de doações para a campanha.",
    },
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

export const DIALOGUES: { [characterId: string]: CharacterDialogue } = {
    hacker: {
        characterId: 'hacker',

        outgoingOptions: [
            {
                id: 'buy_10_cpfs',
                text: 'Buy pack of 10 CPFs (50,000)',
                response: 'Feito. Transferindo agora.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 50000,
                    cpfs: state.cpfs + 10,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 10
                })
            },

            {
                id: 'ask_more_volume',
                text: 'I need more volume',
                condition: (state: GameState) => !state.hasUnlocked50Pack,  // Hide after unlock
                response: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 50) {
                        return 'Yes, I think I can do that. You can get 50 CPFs at a discount.';
                    }
                    return "I don't know you well enough, 10 is all you got.";
                },
                action: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 50) {
                        return { hasUnlocked50Pack: true };  // Unlock 50-pack
                    }
                    return {};
                }
            },

            {
                id: 'buy_50_cpfs',
                text: 'Buy pack of 50 CPFs (200,000 - DISCOUNTED)',
                condition: (state: GameState) => state.hasUnlocked50Pack === true,  // Only show if unlocked
                response: 'Negócio fechado. Mandando os pacotes.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 200000,
                    cpfs: state.cpfs + 50,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 50
                })
            }
        ]
    }
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
