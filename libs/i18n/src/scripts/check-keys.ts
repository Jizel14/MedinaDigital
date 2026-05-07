/**
 * Verify that all locale message files have the same keys.
 * Run via: pnpm i18n:check
 *
 * Fails (exit 1) if any key is missing in any locale, or if a value is empty
 * or equal to its key.
 */
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LOCALES, type Locale } from '@medina/shared-types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_DIR = resolve(__dirname, '../../messages');

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];
interface JsonObject {
  [k: string]: JsonValue;
}

function flatten(obj: JsonObject, prefix = ''): Record<string, JsonValue> {
  const out: Record<string, JsonValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v as JsonObject, path));
    } else {
      out[path] = v;
    }
  }
  return out;
}

async function loadLocale(locale: Locale): Promise<Record<string, JsonValue>> {
  const filePath = resolve(MESSAGES_DIR, `${locale}.json`);
  const raw = await readFile(filePath, 'utf8');
  return flatten(JSON.parse(raw) as JsonObject);
}

async function main(): Promise<void> {
  const flat: Record<Locale, Record<string, JsonValue>> = {} as Record<
    Locale,
    Record<string, JsonValue>
  >;
  for (const l of LOCALES) flat[l] = await loadLocale(l);

  const reference = flat[LOCALES[0]];
  const referenceKeys = new Set(Object.keys(reference));

  let hasError = false;

  for (const locale of LOCALES) {
    const keys = new Set(Object.keys(flat[locale]));

    // Missing keys
    for (const k of referenceKeys) {
      if (!keys.has(k)) {
        console.error(`❌ ${locale}: missing key "${k}"`);
        hasError = true;
      }
    }
    // Extra keys
    for (const k of keys) {
      if (!referenceKeys.has(k)) {
        console.error(`❌ ${locale}: extra key "${k}" (not in ${LOCALES[0]})`);
        hasError = true;
      }
    }
    // Empty values or value === key
    for (const [k, v] of Object.entries(flat[locale])) {
      if (typeof v === 'string') {
        if (v.trim() === '') {
          console.error(`❌ ${locale}: empty value at "${k}"`);
          hasError = true;
        } else if (v === k) {
          console.error(`❌ ${locale}: value equals key at "${k}"`);
          hasError = true;
        }
      }
    }
  }

  if (hasError) {
    console.error('\n❌ i18n check failed.');
    process.exit(1);
  }
  const totalKeys = referenceKeys.size;
  console.log(
    `✅ i18n check passed — ${totalKeys} keys × ${LOCALES.length} locales (${totalKeys * LOCALES.length} entries).`,
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
