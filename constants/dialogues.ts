// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

import { CharacterDialogue, GameState, ScriptedEvent } from '../types/game';

// ============================================================================
// HELPERS
// ============================================================================

const fmt = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
    return String(Math.floor(n));
};

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

// Tutorial messages (step-by-step guide for new players)
export const TUTORIAL = [
    {
        id: 0,
        text: "Bem vindo, Vacaro. Você lava dinheiro para o PCC. Vamos ver quanto você consegue limpar.",
        target: null,
        screen: 'bank'
    },
    {
        id: 1,
        text: "Este é o seu dinheiro sujo. Use seu banco para lavar, criando empréstimos falsos e vendendo a dívida para outros bancos.",
        target: 'dirty_display',
        screen: 'bank'
    },
    {
        id: 2,
        text: "Para isso, você precisa de contas laranjas. O hacker consegue CPFs para criarmos os empréstimos.",
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
        text: "Use CRIAR PACOTE para converter dinheiro sujo em um pacote de dívida.",
        target: 'btn_loan',
        screen: 'bank'
    },
    {
        id: 7,
        text: "Pacote criado! Agora use VENDER DÍVIDA para vendê-lo a um banco e receber dinheiro limpo.",
        target: 'btn_sell',
        screen: 'bank'
    },
];

// Banks that buy debt packs
export const BANKS = [
    { id: 'brausila', name: 'Banco de Brausila' },
    { id: 'eterno',   name: 'Banco Eterno' },
    { id: 'sapo',     name: 'Banco SAPO' },
];

// UI Labels - Bank Screen
export const UI_BANK = {
    btnCreateLoan: "📦 CRIAR PACOTE",
    btnSellPack:   "💰 VENDER DÍVIDA",
    btnPayDebt:    "💸 PAGAR",
    packSection:   "PACOTES PRONTOS",
    packEmpty:     "Nenhum pacote. Crie um empréstimo.",
    debtSection:   "DÍVIDAS A PAGAR",
    debtEmpty:     "Sem dívidas pendentes.",
};

// UI Labels - Sell Modal
export const UI_SELL = {
    title:         "VENDER PACOTE DE DÍVIDA",
    subtitle:      "Escolha um comprador",
    faceValue:     "Valor nominal",
    discount:      "Desconto",
    offer:         "Oferta",
    accept:        "ACEITAR",
    successTitle:  "✅ PACOTE VENDIDO",
    successSub:    "Dinheiro limpo depositado na conta",
    cancel:        "❌ FECHAR",
};

// UI Labels - Loan Modal (Cinematic)
export const UI_LOAN_CINEMATIC = {
    title:           "CRIAR PACOTE DE DÍVIDA",
    subtitle:        "Selecione a quantidade de CPFs",
    sectionValues:   "📊 VALORES DA OPERAÇÃO",
    labelCpfs:       "CPFs Utilizados:",
    labelDirty:      "Dinheiro Sujo:",
    labelClean:      "Dinheiro Limpo:",
    labelSuspicion:  "Taxa de Suspeita:",
    sectionCpfs:     "💾 CPFs SELECIONADOS",
    btnConfirm:      "🔒 CONFIRMAR LAVAGEM",
    btnCancel:       "❌ CANCELAR",
    processingTitle: "OPERAÇÃO DE LAVAGEM",
    processingLabel: "PROCESSANDO...",
    successTitle:    "✅ EMPRÉSTIMOS CRIADOS",
    successSubtitle: "Pacote de dívida pronto para venda",
};

// UI Labels - Loan Modal (legacy)
export const UI_LOAN_MODAL = {
    title: "SELECIONE O LOTE",
    labelIds: "IDs",
    labelDirtyCost: (amount: number) => `${amount}k Sujo`,
    btnConfirm: "LAVAR DINHEIRO",
    btnCancel: "Cancelar",
};

// UI Labels - Pay Modal
export const UI_PAY_MODAL = {
    title: "PAGAR PCC",
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

    // Lawyer - Fixes legal problems
    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        avatar: require('../assets/images/characters/drugdealer.jpg'),

        // Story introduction
        intro: "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
        unlockTrigger: (gameState: any) => false, // Unlocked via scripted event

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
        unlockTrigger: (gameState: any) => false, // Unlocked via scripted event

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
        unlockTrigger: (gameState: any) => false, // Unlocked via scripted event

        // Chat dialogues
        greeting: "Preciso de doações para a campanha.",
    },
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

const LAWYER_COSTS = [50000, 150000, 400000, 1000000];

export const DIALOGUES: { [characterId: string]: CharacterDialogue } = {
    hacker: {
        characterId: 'hacker',

        outgoingOptions: [
            {
                id: 'buy_10_cpfs',
                text: 'Comprar 10 CPFs (50,000)',
                response: 'Feito. Transferindo agora.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 50000,
                    cpfs: state.cpfs + 10,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 10
                })
            },

            {
                id: 'ask_more_volume',
                text: 'Preciso de mais volume',
                condition: (state: GameState) => !state.hasUnlocked50Pack,
                response: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 50) {
                        return 'Ok. Posso vender 50 com um desconto.';
                    }
                    return "É o que té tendo. Não vai dar não.";
                },
                action: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 50) {
                        return { hasUnlocked50Pack: true };
                    }
                    return {};
                }
            },

            {
                id: 'buy_50_cpfs',
                text: 'Comprar 50 CPFs (200,000)',
                condition: (state: GameState) => state.hasUnlocked50Pack === true,
                response: 'Negócio fechado. Mandando os pacotes.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 200000,
                    cpfs: state.cpfs + 50,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 50
                })
            }
        ]
    },

    lawyer: {
        characterId: 'lawyer',
        outgoingOptions: [
            {
                id: 'hire_lawyer',
                text: 'Preciso esfriar as coisas.',
                condition: (state: GameState) => state.dirty >= LAWYER_COSTS[state.levelIdx],
                response: (state: GameState) =>
                    `R$${fmt(LAWYER_COSTS[state.levelIdx])}. Vou ligar.`,
                action: (state: GameState) => {
                    const cost = LAWYER_COSTS[state.levelIdx];
                    return {
                        dirty: state.dirty - cost,
                        suspicion: Math.max(0, state.suspicion - 15),
                    };
                },
            },
            {
                id: 'hire_lawyer_broke',
                text: 'Quanto custa?',
                condition: (state: GameState) => state.dirty < LAWYER_COSTS[state.levelIdx],
                response: (state: GameState) =>
                    `R$${fmt(LAWYER_COSTS[state.levelIdx])}. Não aceito menos.`,
            },
        ],
    },

    judge: {
        characterId: 'judge',
        outgoingOptions: [
            {
                id: 'judge_first_offer',
                text: 'Preciso de mais tempo.',
                condition: (state: GameState) =>
                    state.unlockedDialogueOptions.includes('judge_first_offer') &&
                    state.clean >= 500000 &&
                    state.batches.length > 0,
                response: 'Fica quieto. 30 dias — e não me ligue de novo tão cedo.',
                action: (state: GameState) => ({
                    clean: state.clean - 500000,
                    batches: state.batches.map((b, i) =>
                        i === 0 ? { ...b, days: b.days + 30 } : b
                    ),
                }),
            },
            {
                id: 'judge_offer_2',
                text: '[PLACEHOLDER — designer fills in]',
                condition: (state: GameState) =>
                    state.unlockedDialogueOptions.includes('judge_offer_2'),
                response: '[PLACEHOLDER]',
            },
        ],
    },

    deputy: {
        characterId: 'deputy',
        outgoingOptions: [
            {
                id: 'hire_deputy',
                text: 'Preciso que recuem.',
                condition: (state: GameState) => state.dirty >= 200000,
                response: 'Uma visita. Eles vão entender.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 200000,
                    pressure: Math.max(0, state.pressure - 20),
                }),
            },
            {
                id: 'hire_deputy_broke',
                text: 'Quanto custa?',
                condition: (state: GameState) => state.dirty < 200000,
                response: 'R$200k. Não trabalho de graça.',
            },
        ],
    },
};

// ============================================================================
// SCRIPTED EVENTS
// ============================================================================

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
    // ── Contact unlocks ──
    {
        id: 'unlock_lawyer',
        trigger: (s) => s.levelIdx >= 1,
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'lawyer' },
                {
                    type: 'incoming_message',
                    contactId: 'drugdealer',
                    text: 'você tá crescendo. hora de ter proteção.',
                },
            ],
        },
    },
    {
        id: 'unlock_judge',
        trigger: (s) => s.levelIdx >= 2 && s.clean >= 10_000_000,
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'judge' },
                {
                    type: 'incoming_message',
                    contactId: 'lawyer',
                    text: 'Conheço alguém que pode adiar um prazo. Custa caro.',
                },
                { type: 'unlock_dialogue_option', optionId: 'judge_first_offer' },
            ],
        },
    },
    {
        id: 'unlock_deputy',
        trigger: (s) => s.levelIdx >= 2 && s.clean >= 12_000_000,
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'deputy' },
                {
                    type: 'incoming_message',
                    contactId: 'lawyer',
                    text: 'Tem outro cara que resolve o lado da pressão.',
                },
            ],
        },
    },

    // ── Judge dialogue unlocks (score-gated) ──
    {
        id: 'judge_offer_2',
        trigger: (s) => s.levelIdx === 3 && s.omstreDayStart > 0 && (s.day - s.omstreDayStart) >= 30,
        payload: { type: 'unlock_dialogue_option', optionId: 'judge_offer_2' },
    },

    // ── Pressure warning messages ──
    {
        id: 'pressure_warning_police',
        trigger: (s) => s.suspicion >= 75,
        payload: {
            type: 'incoming_message',
            contactId: 'drugdealer',
            text: 'Cuidado — os federais tão de olho. Esfria isso.',
        },
    },
    {
        id: 'pressure_warning_cartel',
        trigger: (s) => s.pressure >= 75,
        payload: {
            type: 'incoming_message',
            contactId: 'drugdealer',
            text: 'Isso tá demorando demais.',
        },
    },
];

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
        unlock: char.id === 'hacker' || char.id === 'lawyer',
    }));
};
