// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

import { CharacterDialogue, DialogueOption, GameState, LevelEvent, ScriptedEvent, TutorialStep } from '../types/game';
import { formatMoney as fmt } from '../utils/format';

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

// Tutorial messages (step-by-step guide for new players)
export const TUTORIAL: TutorialStep[] = [
    // 0 — Welcome
    {
        id: 0,
        text: "Bem-vindo, Vacaro. Você lava dinheiro pro PCC: eles mandam uma quantia, você devolve pelo menos 60%.",
        target: null,
        screen: 'home',
    },
    // 1 — Scheme explanation
    {
        id: 1,
        text: "O esquema: empréstimos falsos em nome de CPFs reais, vendidos como dívida pra outros bancos.",
        target: null,
        screen: 'home',
    },
    // 2 — Open ZEP
    {
        id: 2,
        text: "Primeiro a gente compra um pacote de CPFs. Entre no ZEP.",
        target: 'nav_zep',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 3 — Tap hacker
    {
        id: 3,
        text: "Este é o Hacker. Ele vende identidades. Laranjas que nem sabem que estão na feira.",
        target: 'contact_hacker',
        screen: 'zep',
        boxPosition: { top: 380 },
    },
    // 4 — Buy CPFs
    {
        id: 4,
        text: "Compre 100 CPFs.",
        target: 'btn_buy_100',
        screen: 'chat',
        boxPosition: { top: 380 },
    },
    // 5 — Leave ZEP (info)
    {
        id: 5,
        text: "Bom. Agora vamos criar uns empréstimos falsos em nome dessas pessoas. Volte ao início.",
        target: 'btn_back',
        screen: 'chat',
        boxPosition: { bottom: 90 },
    },
    // 6 — Open LARANJAS (NEW)
    {
        id: 6,
        text: "Abra o LARANJAS.",
        target: 'nav_laranjas',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 7 — Create derivativo (was step 6)
    {
        id: 7,
        text: "Use CRIAR DERIVATIVO para gerar o derivativo de dívida.",
        target: 'btn_loan',
        screen: 'laranjas',
        boxPosition: { top: 120 },
    },
    // 8 — Derivativo created (info, NEW)
    {
        id: 8,
        text: "Derivativo criado. Agora precisamos vender pra receber o dinheiro limpo. Volte ao início.",
        target: null,
        screen: 'laranjas',
    },
    // 9 — Open BACEN (NEW)
    {
        id: 9,
        text: "Abra o BACEN.",
        target: 'nav_bacen',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 10 — BACEN explanation (info, NEW)
    {
        id: 10,
        text: "No BACEN você vende derivativos para outros bancos. Escolha a melhor oferta.",
        target: null,
        screen: 'bacen',
    },
    // 11 — Sell derivativo (was step 7)
    {
        id: 11,
        text: "Ofereça o derivativo.",
        target: 'btn_sell',
        screen: 'bacen',
        boxPosition: { top: 250 },
    },
    // 12 — Money received, go pay PCC (info, NEW)
    {
        id: 12,
        text: "Dinheiro limpo. Última etapa: devolver ao PCC.",
        target: null,
        screen: 'home',
    },
    // 13 — Open CARTEIRA (NEW)
    {
        id: 13,
        text: "Abra a CARTEIRA.",
        target: 'nav_carteira',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 14 — Carteira explanation (info, NEW)
    {
        id: 14,
        text: "Aqui você controla quanto devolve ao PCC. Use o slider e confirme.",
        target: null,
        screen: 'carteira',
    },
    // 15 — Send payment (NEW)
    {
        id: 15,
        text: "Envie o pagamento.",
        target: 'btn_pay',
        screen: 'carteira',
        boxPosition: { bottom: 200 },
    },
    // 16 — Congratulation (info, NEW)
    {
        id: 16,
        text: "Loop completo. A lavanderia está aberta.",
        target: null,
        screen: 'carteira',
    },
];

// Banks that buy debt packs
export const BANKS = [
    { id: 'brausila', name: 'Banco de Brausila' },
    { id: 'eterno',   name: 'Banco Eterno' },
    { id: 'sapo',     name: 'Banco SAPO' },
];

// UI Labels - Pay Modal
export const UI_PAY_MODAL = {
    title: "PAGAR PCC",
    labelBalance: (amount: string) => `Saldo Limpo: ${amount}`,
    btnConfirm: "CONFIRMAR PAGAMENTO",
    btnCancel: "Cancelar",
};

// UI Labels - Laranjas screen
export const UI_LARANJAS = {
    appName:          "laranjas",
    ctaBtn:           "CRIAR CARTEIRA DE CRÉDITO",
    warning:          "⚠ aumenta suspeita",
    maxBtn:           "MAX",
    labelCpfAvail:    "CPF disponíveis",
    labelCpfSelected: "CPF selecionados",
    labelUsar:        "usar",
    labelLoan:        "empréstimo gerado",
    processingTitle:  "Criando empréstimos nos nomes da lista. Amalgando pedidos. Gerando ",
    processingLabel:  "PROCESSANDO DÍVIDA E INTEGRANDO AO PRODUTO",
    successIcon:      "✓",
    successTitle:     "CARTEIRA CRIADA",
    successSub:       "Pronto para venda no BACEN",
};

// UI Labels - BACEN screen
export const UI_BACEN = {
    wordmark:        "BACEN",
    subtitle:        "Plataforma Interbancária",
    corpBadge:       "CORP",
    offerBtn:        "OFERECER CARTEIRA",
    sectionLoading:  "BUSCANDO OFERTAS",
    loadingHint:     "Procurando ofertas de outros bancos...",
    sectionOffers:   "OFERTAS RECEBIDAS",
    cancelLink:      "Cancelar",
    sectionPackList: "CRÉDITO EM CARTEIRA",
    emptyPacks:      "Nenhuma carteira disponível.",
    confirmBtn:      "CESSAR CARTEIRA DE CRÉDITO",
    bestOffer:       "MELHOR OFERTA",
    offerLabel:      "Oferta",
    bankReady:       "RESPONDEU",
    bankWaiting:     "aguardando...",
    bankIcon:        "🏦",
    successIcon:     "✓",
    successTitle:    "CARTEIRA VENDIDA",
    successSub:      "Dinheiro limpo adicionado à carteira",
    packName:        (cpfsUsed: number) => `Derivativo — ${cpfsUsed} CPF`,
    packMeta:        (dayCreated: number) => `Emitido dia ${dayCreated} · vence dia ${dayCreated + 90}`,
    packDays:        (days: number) => `${days} dias`,
};

// UI Labels - Carteira screen
export const UI_CARTEIRA = {
    appName:         "COFRE",
    labelDirty:      "sujo",
    labelClean:      "limpo",
    currency:        "R$",
    sectionTransfer: "TRANSFERIR PARA PCC",
    labelEnviar:     "enviar",
    labelDoLimpo:    " do limpo",
    maxBtn:          "MAX",
    labelAEnviar:    "a enviar",
    labelResta:      (remaining: string) => `resta R$ ${remaining} limpo`,
    sendBtn:         "ENVIAR",
    sectionHistory:  "HISTÓRICO",
};

// UI Labels - Home screen app icons
export const UI_HOME = {
    apps: {
        zep:       "ZepZep",
        bacen:     "BaCen",
        laranjas:  "Laranjas",
        calendario:"Calendário",
        carteira:  "Cofre",
        dossie:    "Dossiê",
        news:      "News",
    },
};

// UI Labels - ZEP app screen
export const UI_ZEP = {
    wordmark:          "ZEP",
    searchIcon:        "⌕",
    menuIcon:          "⋮",
    searchPlaceholder: "Buscar conversa...",
    timeLabel:         "agora",
    checkmarks:        "✓✓ ",
    fabIcon:           "✉",
};

// UI Labels - Chat screen
export const UI_CHAT = {
    bagAccept:        "OK, manda.",
    bagDecline:       "Não agora.",
    bagAcceptLater:   "Pronto, pode mandar",
    escalation1:      'E aí? Vai movimentar ou não?',
    escalation2:      'Tô perdendo a paciência. Manda logo.',
    pccConfirmation:  '🔥',
};

// UI Labels - Tutorial overlay
export const UI_TUTORIAL_OVERLAY = {
    tapToContinue: "(Toque para continuar)",
};

// UI Labels - Level up screen
export const UI_LEVEL_UP = {
    label: "NÍVEL",
    tapToPlay: "TOQUE PARA JOGAR",
    tapToContinue: "TOQUE PARA CONTINUAR",
};

// UI Labels - Game over screen
export const UI_GAME_OVER = {
    masterDays: (days: number) => `Dias como O Mestre: ${days}`,
    restartBtn: "NOVA PARTIDA",
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
        avatar: require('../assets/images/characters/MJdrugdealer01.png'),
        intro: "mandando 💵 💵 💵 passa o sabao",
        greeting: "Tem trabalho pra fazer.",
    },

    hacker: {
        id: "hacker",
        name: "H4CK3R",
        sub: "Venda de Dados",
        borderColor: "#0f0",
        avatar: require('../assets/images/characters/MJhacker01.png'),
        intro: "feira da fruta cheio de laranja",
        greeting: "identidades fresquinhas",
    },

    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        sub: "Advogado",
        borderColor: "#ff4500",
        avatar: require('../assets/images/characters/MJadevogado01.png'),
        intro: "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
        greeting: "Como posso ajudar?",
    },

    judge: {
        id: "judge",
        name: "Dr. Gilmar",
        sub: "Jurídico",
        borderColor: "gold",
        avatar: require('../assets/images/characters/MJjuiz01.png'),
        intro: "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
        greeting: "Como posso ajudar?",
    },

    anonimo: {
        id: "anonimo",
        name: "Número Desconhecido",
        sub: "Desconhecido",
        borderColor: "#666",
        avatar: require('../assets/images/characters/MJhacker02.png'),
        intro: "eu sei o que você está fazendo.",
        greeting: "...",
    },

    investigador: {
        id: "investigador",
        name: "Investigador BC",
        sub: "Banco Central",
        borderColor: "#1e90ff",
        avatar: require('../assets/images/characters/MJBanCen01.png'),
        intro: "Boa tarde. Sou do Banco Central. Precisamos dos seus registros.",
        greeting: "Estou aguardando os documentos.",
    },

    madame: {
        id: "madame",
        name: "Dra. Helena",
        sub: "Advocacia & Consultoria",
        borderColor: "#e6b8d4",
        avatar: require('../assets/images/characters/MJmadame01.png'),
        intro: "Meu marido me disse que você precisa de orientação. Posso ajudar.",
        greeting: "Vamos resolver isso.",
    },

    // Deputy - Political corruption
    deputy: {
        id: "deputy",
        name: "Dep. Motta",
        sub: "Campanha",
        borderColor: "cyan",
        avatar: require('../assets/images/characters/MJdeputado01.png'),
        intro: "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
        greeting: "Preciso de doações para a campanha.",
    },
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

const LAWYER_COSTS = [500000, 1500000, 4000000, 10000000];
const DEPUTY_COST = 2000000;
const JUDGE_COST = 5000000;
const MADAME_COST = 1200000000;
const BLACKMAIL_COST = 3000000;

const CPF_PACKS = [
    { qty: 100,    cost: 500000,     minLevel: 0, response: 'Feito. Transferindo agora.' },
    { qty: 1000,   cost: 4000000,    minLevel: 0, response: 'Negócio fechado. Mandando os pacotes.' },
    { qty: 5000,   cost: 15000000,   minLevel: 1, response: 'Pacote grande. Vai demorar umas horas.' },
    { qty: 10000,  cost: 25000000,   minLevel: 1, response: 'Isso é operação pesada. Tá mandado.' },
    { qty: 50000,  cost: 100000000,  minLevel: 2, response: 'Cinquenta mil identidades. Preciso de 24h.' },
    { qty: 100000, cost: 150000000,  minLevel: 3, response: 'Cem mil. Vou acionar a rede inteira.' },
];

export const DIALOGUES: { [characterId: string]: CharacterDialogue } = {
    drugdealer: {
        characterId: 'drugdealer',
        options: [
            {
                id: 'request_bag',
                text: 'Preciso de mais dinheiro.',
                visible: [
                    { type: 'custom', fn: (s: GameState) => !s.eventsTriggered.includes('pressure_warning_police') || s.dialoguesSeen.includes('ack_federais'), description: 'before police warning or after ack' },
                ],
                response: 'Certo. Mandando agora.',
                effects: [{ type: 'requestBag' }],
            },
            {
                id: 'ack_federais',
                text: 'Vou falar com meu advogado.',
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('pressure_warning_police'), description: 'after police warning' },
                    { type: 'dialogueNotSeen', optionId: 'ack_federais' },
                ],
                response: 'Faz isso. E rápido.',
            },
        ],
    },

    anonimo: {
        characterId: 'anonimo',
        options: [
            {
                id: 'blackmail_pay',
                text: `PAGAR (R$${fmt(BLACKMAIL_COST)})`,
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'blackmail_pay' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: BLACKMAIL_COST }],
                response: 'Sábio. Obrigado pela cooperação.',
                effects: [
                    { type: 'spend', resource: 'dirty', amount: BLACKMAIL_COST },
                    { type: 'trackTransfer', contactId: 'anonimo', amount: BLACKMAIL_COST },
                ],
            },
            {
                id: 'blackmail_ignore',
                text: 'cai fora',
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'blackmail_pay' },
                    { type: 'dialogueNotSeen', optionId: 'blackmail_ignore' },
                ],
                response: 'Você vai se arrepender.',
                effects: [{ type: 'adjust', resource: 'suspicion', delta: 50, min: 0, max: 100 }],
            },
        ],
    },

    hacker: {
        characterId: 'hacker',
        options: [
            ...CPF_PACKS.map((pack): DialogueOption => ({
                id: `buy_${pack.qty}_cpfs`,
                text: `Comprar ${pack.qty.toLocaleString('pt-BR')} CPFs (R$${fmt(pack.cost)})`,
                visible: [{ type: 'level', op: 'gte', value: pack.minLevel }],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: pack.cost }],
                response: pack.response,
                effects: [
                    { type: 'spend', resource: 'dirty', amount: pack.cost },
                    { type: 'gain', resource: 'cpfs', amount: pack.qty },
                    { type: 'trackTransfer', contactId: 'hacker', amount: pack.cost },
                ],
            })),

            {
                id: 'investigate_bitcoin',
                text: 'Investigar endereço Bitcoin',
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.dialoguesSeen.includes('blackmail_pay') || s.dialoguesSeen.includes('blackmail_ignore'), description: 'after blackmail response' },
                    { type: 'custom', fn: (s: GameState) => s.investigateBitcoinDay === 0, description: 'not already investigating' },
                ],
                response: 'Vou rastrear. Isso leva tempo — te aviso.',
                effects: [{ type: 'setDay', field: 'investigateBitcoinDay' }],
            },
        ],
    },

    lawyer: {
        characterId: 'lawyer',
        options: [
            {
                id: 'hire_lawyer',
                text: 'Preciso esfriar as coisas.',
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: (s: GameState) => LAWYER_COSTS[s.levelIdx] }],
                response: (s: GameState) => `R$${fmt(LAWYER_COSTS[s.levelIdx])}. Vou ligar.`,
                disabledResponse: (s: GameState) => `R$${fmt(LAWYER_COSTS[s.levelIdx])}. Não aceito menos.`,
                effects: [
                    { type: 'spend', resource: 'dirty', amount: (s: GameState) => LAWYER_COSTS[s.levelIdx] },
                    { type: 'adjust', resource: 'suspicion', delta: -15 },
                    { type: 'trackTransfer', contactId: 'lawyer', amount: (s: GameState) => LAWYER_COSTS[s.levelIdx] },
                ],
            },
        ],
    },

    deputy: {
        characterId: 'deputy',
        options: [
            {
                id: 'deputy_help_bc',
                text: 'O Banco Central tá em cima de mim.',
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.dialoguesSeen.includes('investigador_comply') || s.dialoguesSeen.includes('investigador_stall'), description: 'after investigador interaction' },
                    { type: 'dialogueNotSeen', optionId: 'deputy_help_bc' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: DEPUTY_COST }],
                response: `Posso fazer uns telefonemas. R$${fmt(DEPUTY_COST)}. Tenho uns amigos no judiciário que podem te apresentar alguém.`,
                disabledResponse: `Posso ajudar, mas custa R$${fmt(DEPUTY_COST)}. Volta quando tiver.`,
                effects: [
                    { type: 'spend', resource: 'dirty', amount: DEPUTY_COST },
                    { type: 'adjust', resource: 'suspicion', delta: -10 },
                    { type: 'trackTransfer', contactId: 'deputy', amount: DEPUTY_COST },
                ],
            },
            {
                id: 'hire_deputy',
                text: 'Preciso que recuem.',
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: DEPUTY_COST }],
                response: 'Uma visita. Eles vão entender.',
                disabledResponse: `R$${fmt(DEPUTY_COST)}. Não trabalho de graça.`,
                effects: [
                    { type: 'spend', resource: 'dirty', amount: DEPUTY_COST },
                    { type: 'adjust', resource: 'pressure', delta: -20 },
                    { type: 'trackTransfer', contactId: 'deputy', amount: DEPUTY_COST },
                ],
            },
        ],
    },

    investigador: {
        characterId: 'investigador',
        options: [
            {
                id: 'investigador_comply',
                text: 'Vou providenciar os documentos.',
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall' },
                ],
                response: 'Ótimo. Aguardo em até 48 horas. Qualquer irregularidade será encaminhada ao Ministério Público.',
            },
            {
                id: 'investigador_stall',
                text: 'Posso ter mais tempo?',
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall' },
                ],
                response: 'Não. O prazo é regulamentar. Envie os documentos ou vamos abrir um processo formal.',
            },
            {
                id: 'investigador_done',
                text: 'Alguma novidade?',
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.dialoguesSeen.includes('investigador_comply') || s.dialoguesSeen.includes('investigador_stall'), description: 'after investigador interaction' },
                ],
                response: 'A análise está em andamento. Não saia do país.',
            },
        ],
    },

    judge: {
        characterId: 'judge',
        options: [
            {
                id: 'judge_intro_talk',
                text: 'O deputado me mandou falar com o senhor.',
                visible: [
                    { type: 'dialogueSeen', optionId: 'deputy_help_bc' },
                    { type: 'dialogueNotSeen', optionId: 'judge_intro_talk' },
                ],
                response: 'Nós não deveríamos estar tendo essa conversa. Mas... minha esposa tem um escritório de advocacia. Dra. Helena. Ela faz consultoria para orientação junto ao Supremo. Qualquer solicitação, fale diretamente com ela.',
            },
            {
                id: 'judge_first_offer',
                text: 'Preciso de mais tempo.',
                visible: [{ type: 'dialogueSeen', optionId: 'judge_intro_talk' }],
                enabled: [
                    { type: 'resource', resource: 'dirty', op: 'gte', value: JUDGE_COST },
                    { type: 'hasBatches' },
                ],
                response: 'Fica quieto. 30 dias — e não me ligue de novo tão cedo.',
                disabledResponse: 'Não posso fazer nada sem ter o que estender.',
                effects: [
                    { type: 'spend', resource: 'dirty', amount: JUDGE_COST },
                    { type: 'extendBatch', index: 0, days: 30 },
                    { type: 'trackTransfer', contactId: 'judge', amount: JUDGE_COST },
                ],
            },
        ],
    },

    madame: {
        characterId: 'madame',
        options: [
            {
                id: 'madame_proposal',
                text: 'Me disseram que a senhora pode ajudar.',
                visible: [{ type: 'dialogueNotSeen', optionId: 'madame_proposal' }],
                response: `Posso. Ofereço um contrato de consultoria geral e assessoria para orientação junto ao Supremo Tribunal. O valor é R$${fmt(MADAME_COST)}. Quando estiver pronto, me avise.`,
            },
            {
                id: 'madame_negotiate',
                text: `R$${fmt(MADAME_COST)} é muito. Tem como negociar?`,
                visible: [
                    { type: 'dialogueSeen', optionId: 'madame_proposal' },
                    { type: 'dialogueNotSeen', optionId: 'madame_pay' },
                ],
                response: 'Não. O valor reflete a complexidade e os riscos envolvidos. Quando tiver o valor, me procure. Seus problemas vão desaparecer.',
            },
            {
                id: 'madame_pay',
                text: `Quero fechar o contrato (R$${fmt(MADAME_COST)})`,
                visible: [
                    { type: 'dialogueSeen', optionId: 'madame_proposal' },
                    { type: 'dialogueNotSeen', optionId: 'madame_pay' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: MADAME_COST }],
                response: 'Excelente decisão. O contrato está assinado. A partir de agora, considere seus problemas resolvidos.',
                disabledResponse: 'Sem pressa. Mas não demore — cada dia que passa, a situação fica mais delicada.',
                effects: [
                    { type: 'spend', resource: 'dirty', amount: MADAME_COST },
                    { type: 'set', resource: 'suspicion', value: 0 },
                    { type: 'trackTransfer', contactId: 'madame', amount: MADAME_COST },
                ],
            },
        ],
    },
};

// ============================================================================
// LEVEL TRANSITION EVENTS
// ============================================================================

// Keyed by the levelIdx the player just reached (1 = became Gerente, etc.)
// Fill in dialogues/unlocks per level. Empty placeholder = no cutscene.
export const LEVEL_EVENTS: { [levelIdx: number]: LevelEvent } = {
    1: {
        title: "GERENTE",
        subtitle: "O esquema cresceu. Agora vem a atenção.",
        dialogues: [
            { from: 'drugdealer', text: 'Bom trabalho. Você tá subindo. Mas cuidado — o Banco Central tá de olho.' },
            { from: 'system', text: 'Novo contato apareceu no Zep.' },
        ],
        unlocks: ['investigador'],
        payloads: [
            {
                type: 'incoming_message',
                contactId: 'investigador',
                text: 'Boa tarde. Sou do departamento de compliance do Banco Central. Identificamos movimentações atípicas nas suas contas. Precisamos dos seus registros bancários para uma análise preliminar.',
            },
        ],
    },
    2: {
        title: "DOLEIRO",
        subtitle: "O jogo ficou mais pesado.",
        dialogues: [],
        unlocks: [],
    },
    3: {
        title: "O MESTRE",
        subtitle: "Agora é sobrevivência.",
        dialogues: [],
        unlocks: [],
    },
};

// ============================================================================
// SCRIPTED EVENTS
// ============================================================================

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
    // ── Blackmail event ──
    {
        id: 'blackmail_intro',
        trigger: (s) => s.suspicion >= 50,
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

    // ── Gerente chain: Investigador → Deputado → Juiz → Madame ──
    {
        id: 'gerente_deputado_unlock',
        trigger: (s) =>
            (s.dialoguesSeen.includes('investigador_comply') || s.dialoguesSeen.includes('investigador_stall'))
            && !s.dialoguesSeen.includes('deputy_help_bc'),
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'deputy' },
                {
                    type: 'incoming_message',
                    contactId: 'deputy',
                    text: 'Soube que o BC tá te incomodando. Posso fazer uns telefonemas. Me procura.',
                },
            ],
        },
    },
    {
        id: 'gerente_juiz_unlock',
        trigger: (s) =>
            s.dialoguesSeen.includes('deputy_help_bc') && !s.dialoguesSeen.includes('judge_intro_talk'),
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'judge' },
                {
                    type: 'incoming_message',
                    contactId: 'deputy',
                    text: 'Falei com um amigo meu. Dr. Gilmar. Ele pode te ajudar. Tá no seu Zep.',
                },
            ],
        },
    },
    {
        id: 'gerente_madame_unlock',
        trigger: (s) =>
            s.dialoguesSeen.includes('judge_intro_talk') && !s.dialoguesSeen.includes('madame_pay'),
        payload: {
            type: 'multi',
            payloads: [
                { type: 'unlock_contact', contactId: 'madame' },
                {
                    type: 'incoming_message',
                    contactId: 'madame',
                    text: 'Meu marido me disse que você precisa de orientação. Me procure quando quiser conversar.',
                },
            ],
        },
    },

    // ── Hacker follow-up: Bitcoin investigation result ──
    {
        id: 'bitcoin_investigation_result',
        trigger: (s) => s.investigateBitcoinDay > 0 && s.day >= s.investigateBitcoinDay + 10,
        payload: {
            type: 'incoming_message',
            contactId: 'hacker',
            text: 'Rastreei o endereço. Usaram mixer, mas achei um padrão. Quem te mandou aquilo sabe o que faz. Cuidado.',
        },
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

