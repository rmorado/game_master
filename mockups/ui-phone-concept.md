---
status: approved
date: 2026-03-26
mockup: design/mockups/home-screen.html
---

# UI — Phone Interface Concept

## Overview

The entire game is framed as the player's burner phone. There is no "game UI" —
only a cheap Android device running a handful of apps that together constitute a
criminal financial operation. The phone looks slightly worn, the signal is always
weak, the battery is always low.

---

## Home Screen

A dark Android-style home screen. Wallpaper is a photo — something mundane and
vaguely threatening (a figure in low light). A gradient overlay darkens the top
and bottom thirds so the status bar and app grid remain legible over the image.

Status bar at the top shows fake time, signal bars, WiFi, and battery percentage.
A Dynamic Island sits centered at the top.

Apps are arranged in a **4-column grid, anchored to the bottom** of the screen,
leaving the wallpaper visible in the upper half. This gives the home screen
negative space and lets the wallpaper carry visual weight. Notification badges
appear as red circles with counts on apps with pending actions.

App icons are 62×62px with 16px corner radius, 26–28px gap between them.
Each has a colored gradient background and an SVG or emoji icon — slightly
hand-crafted, not generic. Labels below each icon in small white text.

---

## The Apps

| App | Icon | Maps to | Badge triggers |
|-----|------|---------|----------------|
| **ZEP** | Green speech bubble (SVG) | Messaging — all contacts | New unread message |
| **BACEN** | Bold letter "A" on purple gradient | Sell derivatives to other banks | Debt approaching deadline |
| **Laranjas** | 🍊 orange emoji on orange gradient | Fake loan creation | Available CPFs to deploy |
| **Calendário** | 📅 emoji on blue gradient | Debt deadlines on a 90-day calendar | Deadline within 7 days |
| **Carteira** | Green vault SVG on black | Dirty money balance + bag history | New bag received |
| **Dossiê** | 📁 emoji on red gradient | Suspicion %, pressure %, level, day count | Suspicion or pressure > 70% |
| **News** | Newspaper layout SVG on blue gradient | Fake Brazilian news feed | Breaking gameplay-impact headline |

---

## App Breakdown

### ZEP

WhatsApp clone. Dark theme (`#0f0f0f` background, `#111` header).

**Header**: "ZEP" wordmark in green (`#22c55e`), search and overflow icons.
**Search bar**: Dark pill (`#1e1e1e`), placeholder "Buscar conversa...".
**Contact list**: Two sections — *Recentes* and *Outros*. Each row shows a
colored circular avatar with initials, contact name, last message preview,
timestamp, and unread badge (green). Sent messages prefixed with green `✓✓`.
**Floating action button**: Green circle, bottom-right, chat bubble icon.

Contacts in order: Traficante (green), O Chefe / Druglord (red), Hacker (cyan),
Juiz (purple), Deputado (amber), Advogado (blue), Madame (pink).

### BACEN

Official interbank trading platform — not consumer-facing. Aesthetic: dark
purple (`#0b0118`), Inter font, clean financial data layout. Looks like a real
B2B banking tool (Bloomberg-adjacent, not Nubank).

**Header**: "A" logo mark + "BACEN" wordmark + "Plataforma Interbancária"
subtitle + "CORP" badge. No tab bar.

**Derivativos tab** — three states:

*State 1 — Pack list:* All open derivative packs created in Laranjas, each
showing pack ID, description (N CPF), issue day, expiry day, nominal value,
and days remaining (red if urgent). Tap to select. "OFERECER DERIVATIVO" button
at the bottom, enabled only when a pack is selected.

*State 2 — Loading (3s):* Spinner + "Procurando ofertas de outros bancos..."
with three bank rows that light up one by one as each bank responds
(staggered at 0.7s, 1.4s, 2.2s).

*State 3 — Offers:* Three cards from three different banks, each showing bank
name, offer amount, and percentage of nominal (random 75–85%). Best offer
badge on the highest. Tap to select. "CONFIRMAR — R$ X" button activates.
Confirming returns to the pack list.

### Laranjas

A hacker tool for generating fake loan derivatives. Not trying to look
legitimate — built to do one illegal thing and nothing else.

**Aesthetic**: Black background (`#080808`), monospace font, minimal chrome.
Orange (`#ff6a00`) as the only accent color. No branding, no logo, no tagline.
The app header shows only the word "laranjas" in lowercase dim text.

**CPFs disponíveis**: Large orange number at the top — the total fake IDs
currently in inventory.

**% input**: A single underlined number field (no box, no border — just an
orange bottom border). The player types a percentage. Updates live:
- `= N ids` shown inline next to the input
- Loan value updates below

**Empréstimo gerado**: Large white number showing the resulting loan value
(`CPFs used × 5,000`). Updates as the player types.

**CTA**: Full-width flat button "CRIAR DERIVATIVO" in black-on-orange.

**Warning**: One small line below the button — "aumenta suspeita" with a
triangle icon. No numbers, no percentages. Just a signal.

### Calendário

A simple calendar. Each debt batch appears as a red event on its due date.
Approaching deadlines pulse or highlight. Gives the player a visual sense of
how many time bombs they're sitting on.

### Carteira

Criminal wallet for sending clean money to the PCC. Black background
(`#060606`), JetBrains Mono font, green (`#22c55e`) accents matching the
vault icon.

**Balances**: Two rows — *sujo* (dirty, orange) and *limpo* (clean, green),
shown at the same visual weight.

**Transfer section**: Labeled "transferir para PCC". Slider (1–100% of clean
balance) + MAX button. Readout shows percentage and resulting amount live.
Amount preview block shows exact value to send and what remains after.
"ENVIAR" CTA button in solid green.

**Histórico**: Past PCC transfers with day and amount.

### Dossiê

A folder of self-surveillance. Shows the two threat gauges (suspicion,
pressure), current level title, day counter, and level goal progress. Framed
as the player tracking their own exposure — paranoid self-monitoring.

### News

A news feed app (formerly "Gazeta" in early designs, renamed for clarity).
Delivers in-game narrative events as fake headlines — police operations,
political scandals, economic policy changes that affect the player's operation.
Some headlines are flavor; others are mechanics (a crackdown raises suspicion
rate, an ally's arrest temporarily locks a contact).

Aesthetic: real Brazilian news aggregator (UOL / G1). Badge appears when a
new headline has gameplay impact.

---

## Navigation Model

- Home screen is always reachable via back gesture or hardware button
- Each app opens full-screen with its own back affordance (top-left arrow)
- No persistent bottom nav bar — the phone IS the nav
- Incoming events (new bag, new message) trigger home screen badge updates

---

## Tone

The phone itself is a character. It's a burner — not an iPhone. The wallpaper
never changes. The battery is always running down. The apps look like they were
sideloaded from a sketchy APK. Nothing about this phone says the person who
owns it is doing anything legitimate.

---

## Mockup

Interactive HTML prototype at `design/mockups/home-screen.html`.

| Screen | Status |
|--------|--------|
| Home screen | ✓ Done |
| ZEP | ✓ Done |
| Laranjas | ✓ Done |
| BACEN | ✓ Done |
| Calendário | Placeholder |
| Carteira | ✓ Done |
| Dossiê | Placeholder |
| News | Placeholder |

---

## Current State Mapping

| Current component | New home |
|------------------|----------|
| `BankScreen.tsx` | Banco Âncora app |
| `ZepScreen.tsx` + `ChatScreen.tsx` | ZEP app |
| `LoanModal` / `LoanModalCinematic` | Laranjas app |
| `PayModal` | Inside Banco Âncora |
| `NavBar.tsx` | Replaced by phone home screen |
| Suspicion/pressure gauges | Dossiê app |
| Dirty money display | Carteira app |

---

## Open Questions

| # | Question |
|---|----------|
| 1 | Does the Calendário show all debts or only upcoming ones (within N days)? |
| 2 | Should Carteira and Dossiê merge into a single "status" app? |
| 3 | Lock screen notifications — full implementation or just home screen badges to start? |
| 4 | Does the phone have a lock screen / PIN as a game mechanic? |
