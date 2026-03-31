#!/usr/bin/env node
/**
 * parse-twee.js
 *
 * Reads .twee files from docs/twee/ and outputs TypeScript DIALOGUES entries
 * for constants/dialogues.ts. The output is a first-pass scaffold — review
 * and add dynamic text, custom conditions, and complex effects by hand.
 *
 * Usage:  node scripts/parse-twee.js [file.twee]
 *         node scripts/parse-twee.js              # reads all docs/twee/*.twee
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Variable mapping: Twee $var → game resource
// ---------------------------------------------------------------------------
const VAR_MAP = {
  pressure: 'pressure',
  suspicion: 'suspicion',
  money: 'dirty',
  dirty: 'dirty',
  clean: 'clean',
  cpf: 'cpfs',
  cpfs: 'cpfs',
};

// Tag → characterId mapping
const TAG_MAP = {
  PCC: 'drugdealer',
  pcc: 'drugdealer',
  hacker: 'hacker',
  H4CKR: 'hacker',
  anonimo: 'anonimo',
  lawyer: 'lawyer',
  advogado: 'lawyer',
  deputy: 'deputy',
  deputado: 'deputy',
  judge: 'judge',
  juiz: 'judge',
  investigador: 'investigador',
  madame: 'madame',
};

// Resources that use adjust/set (gauges) vs spend/gain (currencies)
const GAUGE_RESOURCES = new Set(['pressure', 'suspicion']);

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

function parseTweeFile(content) {
  const passages = [];
  let startPassage = null;

  // Split on passage headers: lines starting with ::
  const parts = content.split(/^(:: .+)$/m);

  for (let i = 1; i < parts.length; i += 2) {
    const headerLine = parts[i];
    const body = (parts[i + 1] || '').trim();

    const parsed = parseHeader(headerLine);
    if (!parsed) continue;
    // Skip metadata passages
    if (parsed.name === 'StoryTitle' || parsed.name === 'StoryData') continue;
    if (parsed.name === 'OVERVIEW') continue;

    parsed.body = body;
    parsed.links = parseLinks(body);
    parsed.conditions = parseConditions(body);
    parsed.effects = parseEffects(body);
    parsed.plainText = extractPlainText(body);
    parsed.inlineLinks = parseInlineLinks(body);

    if (parsed.name === 'START') {
      startPassage = parsed;
      continue;
    }

    passages.push(parsed);
  }

  // Detect character roots from START links — assign tags to untagged passages
  if (startPassage) {
    for (const link of startPassage.links) {
      const target = passages.find(p => p.name === link.target);
      if (target && target.tags.length === 0) {
        // Use the passage name as a tag (maps through TAG_MAP)
        target.tags.push(link.target);
      }
    }
  }

  return passages;
}

function parseHeader(line) {
  // :: PassageName [tags] {"position":...}
  // Note: some passage names have leading spaces like ":: \ pedido [PCC]"
  const match = line.match(/^::\s*\\?\s*(.+?)(?:\s+\[([^\]]*)\])?\s*(\{.*\})?\s*$/);
  if (!match) return null;

  const name = match[1].replace(/\s*\{.*\}\s*$/, '').trim();
  const tagsStr = match[2] || '';
  const tags = tagsStr.split(/\s+/).filter(Boolean);

  return { name, tags, metadata: match[3] || '' };
}

function parseLinks(body) {
  const links = [];
  // Match [[text -> target]] and [[target]]
  const re = /(?:\(if:\s*([^)]+)\))?\s*\[\[([^\]]+)\]\]/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const condStr = m[1] || null;
    const linkContent = m[2];

    let text, target;
    if (linkContent.includes('->')) {
      const parts = linkContent.split('->').map(s => s.trim());
      text = parts[0];
      target = parts[1];
    } else {
      text = linkContent.trim();
      target = linkContent.trim();
    }

    // Parse effects on the same line as the link — use position of [[ not regex start
    const bracketPos = body.indexOf('[[' + linkContent + ']]', m.index);
    const lines = body.split('\n');
    let charCount = 0;
    let linkLine = '';
    for (const line of lines) {
      if (bracketPos >= charCount && bracketPos < charCount + line.length + 1) {
        linkLine = line;
        break;
      }
      charCount += line.length + 1;
    }
    const lineEffects = parseEffects(linkLine);

    const link = { text, target, effects: lineEffects };
    if (condStr) {
      link.condition = parseConditionStr(condStr);
    }
    links.push(link);
  }
  return links;
}

function parseConditions(body) {
  const conditions = [];
  const re = /\(if:\s*([^)]+)\)\s*\[/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const cond = parseConditionStr(m[1]);
    if (cond) conditions.push(cond);
  }
  return conditions;
}

function parseConditionStr(str) {
  // Handle compound conditions with "and" / "or"
  if (str.includes(' and ') || str.includes(' or ')) {
    const isOr = str.includes(' or ');
    const parts = str.split(isOr ? / or /g : / and /g);
    const parsed = parts.map(p => parseSingleCondition(p.trim()));
    return { compound: isOr ? 'or' : 'and', conditions: parsed };
  }
  return parseSingleCondition(str);
}

function parseSingleCondition(str) {
  // $var op value
  const m = str.match(/\$(\w+)\s*(is|<|>|<=|>=|===|!==)\s*(.+)/);
  if (!m) return { raw: str };

  const variable = m[1];
  const op = m[2];
  const rawValue = m[3].trim();

  // Pattern: $optionId is true/false → dialogueSeen/dialogueNotSeen
  if ((op === 'is' || op === '===') && (rawValue === 'true' || rawValue === 'false')) {
    if (rawValue === 'true') {
      return { type: 'dialogueSeen', optionId: variable };
    } else {
      return { type: 'dialogueNotSeen', optionId: variable };
    }
  }

  const resource = VAR_MAP[variable];
  const gameOp = op === 'is' || op === '===' ? 'eq'
    : op === '<' ? 'lt'
    : op === '>' ? 'gt'
    : op === '<=' ? 'lte'
    : op === '>=' ? 'gte'
    : op === '!==' ? 'neq'
    : op;

  if (resource) {
    const numVal = Number(rawValue);
    if (!isNaN(numVal)) {
      return { type: 'resource', resource, op: gameOp, value: numVal };
    }
  }

  // Unmapped — return raw for TODO comment
  return { raw: str, variable, op: gameOp, value: rawValue };
}

function parseEffects(body) {
  const effects = [];
  const re = /\(set:\s*\$(\w+)\s+to\s+(.+?)\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const variable = m[1];
    const expr = m[2].trim();
    const resource = VAR_MAP[variable];

    if (!resource) {
      effects.push({ raw: `set $${variable} to ${expr}` });
      continue;
    }

    // Pattern: $var + N or $var - N (relative change)
    const relMatch = expr.match(/\$\w+\s*([+-])\s*(\d+)/);
    if (relMatch) {
      const delta = parseInt(relMatch[2]);
      const sign = relMatch[1] === '+' ? 1 : -1;

      if (GAUGE_RESOURCES.has(resource)) {
        effects.push({ type: 'adjust', resource, delta: sign * delta });
      } else if (sign > 0) {
        effects.push({ type: 'gain', resource, amount: delta });
      } else {
        effects.push({ type: 'spend', resource, amount: delta });
      }
      continue;
    }

    // Pattern: literal number (absolute set)
    const numVal = Number(expr);
    if (!isNaN(numVal)) {
      if (GAUGE_RESOURCES.has(resource)) {
        effects.push({ type: 'set', resource, value: numVal });
      } else {
        effects.push({ type: 'gain', resource, amount: numVal });
      }
      continue;
    }

    effects.push({ raw: `set $${variable} to ${expr}` });
  }
  return effects;
}

function parseInlineLinks(body) {
  // (link: "text")[(effects)(go-to: "target")]
  const links = [];
  const re = /\(link:\s*"([^"]+)"\)\[([^\]]*)\]/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const text = m[1];
    const inner = m[2];
    const goTo = inner.match(/\(go-to:\s*"([^"]+)"\)/);
    const target = goTo ? goTo[1] : null;
    const effects = parseEffects(inner);
    links.push({ text, target, effects });
  }
  return links;
}

function extractPlainText(body) {
  let text = body;
  // Remove HTML comments
  text = text.replace(/<!--[\s\S]*?-->/g, '');
  // Remove links
  text = text.replace(/\[\[[^\]]+\]\]/g, '');
  // Remove (if: ...)[ ... ] blocks — but keep the content inside for display
  text = text.replace(/\(if:\s*[^)]+\)\s*\[([^\]]*)\]/g, '$1');
  // Remove (set: ...) macros
  text = text.replace(/\(set:\s*[^)]+\)/g, '');
  // Remove (link: ...)[ ... ] macros
  text = text.replace(/\(link:\s*[^)]+\)\[[^\]]*\]/g, '');
  // Remove (go-to: ...) macros
  text = text.replace(/\(go-to:\s*[^)]+\)/g, '');
  // Clean up whitespace
  text = text.replace(/\n{3,}/g, '\n\n').trim();
  return text;
}

// ---------------------------------------------------------------------------
// Dialogue generation
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}

function buildDialogues(passages) {
  // Index passages by name
  const passageMap = {};
  for (const p of passages) {
    passageMap[p.name] = p;
  }

  // Group root passages by character (tag)
  const characters = {};
  for (const p of passages) {
    for (const tag of p.tags) {
      const charId = TAG_MAP[tag] || tag.toLowerCase();
      if (!characters[charId]) characters[charId] = [];
      characters[charId].push(p);
    }
    // Also include tagless passages that are referenced as link targets
  }

  const dialogues = {};

  for (const [charId, charPassages] of Object.entries(characters)) {
    // Find "root" passages — those that primarily contain links (player options)
    // Root = passage where most content is links, not plain text responses
    const rootPassages = charPassages.filter(p => p.links.length > 0);
    const options = [];

    for (const rootP of rootPassages) {
      for (const link of rootP.links) {
        // Skip navigation-only links (back to START, etc.)
        if (['START', 'BACK'].includes(link.target)) continue;

        const targetPassage = passageMap[link.target];
        const optionId = slugify(link.target !== link.text ? link.target : link.text);

        const option = {
          id: optionId,
          text: link.text,
          response: targetPassage ? targetPassage.plainText : '...',
          visible: [],
          effects: [],
          _source: rootP.name, // for debugging
        };

        // Add condition from the link's (if:) wrapper
        if (link.condition) {
          option.visible.push(link.condition);
        }

        // Add effects from the link itself
        if (link.effects.length > 0) {
          option.effects.push(...link.effects);
        }

        // Add effects from the target passage
        if (targetPassage && targetPassage.effects.length > 0) {
          option.effects.push(...targetPassage.effects);
        }

        // Check target passage for inline links (sub-options)
        if (targetPassage && targetPassage.inlineLinks.length > 0) {
          option._inlineLinks = targetPassage.inlineLinks;
        }

        // Check target passage for conditional text
        if (targetPassage && targetPassage.conditions.length > 0) {
          option._conditionalText = targetPassage.conditions;
        }

        options.push(option);
      }

      // Also handle inline links from root passage
      for (const iLink of rootP.inlineLinks) {
        const optionId = slugify(iLink.text);
        const targetPassage = iLink.target ? passageMap[iLink.target] : null;
        options.push({
          id: optionId,
          text: iLink.text,
          response: targetPassage ? targetPassage.plainText : '...',
          effects: iLink.effects,
          visible: [],
          _source: rootP.name,
          _isInlineLink: true,
        });
      }
    }

    // Deduplicate IDs: if multiple options share an ID, append a counter
    const idCounts = {};
    for (const opt of options) {
      idCounts[opt.id] = (idCounts[opt.id] || 0) + 1;
    }
    const idSeen = {};
    for (const opt of options) {
      if (idCounts[opt.id] > 1) {
        idSeen[opt.id] = (idSeen[opt.id] || 0) + 1;
        opt.id = `${opt.id}_${idSeen[opt.id]}`;
      }
    }

    if (options.length > 0) {
      dialogues[charId] = { characterId: charId, options };
    }
  }

  return dialogues;
}

// ---------------------------------------------------------------------------
// TypeScript output
// ---------------------------------------------------------------------------

function formatCondition(cond, indent) {
  if (cond.compound) {
    // Compound "and" → multiple conditions in the array (all must pass)
    // Compound "or" → needs a custom fn wrapper
    if (cond.compound === 'and') {
      return cond.conditions.map(c => formatCondition(c, indent)).join(`\n${indent}`);
    } else {
      // "or" can't be expressed as multiple array entries — emit as TODO
      const parts = cond.conditions.map(c => formatCondition(c, indent)).join(', ');
      return `// TODO: OR condition — ${parts}`;
    }
  }
  if (cond.raw) {
    return `// TODO: custom condition — ${cond.raw}`;
  }
  if (cond.type === 'dialogueSeen') {
    return `{ type: 'dialogueSeen', optionId: '${cond.optionId}' },`;
  }
  if (cond.type === 'dialogueNotSeen') {
    return `{ type: 'dialogueNotSeen', optionId: '${cond.optionId}' },`;
  }
  return `{ type: 'resource', resource: '${cond.resource}', op: '${cond.op}', value: ${cond.value} }`;
}

function formatEffect(eff) {
  if (eff.raw) {
    return `// TODO: effect — ${eff.raw}`;
  }
  if (eff.type === 'adjust') {
    return `{ type: 'adjust', resource: '${eff.resource}', delta: ${eff.delta} }`;
  }
  if (eff.type === 'set') {
    return `{ type: 'set', resource: '${eff.resource}', value: ${eff.value} }`;
  }
  if (eff.type === 'gain') {
    return `{ type: 'gain', resource: '${eff.resource}', amount: ${eff.amount} }`;
  }
  if (eff.type === 'spend') {
    return `{ type: 'spend', resource: '${eff.resource}', amount: ${eff.amount} }`;
  }
  return `// TODO: unknown effect type — ${JSON.stringify(eff)}`;
}

function generateTypeScript(dialogues) {
  const lines = [];
  lines.push('// Generated by scripts/parse-twee.js — review and correct before use');
  lines.push('');

  for (const [charId, dialogue] of Object.entries(dialogues)) {
    lines.push(`    ${charId}: {`);
    lines.push(`        characterId: '${charId}',`);
    lines.push(`        options: [`);

    for (const opt of dialogue.options) {
      lines.push(`            {`);
      lines.push(`                id: '${opt.id}',`);
      lines.push(`                text: '${escapeStr(opt.text)}',`);

      // Visible conditions
      if (opt.visible.length > 0) {
        const indent = '                    ';
        const condLines = opt.visible.map(c => {
          const f = formatCondition(c, indent);
          // formatCondition may return multiple lines for compound "and"
          return f.split('\n').map(line => {
            line = line.trim();
            if (!line) return '';
            return line.startsWith('//') ? `${indent}${line}` : (line.endsWith(',') ? `${indent}${line}` : `${indent}${line},`);
          }).filter(Boolean).join('\n');
        });
        lines.push(`                visible: [`);
        lines.push(...condLines);
        lines.push(`                ],`);
      }

      lines.push(`                response: '${escapeStr(opt.response)}',`);

      // Effects
      if (opt.effects.length > 0) {
        const effLines = opt.effects.map(e => {
          const f = formatEffect(e);
          return f.startsWith('//') ? `                    ${f}` : `                    ${f},`;
        });
        lines.push(`                effects: [`);
        lines.push(...effLines);
        lines.push(`                ],`);
      }

      // Warnings for complex passages
      if (opt._inlineLinks) {
        lines.push(`                // TODO: target passage has inline links (sub-options): ${opt._inlineLinks.map(l => l.text).join(', ')}`);
      }
      if (opt._conditionalText) {
        lines.push(`                // TODO: target passage has conditional text based on game state`);
      }

      lines.push(`            },`);
    }

    lines.push(`        ],`);
    lines.push(`    },`);
    lines.push('');
  }

  return lines.join('\n');
}

function escapeStr(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const args = process.argv.slice(2);
  let files;

  if (args.length > 0) {
    files = args;
  } else {
    const tweeDir = path.join(__dirname, '..', 'docs', 'twee');
    if (!fs.existsSync(tweeDir)) {
      // Fall back to docs/ root
      const rootTwee = path.join(__dirname, '..', 'docs');
      files = fs.readdirSync(rootTwee)
        .filter(f => f.endsWith('.twee'))
        .map(f => path.join(rootTwee, f));
    } else {
      files = fs.readdirSync(tweeDir)
        .filter(f => f.endsWith('.twee'))
        .map(f => path.join(tweeDir, f));
    }
  }

  if (files.length === 0) {
    console.error('No .twee files found');
    process.exit(1);
  }

  let allPassages = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const passages = parseTweeFile(content);
    allPassages.push(...passages);
    console.error(`Parsed ${file}: ${passages.length} passages`);
  }

  const dialogues = buildDialogues(allPassages);
  const output = generateTypeScript(dialogues);

  console.log(output);
}

main();
