// types/game.ts

export interface Level {
    id: number;
    name: string;
    goal: number | null;   // null = O Mestre survival mode
    bagSize: number;
    suspRate: number;
}

// ─── Scripted Event System ───────────────────────────────────────────────────

export type EventPayload =
    | { type: 'unlock_contact'; contactId: string }
    | { type: 'incoming_message'; contactId: string; text: string }
    | { type: 'multi'; payloads: EventPayload[] };

export interface ScriptedEvent {
    id: string;
    trigger: (state: GameState) => boolean;
    payload: EventPayload;
}

// ─── Core Game State ─────────────────────────────────────────────────────────

export interface GameState {
    day: number;
    dirty: number;
    clean: number;
    cpfs: number;
    suspicion: number;
    pressure: number;
    batches: Batch[];
    debtPacks: DebtPack[];
    currentSellPackId: number | null;
    bankOffers: BankOffer[];
    levelIdx: number;
    totalWashed: number;
    totalReceived: number;
    totalPaid: number;
    transfersByContact: Record<string, number>;
    contacts: Record<string, boolean>;
    eventsTriggered: string[];
    isPaused: boolean;
    tutStep: number;
    activeApp: 'home' | 'zep' | 'chat' | 'laranjas' | 'bacen' | 'carteira' | 'dossie';
    modal: ModalType;
    currentChat: string | null;
    // Per-contact chat history (replaces messages[] and drugdealerMessages[])
    chatHistory: { [contactId: string]: Message[] };
    // Per-contact unread badge counts (replaces hasUnreadZepMessages)
    unreadCounts: { [contactId: string]: number };
    showNewMessagePopup: boolean;
    popupSender: string;
    popupPreview: string;
    // Pending bag (drug dealer offer)
    hasPendingBag: boolean;
    pendingBagAmount: number;
    hasUsedNotNow: boolean;
    consecutiveBagDeclines: number;
    // Dialogue system state
    dialoguesSeen: string[];
    investigateBitcoinDay: number;       // day when player asked hacker to trace BTC (0 = not started)
    cpfCooldownUntilDay: number;         // day when CPF cooldown expires (0 = no cooldown)
    debugNoCooldowns: boolean;
    // Loan processing (background)
    pendingLoan: { cpfCount: number; endsAt: number; durationMs: number } | null;
    // Auction system
    pendingAuctions: Array<{ packId: number; endDay: number; minPct: number; maxPct: number }>;
    completedAuctions: Array<{ packId: number; offers: BankOffer[] }>;
    // Toast notifications
    activeToast: { id: string; message: string; appId: 'laranjas' | 'bacen' } | null;
    // Chat typing indicator
    isTyping: boolean;
    // Level transition state
    levelUpScreen: number | null;       // levelIdx that was just reached, or null
    levelUpDialogueIdx: number;         // which dialogue in the sequence we're showing
    // Game over state
    isGameOver: boolean;
    gameOverReason: string;
    gameOverDetail: string;
    omstreDayStart: number;
    // Android-style nav
    navHistory: string[];
    visitedApps: string[];
    showAppOverview: boolean;
}

export interface Message {
    id: string;
    text: string;
    me: boolean;
}

export interface Batch {
    id: number;
    due: number;
    days: number;
}

export interface DebtPack {
    id: number;
    value: number;       // face value (cpfCount × 5000)
    cpfsUsed: number;
    dayCreated: number;
}

export interface BankOffer {
    bankName: string;
    discountRate: number;  // 0.10 to 0.20
    offerValue: number;
}

export type ModalType = 'none' | 'pay';

// ─── Level Transition System ────────────────────────────────────────────────

export interface LevelDialogue {
    from: string;       // character id (e.g. 'drugdealer', 'system')
    text: string;
}

export interface LevelEvent {
    title: string;                      // e.g. "GERENTE"
    subtitle?: string;                  // optional flavor text
    dialogues: LevelDialogue[];         // sequence of messages player taps through
    unlocks?: string[];                 // contact ids to unlock
    payloads?: EventPayload[];          // additional scripted event payloads to fire
}

// Tutorial step type
export interface TutorialStep {
    id: number;
    text: string;
    target: string | null;
    screen: GameState['activeApp'];
    boxPosition?: { top?: number; bottom?: number };
}

// ─── Declarative Dialogue System ────────────────────────────────────────────

export type ComparisonOp = 'gte' | 'lte' | 'gt' | 'lt' | 'eq';

export type Condition =
    | { type: 'resource'; resource: 'dirty' | 'clean' | 'cpfs' | 'suspicion' | 'pressure'; op: ComparisonOp; value: number | ((s: GameState) => number) }
    | { type: 'dialogueSeen'; optionId: string }
    | { type: 'dialogueNotSeen'; optionId: string }
    | { type: 'level'; op: ComparisonOp; value: number }
    | { type: 'hasBatches' }
    | { type: 'custom'; fn: (s: GameState) => boolean; description: string };

export type ConditionSet = Condition[];

export type Effect =
    | { type: 'spend'; resource: 'dirty' | 'clean'; amount: number | ((s: GameState) => number) }
    | { type: 'gain'; resource: 'dirty' | 'clean' | 'cpfs'; amount: number | ((s: GameState) => number) }
    | { type: 'adjust'; resource: 'suspicion' | 'pressure'; delta: number; min?: number; max?: number }
    | { type: 'set'; resource: 'suspicion' | 'pressure'; value: number }
    | { type: 'extendBatch'; index: number; days: number }
    | { type: 'trackTransfer'; contactId: string; amount: number | ((s: GameState) => number) }
    | { type: 'setDay'; field: 'investigateBitcoinDay' | 'cpfCooldownUntilDay'; offset?: number }
    | { type: 'requestBag' }
    | { type: 'acceptBag' }
    | { type: 'declineBag' }
    | { type: 'gameOver'; reason: string; detail: string };

export interface DialogueOption {
    id: string;
    text: string | ((s: GameState) => string);
    visible?: ConditionSet;
    enabled?: ConditionSet;
    response: string | ((s: GameState) => string);
    disabledResponse?: string | ((s: GameState) => string);
    effects?: Effect[];
}

export interface CharacterDialogue {
    characterId: string;
    options: DialogueOption[];
}
