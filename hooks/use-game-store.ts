// hooks/use-game-store.ts
import { create } from 'zustand';
import { GameState, Batch, DebtPack, BankOffer } from '../types/game';
import { LEVELS, STORY } from '../constants/game-data';
import { BANKS } from '../constants/dialogues';

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
    markZepMessagesAsRead: () => void;
    chooseDialogueOption: (optionId: string) => void;
  };
};

const initialState: GameState = {
  day: 1,
  dirty: 500000, // Start with some dirty money for tutorial
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
  messages: [],
  hasUnreadZepMessages: false,
  showNewMessagePopup: false,
  drugdealerMessages: [],
  // Dialogue system state
  cpfsBoughtFromHacker: 0,
  hasUnlocked50Pack: false,
  chatMode: null,
  unlockedDialogueOptions: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  actions: {
    advanceTutorial: () => {
        set(state => ({ tutStep: state.tutStep + 1 }));
    },
    tick: () => {
      if (get().isPaused) return;

      set((state) => ({ day: state.day + 1 }));

      const lvl = LEVELS[get().levelIdx];

      // New Bag — notify player via ZEP instead of auto-delivering
      if (get().day >= get().nextBagDay && !get().hasPendingBag) {
        const amount = lvl.bagSize;
        const fmtM = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : (n/1000).toFixed(0)+'k';
        const offerMsg = {
          id: Date.now().toString(),
          text: `Tenho R$${fmtM(amount)} pra lavar. Posso mandar agora?`,
          me: false,
          unread: true,
        };
        set(state => ({
          hasPendingBag: true,
          pendingBagAmount: amount,
          hasUnreadZepMessages: true,
          showNewMessagePopup: true,
          nextBagDay: state.day + lvl.bagInterval + Math.floor(Math.random() * 5),
          drugdealerMessages: [...state.drugdealerMessages, offerMsg],
        }));
        setTimeout(() => set({ showNewMessagePopup: false }), 3000);
      }

      // Batches
      let critical = false;
      const updatedBatches = get().batches.map(b => {
        const newDays = b.days - 1;
        if (newDays <= 0) {
          // gameOver("PRAZO ESTOURADO", "O Cartel não perdoa calotes.");
        }
        if (newDays < 30) critical = true;
        return { ...b, days: newDays };
      });
      set({ batches: updatedBatches });


      // Pressure
      if (critical) set(state => ({ pressure: state.pressure + 0.5 }));
      else if (get().batches.length > 2) set(state => ({ pressure: state.pressure + 0.1 }));
      else if (get().pressure > 0) set(state => ({ pressure: state.pressure - 0.1 }));

      if (get().pressure >= 100) {
        // gameOver("COBRANÇA MÁXIMA", "Fim da linha.");
      }

      // Story & Level
      // ... (story logic will be added later)
    },
    receiveBag: (amount) => {
        const due = amount * 0.7;
        const newBatch: Batch = { id: Date.now(), due, days: 90 };
        const formatMoney = (n: number) => {
            if(n >= 1000000) return (n/1000000).toFixed(1) + "M";
            if(n >= 1000) return (n/1000).toFixed(0) + "k";
            return Math.floor(n);
        };

        set(state => ({
            dirty: state.dirty + amount,
            batches: [...state.batches, newBatch],
            hasUnreadZepMessages: true,
            showNewMessagePopup: true,
        }));

        // Store money transfer message for drugdealer chat
        const transferMessage = `Malote de ${formatMoney(amount)} depositado. Movimenta isso logo.`;
        const drugdealerMessages = get().drugdealerMessages || [];
        set({ drugdealerMessages: [...drugdealerMessages, { id: Date.now().toString(), text: transferMessage, me: false, unread: true }] });

        // Auto-dismiss popup after 3 seconds
        setTimeout(() => {
            set({ showNewMessagePopup: false });
        }, 3000);
    },
    setActiveScreen: (screen) => {
        const { tutStep, actions } = get();
        if (tutStep === 2 && screen === 'zep') actions.advanceTutorial();
        if (tutStep === 5 && screen === 'bank') actions.advanceTutorial();

        // Mark ZEP messages as read when opening ZEP screen
        if (screen === 'zep') {
            actions.markZepMessagesAsRead();
        }

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

        set(state => ({
            dirty: state.dirty - cost,
            cpfs: state.cpfs - size,
            suspicion: state.suspicion + (size * lvl.suspRate),
            debtPacks: [...state.debtPacks, newPack],
        }));

        // Advance tutorial after pack is created
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

        set(state => ({
            clean: state.clean + offerValue,
            totalWashed: state.totalWashed + offerValue,
            suspicion: state.suspicion + suspicionIncrease,
            debtPacks: state.debtPacks.filter(p => p.id !== packId),
            modal: 'none',
            isPaused: false,
            currentSellPackId: null,
            bankOffers: [],
        }));

        // Advance tutorial after first sell
        if (tutStep === 7) actions.advanceTutorial();
    },
    respondToBag: (accept: boolean) => {
        const { pendingBagAmount } = get();
        const now = Date.now();
        const fmtM = (n: number) => n >= 1000000 ? (n/1000000).toFixed(1)+'M' : (n/1000).toFixed(0)+'k';

        if (accept) {
            // Deliver the money + create debt batch inline (no extra notification)
            const due = Math.floor(pendingBagAmount * 0.7);
            const newBatch: Batch = { id: now, due, days: 90 };
            set(state => ({
                dirty: state.dirty + pendingBagAmount,
                batches: [...state.batches, newBatch],
                drugdealerMessages: [...state.drugdealerMessages,
                    { id: now.toString(), text: 'OK, manda.', me: true },
                ],
            }));
            setTimeout(() => {
                set(state => ({
                    drugdealerMessages: [...state.drugdealerMessages,
                        { id: (Date.now()+1).toString(), text: `Feito. R$${fmtM(pendingBagAmount)} mandados. Movimenta isso logo.`, me: false },
                    ],
                }));
            }, 500);
        } else {
            set(state => ({
                drugdealerMessages: [...state.drugdealerMessages,
                    { id: now.toString(), text: 'Não agora.', me: true },
                ],
                hasUsedNotNow: true,
            }));
            setTimeout(() => {
                set(state => ({
                    drugdealerMessages: [...state.drugdealerMessages,
                        { id: (Date.now()+1).toString(), text: 'Tudo bem. Te mando sinal quando for a hora.', me: false },
                    ],
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
        
        set(state => ({
            clean: state.clean - amount,
            batches: newBatches,
            pressure: Math.max(0, state.pressure - 10),
        }));

        get().actions.setModal('none');
    },
    chat: (contactId) => {
        const { tutStep, actions } = get();
        if (tutStep === 3 && contactId === 'hacker') actions.advanceTutorial();

        set({
            activeScreen: 'chat',
            currentChat: contactId,
            chatMode: 'outgoing',  // Player initiated
            messages: []  // No greeting - dialogue options show immediately
        });
    },
    buyCpf: (isTut, qtd) => {
        const { tutStep, actions } = get();
        if (tutStep === 4) actions.advanceTutorial();

        const cost = isTut ? 100000 : (qtd * 5000);
        const amount = isTut ? 50 : qtd;
        const { addMessage } = get().actions;

        if (get().dirty >= cost) {
            set(state => ({
                dirty: state.dirty - cost,
                cpfs: state.cpfs + amount,
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
        const newMessage = { id: Date.now().toString(), text, me };
        set(state => ({ messages: [...state.messages, newMessage] }));
    },
    dismissNewMessagePopup: () => {
        set({ showNewMessagePopup: false });
    },
    markZepMessagesAsRead: () => {
        set({ hasUnreadZepMessages: false });
        // Mark all drugdealer messages as read
        const drugdealerMessages = get().drugdealerMessages || [];
        const updatedMessages = drugdealerMessages.map(msg => ({ ...msg, unread: false }));
        set({ drugdealerMessages: updatedMessages });
    },
    chooseDialogueOption: (optionId: string) => {
        const state = get();
        const { DIALOGUES } = require('../constants/dialogues');
        const dialogue = DIALOGUES[state.currentChat!];

        if (!dialogue) return;

        const option = dialogue.outgoingOptions.find((o: any) => o.id === optionId);

        if (!option) return;

        // Check condition
        if (option.condition && !option.condition(state)) return;

        // Get response
        const response = typeof option.response === 'function'
            ? option.response(state)
            : option.response;

        // Execute action
        const stateChanges = option.action ? option.action(state) : {};

        // Handle unlocks
        const newUnlocks = option.unlocks
            ? [...state.unlockedDialogueOptions, ...option.unlocks]
            : state.unlockedDialogueOptions;

        // Update state
        set({
            ...stateChanges,
            unlockedDialogueOptions: newUnlocks,
            messages: [
                ...state.messages,
                { id: Date.now().toString(), text: option.text, me: true },
                { id: (Date.now() + 1).toString(), text: response, me: false }
            ]
        });

        // Tutorial advancement
        const { tutStep, actions } = get();
        if (tutStep === 4 && optionId === 'buy_10_cpfs') {
            actions.advanceTutorial();
        }
    },
    // ... other actions from the original game object will be translated here
  }
}));
