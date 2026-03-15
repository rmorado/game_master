// hooks/use-game-store.ts
import { create } from 'zustand';
import { GameState, Batch, DebtPack, BankOffer, EventPayload } from '../types/game';
import { LEVELS } from '../constants/game-data';
import { BANKS, SCRIPTED_EVENTS, DIALOGUES, LEVEL_EVENTS } from '../constants/dialogues';
import { formatMoney } from '../utils/format';

const MSG_POPUP_DURATION = 3000;

// ─── Timeout tracking (cleared on restart) ──────────────────────────────────

const pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

function trackedTimeout(fn: () => void, ms: number) {
    const id = setTimeout(() => {
        const idx = pendingTimeouts.indexOf(id);
        if (idx !== -1) pendingTimeouts.splice(idx, 1);
        fn();
    }, ms);
    pendingTimeouts.push(id);
}

// ─── Chat helper ────────────────────────────────────────────────────────────

function appendMsg(
    state: Pick<GameState, 'chatHistory' | 'unreadCounts'>,
    contactId: string,
    text: string,
    me: boolean,
    incrementUnread = false,
): Pick<GameState, 'chatHistory'> & Partial<Pick<GameState, 'unreadCounts'>> {
    const result: any = {
        chatHistory: {
            ...state.chatHistory,
            [contactId]: [
                ...(state.chatHistory[contactId] || []),
                { id: Date.now().toString(), text, me },
            ],
        },
    };
    if (incrementUnread) {
        result.unreadCounts = {
            ...state.unreadCounts,
            [contactId]: (state.unreadCounts[contactId] || 0) + 1,
        };
    }
    return result;
}

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
                ...appendMsg(s, payload.contactId, payload.text, false, true),
                showNewMessagePopup: true,
            }));
            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
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
        confirmLoan: (loanSize: number) => void;
        confirmPay: () => void;
        openSellModal: (packId: number) => void;
        sellDebtPack: (packId: number, offerValue: number) => void;
        respondToBag: (accept: boolean) => void;
        chat: (contactId: string) => void;
        advanceTutorial: () => void;
        dismissNewMessagePopup: () => void;
        chooseDialogueOption: (optionId: string) => void;
        advanceLevelDialogue: () => void;
        gameOver: (reason: string, detail: string) => void;
        restartGame: () => void;
    };
};

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: GameState = {
    day: 1,
    dirty: 5000000,
    clean: 0,
    cpfs: 0,
    suspicion: 0,
    pressure: 0,
    batches: [{ id: 1, due: 3500000, days: 90 }],
    debtPacks: [],
    currentSellPackId: null,
    bankOffers: [],
    hasPendingBag: false,
    pendingBagAmount: 0,
    hasUsedNotNow: false,
    levelIdx: 0,
    totalWashed: 0,
    contacts: { drugdealer: true, hacker: true },
    eventsTriggered: [],
    nextBagDay: 2,
    isPaused: true,
    isTyping: false,
    tutStep: 0,
    activeScreen: 'bank',
    modal: 'none',
    currentChat: null,
    chatHistory: { drugdealer: [], hacker: [] },
    unreadCounts: {},
    showNewMessagePopup: false,
    cpfsBoughtFromHacker: 0,
    hasUnlocked50Pack: false,
    unlockedDialogueOptions: [],
    hasFirstSoldPack: false,
    hasFirstPaidDebt: false,
    hasRespondedToBlackmail: false,
    hasCompletedInvestigador: false,
    hasPaidDeputado: false,
    hasContactedJuiz: false,
    hasPaidMadame: false,
    levelUpScreen: null,
    levelUpDialogueIdx: 0,
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

        advanceLevelDialogue: () => {
            const { levelUpScreen, levelUpDialogueIdx } = get();
            if (levelUpScreen === null) return;

            const event = LEVEL_EVENTS[levelUpScreen];
            if (!event) {
                set({ levelUpScreen: null, levelUpDialogueIdx: 0, isPaused: false });
                return;
            }

            const nextIdx = levelUpDialogueIdx + 1;
            if (nextIdx < event.dialogues.length) {
                set({ levelUpDialogueIdx: nextIdx });
            } else {
                if (event.unlocks) {
                    event.unlocks.forEach(contactId => {
                        fireEvent({ type: 'unlock_contact', contactId }, get, set);
                    });
                }
                if (event.payloads) {
                    event.payloads.forEach(p => fireEvent(p, get, set));
                }
                set({ levelUpScreen: null, levelUpDialogueIdx: 0, isPaused: false });
            }
        },

        gameOver: (reason, detail) => {
            set({ isGameOver: true, isPaused: true, gameOverReason: reason, gameOverDetail: detail });
        },

        restartGame: () => {
            pendingTimeouts.forEach(clearTimeout);
            pendingTimeouts.length = 0;
            set({ ...initialState });
        },

        tick: () => {
            if (get().isPaused || get().isGameOver) return;

            set(state => ({ day: state.day + 1 }));

            const state = get();
            const lvl = LEVELS[state.levelIdx];

            // ── Bag spawn ──
            if (state.day >= state.nextBagDay && !state.hasPendingBag) {
                const amount = lvl.bagSize;
                set(s => ({
                    hasPendingBag: true,
                    pendingBagAmount: amount,
                    showNewMessagePopup: true,
                    nextBagDay: s.day + lvl.bagInterval + Math.floor(Math.random() * 5),
                    ...appendMsg(s, 'drugdealer', `Tenho R$${formatMoney(amount)} pra lavar. Posso mandar agora?`, false, true),
                }));
                trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
            }

            // ── Debt countdown + default ──
            let critical = false;
            const updatedBatches: Batch[] = [];
            let pressureSpike = 0;

            for (const b of get().batches) {
                const newDays = b.days - 1;
                if (newDays <= 0) {
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
            if (get().pressure >= 100) {
                get().actions.gameOver("VINGANÇA DO CARTEL", "O Cartel cobra com juros.");
                return;
            }

            // ── Level progression ──
            const afterState = get();
            const currentLvl = LEVELS[afterState.levelIdx];
            if (
                currentLvl.goal !== null &&
                afterState.totalWashed >= currentLvl.goal &&
                afterState.levelIdx < 3
            ) {
                const newLevel = afterState.levelIdx + 1;
                set({
                    levelIdx: newLevel,
                    levelUpScreen: newLevel,
                    levelUpDialogueIdx: 0,
                    isPaused: true,
                });
            }
            // Track O Mestre start day
            if (get().levelIdx === 3 && get().omstreDayStart === 0) {
                set({ omstreDayStart: get().day });
            }

            // ── Scripted event loop ──
            const snapshot = get();
            if (snapshot.eventsTriggered.length < SCRIPTED_EVENTS.length) {
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
            }
        },

        receiveBag: (amount) => {
            const due = amount * 0.7;
            const newBatch: Batch = { id: Date.now(), due, days: 90 };

            set(s => ({
                dirty: s.dirty + amount,
                batches: [...s.batches, newBatch],
                showNewMessagePopup: true,
                ...appendMsg(s, 'drugdealer', `Malote de ${formatMoney(amount)} depositado. Movimenta isso logo.`, false, true),
            }));

            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
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

        confirmLoan: (loanSize: number) => {
            const { dirty, cpfs, levelIdx, day, tutStep } = get();
            const size = loanSize;
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
                hasFirstSoldPack: true,
                currentSellPackId: null,
                bankOffers: [],
            }));

            if (tutStep === 7) actions.advanceTutorial();
        },

        respondToBag: (accept: boolean) => {
            const { pendingBagAmount } = get();

            if (accept) {
                const due = Math.floor(pendingBagAmount * 0.7);
                const newBatch: Batch = { id: Date.now(), due, days: 90 };
                set(s => ({
                    dirty: s.dirty + pendingBagAmount,
                    batches: [...s.batches, newBatch],
                    ...appendMsg(s, 'drugdealer', 'OK, manda.', true),
                }));
                trackedTimeout(() => {
                    set(s => ({
                        ...appendMsg(s, 'drugdealer', `Feito. R$${formatMoney(pendingBagAmount)} mandados. Movimenta isso logo.`, false),
                    }));
                }, 500);
            } else {
                set(s => ({
                    ...appendMsg(s, 'drugdealer', 'Não agora.', true),
                    hasUsedNotNow: true,
                }));
                trackedTimeout(() => {
                    set(s => ({
                        ...appendMsg(s, 'drugdealer', 'Tudo bem. Te mando sinal quando for a hora.', false),
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
                hasFirstPaidDebt: true,
            }));

            get().actions.setModal('none');
        },

        chat: (contactId) => {
            const { tutStep, actions } = get();
            if (tutStep === 3 && contactId === 'hacker') actions.advanceTutorial();

            set(s => ({
                activeScreen: 'chat',
                currentChat: contactId,
                unreadCounts: { ...s.unreadCounts, [contactId]: 0 },
            }));
        },

        dismissNewMessagePopup: () => {
            set({ showNewMessagePopup: false });
        },

        chooseDialogueOption: (optionId: string) => {
            const state = get();
            const dialogue = DIALOGUES[state.currentChat!];

            if (!dialogue) return;

            const option = dialogue.outgoingOptions.find((o: any) => o.id === optionId);
            if (!option) return;

            if (option.condition && !option.condition(state)) return;

            const response = typeof option.response === 'function'
                ? option.response(state)
                : option.response;

            const currentChat = state.currentChat!;
            set(s => ({
                ...(option.action ? option.action(s) : {}),
                unlockedDialogueOptions: option.unlocks
                    ? [...s.unlockedDialogueOptions, ...option.unlocks]
                    : s.unlockedDialogueOptions,
                isTyping: true,
                ...appendMsg(s, currentChat, option.text, true),
            }));

            trackedTimeout(() => {
                set(s => ({
                    isTyping: false,
                    ...appendMsg(s, currentChat, response, false),
                }));

                const { tutStep, actions } = get();
                if (tutStep === 4 && optionId === 'buy_100_cpfs') {
                    actions.advanceTutorial();
                }
            }, 1000);
        },
    },
}));
