// hooks/use-game-store.ts
import { create } from 'zustand';
import { GameState, Batch, DebtPack, BankOffer, EventPayload } from '../types/game';
import { LEVELS } from '../constants/game-data';
import { BANKS, SCRIPTED_EVENTS } from '../constants/dialogues';

// ─── fireEvent helper ────────────────────────────────────────────────────────

function fireEvent(
    payload: EventPayload,
    get: () => GameStore,
    set: (partial: Partial<GameStore> | ((s: GameStore) => Partial<GameStore>)) => void
) {
    switch (payload.type) {
        case 'unlock_contact':
            set(s => ({
                contacts: { ...s.contacts, [payload.contactId]: true },
            }));
            break;
        case 'incoming_message':
            set(s => ({
                chatHistory: {
                    ...s.chatHistory,
                    [payload.contactId]: [
                        ...(s.chatHistory[payload.contactId] || []),
                        { id: Date.now().toString(), text: payload.text, me: false },
                    ],
                },
                unreadCounts: {
                    ...s.unreadCounts,
                    [payload.contactId]: (s.unreadCounts[payload.contactId] || 0) + 1,
                },
                showNewMessagePopup: true,
            }));
            setTimeout(() => set({ showNewMessagePopup: false }), 3000);
            break;
        case 'unlock_dialogue_option':
            set(s => ({
                unlockedDialogueOptions: [
                    ...s.unlockedDialogueOptions,
                    payload.optionId,
                ],
            }));
            break;
        case 'multi':
            payload.payloads.forEach(p => fireEvent(p, get, set));
            break;
    }
}

// ─── Store type ──────────────────────────────────────────────────────────────

type GameStore = GameState & {
    actions: {
        tick: () => void;
        receiveBag: (amount: number) => void;
        setActiveScreen: (screen: 'bank' | 'zep' | 'chat') => void;
        setModal: (modal: GameState['modal']) => void;
        setSelectedLoanSize: (size: number) => void;
        confirmLoan: (loanSize?: number) => void;
        confirmPay: () => void;
        openSellModal: (packId: number) => void;
        sellDebtPack: (packId: number, offerValue: number) => void;
        respondToBag: (accept: boolean) => void;
        chat: (contactId: string) => void;
        buyCpf: (isTut: boolean, qtd: number) => void;
        addMessage: (text: string, me: boolean) => void;
        advanceTutorial: () => void;
        dismissNewMessagePopup: () => void;
        chooseDialogueOption: (optionId: string) => void;
        gameOver: (reason: string, detail: string) => void;
        restartGame: () => void;
        addIncomingMessage: (contactId: string, text: string) => void;
    };
};

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: GameState = {
    day: 1,
    dirty: 500000,
    clean: 0,
    cpfs: 0,
    suspicion: 0,
    pressure: 0,
    batches: [],
    debtPacks: [],
    currentSellPackId: null,
    bankOffers: [],
    hasPendingBag: false,
    pendingBagAmount: 0,
    hasUsedNotNow: false,
    levelIdx: 0,
    totalWashed: 0,
    contacts: { drugdealer: true, hacker: true, judge: false, deputy: false, lawyer: false },
    eventsTriggered: [],
    nextBagDay: 2,
    isPaused: true,
    tutStep: 0,
    selectedLoanSize: 10,
    incomingEvent: null,
    activeScreen: 'bank',
    modal: 'none',
    currentChat: null,
    chatHistory: { drugdealer: [], hacker: [] },
    unreadCounts: {},
    showNewMessagePopup: false,
    cpfsBoughtFromHacker: 0,
    hasUnlocked50Pack: false,
    chatMode: null,
    unlockedDialogueOptions: [],
    isGameOver: false,
    gameOverReason: '',
    gameOverDetail: '',
    omstreDayStart: 0,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,
    actions: {
        advanceTutorial: () => {
            set(state => ({ tutStep: state.tutStep + 1 }));
        },

        gameOver: (reason, detail) => {
            set({ isGameOver: true, isPaused: true, gameOverReason: reason, gameOverDetail: detail });
        },

        restartGame: () => {
            set({ ...initialState });
        },

        addIncomingMessage: (contactId, text) => {
            set(s => ({
                chatHistory: {
                    ...s.chatHistory,
                    [contactId]: [
                        ...(s.chatHistory[contactId] || []),
                        { id: Date.now().toString(), text, me: false },
                    ],
                },
                unreadCounts: {
                    ...s.unreadCounts,
                    [contactId]: (s.unreadCounts[contactId] || 0) + 1,
                },
                showNewMessagePopup: true,
            }));
            setTimeout(() => set({ showNewMessagePopup: false }), 3000);
        },

        tick: () => {
            if (get().isPaused || get().isGameOver) return;

            set(state => ({ day: state.day + 1 }));

            const state = get();
            const lvl = LEVELS[state.levelIdx];

            // ── Bag spawn ──
            if (state.day >= state.nextBagDay && !state.hasPendingBag) {
                const amount = lvl.bagSize;
                const fmtM = (n: number) =>
                    n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : (n / 1_000).toFixed(0) + 'k';
                const offerMsg = {
                    id: Date.now().toString(),
                    text: `Tenho R$${fmtM(amount)} pra lavar. Posso mandar agora?`,
                    me: false,
                };
                set(s => ({
                    hasPendingBag: true,
                    pendingBagAmount: amount,
                    showNewMessagePopup: true,
                    nextBagDay: s.day + lvl.bagInterval + Math.floor(Math.random() * 5),
                    chatHistory: {
                        ...s.chatHistory,
                        drugdealer: [...(s.chatHistory.drugdealer || []), offerMsg],
                    },
                    unreadCounts: {
                        ...s.unreadCounts,
                        drugdealer: (s.unreadCounts.drugdealer || 0) + 1,
                    },
                }));
                setTimeout(() => set({ showNewMessagePopup: false }), 3000);
            }

            // ── Debt countdown + default ──
            let critical = false;
            const updatedBatches: Batch[] = [];
            let pressureSpike = 0;

            for (const b of get().batches) {
                const newDays = b.days - 1;
                if (newDays <= 0) {
                    // Batch defaulted — spike pressure
                    pressureSpike += 25;
                } else {
                    if (newDays < 30) critical = true;
                    updatedBatches.push({ ...b, days: newDays });
                }
            }

            set(s => ({
                batches: updatedBatches,
                pressure: Math.min(100, s.pressure + pressureSpike),
            }));

            // ── Pressure drift ──
            const current = get();
            if (critical) {
                set(s => ({ pressure: Math.min(100, s.pressure + 0.5) }));
            } else if (current.batches.length > 2) {
                set(s => ({ pressure: Math.min(100, s.pressure + 0.1) }));
            } else if (current.pressure > 0) {
                set(s => ({ pressure: Math.max(0, s.pressure - 0.1) }));
            }

            // ── Game over checks ──
            if (get().suspicion >= 100) {
                get().actions.gameOver("OPERAÇÃO POLICIAL", "A Polícia Federal fechou o cerco.");
                return;
            }
            if (get().pressure >= 100) {
                get().actions.gameOver("VINGANÇA DO CARTEL", "O Cartel cobra com juros.");
                return;
            }

            // ── Level progression ──
            const afterState = get();
            const currentLvl = LEVELS[afterState.levelIdx];
            if (
                currentLvl.goal !== null &&
                afterState.clean >= currentLvl.goal &&
                afterState.levelIdx < 3
            ) {
                set(s => ({ levelIdx: s.levelIdx + 1 }));
            }
            // Track O Mestre start day
            if (get().levelIdx === 3 && get().omstreDayStart === 0) {
                set({ omstreDayStart: get().day });
            }

            // ── Scripted event loop ──
            const snapshot = get();
            SCRIPTED_EVENTS.forEach(event => {
                if (
                    !snapshot.eventsTriggered.includes(event.id) &&
                    event.trigger(snapshot)
                ) {
                    fireEvent(event.payload, get, set);
                    set(s => ({
                        eventsTriggered: [...s.eventsTriggered, event.id],
                    }));
                }
            });
        },

        receiveBag: (amount) => {
            const due = amount * 0.7;
            const newBatch: Batch = { id: Date.now(), due, days: 90 };
            const fmtM = (n: number) => {
                if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
                if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k';
                return String(Math.floor(n));
            };
            const transferMsg = `Malote de ${fmtM(amount)} depositado. Movimenta isso logo.`;

            set(s => ({
                dirty: s.dirty + amount,
                batches: [...s.batches, newBatch],
                showNewMessagePopup: true,
                chatHistory: {
                    ...s.chatHistory,
                    drugdealer: [
                        ...(s.chatHistory.drugdealer || []),
                        { id: Date.now().toString(), text: transferMsg, me: false },
                    ],
                },
                unreadCounts: {
                    ...s.unreadCounts,
                    drugdealer: (s.unreadCounts.drugdealer || 0) + 1,
                },
            }));

            setTimeout(() => set({ showNewMessagePopup: false }), 3000);
        },

        setActiveScreen: (screen) => {
            const { tutStep, actions } = get();
            if (tutStep === 2 && screen === 'zep') actions.advanceTutorial();
            if (tutStep === 5 && screen === 'bank') actions.advanceTutorial();
            set({ activeScreen: screen });
        },

        setModal: (modal) => {
            set({ modal, isPaused: modal !== 'none' });
        },

        setSelectedLoanSize: (size) => {
            set({ selectedLoanSize: size });
        },

        confirmLoan: (loanSize?: number) => {
            const { dirty, cpfs, selectedLoanSize, levelIdx, day, tutStep } = get();
            const size = loanSize || selectedLoanSize;
            const cost = size * 5000;

            if (dirty < cost || cpfs < size) return;

            const lvl = LEVELS[levelIdx];
            const newPack: DebtPack = {
                id: Date.now(),
                value: cost,
                cpfsUsed: size,
                dayCreated: day,
            };

            set(s => ({
                dirty: s.dirty - cost,
                cpfs: s.cpfs - size,
                suspicion: s.suspicion + size * lvl.suspRate,
                debtPacks: [...s.debtPacks, newPack],
            }));

            if (tutStep === 6) get().actions.advanceTutorial();

            get().actions.setModal('none');
        },

        openSellModal: (packId: number) => {
            const pack = get().debtPacks.find(p => p.id === packId);
            if (!pack) return;

            const offers: BankOffer[] = BANKS.map(bank => {
                const discountRate = 0.10 + Math.random() * 0.10;
                return {
                    bankName: bank.name,
                    discountRate,
                    offerValue: Math.floor(pack.value * (1 - discountRate)),
                };
            });

            set({ currentSellPackId: packId, bankOffers: offers, modal: 'sell', isPaused: true });
        },

        sellDebtPack: (packId: number, offerValue: number) => {
            const { tutStep, actions, debtPacks, levelIdx } = get();
            const pack = debtPacks.find(p => p.id === packId);
            const lvl = LEVELS[levelIdx];
            const suspicionIncrease = pack
                ? Math.max(1, Math.round(pack.cpfsUsed * lvl.suspRate * 0.5))
                : 1;

            set(s => ({
                clean: s.clean + offerValue,
                totalWashed: s.totalWashed + offerValue,
                suspicion: s.suspicion + suspicionIncrease,
                debtPacks: s.debtPacks.filter(p => p.id !== packId),
                modal: 'none',
                isPaused: false,
                currentSellPackId: null,
                bankOffers: [],
            }));

            if (tutStep === 7) actions.advanceTutorial();
        },

        respondToBag: (accept: boolean) => {
            const { pendingBagAmount } = get();
            const now = Date.now();
            const fmtM = (n: number) =>
                n >= 1_000_000 ? (n / 1_000_000).toFixed(1) + 'M' : (n / 1_000).toFixed(0) + 'k';

            if (accept) {
                const due = Math.floor(pendingBagAmount * 0.7);
                const newBatch: Batch = { id: now, due, days: 90 };
                set(s => ({
                    dirty: s.dirty + pendingBagAmount,
                    batches: [...s.batches, newBatch],
                    chatHistory: {
                        ...s.chatHistory,
                        drugdealer: [
                            ...(s.chatHistory.drugdealer || []),
                            { id: now.toString(), text: 'OK, manda.', me: true },
                        ],
                    },
                }));
                setTimeout(() => {
                    set(s => ({
                        chatHistory: {
                            ...s.chatHistory,
                            drugdealer: [
                                ...(s.chatHistory.drugdealer || []),
                                {
                                    id: (Date.now() + 1).toString(),
                                    text: `Feito. R$${fmtM(pendingBagAmount)} mandados. Movimenta isso logo.`,
                                    me: false,
                                },
                            ],
                        },
                    }));
                }, 500);
            } else {
                set(s => ({
                    chatHistory: {
                        ...s.chatHistory,
                        drugdealer: [
                            ...(s.chatHistory.drugdealer || []),
                            { id: now.toString(), text: 'Não agora.', me: true },
                        ],
                    },
                    hasUsedNotNow: true,
                }));
                setTimeout(() => {
                    set(s => ({
                        chatHistory: {
                            ...s.chatHistory,
                            drugdealer: [
                                ...(s.chatHistory.drugdealer || []),
                                {
                                    id: (Date.now() + 1).toString(),
                                    text: 'Tudo bem. Te mando sinal quando for a hora.',
                                    me: false,
                                },
                            ],
                        },
                    }));
                }, 500);
            }

            set({ hasPendingBag: false, pendingBagAmount: 0 });
        },

        confirmPay: () => {
            const { clean, batches } = get();
            if (batches.length === 0) return;

            const debt = batches[0];
            const amount = Math.min(clean, debt.due);
            if (amount <= 0) return;

            const newBatches = [...batches];
            const updatedDebt = { ...debt, due: debt.due - amount };

            if (updatedDebt.due <= 0) {
                newBatches.shift();
            } else {
                newBatches[0] = updatedDebt;
            }

            set(s => ({
                clean: s.clean - amount,
                batches: newBatches,
                pressure: Math.max(0, s.pressure - 10),
            }));

            get().actions.setModal('none');
        },

        chat: (contactId) => {
            const { tutStep, actions } = get();
            if (tutStep === 3 && contactId === 'hacker') actions.advanceTutorial();

            set(s => ({
                activeScreen: 'chat',
                currentChat: contactId,
                chatMode: 'outgoing',
                unreadCounts: { ...s.unreadCounts, [contactId]: 0 },
            }));
        },

        buyCpf: (isTut, qtd) => {
            const { tutStep, actions } = get();
            if (tutStep === 4) actions.advanceTutorial();

            const cost = isTut ? 100000 : qtd * 5000;
            const amount = isTut ? 50 : qtd;
            const { addMessage } = get().actions;

            if (get().dirty >= cost) {
                set(s => ({
                    dirty: s.dirty - cost,
                    cpfs: s.cpfs + amount,
                }));
                const { SYSTEM_MESSAGES } = require('../constants/dialogues');
                addMessage(SYSTEM_MESSAGES.transferring, true);
                setTimeout(() => {
                    addMessage(SYSTEM_MESSAGES.done, false);
                }, 500);
            } else {
                const { SYSTEM_MESSAGES } = require('../constants/dialogues');
                addMessage(SYSTEM_MESSAGES.insufficientFunds, true);
            }
        },

        addMessage: (text, me) => {
            const { currentChat } = get();
            if (!currentChat) return;
            const newMessage = { id: Date.now().toString(), text, me };
            set(s => ({
                chatHistory: {
                    ...s.chatHistory,
                    [currentChat]: [...(s.chatHistory[currentChat] || []), newMessage],
                },
            }));
        },

        dismissNewMessagePopup: () => {
            set({ showNewMessagePopup: false });
        },

        chooseDialogueOption: (optionId: string) => {
            const state = get();
            const { DIALOGUES } = require('../constants/dialogues');
            const dialogue = DIALOGUES[state.currentChat!];

            if (!dialogue) return;

            const option = dialogue.outgoingOptions.find((o: any) => o.id === optionId);
            if (!option) return;

            if (option.condition && !option.condition(state)) return;

            const response = typeof option.response === 'function'
                ? option.response(state)
                : option.response;

            const stateChanges = option.action ? option.action(state) : {};

            const newUnlocks = option.unlocks
                ? [...state.unlockedDialogueOptions, ...option.unlocks]
                : state.unlockedDialogueOptions;

            const currentChat = state.currentChat!;
            set(s => ({
                ...stateChanges,
                unlockedDialogueOptions: newUnlocks,
                chatHistory: {
                    ...s.chatHistory,
                    [currentChat]: [
                        ...(s.chatHistory[currentChat] || []),
                        { id: Date.now().toString(), text: option.text, me: true },
                        { id: (Date.now() + 1).toString(), text: response, me: false },
                    ],
                },
            }));

            const { tutStep, actions } = get();
            if (tutStep === 4 && optionId === 'buy_10_cpfs') {
                actions.advanceTutorial();
            }
        },
    },
}));
