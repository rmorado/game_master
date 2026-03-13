// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

import { CharacterDialogue, GameState, ScriptedEvent } from '../types/game';
import { formatMoney as fmt } from '../utils/format';

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

// Tutorial messages (step-by-step guide for new players)
export const TUTORIAL = [
    {
        id: 0,
        text: "Bem-vindo, Vacaro. Você lava dinheiro pro PCC: eles mandam uma quantia, você devolve pelo menos 60%.",
        target: null,
        screen: 'bank'
    },
    {
        id: 1,
        text: "O esquema: empréstimos falsos em nome de CPFs reais, vendidos como dívida pra outros bancos.",
        target: null,
        screen: 'bank'
    },
    {
        id: 2,
        text: "Primeiro a gente compra um pacote de CPFs. Entre no Zep.",
        target: 'nav_zep',
        screen: 'bank'
    },
    {
        id: 3,
        text: "Este é o Hacker. Ele vende identidades. Laranjas que nem sabem que estão na feira.",
        target: 'contact_hacker',
        screen: 'zep'
    },
    {
        id: 4,
        text: "Compre 100 CPFs.",
        target: 'btn_buy_100',
        screen: 'chat'
    },
    {
        id: 5,
        text: "Volte ao Banco. Todo mundo aí vai pedir um empréstimo. Logo abaixo do limite pra não ter perguntas do BC.",
        target: 'btn_back',
        screen: 'chat'
    },
    {
        id: 6,
        text: "Use CRIAR DERIVATIVO para gerar o derivativo de dívida.",
        target: 'btn_loan',
        screen: 'bank'
    },
    {
        id: 7,
        text: "Pacote pronto! Agora use VENDER DÍVIDA para receber o dinheiro limpo.",
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
    btnCreateLoan: "📦 CRIAR DERIVATIVO",
    btnSellPack:   "💰 VENDER DÍVIDA",
    btnPayDebt:    "💸 PAGAR",
    packSection:   "DERIVATIVOS PRONTOS",
    packEmpty:     "Nenhum derivativo. Crie um empréstimo.",
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
    title:           "REQUERIMENTO DE EMPRÉSTIMOS",
    subtitle:        "Selecione a quantidade de CPFs",
    sectionValues:   "📊 VALORES DA OPERAÇÃO",
    labelCpfs:       "CPFs Utilizados:",
    labelDirty:      "Custo total da dívida:",
    labelClean:      "Valor de venda total:",
    labelSuspicion:  "Taxa de Suspeita:",
    sectionCpfs:     "💾 CPFs SELECIONADOS",
    btnConfirm:      "🔒 CRIAR DÍVIDA CONSOLIDADA",
    btnCancel:       "❌ CANCELAR",
    processingTitle: "Criando Dívida Consolidada",
    processingLabel: "PROCESSANDO...",
    successTitle:    "✅ PRONTO",
    successSubtitle: "Pacote de dívida pronto para venda",
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
        name: "PCC",
        sub: "Organização",
        borderColor: "#D4AF37",
        avatar: require('../assets/images/characters/drugdealer.jpg'),
        intro: "Mandando dinheiro. Não me decepcione.",
        greeting: "Tem trabalho pra fazer.",
    },

    hacker: {
        id: "hacker",
        name: "H4CK3R",
        sub: "Venda de Dados",
        borderColor: "#0f0",
        avatar: require('../assets/images/characters/hacker.jpg'),
        intro: "Pacotes de CPFs disponíveis.",
        greeting: "Tenho pacotes novos.",
    },

    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        sub: "Advogado",
        borderColor: "#ff4500",
        avatar: require('../assets/images/characters/drugdealer.jpg'),
        intro: "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
        greeting: "Como posso ajudar?",
    },

    judge: {
        id: "judge",
        name: "Dr. Gilmar",
        sub: "Jurídico",
        borderColor: "gold",
        avatar: require('../assets/images/characters/juiz.jpg'),
        intro: "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
        greeting: "Como posso ajudar?",
    },

    anonimo: {
        id: "anonimo",
        name: "Número Desconhecido",
        sub: "Desconhecido",
        borderColor: "#666",
        avatar: require('../assets/images/characters/drugdealer.jpg'),
        intro: "eu sei o que você está fazendo.",
        greeting: "...",
    },

    // Deputy - Political corruption
    deputy: {
        id: "deputy",
        name: "Dep. Motta",
        sub: "Campanha",
        borderColor: "cyan",
        avatar: require('../assets/images/characters/deputado.jpg'),
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        greeting: "Preciso de doações para a campanha.",
    },
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

const LAWYER_COSTS = [50000, 150000, 400000, 1000000];

export const DIALOGUES: { [characterId: string]: CharacterDialogue } = {
    anonimo: {
        characterId: 'anonimo',
        outgoingOptions: [
            {
                id: 'blackmail_pay',
                text: 'PAGAR (R$300.000 sujo)',
                condition: (state: GameState) =>
                    !state.hasRespondedToBlackmail && state.dirty >= 300000,
                response: 'Sábio. Obrigado pela cooperação.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 300000,
                    hasRespondedToBlackmail: true,
                    unlockedDialogueOptions: [
                        ...state.unlockedDialogueOptions,
                        'investigate_bitcoin',
                    ],
                }),
            },
            {
                id: 'blackmail_ignore',
                text: 'IGNORAR',
                condition: (state: GameState) => !state.hasRespondedToBlackmail,
                response: 'Você vai se arrepender.',
                action: (state: GameState) => ({
                    hasRespondedToBlackmail: true,
                    unlockedDialogueOptions: [
                        ...state.unlockedDialogueOptions,
                        'investigate_bitcoin',
                    ],
                }),
            },
        ],
    },

    hacker: {
        characterId: 'hacker',

        outgoingOptions: [
            {
                id: 'buy_100_cpfs',
                text: 'Comprar 100 CPFs (500,000)',
                response: 'Feito. Transferindo agora.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 500000,
                    cpfs: state.cpfs + 100,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 100
                })
            },

            {
                id: 'ask_more_volume',
                text: 'Preciso de mais volume',
                condition: (state: GameState) => !state.hasUnlocked50Pack,
                response: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 500) {
                        return 'Ok. Posso vender 500 com um desconto.';
                    }
                    return "É o que té tendo. Não vai dar não.";
                },
                action: (state: GameState) => {
                    const bought = state.cpfsBoughtFromHacker || 0;
                    if (bought >= 500) {
                        return { hasUnlocked50Pack: true };
                    }
                    return {};
                }
            },

            {
                id: 'buy_500_cpfs',
                text: 'Comprar 500 CPFs (2,000,000)',
                condition: (state: GameState) => state.hasUnlocked50Pack === true,
                response: 'Negócio fechado. Mandando os pacotes.',
                action: (state: GameState) => ({
                    dirty: state.dirty - 2000000,
                    cpfs: state.cpfs + 500,
                    cpfsBoughtFromHacker: (state.cpfsBoughtFromHacker || 0) + 500
                })
            },

            {
                id: 'investigate_bitcoin',
                text: 'Investigar endereço Bitcoin',
                condition: (state: GameState) =>
                    state.unlockedDialogueOptions.includes('investigate_bitcoin'),
                response: 'Vou rastrear. Isso leva tempo — te aviso.',
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
    // ── Blackmail event ──
    {
        id: 'blackmail_intro',
        trigger: (s) => s.hasFirstSoldPack && s.hasFirstPaidDebt,
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'anonimo' },
                {
                    type: 'incoming_message',
                    contactId: 'anonimo',
                    text: 'eu sei o que você está fazendo. meu silencio custa 1 Bitcoin. mandar para: bc1q9x8yflhp5t4k0d3e2w7n6m1c8v0a4s3g7j2r5',
                },
            ],
        },
    },

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

