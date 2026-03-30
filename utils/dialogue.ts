// utils/dialogue.ts
// Pure functions for the declarative dialogue system

import { Condition, ConditionSet, ComparisonOp, Effect, GameState } from '../types/game';

function compare(a: number, op: ComparisonOp, b: number): boolean {
    switch (op) {
        case 'gte': return a >= b;
        case 'lte': return a <= b;
        case 'gt':  return a > b;
        case 'lt':  return a < b;
        case 'eq':  return a === b;
    }
}

function resolveAmount(amount: number | ((s: GameState) => number), state: GameState): number {
    return typeof amount === 'function' ? amount(state) : amount;
}

function evaluateCondition(condition: Condition, state: GameState): boolean {
    switch (condition.type) {
        case 'resource': {
            const threshold = resolveAmount(condition.value, state);
            return compare(state[condition.resource], condition.op, threshold);
        }
        case 'dialogueSeen':
            return state.dialoguesSeen.includes(condition.optionId);
        case 'dialogueNotSeen':
            return !state.dialoguesSeen.includes(condition.optionId);
        case 'level':
            return compare(state.levelIdx, condition.op, condition.value as number);
        case 'hasBatches':
            return state.batches.length > 0;
        case 'custom':
            return condition.fn(state);
    }
}

export function evaluateConditionSet(conditions: ConditionSet, state: GameState): boolean {
    return conditions.every(c => evaluateCondition(c, state));
}

export function applyEffects(effects: Effect[], state: GameState): Partial<GameState> {
    const patch: any = {};

    const get = (key: string) => patch[key] ?? (state as any)[key];

    for (const effect of effects) {
        switch (effect.type) {
            case 'spend': {
                const amount = resolveAmount(effect.amount, state);
                patch[effect.resource] = get(effect.resource) - amount;
                break;
            }
            case 'gain': {
                const amount = resolveAmount(effect.amount, state);
                patch[effect.resource] = get(effect.resource) + amount;
                break;
            }
            case 'adjust': {
                const current = get(effect.resource) as number;
                const min = effect.min ?? 0;
                const max = effect.max ?? 100;
                patch[effect.resource] = Math.max(min, Math.min(max, current + effect.delta));
                break;
            }
            case 'set':
                patch[effect.resource] = effect.value;
                break;
            case 'extendBatch': {
                const batches = [...(patch.batches ?? state.batches)];
                if (batches[effect.index]) {
                    batches[effect.index] = {
                        ...batches[effect.index],
                        days: batches[effect.index].days + effect.days,
                    };
                }
                patch.batches = batches;
                break;
            }
            case 'trackTransfer': {
                const amount = resolveAmount(effect.amount, state);
                const transfers = { ...(patch.transfersByContact ?? state.transfersByContact) };
                transfers[effect.contactId] = (transfers[effect.contactId] ?? 0) + amount;
                patch.transfersByContact = transfers;
                break;
            }
            case 'setDay':
                patch[effect.field] = state.day;
                break;
        }
    }

    return patch;
}
