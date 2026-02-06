// types/game.ts

export interface GameState {
    day: number;
    dirty: number;
    clean: number;
    cpfs: number;
    suspicion: number;
    pressure: number;
    batches: Batch[];
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
    incomingEvent: any | null; // You might want to define a type for events
    activeScreen: 'bank' | 'zep' | 'chat';
    modal: ModalType;
    currentChat: string | null;
    messages: Message[];
    hasUnreadZepMessages: boolean;
    showNewMessagePopup: boolean;
    drugdealerMessages: Message[];
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

export type ModalType = 'none' | 'loan' | 'pay' | 'msg';

// Dialogue system types
export interface DialogueOption {
    id: string;                          // Unique identifier
    text: string;                        // Button text shown to player

    // Conditional visibility
    condition?: (state: GameState) => boolean;  // Show option if true

    // Response handling
    response: string | ((state: GameState) => string);  // Character's reply

    // Side effects
    action?: (state: GameState) => Partial<GameState>;  // State changes

    // Unlocks
    unlocks?: string[];                  // IDs of options to unlock after choosing this
}

export interface CharacterDialogue {
    characterId: string;

    // Player-initiated: options shown when player opens chat
    outgoingOptions: DialogueOption[];

    // Character-initiated: options shown when replying to character's message
    incomingOptions?: DialogueOption[];
}
