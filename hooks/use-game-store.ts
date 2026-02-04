// hooks/use-game-store.ts
import create from 'zustand';
import { GameState, Batch } from '../types/game';
import { LEVELS, STORY } from '../constants/game-data';

type GameStore = GameState & {
  actions: {
    tick: () => void;
    receiveBag: (amount: number) => void;
    setActiveScreen: (screen: 'bank' | 'zep' | 'chat') => void;
    setModal: (modal: GameState['modal']) => void;
    setSelectedLoanSize: (size: number) => void;
    confirmLoan: () => void;
    confirmPay: () => void;
    chat: (contactId: string) => void;
    buyCpf: (isTut: boolean, qtd: number) => void;
    addMessage: (text: string, me: boolean) => void;
    // Add other actions here
  };
};

const initialState: GameState = {
  day: 1,
  dirty: 0,
  clean: 0,
  cpfs: 0,
  suspicion: 0,
  pressure: 0,
  batches: [],
  levelIdx: 0,
  totalWashed: 0,
  contacts: { hacker: true, judge: false, deputy: false },
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
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,
  actions: {
    tick: () => {
      if (get().isPaused) return;

      set((state) => ({ day: state.day + 1 }));

      const lvl = LEVELS[get().levelIdx];

      // New Bag
      if (get().day >= get().nextBagDay) {
        get().actions.receiveBag(lvl.bagSize);
        set((state) => ({ nextBagDay: state.day + lvl.bagInterval + Math.floor(Math.random() * 5) }));
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
        set(state => ({
            dirty: state.dirty + amount,
            batches: [...state.batches, newBatch]
        }));
        // Missing: popup and floatText functionality
    },
    setActiveScreen: (screen) => {
        set({ activeScreen: screen });
    },
    setModal: (modal) => {
        set({ modal, isPaused: modal !== 'none' });
    },
    setSelectedLoanSize: (size) => {
        set({ selectedLoanSize: size });
    },
    confirmLoan: () => {
        const { dirty, cpfs, selectedLoanSize, levelIdx } = get();
        const cost = selectedLoanSize * 5000;

        if (dirty < cost) {
            // alert("Dinheiro sujo insuficiente");
            return;
        }
        if (cpfs < selectedLoanSize) {
            // alert("CPFs insuficientes");
            return;
        }

        const lvl = LEVELS[levelIdx];
        set(state => ({
            dirty: state.dirty - cost,
            clean: state.clean + cost,
            cpfs: state.cpfs - selectedLoanSize,
            totalWashed: state.totalWashed + cost,
            suspicion: state.suspicion + (selectedLoanSize * lvl.suspRate),
        }));

        if (get().suspicion >= 100) {
            // gameOver("PRESO", "A Polícia Federal te pegou.");
        }
        
        get().actions.setModal('none');
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
        set({ activeScreen: 'chat', currentChat: contactId, messages: [] });
        const { addMessage } = get().actions;

        if (contactId === 'hacker') {
            addMessage("Tenho pacotes novos.", false);
        } else if (contactId === 'judge') {
            addMessage("Como posso ajudar?", false);
        } else if (contactId === 'deputy') {
            addMessage("Preciso de doações para a campanha.", false);
        }
    },
    buyCpf: (isTut, qtd) => {
        const cost = isTut ? 100000 : (qtd * 5000);
        const amount = isTut ? 50 : qtd;
        const { addMessage } = get().actions;

        if (get().dirty >= cost) {
            set(state => ({
                dirty: state.dirty - cost,
                cpfs: state.cpfs + amount,
            }));
            addMessage("Transferindo...", true);
            setTimeout(() => {
                addMessage("Feito.", false);
            }, 500);
        } else {
            addMessage("Saldo insuficiente.", true);
        }
    },
    addMessage: (text, me) => {
        const newMessage = { id: Date.now().toString(), text, me };
        set(state => ({ messages: [...state.messages, newMessage] }));
    },
    // ... other actions from the original game object will be translated here
  }
}));
