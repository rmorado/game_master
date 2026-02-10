// types/game.ts

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
    messages: Message[];
    hasUnreadZepMessages: boolean;
    showNewMessagePopup: boolean;
    drugdealerMessages: Message[];
    // Pending bag (drug dealer offer)
    hasPendingBag: boolean;
    pendingBagAmount: number;
    hasUsedNotNow: boolean;
    // Dialogue system state
    cpfsBoughtFromHacker: number;
    hasUnlocked50Pack: boolean;
    chatMode: 'incoming' | 'outgoing' | null;
    unlockedDialogueOptions: string[];
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
