// types/game.ts

export interface Level {
    id: number;
    name: string;
    goal: number | null;   // null = O Mestre survival mode
    bagSize: number;
    bagInterval: number;
    suspRate: number;
}

// ─── Scripted Event System ───────────────────────────────────────────────────

export type EventPayload =
    | { type: 'unlock_contact'; contactId: string }
    | { type: 'incoming_message'; contactId: string; text: string }
    | { type: 'unlock_dialogue_option'; optionId: string }
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
    nextBagDay: number;
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
    bagRejectedOnDay: number;
    bagEscalationStage: number;
    // Dialogue system state
    unlockedDialogueOptions: string[];
    // Blackmail event state
    hasRespondedToBlackmail: boolean;
    investigateBitcoinDay: number;       // day when player asked hacker to trace BTC (0 = not started)
    // Gerente chain state
    hasCompletedInvestigador: boolean;
    hasPaidDeputado: boolean;
    hasContactedJuiz: boolean;
    hasPaidMadame: boolean;
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

// Dialogue system types
export interface DialogueOption {
    id: string;
    text: string;
    showCondition?: (state: GameState) => boolean;
    condition?: (state: GameState) => boolean;
    response: string | ((state: GameState) => string);
    action?: (state: GameState) => Partial<GameState>;
    unlocks?: string[];
    requiresUnlock?: boolean;
}

export interface CharacterDialogue {
    characterId: string;
    outgoingOptions: DialogueOption[];
}
