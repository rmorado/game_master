// hooks/use-game-store.ts
import { create } from 'zustand';
import { BANKS, DIALOGUES, LEVEL_EVENTS, SCRIPTED_EVENTS, TUTORIAL } from '../constants/dialogues';
import { BAG_DIRTY_THRESHOLD, CPF_COST, LEVELS } from '../constants/game-data';
import { BankOffer, Batch, DebtPack, EventPayload, GameState, Lang, NewsItem } from '../types/game';
import { pickHeadline } from '../constants/news';
import { applyEffects, evaluateConditionSet, resolveBi } from '../utils/dialogue';
import { formatMoney } from '../utils/format';

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

// ─── Auction helper ─────────────────────────────────────────────────────────

function generateOffers(packValue: number, minPct: number, maxPct: number): BankOffer[] {
    return BANKS.map(bank => {
        const pct = minPct + Math.random() * (maxPct - minPct);
        return { bankName: bank.name, discountRate: 1 - pct, offerValue: Math.floor(packValue * pct) };
    });
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
        case 'incoming_message': {
            const lang = get().language;
            const text = resolveBi(payload.text, lang);
            set(s => notifyPopup(s, payload.contactId, text));
            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
            break;
        }
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
        startLoan: (cpfCount: number, durationMs: number) => void;
        completeLoan: () => void;
        confirmPay: () => void;
        startAuction: (packId: number, days: number, minPct: number, maxPct: number) => void;
        claimAuction: (packId: number) => void;
        cancelOffers: () => void;
        sellDebtPack: (packId: number, offerValue: number) => void;
        showToast: (message: string, appId: 'laranjas' | 'bacen') => void;
        clearToast: () => void;
        chat: (contactId: string) => void;
        advanceTutorial: () => void;
        skipTutorial: () => void;
        dismissNewMessagePopup: () => void;
        dismissNewsPopup: () => void;
        chooseDialogueOption: (optionId: string) => void;
        advanceLevelDialogue: () => void;
        gameOver: (reason: string, detail: string) => void;
        restartGame: () => void;
        goBack: () => void;
        toggleAppOverview: () => void;
        payPCC: (amount: number) => void;
        setLanguage: (lang: Lang) => void;
        debugForceLevel: (idx: number) => void;
        debugAddResources: (dirty: number, clean: number, cpfs: number) => void;
        debugToggleNoCooldowns: () => void;
    };
};

// ─── Initial state ───────────────────────────────────────────────────────────

const initialState: GameState = {
    day: 1,
    dirty: 5_000_000,
    clean: 0,
    cpfs: 0,
    suspicion: 0,
    pressure: 0,
    batches: [{ id: 1, due: 3_000_000, days: 90 }],
    debtPacks: [],
    currentSellPackId: null,
    bankOffers: [],
    hasPendingBag: false,
    pendingBagAmount: 0,
    hasUsedNotNow: false,
    consecutiveBagDeclines: 0,
    levelIdx: 0,
    totalWashed: 0,
    totalReceived: 5_000_000,
    totalPaid: 0,
    transfersByContact: {},
    contacts: { drugdealer: true, hacker: true, lawyer: true },
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
    cpfCooldownUntilDay: 0,
    debugNoCooldowns: false,
    pendingLoan: null,
    pendingAuctions: [],
    completedAuctions: [],
    activeToast: null,
    levelUpScreen: null,
    levelUpDialogueIdx: -1,
    isGameOver: false,
    gameOverReason: '',
    gameOverDetail: '',
    omstreDayStart: 0,
    levelStartDay: 1,
    navHistory: [],
    visitedApps: ['home'],
    showAppOverview: false,
    language: 'pt' as Lang,
    langPicker: true,
    newsHistory: [],
    currentNews: null,
    showNewsPopup: false,
    counterThisWeek: false,
    lastNewsDay: 0,
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
                const bagMsg = state.pressure >= 100
                    ? 'tou mandando agora'
                    : state.pressure >= 40
                        ? 'Tou mandando ssaporra pra vc lavar'
                        : 'Mandando umas roupas pra lavanderia';
                set(s => ({
                    hasPendingBag: true,
                    pendingBagAmount: amount,
                    ...notifyPopup(s, 'drugdealer', bagMsg),
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
                afterState.totalPaid >= currentLvl.goal &&
                afterState.levelIdx < 3
            ) {
                const newLevel = afterState.levelIdx + 1;
                set({
                    levelIdx: newLevel,
                    levelUpScreen: newLevel,
                    levelUpDialogueIdx: -1,
                    isPaused: true,
                    levelStartDay: afterState.day,
                });
            }
            // Track O Mestre start day
            const { levelIdx: currentLevelIdx, omstreDayStart, day: currentDay } = get();
            if (currentLevelIdx === 3 && omstreDayStart === 0) {
                set({ omstreDayStart: currentDay });
            }

            // ── Auction completion ──
            const preAuction = get();
            const nowCompleted = preAuction.pendingAuctions.filter(a => preAuction.day >= a.endDay);
            if (nowCompleted.length > 0) {
                for (const auction of nowCompleted) {
                    const pack = preAuction.debtPacks.find(p => p.id === auction.packId);
                    if (!pack) continue;
                    const offers = generateOffers(pack.value, auction.minPct, auction.maxPct);
                    set(s => ({
                        pendingAuctions: s.pendingAuctions.filter(a => a.packId !== auction.packId),
                        completedAuctions: [...s.completedAuctions, { packId: auction.packId, offers }],
                    }));
                }
                get().actions.showToast('proposta disponível', 'bacen');
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

            // ── Weekly news ──
            const newsState = get();
            if (newsState.day - newsState.lastNewsDay >= 7) {
                const headline = pickHeadline(newsState.suspicion, newsState.counterThisWeek, newsState.levelIdx);
                const item: NewsItem = { day: newsState.day, subject: headline.subject, pt: headline.pt, en: headline.en };
                set(s => ({
                    newsHistory: [item, ...s.newsHistory].slice(0, 5),
                    currentNews: item,
                    showNewsPopup: true,
                    counterThisWeek: false,
                    lastNewsDay: newsState.day,
                }));
                trackedTimeout(() => set({ showNewsPopup: false }), 5000);
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
                ...notifyPopup(s, 'drugdealer', '🔥'),
            }));
            trackedTimeout(() => set({ showNewMessagePopup: false }), MSG_POPUP_DURATION);
        },

        setModal: (modal) => {
            set({ modal, isPaused: modal !== 'none' });
        },

        startLoan: (cpfCount: number, durationMs: number) => {
            const { dirty, cpfs, tutStep, pendingLoan } = get();
            const cost = cpfCount * CPF_COST;
            if (dirty < cost || cpfs < cpfCount || pendingLoan !== null) return;

            const inTutorial = tutStep > 0 && tutStep < TUTORIAL.length;

            set(s => ({
                dirty: s.dirty - cost,
                cpfs: s.cpfs - cpfCount,
                pendingLoan: inTutorial ? null : { cpfCount, endsAt: Date.now() + durationMs, durationMs },
            }));

            if (tutStep === 7) get().actions.advanceTutorial();

            if (inTutorial) {
                const { levelIdx: lvlIdx, day } = get();
                const lvl = LEVELS[lvlIdx];
                const newPack: DebtPack = { id: Date.now(), value: cost, cpfsUsed: cpfCount, dayCreated: day };
                set(s => ({
                    debtPacks: [...s.debtPacks, newPack],
                    suspicion: s.suspicion + cpfCount * lvl.suspRate,
                }));
            } else {
                trackedTimeout(() => get().actions.completeLoan(), durationMs);
            }
        },

        completeLoan: () => {
            const { pendingLoan, levelIdx, day } = get();
            if (!pendingLoan) return;
            const { cpfCount } = pendingLoan;
            const lvl = LEVELS[levelIdx];
            const newPack: DebtPack = { id: Date.now(), value: cpfCount * CPF_COST, cpfsUsed: cpfCount, dayCreated: day };
            set(s => ({
                pendingLoan: null,
                debtPacks: [...s.debtPacks, newPack],
                suspicion: s.suspicion + cpfCount * lvl.suspRate,
            }));
            get().actions.showToast('derivativo criado', 'laranjas');
        },

        startAuction: (packId: number, days: number, minPct: number, maxPct: number) => {
            const { tutStep, debtPacks } = get();
            const inTutorial = tutStep > 0 && tutStep < TUTORIAL.length;

            if (inTutorial) {
                const pack = debtPacks.find(p => p.id === packId);
                if (!pack) return;
                const offers = generateOffers(pack.value, minPct, maxPct);
                set(s => ({ completedAuctions: [...s.completedAuctions, { packId, offers }] }));
            } else {
                set(s => ({ pendingAuctions: [...s.pendingAuctions, { packId, endDay: s.day + days, minPct, maxPct }] }));
            }
        },

        claimAuction: (packId: number) => {
            const { completedAuctions } = get();
            const entry = completedAuctions.find(a => a.packId === packId);
            if (!entry) return;
            set(s => ({
                currentSellPackId: packId,
                bankOffers: entry.offers,
                isPaused: true,
                completedAuctions: s.completedAuctions.filter(a => a.packId !== packId),
            }));
        },

        cancelOffers: () => {
            const { currentSellPackId, bankOffers } = get();
            if (!currentSellPackId) return;
            set(s => ({
                completedAuctions: [...s.completedAuctions, { packId: currentSellPackId, offers: bankOffers }],
                currentSellPackId: null,
                bankOffers: [],
                isPaused: false,
            }));
        },

        showToast: (message: string, appId: 'laranjas' | 'bacen') => {
            set({ activeToast: { id: Date.now().toString(), message, appId } });
        },

        clearToast: () => {
            set({ activeToast: null });
        },

        sellDebtPack: (packId: number, offerValue: number) => {
            const { debtPacks, levelIdx } = get();
            const pack = debtPacks.find(p => p.id === packId);
            const lvl = LEVELS[levelIdx];
            const suspicionIncrease = pack
                ? Math.max(1, Math.round(pack.cpfsUsed * lvl.suspRate * 0.5))
                : 1;

            const inTutorial = get().tutStep === 11;
            set(s => ({
                clean: s.clean + offerValue,
                totalWashed: s.totalWashed + offerValue,
                suspicion: s.suspicion + suspicionIncrease,
                debtPacks: s.debtPacks.filter(p => p.id !== packId),
                currentSellPackId: null,
                bankOffers: [],
                // In tutorial, stay on BACEN so step 12 overlay is visible
                activeApp: inTutorial ? ('bacen' as const) : ('home' as const),
                isPaused: false,
            }));

            if (inTutorial) get().actions.advanceTutorial();
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

            set(s => ({ unreadCounts: { ...s.unreadCounts, [contactId]: 0 }, currentChat: contactId }));
            actions.setActiveApp('chat');
        },

        dismissNewMessagePopup: () => {
            set({ showNewMessagePopup: false });
        },

        dismissNewsPopup: () => {
            set({ showNewsPopup: false });
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

            // Pick response based on enabled state, resolve Bi to current language
            const lang = state.language;
            const rawResponse = isEnabled
                ? (typeof option.response === 'function' ? option.response(state) : option.response)
                : (option.disabledResponse
                    ? (typeof option.disabledResponse === 'function' ? option.disabledResponse(state) : option.disabledResponse)
                    : null);
            if (!rawResponse) return;
            const response = resolveBi(rawResponse, lang);

            const rawText = typeof option.text === 'function' ? option.text(state) : option.text;
            const playerText = resolveBi(rawText, lang);
            const currentChat = state.currentChat!;

            // Apply effects only when enabled — gameOver is deferred to after response
            const allEffects = (isEnabled && option.effects) ? option.effects : [];
            const immediateEffects = allEffects.filter(e => e.type !== 'gameOver');
            const deferredEffects = allEffects.filter(e => e.type === 'gameOver');
            const effectPatch = immediateEffects.length > 0 ? applyEffects(immediateEffects, state) : {};

            set(s => ({
                ...effectPatch,
                dialoguesSeen: [...s.dialoguesSeen, optionId],
                isTyping: true,
                ...appendMsg(s, currentChat, playerText, true),
            }));

            trackedTimeout(() => {
                const deferredPatch = deferredEffects.length > 0 ? applyEffects(deferredEffects, get()) : {};
                set(s => ({
                    isTyping: false,
                    ...appendMsg(s, currentChat, response, false),
                    ...deferredPatch,
                }));

                const { tutStep, actions } = get();
                if (tutStep === 4 && optionId === 'buy_100_cpfs') {
                    actions.advanceTutorial();
                }
            }, 1000);
        },

        setLanguage: (lang: Lang) => {
            set({ language: lang, langPicker: false });
        },

        debugForceLevel: (idx: number) => {
            set({ levelIdx: idx, levelUpScreen: idx, levelUpDialogueIdx: -1, isPaused: true });
        },

        debugAddResources: (dirty: number, clean: number, cpfs: number) => {
            set(s => ({ dirty: s.dirty + dirty, clean: s.clean + clean, cpfs: s.cpfs + cpfs }));
        },

        debugToggleNoCooldowns: () => {
            set(s => ({ debugNoCooldowns: !s.debugNoCooldowns }));
        },
    },
}));
