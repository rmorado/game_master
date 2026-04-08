// constants/dialogues.ts
// Centralized dialogue and text content for O Mestre

import { Bi, CharacterDialogue, GameState, LevelEvent, ScriptedEvent, TutorialStep } from '../types/game';
import { formatMoney as fmt } from '../utils/format';

// Bilingual string helper
export const bi = (pt: string, en: string): Bi => ({ pt, en });

// ============================================================================
// SYSTEM MESSAGES
// ============================================================================

export const TUTORIAL: TutorialStep[] = [
    // 0 — Welcome
    {
        id: 0,
        text: bi(
            "Bem-vindo, Vicaro. Você lava dinheiro pro PCC: eles mandam uma quantia, você devolve pelo menos 60%.",
            "Welcome, Vicaro. You launder money for the PCC: they send a sum, you return at least 60%.",
        ),
        target: null,
        screen: 'home',
    },
    // 1 — Scheme explanation
    {
        id: 1,
        text: bi(
            "O esquema: empréstimos falsos em nome de CPFs reais, vendidos como dívida pra outros bancos.",
            "The scheme: fake loans under real Social Security numbers (CPFs), sold as debt to other banks.",
        ),
        target: null,
        screen: 'home',
    },
    // 2 — Open ZEP
    {
        id: 2,
        text: bi("Primeiro a gente compra um pacote de CPFs. Entre no ZEP.", "First we buy a CPF package. Open ZEP."),
        target: 'nav_zep',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 3 — Tap hacker
    {
        id: 3,
        text: bi(
            "Este é o Hacker. Ele vende identidades. Laranjas que nem sabem que estão na feira.",
            "This is the Hacker. He sells stolen identities — people who have no idea they're being used as fronts.",
        ),
        target: 'contact_hacker',
        screen: 'zep',
        boxPosition: { top: 450 },
    },
    // 4 — Buy CPFs
    {
        id: 4,
        text: bi("Compre 100 CPFs.", "Buy 100 CPFs."),
        target: 'btn_buy_100',
        screen: 'chat',
        boxPosition: { top: 380 },
    },
    // 5 — Leave ZEP (info)
    {
        id: 5,
        text: bi(
            "Bom. Agora vamos criar uns empréstimos falsos em nome dessas pessoas. Volte ao início.",
            "Good. Now let's create fake loans under these people's names. Go back to the home screen.",
        ),
        target: 'btn_back',
        screen: 'chat',
        boxPosition: { bottom: 250 },
    },
    // 6 — Open LARANJAS
    {
        id: 6,
        text: bi("Abra o LARANJAS.", "Open LARANJAS."),
        target: 'nav_laranjas',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 7 — Create derivativo
    {
        id: 7,
        text: bi(
            "Selecione um pacote para gerar o derivativo de dívida.",
            "Select a package to generate your debt derivative.",
        ),
        target: 'btn_loan',
        screen: 'laranjas',
        boxPosition: { top: 250 },
    },
    // 8 — Derivativo created (info)
    {
        id: 8,
        text: bi(
            "Derivativo criado. Agora precisamos vender pra receber o dinheiro limpo. Volte ao início.",
            "Derivative created. Now we need to sell it to receive clean money. Go back home.",
        ),
        target: null,
        screen: 'laranjas',
    },
    // 9 — Open BACEN
    {
        id: 9,
        text: bi("Abra o BACEN.", "Open BACEN."),
        target: 'nav_bacen',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 10 — BACEN explanation (info)
    {
        id: 10,
        text: bi(
            "No BACEN você vende derivativos de dívida para outros bancos. Inicie um leilão e aceite a melhor oferta.",
            "In BACEN you sell debt derivatives to other banks. Start an auction and accept the best offer.",
        ),
        target: null,
        screen: 'bacen',
    },
    // 11 — Sell derivativo
    {
        id: 11,
        text: bi(
            "Inicie o leilão — depois resgate e aceite a melhor proposta.",
            "Start the auction — then claim the result and accept the best offer.",
        ),
        target: 'btn_sell',
        screen: 'bacen',
        boxPosition: { top: 450 },
    },
    // 12 — Money received, go pay PCC (info)
    {
        id: 12,
        text: bi("Dinheiro limpo. Última etapa: devolver ao PCC.", "Clean money. Last step: return to the PCC."),
        target: null,
        screen: 'bacen',
    },
    // 13 — Open CARTEIRA
    {
        id: 13,
        text: bi("Abra a CARTEIRA.", "Open the SAFE."),
        target: 'nav_carteira',
        screen: 'home',
        boxPosition: { bottom: 450 },
    },
    // 14 — Carteira explanation (info)
    {
        id: 14,
        text: bi(
            "Aqui você controla quanto devolve ao PCC. Use o slider e confirme.",
            "Here you control how much you return to the PCC. Use the slider and confirm.",
        ),
        target: null,
        screen: 'carteira',
    },
    // 15 — Send payment
    {
        id: 15,
        text: bi("Envie o pagamento.", "Send the payment."),
        target: 'btn_pay',
        screen: 'carteira',
        boxPosition: { bottom: 180 },
    },
    // 16 — Congratulation (info)
    {
        id: 16,
        text: bi("Loop completo. A lavanderia está aberta.", "Loop complete. The laundry is open."),
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

// ============================================================================
// CHARACTER DIALOGUES
// ============================================================================

export const CHARACTERS = {
    drugdealer: {
        id: "drugdealer",
        name: "PCC",
        sub: bi("Organização", "Organization"),
        borderColor: "#D4AF37",
        avatar: require('../assets/images/characters/MJdrugdealer01.png'),
        intro: bi("mandando 💵 💵 💵 passa o sabao", "sending 💵 💵 💵 run the soap"),
        greeting: bi("Tem trabalho pra fazer.", "There's work to do."),
    },

    hacker: {
        id: "hacker",
        name: "H4CK3R",
        sub: bi("Venda de Dados", "Data Sales"),
        borderColor: "#0f0",
        avatar: require('../assets/images/characters/MJhacker01.png'),
        intro: bi("feira da fruta cheio de laranja", "fruit market full of laranjas"),
        greeting: bi("identidades fresquinhas", "fresh identities"),
    },

    lawyer: {
        id: "lawyer",
        name: "Dr. Saul",
        sub: bi("Advogado", "Attorney"),
        borderColor: "#ff4500",
        avatar: require('../assets/images/characters/MJadevogado01.png'),
        intro: bi(
            "Problemas com a justiça? Eu resolvo. Tenho os contatos certos.",
            "Legal trouble? I fix it. I have the right contacts.",
        ),
        greeting: bi("Como posso ajudar?", "How can I help?"),
    },

    judge: {
        id: "judge",
        name: "Dr. Gilmar",
        sub: bi("Jurídico", "Legal"),
        borderColor: "gold",
        avatar: require('../assets/images/characters/MJjuiz01.png'),
        intro: bi(
            "Doutor, percebi uma movimentação atípica. Vamos conversar antes que o MP perceba?",
            "Doctor, I noticed an atypical movement. Shall we talk before the DA notices?",
        ),
        greeting: bi("Como posso ajudar?", "How can I help?"),
    },

    anonimo: {
        id: "anonimo",
        name: bi("Número Desconhecido", "Unknown Number"),
        sub: bi("Desconhecido", "Unknown"),
        borderColor: "#666",
        avatar: require('../assets/images/characters/MJhacker02.png'),
        intro: bi("eu sei o que você está fazendo.", "i know what you're doing."),
        greeting: bi("...", "..."),
    },

    investigador: {
        id: "investigador",
        name: bi("Investigador BC", "BC Investigator"),
        sub: bi("Banco Central", "Central Bank"),
        borderColor: "#1e90ff",
        avatar: require('../assets/images/characters/MJBanCen01.png'),
        intro: bi(
            "Boa tarde. Sou do Banco Central. Precisamos dos seus registros.",
            "Good afternoon. I'm from the Central Bank. We need your records.",
        ),
        greeting: bi("Estou aguardando os documentos.", "I am waiting for the documents."),
    },

    madame: {
        id: "madame",
        name: "Dra. Helena",
        sub: bi("Advocacia & Consultoria", "Law & Consulting"),
        borderColor: "#e6b8d4",
        avatar: require('../assets/images/characters/MJmadame01.png'),
        intro: bi(
            "Meu marido me disse que você precisa de orientação. Posso ajudar.",
            "My husband told me you need guidance. I can help.",
        ),
        greeting: bi("Vamos resolver isso.", "Let's sort this out."),
    },

    druglord: {
        id: "druglord",
        name: "Hector",
        sub: bi("PCC — Direção", "PCC — Leadership"),
        borderColor: "#8B0000",
        avatar: require('../assets/images/characters/MJdruglord01.png'),
        intro: bi("O esquema cresceu. Preciso que você cresça com ele.", "The operation grew. I need you to grow with it."),
        greeting: bi("Fala.", "Talk."),
    },

    deputy: {
        id: "deputy",
        name: bi("Dep. Motta", "Rep. Motta"),
        sub: bi("Campanha", "Campaign"),
        borderColor: "cyan",
        avatar: require('../assets/images/characters/MJdeputado01.png'),
        intro: bi(
            "Opa, companheiro. Eleição chegando. Preciso de 'apoio logístico'.",
            "Hey there, comrade. Election coming up. I need some 'logistical support'.",
        ),
        greeting: bi("Preciso de doações para a campanha.", "I need campaign donations."),
    },
};

// ============================================================================
// DIALOGUE SYSTEM
// ============================================================================

const DEPUTY_COST = 2000000;
const JUDGE_COST = 5000000;
const MADAME_COST = 1200000000;
const BLACKMAIL_COST = 3000000;
const PIPOCO_TEXT = bi(
    'uma moto aponta na esquina e vem na sua direção. a pessoa na garupa tira um revolver do casaco e dá quatro tiros sem descer da moto. Vicaro morto, na esquina da faria lima com tucumã.',
    'a motorcycle rounds the corner heading your way. the pillion rider pulls a revolver from their jacket and fires four shots without dismounting. Vicaro dead, on the corner of faria lima and tucumã.',
);
const BTC_TRACK_RESPONSE = bi(
    'já saiu dessa carteira. tô rastreando — te aviso.',
    'already left that wallet. tracking it — I\'ll let you know.',
);

export const DIALOGUES: { [characterId: string]: CharacterDialogue } = {
    // ── PCC (drugdealer) ─────────────────────────────────────────────────
    drugdealer: {
        characterId: 'drugdealer',
        options: [
            {
                id: 'request_bag',
                text: bi('pode mandar mais uma grana', 'send another load'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => !s.hasPendingBag && (!s.eventsTriggered.includes('pressure_warning_police') || s.dialoguesSeen.includes('ack_federais')), description: 'no pending bag, no unacknowledged police warning' },
                ],
                response: bi('foi', 'done'),
                effects: [{ type: 'requestBag' }],
            },
            {
                id: 'ack_federais',
                text: bi('vou falar com meu advogado', 'I\'ll talk to my lawyer'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('pressure_warning_police') && !s.dialoguesSeen.includes('ack_federais'), description: 'police warning active, not yet acknowledged' },
                ],
                response: bi('faz isso. e rápido.', 'do it. fast.'),
            },
            {
                id: 'accept_bag',
                text: bi('pode mandar', 'send it over'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.hasPendingBag, description: 'pending bag' },
                ],
                response: bi('foi', 'done'),
                effects: [{ type: 'acceptBag' }],
            },
            {
                id: 'decline_bag_1',
                text: bi('perae que tá complicado agora', 'hang on, things are complicated right now'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.hasPendingBag && s.consecutiveBagDeclines === 0, description: 'pending bag, first decline' },
                ],
                response: bi('demora não hein', 'don\'t take too long'),
                effects: [{ type: 'declineBag' }],
            },
            {
                id: 'decline_bag_2',
                text: bi('ainda tá complicado aqui', 'still complicated here'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.hasPendingBag && s.consecutiveBagDeclines === 1, description: 'pending bag, second decline' },
                ],
                response: bi('não é assim que a coisa funciona', 'that\'s not how this works'),
                effects: [{ type: 'declineBag' }],
            },
            {
                id: 'decline_bag_3',
                text: bi('tem muita merda rolando, segura a onda', 'lot of shit going on, hold tight'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.hasPendingBag && s.consecutiveBagDeclines >= 2, description: 'pending bag, third decline' },
                ],
                response: bi('segura o caralho', 'hold nothing'),
                effects: [{ type: 'declineBag' }],
            },
            {
                id: 'cv_blackmail',
                text: bi('o CV tá me chantageando', 'the CV is blackmailing me'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('bitcoin_investigation_result'), description: 'hacker identified CV' },
                    { type: 'dialogueNotSeen', optionId: 'cv_blackmail' },
                ],
                response: bi('vamos dar um jeito em quem tá fazendo isso.', 'we\'ll deal with whoever\'s doing this.'),
            },
            {
                id: 'calma_calma',
                text: bi('calma calma', 'easy easy'),
                visible: [
                    { type: 'dialogueSeen', optionId: 'decline_bag_3' },
                    { type: 'dialogueNotSeen', optionId: 'calma_calma' },
                ],
                response: PIPOCO_TEXT,
                effects: [{ type: 'gameOver', reason: 'pressure', detail: PIPOCO_TEXT.pt }],
            },
        ],
    },

    // ── Hector (druglord / PCC boss) ─────────────────────────────────────
    druglord: {
        characterId: 'druglord',
        options: [
            {
                id: 'druglord_check_in',
                text: bi('Tá tudo em cima.', 'Everything\'s running smooth.'),
                response: bi('Continua assim.', 'Keep it that way.'),
            },
            {
                id: 'druglord_pressure_ack',
                text: bi('Tô trabalhando nisso.', 'I\'m working on it.'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('druglord_warning_1'), description: 'after first warning' },
                    { type: 'dialogueNotSeen', optionId: 'druglord_pressure_ack' },
                ],
                response: bi(
                    'Não quero saber que você tá trabalhando. Quero resultado. Você sabe o que acontece quando eu não recebo resultado.',
                    'I don\'t want to hear you\'re working on it. I want results. You know what happens when I don\'t get results.',
                ),
            },
            {
                id: 'druglord_reassure',
                text: bi('Tô no controle.', 'I\'ve got it under control.'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('druglord_warning_2'), description: 'after second warning' },
                    { type: 'dialogueNotSeen', optionId: 'druglord_reassure' },
                ],
                response: bi(
                    'Espero que sim. Não tem terceiro aviso.',
                    'I hope so. There is no third warning.',
                ),
            },
        ],
    },

    // ── Anônimo ──────────────────────────────────────────────────────────
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
                response: bi('Sábio. Obrigado pela cooperação.', 'Wise. Thank you for your cooperation.'),
                effects: [
                    { type: 'spend', resource: 'dirty', amount: BLACKMAIL_COST },
                    { type: 'trackTransfer', contactId: 'anonimo', amount: BLACKMAIL_COST },
                ],
            },
            {
                id: 'blackmail_ignore',
                text: bi('cai fora', 'get lost'),
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'blackmail_pay' },
                    { type: 'dialogueNotSeen', optionId: 'blackmail_ignore' },
                ],
                response: bi('Você vai se arrepender.', 'You\'ll regret this.'),
                effects: [{ type: 'adjust', resource: 'suspicion', delta: 50, min: 0, max: 100 }],
            },
        ],
    },

    // ── H4CKR (hacker) ──────────────────────────────────────────────────
    hacker: {
        characterId: 'hacker',
        options: [
            {
                id: 'buy_100_cpfs',
                text: `manda mais 100 CPFs [R$${fmt(500000)}]`,
                response: bi('transferido', 'transferred'),
                disabledResponse: (s: GameState) => {
                    const days = s.cpfCooldownUntilDay - s.day;
                    if (s.day < s.cpfCooldownUntilDay) {
                        return bi(
                            `perai que tenho que pegar mais dados. falta ${days} dia${days === 1 ? '' : 's'}`,
                            `hang on, need to grab more data. ${days} day${days === 1 ? '' : 's'} left`,
                        );
                    }
                    return bi('perai que tenho que pegar mais dados', 'hang on, need to grab more data');
                },
                effects: [
                    { type: 'spend', resource: 'dirty', amount: 500000 },
                    { type: 'gain', resource: 'cpfs', amount: 100 },
                    { type: 'trackTransfer', contactId: 'hacker', amount: 500000 },
                    { type: 'setDay', field: 'cpfCooldownUntilDay', offset: 3 },
                ],
                enabled: [
                    { type: 'resource', resource: 'dirty', op: 'gte', value: 500000 },
                    { type: 'custom', fn: (s: GameState) => s.debugNoCooldowns || s.day >= s.cpfCooldownUntilDay, description: 'cooldown expired' },
                ],
            },
            {
                id: 'buy_500_cpfs',
                text: `manda mais 500 CPFs [R$${fmt(2500000)}]`,
                response: bi('transferido', 'transferred'),
                disabledResponse: (s: GameState) => {
                    const days = s.cpfCooldownUntilDay - s.day;
                    if (s.day < s.cpfCooldownUntilDay) {
                        return bi(
                            `perai que tenho que pegar mais dados. falta ${days} dia${days === 1 ? '' : 's'}`,
                            `hang on, need to grab more data. ${days} day${days === 1 ? '' : 's'} left`,
                        );
                    }
                    return bi('perai que tenho que pegar mais dados', 'hang on, need to grab more data');
                },
                effects: [
                    { type: 'spend', resource: 'dirty', amount: 2500000 },
                    { type: 'gain', resource: 'cpfs', amount: 500 },
                    { type: 'trackTransfer', contactId: 'hacker', amount: 2500000 },
                    { type: 'setDay', field: 'cpfCooldownUntilDay', offset: 9 },
                ],
                enabled: [
                    { type: 'resource', resource: 'dirty', op: 'gte', value: 2500000 },
                    { type: 'custom', fn: (s: GameState) => s.debugNoCooldowns || s.day >= s.cpfCooldownUntilDay, description: 'cooldown expired' },
                ],
            },
            {
                id: 'investigate_bitcoin',
                text: bi('descobre de quem é este endereço', 'find out who owns this address'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('blackmail_intro') && s.investigateBitcoinDay === 0, description: 'blackmail received, not yet investigating' },
                    { type: 'dialogueSeen', optionId: 'blackmail_pay' },
                    { type: 'dialogueNotSeen', optionId: 'investigate_bitcoin_ask' },
                ],
                response: BTC_TRACK_RESPONSE,
                effects: [{ type: 'setDay', field: 'investigateBitcoinDay' }],
            },
            {
                id: 'investigate_bitcoin_after_pay',
                text: bi('paguei. confere agora', 'I paid. check it now'),
                visible: [
                    { type: 'dialogueSeen', optionId: 'investigate_bitcoin_ask' },
                    { type: 'dialogueSeen', optionId: 'blackmail_pay' },
                    { type: 'custom', fn: (s: GameState) => s.investigateBitcoinDay === 0, description: 'not yet investigating' },
                ],
                response: BTC_TRACK_RESPONSE,
                effects: [{ type: 'setDay', field: 'investigateBitcoinDay' }],
            },
            {
                id: 'investigate_bitcoin_ask',
                text: bi('descobre de quem é este endereço', 'find out who owns this address'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('blackmail_intro') && s.investigateBitcoinDay === 0 && !s.dialoguesSeen.includes('blackmail_pay'), description: 'blackmail received, not paid, not yet investigating' },
                ],
                response: bi('precisa do pagamento pra eu poder rastrear.', 'I need the payment before I can trace it.'),
            },
        ],
    },

    // ── Advogado (lawyer) ────────────────────────────────────────────────
    lawyer: {
        characterId: 'lawyer',
        options: [
            {
                id: 'lawyer_tudo_certo',
                text: bi('tudo certo?', 'all good?'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => !s.eventsTriggered.includes('pressure_warning_police'), description: 'no police warning yet' },
                ],
                response: bi('tudo em cima.', 'all good.'),
            },
            {
                id: 'lawyer_blinda',
                text: bi('blinda geral que a pf tá de olho', 'cover everything, the feds are watching'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('pressure_warning_police'), description: 'police warning active' },
                    { type: 'dialogueNotSeen', optionId: 'lawyer_blinda' },
                    { type: 'dialogueNotSeen', optionId: 'lawyer_blinda_bora' },
                    { type: 'dialogueNotSeen', optionId: 'lawyer_blinda_circulo' },
                ],
                response: bi(
                    'vamos espalhar o patrimônio e garantir o sigilo. vou precisar de um extra pra pagar meu contato na PF, ele vai me dar mais detalhes sobre a investigação.',
                    'we\'ll spread the assets and secure confidentiality. I\'ll need an extra to pay my contact at the feds — he\'ll give me more details on the investigation.',
                ),
            },
            {
                id: 'lawyer_blinda_bora',
                text: `bora rápido [R$${fmt(1000000)}]`,
                visible: [
                    { type: 'dialogueSeen', optionId: 'lawyer_blinda' },
                    { type: 'dialogueNotSeen', optionId: 'lawyer_blinda_bora' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: 1000000 }],
                response: bi('feito. ele me liga ainda hoje.', 'done. he\'ll call me today.'),
                disabledResponse: bi('preciso do valor antes de qualquer coisa.', 'I need the amount before anything else.'),
                effects: [
                    { type: 'spend', resource: 'dirty', amount: 1000000 },
                    { type: 'adjust', resource: 'suspicion', delta: -15 },
                    { type: 'trackTransfer', contactId: 'lawyer', amount: 1000000 },
                ],
            },
            {
                id: 'lawyer_blinda_circulo',
                text: bi('circulo depois', 'I\'ll circle back'),
                visible: [
                    { type: 'dialogueSeen', optionId: 'lawyer_blinda' },
                    { type: 'dialogueNotSeen', optionId: 'lawyer_blinda_bora' },
                ],
                response: bi('não deixa esfriar.', 'don\'t let it cool off.'),
            },
        ],
    },

    // ── Deputado (deputy) ────────────────────────────────────────────────
    deputy: {
        characterId: 'deputy',
        options: [
            {
                id: 'deputy_help_bc',
                text: bi(`O Banco Central tá em cima de mim. [R$${fmt(DEPUTY_COST)}]`, `The Central Bank is on my case. [R$${fmt(DEPUTY_COST)}]`),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.dialoguesSeen.includes('investigador_comply') || s.dialoguesSeen.includes('investigador_stall'), description: 'after investigador interaction' },
                    { type: 'dialogueNotSeen', optionId: 'deputy_help_bc' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: DEPUTY_COST }],
                response: bi(
                    `Posso fazer uns telefonemas. R$${fmt(DEPUTY_COST)}. Tenho uns amigos no judiciário que podem te apresentar alguém.`,
                    `I can make some calls. R$${fmt(DEPUTY_COST)}. I have friends in the judiciary who can introduce you to someone.`,
                ),
                disabledResponse: bi(
                    `Posso ajudar, mas custa R$${fmt(DEPUTY_COST)}. Volta quando tiver.`,
                    `I can help, but it costs R$${fmt(DEPUTY_COST)}. Come back when you have it.`,
                ),
                effects: [
                    { type: 'spend', resource: 'dirty', amount: DEPUTY_COST },
                    { type: 'adjust', resource: 'suspicion', delta: -10 },
                    { type: 'trackTransfer', contactId: 'deputy', amount: DEPUTY_COST },
                ],
            },
            {
                id: 'hire_deputy',
                text: bi(`Preciso que recuem. [R$${fmt(DEPUTY_COST)}]`, `I need them to back off. [R$${fmt(DEPUTY_COST)}]`),
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: DEPUTY_COST }],
                response: bi('Uma visita. Eles vão entender.', 'A visit. They\'ll understand.'),
                disabledResponse: bi(`R$${fmt(DEPUTY_COST)}. Não trabalho de graça.`, `R$${fmt(DEPUTY_COST)}. I don't work for free.`),
                effects: [
                    { type: 'spend', resource: 'dirty', amount: DEPUTY_COST },
                    { type: 'adjust', resource: 'pressure', delta: -20 },
                    { type: 'trackTransfer', contactId: 'deputy', amount: DEPUTY_COST },
                ],
            },
        ],
    },

    // ── Investigador ─────────────────────────────────────────────────────
    investigador: {
        characterId: 'investigador',
        options: [
            {
                id: 'investigador_comply',
                text: bi('Vou providenciar os documentos.', 'I will provide the documents.'),
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall' },
                ],
                response: bi(
                    'Ótimo. Aguardo em até 48 horas. Qualquer irregularidade será encaminhada ao Ministério Público.',
                    'Very well. I\'ll expect them within 48 hours. Any irregularity will be forwarded to the DA\'s office.',
                ),
            },
            {
                id: 'investigador_stall',
                text: bi('Posso ter mais tempo?', 'Can I have more time?'),
                visible: [
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall' },
                ],
                response: bi(
                    'Não. O prazo é regulamentar. Envie os documentos ou vamos abrir um processo formal.',
                    'No. The deadline is regulatory. Submit the documents or we will open a formal proceeding.',
                ),
                effects: [{ type: 'adjust', resource: 'suspicion', delta: 15 }],
            },
            {
                id: 'investigador_done',
                text: bi('Alguma novidade?', 'Any updates?'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.dialoguesSeen.includes('investigador_comply') || s.dialoguesSeen.includes('investigador_stall'), description: 'after investigador interaction' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply_followup' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall_followup' },
                ],
                response: bi('A análise está em andamento. Não saia do país.', 'The analysis is ongoing. Do not leave the country.'),
            },
            {
                id: 'investigador_comply_followup',
                text: bi('O que a análise encontrou?', 'What did the analysis find?'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('investigador_escalate_comply'), description: 'escalation fired' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_comply_followup' },
                ],
                response: bi(
                    'Movimentações que não batem com a renda declarada. Estamos trabalhando junto com a Receita Federal. Você vai querer um advogado.',
                    'Movements that don\'t match declared income. We\'re working with the tax authorities. You\'ll want a lawyer.',
                ),
            },
            {
                id: 'investigador_stall_followup',
                text: bi('Tá bem — vou cooperar.', 'Fine — I\'ll cooperate.'),
                visible: [
                    { type: 'custom', fn: (s: GameState) => s.eventsTriggered.includes('investigador_escalate_stall'), description: 'stall escalation fired' },
                    { type: 'dialogueNotSeen', optionId: 'investigador_stall_followup' },
                ],
                response: bi(
                    'O processo já foi aberto. Sua cooperação será anotada, mas não suspende a investigação.',
                    'The process has already been opened. Your cooperation will be noted, but it doesn\'t suspend the investigation.',
                ),
                effects: [{ type: 'adjust', resource: 'suspicion', delta: -5 }],
            },
        ],
    },

    // ── Juiz (judge) ─────────────────────────────────────────────────────
    judge: {
        characterId: 'judge',
        options: [
            {
                id: 'judge_intro_talk',
                text: bi('O deputado me mandou falar com o senhor.', 'The representative sent me to speak with you.'),
                visible: [
                    { type: 'dialogueSeen', optionId: 'deputy_help_bc' },
                    { type: 'dialogueNotSeen', optionId: 'judge_intro_talk' },
                ],
                response: bi(
                    'Nós não deveríamos estar tendo essa conversa. Mas... minha esposa tem um escritório de advocacia. Dra. Helena. Ela faz consultoria para orientação junto ao Supremo. Qualquer solicitação, fale diretamente com ela.',
                    'We shouldn\'t be having this conversation. But... my wife runs a law firm. Dr. Helena. She consults on matters before the Supreme Court. Any request, speak with her directly.',
                ),
            },
            {
                id: 'judge_first_offer',
                text: bi(`Preciso de mais tempo. [R$${fmt(JUDGE_COST)}]`, `I need more time. [R$${fmt(JUDGE_COST)}]`),
                visible: [{ type: 'dialogueSeen', optionId: 'judge_intro_talk' }],
                enabled: [
                    { type: 'resource', resource: 'dirty', op: 'gte', value: JUDGE_COST },
                    { type: 'hasBatches' },
                ],
                response: bi('Fica quieto. 30 dias — e não me ligue de novo tão cedo.', 'Stay quiet. 30 days — and don\'t call me again so soon.'),
                disabledResponse: bi('Não posso fazer nada sem ter o que estender.', 'I can\'t do anything without something to extend.'),
                effects: [
                    { type: 'spend', resource: 'dirty', amount: JUDGE_COST },
                    { type: 'extendBatch', index: 0, days: 30 },
                    { type: 'trackTransfer', contactId: 'judge', amount: JUDGE_COST },
                ],
            },
        ],
    },

    // ── Madame ───────────────────────────────────────────────────────────
    madame: {
        characterId: 'madame',
        options: [
            {
                id: 'madame_proposal',
                text: bi('Me disseram que a senhora pode ajudar.', 'I was told you could help.'),
                visible: [{ type: 'dialogueNotSeen', optionId: 'madame_proposal' }],
                response: bi(
                    `Posso. Ofereço um contrato de consultoria geral e assessoria para orientação junto ao Supremo Tribunal. O valor é R$${fmt(MADAME_COST)}. Quando estiver pronto, me avise.`,
                    `I can. I offer a general consulting contract and advisory services for guidance before the Supreme Court. The fee is R$${fmt(MADAME_COST)}. Let me know when you're ready.`,
                ),
            },
            {
                id: 'madame_negotiate',
                text: bi(`R$${fmt(MADAME_COST)} é muito. Tem como negociar?`, `R$${fmt(MADAME_COST)} is a lot. Can we negotiate?`),
                visible: [
                    { type: 'dialogueSeen', optionId: 'madame_proposal' },
                    { type: 'dialogueNotSeen', optionId: 'madame_pay' },
                ],
                response: bi(
                    'Não. O valor reflete a complexidade e os riscos envolvidos. Quando tiver o valor, me procure. Seus problemas vão desaparecer.',
                    'No. The fee reflects the complexity and risks involved. When you have the amount, come find me. Your problems will disappear.',
                ),
            },
            {
                id: 'madame_pay',
                text: bi(`Quero fechar o contrato (R$${fmt(MADAME_COST)})`, `I want to close the contract (R$${fmt(MADAME_COST)})`),
                visible: [
                    { type: 'dialogueSeen', optionId: 'madame_proposal' },
                    { type: 'dialogueNotSeen', optionId: 'madame_pay' },
                ],
                enabled: [{ type: 'resource', resource: 'dirty', op: 'gte', value: MADAME_COST }],
                response: bi(
                    'Excelente decisão. O contrato está assinado. A partir de agora, considere seus problemas resolvidos.',
                    'Excellent decision. The contract is signed. From now on, consider your problems resolved.',
                ),
                disabledResponse: bi(
                    'Sem pressa. Mas não demore — cada dia que passa, a situação fica mais delicada.',
                    'No rush. But don\'t wait too long — every day that passes, the situation gets more delicate.',
                ),
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

export const LEVEL_EVENTS: { [levelIdx: number]: LevelEvent } = {
    1: {
        title: bi("GERENTE", "MANAGER"),
        subtitle: bi("O esquema cresceu. Agora vem a atenção.", "The operation grew. Now comes the attention."),
        dialogues: [
            { from: 'drugdealer', text: bi(
                'Bom trabalho. O volume vai subir. E com ele, o risco.',
                'Good work. Volume is going up. And with it, the risk.',
            )},
            { from: 'druglord', text: bi(
                'Vicaro. Eu me chamo Hector. Direto ao ponto: o esquema cresceu, as transferências também. Preciso de 50 milhões limpos. Sem barulho, sem notícia, sem federal na porta.',
                'Vicaro. My name is Hector. Straight to the point: the operation grew, transfers too. I need 50 million clean. No noise, no press, no federal at the door.',
            )},
            { from: 'system', text: bi(
                'Novo contato apareceu no Zep. E uma mensagem do Banco Central.',
                'New contact appeared on Zep. And a message from the Central Bank.',
            )},
        ],
        unlocks: ['investigador', 'druglord'],
        payloads: [
            {
                type: 'incoming_message',
                contactId: 'investigador',
                text: bi(
                    'Boa tarde. Sou do departamento de compliance do Banco Central. Identificamos movimentações atípicas nas contas do Banco Meister. Precisamos dos seus registros para uma análise preliminar. Aguardo resposta em 48h.',
                    'Good afternoon. I\'m from the Central Bank compliance department. We have identified atypical movements in Banco Meister\'s accounts. We need your records for a preliminary analysis. I expect a response within 48 hours.',
                ),
            },
        ],
    },
    2: {
        title: bi("DOLEIRO", "MONEY CHANGER"),
        subtitle: bi("O jogo ficou mais pesado.", "The game got heavier."),
        dialogues: [],
        unlocks: [],
    },
    3: {
        title: bi("O MESTRE", "THE MASTER"),
        subtitle: bi("Agora é sobrevivência.", "Now it's survival."),
        dialogues: [],
        unlocks: [],
    },
};

// ============================================================================
// SCRIPTED EVENTS
// ============================================================================

export const SCRIPTED_EVENTS: ScriptedEvent[] = [
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
                    text: bi(
                        'eu sei o que você está fazendo. meu silencio custa 1 Bitcoin. mandar para: bc1q9x8yflhp5t4k0d3e2w7n6m1c8v0a4s3g7j2r5',
                        'i know what you\'re doing. my silence costs 1 Bitcoin. send to: bc1q9x8yflhp5t4k0d3e2w7n6m1c8v0a4s3g7j2r5',
                    ),
                },
            ],
        },
    },
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
                    text: bi(
                        'Soube que o BC tá te incomodando. Posso fazer uns telefonemas. Me procura.',
                        'Heard the CB is giving you trouble. I can make some calls. Come find me.',
                    ),
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
                    text: bi(
                        'Falei com um amigo meu. Dr. Gilmar. Ele pode te ajudar. Tá no seu Zep.',
                        'Spoke to a friend of mine. Dr. Gilmar. He can help you. He\'s on your Zep.',
                    ),
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
                    text: bi(
                        'Meu marido me disse que você precisa de orientação. Me procure quando quiser conversar.',
                        'My husband told me you need guidance. Come find me when you want to talk.',
                    ),
                },
            ],
        },
    },
    {
        id: 'bitcoin_investigation_result',
        trigger: (s) => s.investigateBitcoinDay > 0 && s.day >= s.investigateBitcoinDay + 10,
        payload: {
            type: 'incoming_message',
            contactId: 'hacker',
            text: bi(
                'esse endereço termina numa conta que é do CV. sujeira.',
                'that address leads to a CV account. dirty.',
            ),
        },
    },
    {
        id: 'pressure_warning_police',
        trigger: (s) => s.suspicion >= 75,
        payload: {
            type: 'incoming_message',
            contactId: 'drugdealer',
            text: bi(
                'Cuidado — os federais tão de olho. Esfria isso.',
                'Careful — the feds are watching. Cool it down.',
            ),
        },
    },
    {
        id: 'pressure_warning_cartel',
        trigger: (s) => s.pressure >= 75,
        payload: {
            type: 'incoming_message',
            contactId: 'drugdealer',
            text: bi('Isso tá demorando demais.', 'This is taking too long.'),
        },
    },
    {
        id: 'druglord_warning_1',
        trigger: (s) =>
            s.levelIdx >= 1 &&
            s.day >= s.levelStartDay + 30 &&
            s.totalPaid < 15_000_000 &&
            s.contacts['druglord'] === true,
        payload: {
            type: 'incoming_message',
            contactId: 'druglord',
            text: bi(
                'Tô esperando mais movimentação limpa. O ritmo tá abaixo do esperado. Isso não é pedido.',
                'I\'m expecting more clean movement. The pace is below expectations. This isn\'t a request.',
            ),
        },
    },
    {
        id: 'druglord_warning_2',
        trigger: (s) =>
            s.levelIdx >= 1 &&
            s.day >= s.levelStartDay + 60 &&
            s.totalPaid < 30_000_000 &&
            s.eventsTriggered.includes('druglord_warning_1'),
        payload: {
            type: 'incoming_message',
            contactId: 'druglord',
            text: bi(
                'Última vez que aviso com calma. Você não tá entregando. Isso tem consequências que você não vai gostar.',
                'Last time I ask calmly. You\'re not delivering. There are consequences you won\'t like.',
            ),
        },
    },
    {
        id: 'investigador_escalate_comply',
        trigger: (s) =>
            s.dialoguesSeen.includes('investigador_comply') &&
            s.day >= s.levelStartDay + 20,
        payload: {
            type: 'incoming_message',
            contactId: 'investigador',
            text: bi(
                'Vicaro. A análise identificou inconsistências nos registros enviados. Precisamos de uma conversa. Não é opcional.',
                'Vicaro. The analysis identified inconsistencies in the submitted records. We need to talk. This is not optional.',
            ),
        },
    },
    {
        id: 'investigador_escalate_stall',
        trigger: (s) =>
            s.dialoguesSeen.includes('investigador_stall') &&
            s.day >= s.levelStartDay + 10,
        payload: {
            type: 'incoming_message',
            contactId: 'investigador',
            text: bi(
                'Prazo vencido. O Banco Central abriu processo formal contra o Banco Meister. Você tem 72 horas para apresentar advogado.',
                'Deadline passed. The Central Bank has opened a formal proceeding against Banco Meister. You have 72 hours to present legal counsel.',
            ),
        },
    },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getCharacter = (characterId: string) => {
    return CHARACTERS[characterId as keyof typeof CHARACTERS];
};
