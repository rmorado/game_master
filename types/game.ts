// types/game.ts

export interface Level {
    id: number;
    name: string;
    goal: number | null;   // null = O Mestre survival mode
    bagSize: number;
    bagInterval: number;
    maxBatch: number;
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
    contacts: {
        drugdealer: boolean;
        hacker: boolean;
        judge: boolean;
        deputy: boolean;
        lawyer: boolean;
    };
    eventsTriggered: string[];
    nextBagDay: number;
    isPaused: boolean;
    tutStep: number;
    selectedLoanSize: number;
    incomingEvent: any | null;
    activeScreen: 'bank' | 'zep' | 'chat';
    modal: ModalType;
    currentChat: string | null;
    // Per-contact chat history (replaces messages[] and drugdealerMessages[])
    chatHistory: { [contactId: string]: Message[] };
    // Per-contact unread badge counts (replaces hasUnreadZepMessages)
    unreadCounts: { [contactId: string]: number };
    showNewMessagePopup: boolean;
    // Pending bag (drug dealer offer)
    hasPendingBag: boolean;
    pendingBagAmount: number;
    hasUsedNotNow: boolean;
    // Dialogue system state
    cpfsBoughtFromHacker: number;
    hasUnlocked50Pack: boolean;
    chatMode: 'incoming' | 'outgoing' | null;
    unlockedDialogueOptions: string[];
    // Game over state
    isGameOver: boolean;
    gameOverReason: string;
    gameOverDetail: string;
    omstreDayStart: number;
}

export interface Message {
    id: string;
    text: string;
    me: boolean;
    unread?: boolean;
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

export type ModalType = 'none' | 'loan' | 'pay' | 'msg' | 'sell';

// Dialogue system types
export interface DialogueOption {
    id: string;
    text: string;
    condition?: (state: GameState) => boolean;
    response: string | ((state: GameState) => string);
    action?: (state: GameState) => Partial<GameState>;
    unlocks?: string[];
}

export interface CharacterDialogue {
    characterId: string;
    outgoingOptions: DialogueOption[];
    incomingOptions?: DialogueOption[];
}
