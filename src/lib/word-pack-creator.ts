'use client';

import { type WordCategory } from './word-pool';

// --- Types ---

export type CustomWord = {
  word: string;
  category: WordCategory;
  points: number;
  definition?: string;
  pronunciation?: string;
};

/** A user-created word pack. */
export type CustomWordPack = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  words: CustomWord[];
  createdAt: number;
  updatedAt: number;
  isPublic: boolean;
  playCount: number;
};


// --- Constants ---
export const PACK_COLORS: string[] = [
  '#3b82f6', '#8b5cf6', '#ef4444', '#22c55e',
  '#f59e0b', '#ec4899', '#06b6d4', '#f97316',
];
export const PACK_EMOJIS: string[] = ['📚', '🎨', '🎵', '🌍', '🎮', '🔬', '📚', '✨'];
export const MAX_WORDS_PER_PACK = 100;
export const MAX_PACKS = 10;
export const STORAGE_KEY = 'wordsnake_custom_packs';


// --- Internal helpers ---
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function persistPacks(packs: CustomWordPack[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(packs));
}

function readPacks(): CustomWordPack[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CustomWordPack[]) : [];
  } catch { return []; }
}


// --- CRUD operations ---

/** Create a new pack with a unique ID and random colour. */
export function createWordPack(name: string, emoji: string, description: string): CustomWordPack {
  return {
    id: generateId(), name, emoji, description,
    color: PACK_COLORS[Math.floor(Math.random() * PACK_COLORS.length)],
    words: [], createdAt: Date.now(), updatedAt: Date.now(),
    isPublic: false, playCount: 0,
  };
}

/** Add a word (rejects duplicates case-insensitively, enforces MAX_WORDS_PER_PACK). */
export function addWordToPack(pack: CustomWordPack, word: CustomWord): CustomWordPack {
  if (pack.words.length >= MAX_WORDS_PER_PACK) return pack;
  if (pack.words.some((w) => w.word.toLowerCase() === word.word.toLowerCase())) return pack;
  return { ...pack, words: [...pack.words, word], updatedAt: Date.now() };
}

/** Remove a word by index. */
export function removeWordFromPack(pack: CustomWordPack, wordIndex: number): CustomWordPack {
  if (wordIndex < 0 || wordIndex >= pack.words.length) return pack;
  return { ...pack, words: pack.words.filter((_, i) => i !== wordIndex), updatedAt: Date.now() };
}

/** Partially update a word at the given index. */
export function updateWordInPack(pack: CustomWordPack, wordIndex: number, updates: Partial<CustomWord>): CustomWordPack {
  if (wordIndex < 0 || wordIndex >= pack.words.length) return pack;
  return {
    ...pack,
    words: pack.words.map((w, i) => (i === wordIndex ? { ...w, ...updates } : w)),
    updatedAt: Date.now(),
  };
}

/** Delete a pack from localStorage by its ID. */
export function deleteWordPack(packId: string): void {
  persistPacks(readPacks().filter((p) => p.id !== packId));
}

/** Save (upsert) a pack. Enforces MAX_PACKS — drops the oldest pack if full. */
export function saveWordPack(pack: CustomWordPack): void {
  const packs = readPacks();
  const idx = packs.findIndex((p) => p.id === pack.id);
  if (idx >= 0) {
    packs[idx] = { ...pack, updatedAt: Date.now() };
  } else {
    if (packs.length >= MAX_PACKS) { packs.sort((a, b) => a.createdAt - b.createdAt); packs.shift(); }
    packs.push(pack);
  }
  persistPacks(packs);
}

/** Load all custom packs from localStorage. */
export function loadWordPacks(): CustomWordPack[] { return readPacks(); }

/** Load a single pack by ID, or null if not found. */
export function loadWordPack(packId: string): CustomWordPack | null {
  return readPacks().find((p) => p.id === packId) ?? null;
}

/** Increment the play count for the given pack. */
export function incrementPlayCount(packId: string): void {
  const pack = readPacks().find((p) => p.id === packId);
  if (!pack) return;
  pack.playCount += 1;
  pack.updatedAt = Date.now();
  persistPacks(readPacks().map((p) => (p.id === packId ? pack : p)));
}


// --- Import / Export ---
/** Serialize a pack to a shareable JSON string. */
export function exportPackAsJSON(pack: CustomWordPack): string {
  return JSON.stringify(pack, null, 2);
}

/** Deserialize and validate a pack from JSON. Reassigns a fresh ID on success. */
export function importPackFromJSON(json: string): CustomWordPack | null {
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const required: (keyof CustomWordPack)[] = [
      'id', 'name', 'emoji', 'description', 'color',
      'words', 'createdAt', 'updatedAt', 'isPublic', 'playCount',
    ];
    if (!required.every((k) => data[k] !== undefined)) return null;
    (data as CustomWordPack).id = generateId();
    return data as CustomWordPack;
  } catch { return null; }
}


// --- Validation ---
/** Validate a word: non-empty, 2–30 chars, alphanumeric + spaces only. */
export function validateWord(word: string): { valid: boolean; error?: string } {
  if (!word || !word.trim()) return { valid: false, error: 'Word must not be empty.' };
  if (word.length < 2) return { valid: false, error: 'Word must be at least 2 characters.' };
  if (word.length > 30) return { valid: false, error: 'Word must be 30 characters or fewer.' };
  if (!/^[a-zA-Z0-9\s]+$/.test(word))
    return { valid: false, error: 'Only letters, numbers, and spaces are allowed.' };
  return { valid: true };
}
