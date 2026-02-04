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

export type ModalType = 'none' | 'loan' | 'pay' | 'msg';
