# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**O Mestre** is a mobile money laundering simulation game built with Expo and React Native. Players manage dirty money from criminal organizations, convert it to clean money through fake bank loans, and progress through 4 difficulty levels while managing federal police suspicion and cartel pressure.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (choose platform from interactive menu)
npm start
# or: npx expo start

# Run on specific platforms
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser

# Linting
npm run lint
```

## Architecture Overview

### State Management with Zustand

The entire game state lives in a **single Zustand store** at `hooks/use-game-store.ts`. This is the source of truth for all game data and logic.

**Key state properties:**
- `day`, `dirty`, `clean`, `cpfs` - Core resources
- `suspicion`, `pressure` - Gauges that trigger game over at 100%
- `batches[]` - Debt queue with 90-day deadlines
- `levelIdx` - Current level (0-3)
- `activeScreen` - Determines which screen renders ('bank' | 'zep' | 'chat')
- `modal` - Active modal overlay ('loan' | 'pay' | 'msg' | 'none')
- `tutStep` - Tutorial progress (0-7, then complete)
- `hasUnreadZepMessages` - Controls red dot badge on ZEP nav button
- `showNewMessagePopup` - Controls money transfer notification popup
- `drugdealerMessages[]` - Separate message array for drugdealer chat

**Critical actions:**
- `tick()` - Game loop (runs every 1 second). Handles bag spawning, debt countdown, pressure calculation
- `receiveBag()` - Adds dirty money + creates debt batch + triggers money transfer notification
- `confirmLoan(cpfAmount)` - Converts dirty→clean money, increases suspicion
- `confirmPay()` - Pays oldest debt from clean money
- `buyCpf(qty)` - Purchases fake IDs from hacker (costs dirty money)
- `markZepMessagesAsRead()` - Clears notification badge when user opens ZEP screen
- `dismissNewMessagePopup()` - Manually dismisses money transfer popup

### Component Architecture

```
app/(tabs)/game.tsx (MAIN GAME CONTAINER)
├── Runs setInterval(tick, 1000) - the game loop
├── Renders based on activeScreen state:
│   ├── BankScreen - Primary UI (money, gauges, debt queue, actions)
│   ├── ZepScreen - Contact list (drugdealer, hacker, judge, deputy, lawyer)
│   └── ChatScreen - Contact interaction UI
├── NavBar - Bottom navigation (bank/zep) with notification badge
├── Modal overlays (controlled by modal state):
│   ├── LoanModal - Create fake loans (choose 10/50/100 CPFs)
│   └── PayModal - Pay debts from clean money
├── TutorialOverlay - Contextual hints (8 steps)
└── NewMessagePopup - Money transfer notification (auto-dismisses after 3s)
```

**Screen navigation:** Use `setActiveScreen('bank' | 'zep' | 'chat')` from the store. Do NOT use React Navigation for in-game screens.

### Game Mechanics Flow

1. **Receive Bags**: Criminal organization sends dirty money every X days (interval decreases with level)
2. **Buy CPFs**: Contact hacker via ZepScreen → ChatScreen, purchase fake IDs (1 CPF = 5k dirty)
3. **Create Loans**: BankScreen → Open LoanModal → Select CPF amount → Converts dirty→clean
4. **Pay Debts**: BankScreen shows debt queue → Open PayModal → Pay 70% of original loan
5. **Progression**: Clean money advances level when reaching levelGoal (500k → 5M → 20M → 1B)

**Key constraints:**
- Suspicion increases when creating loans (`cpfAmount × level.suspRate`)
- Pressure increases as debts approach deadline (90 days countdown)
- Game over if: suspicion ≥ 100% (police) OR pressure ≥ 100% (cartel revenge) OR debt unpaid at deadline

### Critical Files

| File | Purpose | When to Modify |
|------|---------|----------------|
| `hooks/use-game-store.ts` | **All game state and logic** | Adding mechanics, balancing, new actions |
| `constants/dialogues.ts` | All text content, character data, avatars | Changing text, adding characters, translations |
| `constants/game-data.ts` | Level configs, tutorial steps, contacts | Balancing difficulty, changing progression |
| `components/BankScreen.tsx` | Primary UI, shows money/gauges/debts | UI changes to main screen |
| `components/NewMessagePopup.tsx` | Money transfer notification popup | Notification styling, behavior |
| `components/NavBar.tsx` | Bottom navigation with badge system | Navigation UI, badge styling |
| `app/(tabs)/game.tsx` | Game loop coordinator, screen router | Changing tick interval, screen routing |
| `types/game.ts` | TypeScript interfaces | Adding new state properties or types |

### Tutorial System

The tutorial (`TutorialOverlay.tsx`) is **integrated into game actions**. When implementing new features:
1. Tutorial steps are defined in `constants/game-data.ts`
2. Actions in `use-game-store.ts` call `advanceTutorial()` when conditions match
3. Tutorial automatically shows contextual hints based on `tutStep` and `activeScreen`

To add a new tutorial step:
1. Add entry to `tutorialSteps[]` in `game-data.ts`
2. Add advancement logic to relevant action in `use-game-store.ts`
3. Update `TutorialOverlay.tsx` positioning/targeting if needed

### Level Progression

Levels are defined in `constants/game-data.ts` as `levels[]`:
```typescript
{
  title: string,           // e.g., "Laranja", "O Mestre"
  levelGoal: number,       // Clean money needed to advance
  bagSize: number,         // Dirty money per bag
  nextBagIntervalDays: number,  // Days between bags
  suspRate: number         // Suspicion cost per CPF when creating loans
}
```

Level changes trigger automatically in `tick()` when `clean >= currentLevel.levelGoal`.

### Money System

- **Dirty money**: Received from bags, used to buy CPFs
- **Clean money**: Created via loans (costs dirty money + CPFs), used to pay debts and advance levels
- **Loan mechanics**: Creating a loan of N CPFs costs `N × 5000` dirty money, generates `N × 5000` clean money, adds `N × suspRate` suspicion
- **Debt repayment**: Must pay 70% of original loan amount within 90 days

### Styling and Theming

Theme definitions in `constants/theme.ts`:
- Light/dark color schemes (uses device color scheme)
- Typography: `sans` (main UI), `serif` (decorative), `rounded` (friendly), `mono` (code/numbers)
- Components use `useColorScheme()` hook to access current theme

### Common Development Patterns

**Adding a new action button:**
1. Add handler function to `use-game-store.ts` actions
2. Call via `useGameStore(s => s.actionName)` in component
3. Update tutorial if action should be taught

**Adding a new contact:**
1. Add character to `CHARACTERS` object in `constants/dialogues.ts` with avatar, name, greeting, offers
2. Add character ID to `contacts` object in GameState initial state
3. Contact appears automatically in `ZepScreen` via `getCharacter()` helper
4. Implement chat responses in `ChatScreen.tsx`

**Adding character images:**
- Place images in `assets/images/characters/`
- Reference via `require('../assets/images/characters/filename.jpg')` in dialogues.ts
- React Native Image component automatically handles local requires

**Implementing notifications:**
- Set notification flags (`hasUnreadZepMessages`, `showNewMessagePopup`) in store action
- Create separate message array if messages should persist independently
- Auto-clear notifications in screen navigation (`setActiveScreen`) or via setTimeout
- Add badge rendering to NavBar using conditional rendering

**Modifying game balance:**
- Edit `levels[]` in `game-data.ts` for difficulty curves
- Edit formulas in `confirmLoan()`, `tick()`, `receiveBag()` in `use-game-store.ts`

**State debugging:**
- All state visible via `useGameStore.getState()` in console
- Use `isPaused` state to freeze game for debugging
