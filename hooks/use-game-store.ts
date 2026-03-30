// hooks/use-game-store.ts
import { create } from 'zustand';
import { GameState, Batch, DebtPack, BankOffer, EventPayload } from '../types/game';
import { LEVELS, BAG_DIRTY_THRESHOLD } from '../constants/game-data';
import { BANKS, SCRIPTED_EVENTS, DIALOGUES, LEVEL_EVENTS, TUTORIAL, UI_CHAT } from '../constants/dialogues';
import { formatMoney } from '../utils/format';
import { evaluateConditionSet, applyEffects } from '../utils/dialogue';

const MSG_POPUP_DURATION = 2000;

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

let msgIdCounter = 0;

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
                { id: String(++msgIdCounter), text, me },
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

function notifyPopup(
    state: Pick<GameState, 'chatHistory' | 'unreadCounts'>,
    contactId: string,
    text: string,
) {
    return {
        ...appendMsg(state, contactId, text, false, true),
        showNewMessagePopup: true,
        popupSender: contactId,
        popupPreview: text.slice(0, 60),
    };
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
            set(s => notifyPopup(s, payload.contactId, payload.text));
            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
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
        setActiveApp: (app: GameState['activeApp']) => void;
        setModal: (modal: GameState['modal']) => void;
        confirmLoan: (loanSize: number) => void;
        confirmPay: () => void;
        openSellModal: (packId: number) => void;
        sellDebtPack: (packId: number, offerValue: number) => void;
        respondToBag: (accept: boolean) => void;
        chat: (contactId: string) => void;
        advanceTutorial: () => void;
        skipTutorial: () => void;
        dismissNewMessagePopup: () => void;
        chooseDialogueOption: (optionId: string) => void;
        advanceLevelDialogue: () => void;
        gameOver: (reason: string, detail: string) => void;
        restartGame: () => void;
        goBack: () => void;
        toggleAppOverview: () => void;
        payPCC: (amount: number) => void;
        debugForceLevel: (idx: number) => void;
        debugAddResources: (dirty: number, clean: number, cpfs: number) => void;
    };
};

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: GameState = {
    day: 1,
    dirty: 20000000,
    clean: 0,
    cpfs: 0,
    suspicion: 0,
    pressure: 0,
    batches: [{ id: 1, due: 14000000, days: 90 }],
    debtPacks: [],
    currentSellPackId: null,
    bankOffers: [],
    hasPendingBag: false,
    pendingBagAmount: 0,
    hasUsedNotNow: false,
    bagRejectedOnDay: 0,
    bagEscalationStage: 0,
    levelIdx: 0,
    totalWashed: 0,
    totalReceived: 0,
    totalPaid: 0,
    transfersByContact: {},
    contacts: { drugdealer: true, hacker: true },
    eventsTriggered: [],
    isPaused: true,
    isTyping: false,
    tutStep: 0,
    activeApp: 'home',
    modal: 'none',
    currentChat: null,
    chatHistory: { drugdealer: [], hacker: [] },
    unreadCounts: {},
    showNewMessagePopup: false,
    popupSender: '',
    popupPreview: '',
    dialoguesSeen: [],
    investigateBitcoinDay: 0,
    levelUpScreen: null,
    levelUpDialogueIdx: -1,
    isGameOver: false,
    gameOverReason: '',
    gameOverDetail: '',
    omstreDayStart: 0,
    navHistory: [],
    visitedApps: ['home'],
    showAppOverview: false,
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useGameStore = create<GameStore>((set, get) => ({
    ...initialState,
    actions: {
        advanceTutorial: () => {
            set(state => ({ tutStep: state.tutStep + 1 }));
        },

        skipTutorial: () => {
            set({ tutStep: TUTORIAL.length, isPaused: false });
        },

        advanceLevelDialogue: () => {
            const { levelUpScreen, levelUpDialogueIdx } = get();
            if (levelUpScreen === null) return;

            const event = LEVEL_EVENTS[levelUpScreen];
            if (!event) {
                set({ levelUpScreen: null, levelUpDialogueIdx: -1, isPaused: false });
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
                set({ levelUpScreen: null, levelUpDialogueIdx: -1, isPaused: false });
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
            const { isPaused, isGameOver } = get();
            if (isPaused || isGameOver) return;

            set(state => ({ day: state.day + 1 }));

            const state = get();
            const lvl = LEVELS[state.levelIdx];

            // ── Bag spawn (threshold-based) ──
            if (state.tutStep >= TUTORIAL.length && state.dirty <= BAG_DIRTY_THRESHOLD && !state.hasPendingBag) {
                const amount = lvl.bagSize;
                const bagMsg = `Tenho R$${formatMoney(amount)} pra lavar. Posso mandar agora?`;
                set(s => ({
                    hasPendingBag: true,
                    pendingBagAmount: amount,
                    ...notifyPopup(s, 'drugdealer', bagMsg),
                }));
                trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
            }

            // ── Bag rejection escalation ──
            const bagState = get();
            if (bagState.hasPendingBag && bagState.hasUsedNotNow && bagState.bagRejectedOnDay > 0) {
                const daysSinceReject = bagState.day - bagState.bagRejectedOnDay;
                if (daysSinceReject >= 30 && bagState.bagEscalationStage < 3) {
                    set(s => ({
                        bagEscalationStage: 3,
                        pressure: Math.min(100, s.pressure + 5),
                    }));
                } else if (daysSinceReject >= 20 && bagState.bagEscalationStage < 2) {
                    set(s => ({
                        bagEscalationStage: 2,
                        ...appendMsg(s, 'drugdealer', UI_CHAT.escalation2, false, true),
                    }));
                } else if (daysSinceReject >= 10 && bagState.bagEscalationStage < 1) {
                    set(s => ({
                        bagEscalationStage: 1,
                        ...appendMsg(s, 'drugdealer', UI_CHAT.escalation1, false, true),
                    }));
                }
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
                afterState.totalPaid >= currentLvl.goal &&
                afterState.levelIdx < 3
            ) {
                const newLevel = afterState.levelIdx + 1;
                set({
                    levelIdx: newLevel,
                    levelUpScreen: newLevel,
                    levelUpDialogueIdx: -1,
                    isPaused: true,
                });
            }
            // Track O Mestre start day
            const { levelIdx: currentLevelIdx, omstreDayStart, day: currentDay } = get();
            if (currentLevelIdx === 3 && omstreDayStart === 0) {
                set({ omstreDayStart: currentDay });
            }

            // ── Scripted event loop ──
            const snapshot = get();
            if (snapshot.tutStep >= TUTORIAL.length && snapshot.eventsTriggered.length < SCRIPTED_EVENTS.length) {
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

            const depositMsg = `Malote de ${formatMoney(amount)} depositado. Movimenta isso logo.`;
            set(s => ({
                dirty: s.dirty + amount,
                totalReceived: s.totalReceived + amount,
                batches: [...s.batches, newBatch],
                ...notifyPopup(s, 'drugdealer', depositMsg),
            }));

            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
        },

        setActiveApp: (app) => {
            const { tutStep, actions, activeApp, navHistory, visitedApps } = get();
            if (tutStep === 2 && app === 'zep') actions.advanceTutorial();
            if (tutStep === 6 && app === 'laranjas') actions.advanceTutorial();
            if (tutStep === 9 && app === 'bacen') actions.advanceTutorial();
            if (tutStep === 13 && app === 'carteira') actions.advanceTutorial();
            const isPaused = app === 'laranjas' || app === 'bacen' || app === 'dossie';
            const newHistory = activeApp !== app ? [...navHistory, activeApp].slice(-20) : navHistory;
            const newVisited = visitedApps.includes(app) ? visitedApps : [...visitedApps, app];
            set({ activeApp: app, isPaused, navHistory: newHistory, visitedApps: newVisited, showAppOverview: false });
        },

        goBack: () => {
            const { navHistory, tutStep, actions } = get();
            if (tutStep === 5) actions.advanceTutorial();
            if (navHistory.length === 0) {
                actions.setActiveApp('home');
                return;
            }
            const prev = navHistory[navHistory.length - 1] as GameState['activeApp'];
            const isPaused = prev === 'laranjas' || prev === 'bacen' || prev === 'dossie';
            set({ activeApp: prev, isPaused, navHistory: navHistory.slice(0, -1), showAppOverview: false });
        },

        toggleAppOverview: () => {
            set(s => ({ showAppOverview: !s.showAppOverview }));
        },

        payPCC: (amount: number) => {
            const { clean, batches, tutStep } = get();
            if (amount <= 0 || clean < amount) return;
            let remaining = amount;
            const newBatches = [...batches].sort((a, b) => a.id - b.id);
            const kept: typeof batches = [];
            for (const batch of newBatches) {
                if (remaining >= batch.due) {
                    remaining -= batch.due;
                } else {
                    kept.push(batch);
                }
            }
            set(s => ({
                clean: clean - amount,
                batches: kept,
                totalPaid: s.totalPaid + amount,
                transfersByContact: { ...s.transfersByContact, drugdealer: (s.transfersByContact.drugdealer ?? 0) + amount },
                ...(tutStep === 15 ? { tutStep: 16 } : {}),
                ...notifyPopup(s, 'drugdealer', UI_CHAT.pccConfirmation),
            }));
            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
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

            if (tutStep === 7) get().actions.advanceTutorial();
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

            set({ currentSellPackId: packId, bankOffers: offers, activeApp: 'bacen', isPaused: true });
            if (get().tutStep === 11) get().actions.advanceTutorial();
        },

        sellDebtPack: (packId: number, offerValue: number) => {
            const { debtPacks, levelIdx } = get();
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
                currentSellPackId: null,
                bankOffers: [],
                activeApp: 'home' as const,
                isPaused: false,
            }));

        },

        respondToBag: (accept: boolean) => {
            const { pendingBagAmount, day } = get();

            if (accept) {
                const due = pendingBagAmount * 0.7;
                const newBatch: Batch = { id: Date.now(), due, days: 90 };
                set(s => ({
                    dirty: s.dirty + pendingBagAmount,
                    totalReceived: s.totalReceived + pendingBagAmount,
                    batches: [...s.batches, newBatch],
                    hasPendingBag: false,
                    pendingBagAmount: 0,
                    hasUsedNotNow: false,
                    bagRejectedOnDay: 0,
                    bagEscalationStage: 0,
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
                    bagRejectedOnDay: day,
                    bagEscalationStage: 0,
                }));
                trackedTimeout(() => {
                    set(s => ({
                        ...appendMsg(s, 'drugdealer', 'Tudo bem. Te mando sinal quando for a hora.', false),
                    }));
                }, 500);
            }
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
                activeApp: 'chat',
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

            const option = dialogue.options.find(o => o.id === optionId);
            if (!option) return;

            // Check visibility
            if (option.visible && !evaluateConditionSet(option.visible, state)) return;

            const isEnabled = !option.enabled || evaluateConditionSet(option.enabled, state);

            // Pick response based on enabled state
            const response = isEnabled
                ? (typeof option.response === 'function' ? option.response(state) : option.response)
                : (option.disabledResponse
                    ? (typeof option.disabledResponse === 'function' ? option.disabledResponse(state) : option.disabledResponse)
                    : null);
            if (!response) return;

            const playerText = typeof option.text === 'function' ? option.text(state) : option.text;
            const currentChat = state.currentChat!;

            // Apply effects only when enabled
            const effectPatch = isEnabled && option.effects
                ? applyEffects(option.effects, state)
                : {};

            set(s => ({
                ...effectPatch,
                dialoguesSeen: [...s.dialoguesSeen, optionId],
                isTyping: true,
                ...appendMsg(s, currentChat, playerText, true),
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

        debugForceLevel: (idx: number) => {
            set({ levelIdx: idx, levelUpScreen: idx, levelUpDialogueIdx: -1, isPaused: true });
        },

        debugAddResources: (dirty: number, clean: number, cpfs: number) => {
            set(s => ({ dirty: s.dirty + dirty, clean: s.clean + clean, cpfs: s.cpfs + cpfs }));
        },
    },
}));
