// ─────────────────────────────────────────────────────────────
// Avatar Customizer Wire — Word Snake Game
// 8 body parts × 8+ options, presets, outfits, share codes,
// color customization, unlock system, localStorage persistence.
// Key: ws_avatar_customizer_wire
// ─────────────────────────────────────────────────────────────

// ─── Types ──────────────────────────────────────────────────

export type PartId =
  | "head"
  | "eyes"
  | "mouth"
  | "hat"
  | "body"
  | "accessory"
  | "background"
  | "effect";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface AvatarPart {
  id: PartId;
  label: string;
  icon: string;
  options: PartOption[];
}

export interface PartOption {
  id: string;
  label: string;
  svg: string;
  rarity: Rarity;
  unlockCost: number;
}

export interface AvatarData {
  head: string;
  eyes: string;
  mouth: string;
  hat: string;
  body: string;
  accessory: string;
  background: string;
  effect: string;
  colors: Record<PartId, string>;
}

export interface Outfit {
  id: string;
  name: string;
  avatar: AvatarData;
  createdAt: number;
  updatedAt: number;
  slot: number;
}

export interface AvatarCustomizerState {
  current: AvatarData;
  outfits: Outfit[];
  unlockedParts: string[];
  history: AvatarData[];
  activeSlot: number;
  initialized: boolean;
  version: number;
}

// ─── Constants ──────────────────────────────────────────────

const STORAGE_KEY = "ws_avatar_customizer_wire";
const STATE_VERSION = 1;

const ALL_PART_IDS: PartId[] = [
  "head",
  "eyes",
  "mouth",
  "hat",
  "body",
  "accessory",
  "background",
  "effect",
];

const DEFAULT_COLORS: Record<PartId, string> = {
  head: "#4ECDC4",
  eyes: "#2C3E50",
  mouth: "#E74C3C",
  hat: "#F39C12",
  body: "#3498DB",
  accessory: "#9B59B6",
  background: "#1A1A2E",
  effect: "#FFD700",
};

const DEFAULT_AVATAR: AvatarData = {
  head: "round",
  eyes: "normal",
  mouth: "smile",
  hat: "none",
  body: "default",
  accessory: "none",
  background: "plain",
  effect: "none",
  colors: { ...DEFAULT_COLORS },
};

const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
];

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#A0A0A0",
  uncommon: "#55CC55",
  rare: "#4488FF",
  epic: "#AA44FF",
  legendary: "#FFAA00",
};

// ─── Part Option Data (8+ options per part) ─────────────────

const HEAD_OPTIONS: PartOption[] = [
  { id: "round", label: "Round", svg: '<circle cx="50" cy="40" r="30" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "square", label: "Square", svg: '<rect x="20" y="10" width="60" height="60" rx="8" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "oval", label: "Oval", svg: '<ellipse cx="50" cy="42" rx="28" ry="35" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "triangle", label: "Triangle", svg: '<polygon points="50,8 85,70 15,70" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "diamond", label: "Diamond", svg: '<polygon points="50,5 85,40 50,75 15,40" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "hexagon", label: "Hexagon", svg: '<polygon points="50,10 80,28 80,60 50,78 20,60 20,28" fill="currentColor"/>', rarity: "rare", unlockCost: 150 },
  { id: "star", label: "Star Head", svg: '<polygon points="50,5 61,35 95,35 68,55 78,85 50,67 22,85 32,55 5,35 39,35" fill="currentColor"/>', rarity: "epic", unlockCost: 400 },
  { id: "blob", label: "Blob", svg: '<path d="M50 10 C70 10, 90 25, 85 50 C80 75, 60 90, 40 85 C15 78, 8 55, 15 35 C22 15, 35 10, 50 10Z" fill="currentColor"/>', rarity: "rare", unlockCost: 150 },
  { id: "skull", label: "Skull", svg: '<path d="M50 10 C30 10, 15 25, 15 45 C15 60, 25 72, 35 78 L35 88 L65 88 L65 78 C75 72, 85 60, 85 45 C85 25, 70 10, 50 10Z" fill="currentColor"/>', rarity: "legendary", unlockCost: 1000 },
  { id: "cat", label: "Cat", svg: '<path d="M50 12 C30 12, 15 28, 15 48 C15 65, 28 78, 50 78 C72 78, 85 65, 85 48 C85 28, 70 12, 50 12Z M12 12 L25 30 M88 12 L75 30" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/>', rarity: "epic", unlockCost: 400 },
];

const EYES_OPTIONS: PartOption[] = [
  { id: "normal", label: "Normal", svg: '<circle cx="38" cy="36" r="5" fill="currentColor"/><circle cx="62" cy="36" r="5" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "big", label: "Big Eyes", svg: '<ellipse cx="38" cy="36" rx="8" ry="9" fill="currentColor"/><ellipse cx="62" cy="36" rx="8" ry="9" fill="currentColor"/><circle cx="40" cy="34" r="3" fill="#fff"/><circle cx="64" cy="34" r="3" fill="#fff"/>', rarity: "common", unlockCost: 0 },
  { id: "sleepy", label: "Sleepy", svg: '<path d="M30 38 Q38 44 46 38" stroke="currentColor" stroke-width="3" fill="none"/><path d="M54 38 Q62 44 70 38" stroke="currentColor" stroke-width="3" fill="none"/>', rarity: "common", unlockCost: 0 },
  { id: "angry", label: "Angry", svg: '<circle cx="38" cy="40" r="4" fill="currentColor"/><circle cx="62" cy="40" r="4" fill="currentColor"/><line x1="28" y1="30" x2="44" y2="34" stroke="currentColor" stroke-width="3"/><line x1="72" y1="30" x2="56" y2="34" stroke="currentColor" stroke-width="3"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "wink", label: "Wink", svg: '<circle cx="38" cy="36" r="5" fill="currentColor"/><path d="M56 36 Q62 30 68 36" stroke="currentColor" stroke-width="3" fill="none"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "cyborg", label: "Cyborg", svg: '<rect x="30" y="30" width="16" height="12" rx="2" fill="currentColor"/><rect x="54" y="30" width="16" height="12" rx="2" fill="currentColor"/><circle cx="38" cy="36" r="2" fill="#FF0000"/><circle cx="62" cy="36" r="2" fill="#FF0000"/>', rarity: "rare", unlockCost: 150 },
  { id: "hearts", label: "Hearts", svg: '<path d="M34 34 C32 30, 28 30, 28 34 C28 38, 34 42, 34 42 C34 42, 40 38, 40 34 C40 30, 36 30, 34 34Z" fill="currentColor"/><path d="M58 34 C56 30, 52 30, 52 34 C52 38, 58 42, 58 42 C58 42, 64 38, 64 34 C64 30, 60 30, 58 34Z" fill="currentColor"/>', rarity: "epic", unlockCost: 400 },
  { id: "multi", label: "Multi-Eye", svg: '<circle cx="32" cy="34" r="4" fill="currentColor"/><circle cx="46" cy="34" r="4" fill="currentColor"/><circle cx="60" cy="34" r="4" fill="currentColor"/><circle cx="38" cy="42" r="3" fill="currentColor"/><circle cx="54" cy="42" r="3" fill="currentColor"/>', rarity: "legendary", unlockCost: 1000 },
  { id: "stars", label: "Star Eyes", svg: '<polygon points="38,28 40,34 46,34 41,38 43,44 38,40 33,44 35,38 30,34 36,34" fill="currentColor"/><polygon points="62,28 64,34 70,34 65,38 67,44 62,40 57,44 59,38 54,34 60,34" fill="currentColor"/>', rarity: "epic", unlockCost: 400 },
];

const MOUTH_OPTIONS: PartOption[] = [
  { id: "smile", label: "Smile", svg: '<path d="M35 52 Q50 68 65 52" stroke="currentColor" stroke-width="3" fill="none"/>', rarity: "common", unlockCost: 0 },
  { id: "grin", label: "Grin", svg: '<path d="M32 50 Q50 72 68 50Z" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "flat", label: "Flat", svg: '<line x1="35" y1="56" x2="65" y2="56" stroke="currentColor" stroke-width="3"/>', rarity: "common", unlockCost: 0 },
  { id: "fangs", label: "Fangs", svg: '<path d="M35 52 Q50 66 65 52" stroke="currentColor" stroke-width="2.5" fill="none"/><polygon points="40,52 43,60 46,52" fill="currentColor"/><polygon points="54,52 57,60 60,52" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "tongue", label: "Tongue Out", svg: '<path d="M35 52 Q50 66 65 52" stroke="currentColor" stroke-width="2.5" fill="none"/><ellipse cx="50" cy="64" rx="8" ry="6" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "mask", label: "Mask", svg: '<rect x="32" y="48" width="36" height="16" rx="4" fill="currentColor"/><rect x="42" y="52" width="6" height="5" rx="1" fill="#1A1A2E"/><rect x="52" y="52" width="6" height="5" rx="1" fill="#1A1A2E"/>', rarity: "rare", unlockCost: 150 },
  { id: "fire", label: "Fire Breath", svg: '<path d="M35 52 Q50 60 65 52" stroke="currentColor" stroke-width="2.5" fill="none"/><path d="M46 60 Q50 76 54 60" fill="#FF4500"/><path d="M44 58 Q50 72 56 58" fill="#FFD700"/>', rarity: "epic", unlockCost: 400 },
  { id: "stitch", label: "Stitch", svg: '<line x1="35" y1="54" x2="40" y2="54" stroke="currentColor" stroke-width="2.5"/><line x1="43" y1="54" x2="48" y2="54" stroke="currentColor" stroke-width="2.5"/><line x1="51" y1="54" x2="56" y2="54" stroke="currentColor" stroke-width="2.5"/><line x1="59" y1="54" x2="65" y2="54" stroke="currentColor" stroke-width="2.5"/>', rarity: "rare", unlockCost: 150 },
  { id: "robot", label: "Robot", svg: '<rect x="38" y="50" width="24" height="12" rx="2" fill="currentColor"/><line x1="38" y1="56" x2="62" y2="56" stroke="#1A1A2E" stroke-width="1.5"/>', rarity: "legendary", unlockCost: 1000 },
];

const HAT_OPTIONS: PartOption[] = [
  { id: "none", label: "None", svg: "", rarity: "common", unlockCost: 0 },
  { id: "cap", label: "Cap", svg: '<path d="M20 28 L50 15 L80 28 Z" fill="currentColor"/><rect x="18" y="28" width="64" height="6" rx="2" fill="currentColor"/><ellipse cx="75" cy="34" rx="16" ry="4" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "tophat", label: "Top Hat", svg: '<rect x="28" y="4" width="44" height="24" rx="4" fill="currentColor"/><rect x="18" y="26" width="64" height="7" rx="3" fill="currentColor"/><rect x="34" y="1" width="32" height="5" rx="2" fill="currentColor" opacity="0.5"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "crown", label: "Crown", svg: '<path d="M22 22 L30 6 L40 16 L50 4 L60 16 L70 6 L78 22 Z" fill="currentColor"/><rect x="22" y="22" width="56" height="8" rx="2" fill="currentColor"/>', rarity: "rare", unlockCost: 150 },
  { id: "wizard", label: "Wizard Hat", svg: '<path d="M50 0 L85 30 L15 30 Z" fill="currentColor"/><rect x="15" y="30" width="70" height="7" rx="2" fill="currentColor"/><circle cx="55" cy="8" r="4" fill="#FFD700"/>', rarity: "epic", unlockCost: 400 },
  { id: "party", label: "Party Hat", svg: '<path d="M50 2 L72 30 L28 30 Z" fill="currentColor"/><circle cx="50" cy="2" r="5" fill="#FF69B4"/><line x1="55" y1="10" x2="65" y2="6" stroke="#FFD700" stroke-width="2"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "halo", label: "Halo", svg: '<ellipse cx="50" cy="10" rx="25" ry="8" stroke="currentColor" stroke-width="4" fill="none" opacity="0.85"/>', rarity: "epic", unlockCost: 400 },
  { id: "horns", label: "Horns", svg: '<path d="M20 22 Q10 4 25 8 L30 18" fill="currentColor"/><path d="M80 22 Q90 4 75 8 L70 18" fill="currentColor"/>', rarity: "rare", unlockCost: 150 },
  { id: "antenna", label: "Antenna", svg: '<line x1="50" y1="10" x2="50" y2="2" stroke="currentColor" stroke-width="2.5"/><circle cx="50" cy="1" r="4" fill="#FF0000"/>', rarity: "legendary", unlockCost: 1000 },
];

const BODY_OPTIONS: PartOption[] = [
  { id: "default", label: "Default", svg: '<rect x="30" y="75" width="40" height="50" rx="10" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "slim", label: "Slim", svg: '<rect x="36" y="75" width="28" height="50" rx="12" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "broad", label: "Broad", svg: '<rect x="22" y="75" width="56" height="50" rx="8" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "armored", label: "Armored", svg: '<rect x="26" y="75" width="48" height="50" rx="6" fill="currentColor"/><rect x="28" y="78" width="44" height="4" fill="#666"/><rect x="28" y="88" width="44" height="4" fill="#666"/><rect x="28" y="98" width="44" height="4" fill="#666"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "robotic", label: "Robotic", svg: '<rect x="28" y="75" width="44" height="50" rx="4" fill="currentColor"/><rect x="32" y="80" width="14" height="10" rx="2" fill="#00FF88"/><rect x="54" y="80" width="14" height="10" rx="2" fill="#00FF88"/>', rarity: "rare", unlockCost: 150 },
  { id: "ghost", label: "Ghost", svg: '<path d="M26 75 Q26 130 50 130 Q74 130 74 75 Z" fill="currentColor" opacity="0.7"/><path d="M26 120 Q34 135 42 120 Q50 135 58 120 Q66 135 74 120" fill="currentColor" opacity="0.7"/>', rarity: "epic", unlockCost: 400 },
  { id: "dragon", label: "Dragon", svg: '<path d="M24 78 Q22 130 35 132 L45 125 L50 130 L55 125 L65 132 Q78 130 76 78 Z" fill="currentColor"/><path d="M24 78 L10 65 L20 80Z" fill="currentColor"/><path d="M76 78 L90 65 L80 80Z" fill="currentColor"/>', rarity: "legendary", unlockCost: 1000 },
  { id: "crystal", label: "Crystal", svg: '<polygon points="35,75 65,75 70,125 30,125" fill="currentColor" opacity="0.6"/><polygon points="38,80 62,80 65,120 35,120" fill="currentColor" opacity="0.3"/>', rarity: "epic", unlockCost: 400 },
  { id: "wings", label: "Wings Body", svg: '<rect x="35" y="75" width="30" height="50" rx="8" fill="currentColor"/><path d="M35 80 Q15 60 10 85 Q8 100 30 100Z" fill="currentColor" opacity="0.7"/><path d="M65 80 Q85 60 90 85 Q92 100 70 100Z" fill="currentColor" opacity="0.7"/>', rarity: "rare", unlockCost: 150 },
];

const ACCESSORY_OPTIONS: PartOption[] = [
  { id: "none", label: "None", svg: "", rarity: "common", unlockCost: 0 },
  { id: "glasses", label: "Glasses", svg: '<circle cx="38" cy="36" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><circle cx="62" cy="36" r="10" stroke="currentColor" stroke-width="2.5" fill="none"/><line x1="48" y1="36" x2="52" y2="36" stroke="currentColor" stroke-width="2.5"/>', rarity: "common", unlockCost: 0 },
  { id: "monocle", label: "Monocle", svg: '<circle cx="62" cy="36" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M72 36 Q78 28 80 22" stroke="currentColor" stroke-width="2" fill="none"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "scarf", label: "Scarf", svg: '<path d="M22 72 Q50 78 78 72" stroke="currentColor" stroke-width="7" fill="none"/><path d="M68 72 L72 90 L64 90Z" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "necklace", label: "Necklace", svg: '<path d="M28 72 Q50 85 72 72" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="50" cy="80" r="5" fill="currentColor"/>', rarity: "rare", unlockCost: 150 },
  { id: "earrings", label: "Earrings", svg: '<circle cx="18" cy="44" r="4" fill="currentColor"/><circle cx="82" cy="44" r="4" fill="currentColor"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "bowtie", label: "Bowtie", svg: '<path d="M38 72 L50 68 L62 72 L50 76Z" fill="currentColor"/><circle cx="50" cy="72" r="3" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "backpack", label: "Backpack", svg: '<rect x="62" y="78" width="20" height="35" rx="5" fill="currentColor"/><rect x="65" y="85" width="14" height="8" rx="2" fill="#1A1A2E" opacity="0.3"/>', rarity: "rare", unlockCost: 150 },
  { id: "aura", label: "Aura", svg: '<ellipse cx="50" cy="60" rx="42" ry="55" stroke="currentColor" stroke-width="3" fill="none" opacity="0.4" stroke-dasharray="6 4"/>', rarity: "legendary", unlockCost: 1000 },
];

const BACKGROUND_OPTIONS: PartOption[] = [
  { id: "plain", label: "Plain", svg: '<rect width="100" height="140" fill="currentColor"/>', rarity: "common", unlockCost: 0 },
  { id: "gradient", label: "Gradient", svg: '<defs><linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="currentColor"/><stop offset="100%" stop-color="#0D0D1A"/></linearGradient></defs><rect width="100" height="140" fill="url(#bg1)"/>', rarity: "common", unlockCost: 0 },
  { id: "stars", label: "Starry", svg: '<rect width="100" height="140" fill="currentColor"/><circle cx="15" cy="20" r="1.5" fill="#fff"/><circle cx="45" cy="8" r="1" fill="#fff"/><circle cx="80" cy="25" r="1.5" fill="#fff"/><circle cx="30" cy="55" r="1" fill="#fff"/><circle cx="70" cy="45" r="1.2" fill="#fff"/><circle cx="90" cy="70" r="1" fill="#fff"/><circle cx="10" cy="90" r="1.5" fill="#fff"/><circle cx="55" cy="110" r="1" fill="#fff"/><circle cx="85" cy="120" r="1.3" fill="#fff"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "grid", label: "Grid", svg: '<rect width="100" height="140" fill="currentColor"/><g stroke="#ffffff" stroke-width="0.4" opacity="0.15"><line x1="0" y1="20" x2="100" y2="20"/><line x1="0" y1="40" x2="100" y2="40"/><line x1="0" y1="60" x2="100" y2="60"/><line x1="0" y1="80" x2="100" y2="80"/><line x1="0" y1="100" x2="100" y2="100"/><line x1="0" y1="120" x2="100" y2="120"/><line x1="20" y1="0" x2="20" y2="140"/><line x1="40" y1="0" x2="40" y2="140"/><line x1="60" y1="0" x2="60" y2="140"/><line x1="80" y1="0" x2="80" y2="140"/></g>', rarity: "uncommon", unlockCost: 50 },
  { id: "wave", label: "Wave", svg: '<rect width="100" height="140" fill="currentColor"/><path d="M0 100 Q25 85 50 100 Q75 115 100 100" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.2"/><path d="M0 115 Q25 100 50 115 Q75 130 100 115" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.15"/>', rarity: "rare", unlockCost: 150 },
  { id: "circuit", label: "Circuit", svg: '<rect width="100" height="140" fill="currentColor"/><g stroke="#00FF88" stroke-width="0.8" opacity="0.2"><line x1="10" y1="10" x2="10" y2="50"/><line x1="10" y1="50" x2="40" y2="50"/><line x1="40" y1="50" x2="40" y2="90"/><line x1="60" y1="20" x2="90" y2="20"/><line x1="90" y1="20" x2="90" y2="70"/><line x1="90" y1="70" x2="60" y2="70"/><circle cx="10" cy="10" r="3"/><circle cx="40" cy="90" r="3"/><circle cx="60" cy="20" r="3"/><circle cx="60" cy="70" r="3"/></g>', rarity: "rare", unlockCost: 150 },
  { id: "portal", label: "Portal", svg: '<rect width="100" height="140" fill="currentColor"/><ellipse cx="50" cy="70" rx="35" ry="50" stroke="currentColor" stroke-width="3" fill="none" opacity="0.3"/><ellipse cx="50" cy="70" rx="25" ry="38" stroke="currentColor" stroke-width="2" fill="none" opacity="0.2"/>', rarity: "epic", unlockCost: 400 },
  { id: "cosmic", label: "Cosmic", svg: '<rect width="100" height="140" fill="currentColor"/><circle cx="50" cy="70" r="30" fill="none" stroke="#9B59B6" stroke-width="1" opacity="0.25"/><circle cx="50" cy="70" r="50" fill="none" stroke="#E74C3C" stroke-width="0.8" opacity="0.15"/><circle cx="50" cy="70" r="70" fill="none" stroke="#3498DB" stroke-width="0.6" opacity="0.1"/>', rarity: "legendary", unlockCost: 1000 },
  { id: "firebg", label: "Fire BG", svg: '<defs><linearGradient id="firebg" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stop-color="#FF4500" stop-opacity="0.4"/><stop offset="50%" stop-color="#FFD700" stop-opacity="0.15"/><stop offset="100%" stop-color="currentColor"/></linearGradient></defs><rect width="100" height="140" fill="url(#firebg)"/>', rarity: "epic", unlockCost: 400 },
];

const EFFECT_OPTIONS: PartOption[] = [
  { id: "none", label: "None", svg: "", rarity: "common", unlockCost: 0 },
  { id: "sparkle", label: "Sparkle", svg: '<g opacity="0.7"><polygon points="20,15 22,20 27,20 23,24 25,29 20,25 15,29 17,24 13,20 18,20" fill="currentColor"/><polygon points="78,18 80,22 84,22 81,25 82,29 78,26 74,29 75,25 72,22 76,22" fill="currentColor"/><polygon points="85,60 87,64 91,64 88,67 89,71 85,68 81,71 82,67 79,64 83,64" fill="currentColor"/><polygon points="12,55 14,58 17,58 15,61 16,64 12,62 8,64 9,61 7,58 10,58" fill="currentColor"/></g>', rarity: "uncommon", unlockCost: 50 },
  { id: "shadow", label: "Shadow", svg: '<ellipse cx="50" cy="135" rx="30" ry="5" fill="#000000" opacity="0.3"/>', rarity: "common", unlockCost: 0 },
  { id: "glow", label: "Glow", svg: '<ellipse cx="50" cy="60" rx="45" ry="60" fill="currentColor" opacity="0.08"/>', rarity: "uncommon", unlockCost: 50 },
  { id: "fireflies", label: "Fireflies", svg: '<circle cx="15" cy="30" r="2.5" fill="#FFD700" opacity="0.8"/><circle cx="80" cy="20" r="2" fill="#ADFF2F" opacity="0.6"/><circle cx="25" cy="90" r="2" fill="#FFD700" opacity="0.7"/><circle cx="75" cy="80" r="2.5" fill="#ADFF2F" opacity="0.5"/><circle cx="50" cy="110" r="2" fill="#FFD700" opacity="0.6"/>', rarity: "rare", unlockCost: 150 },
  { id: "lightning", label: "Lightning", svg: '<path d="M18 0 L22 20 L16 20 L22 45" stroke="currentColor" stroke-width="2" fill="none"/><path d="M82 5 L78 25 L84 25 L78 50" stroke="currentColor" stroke-width="2" fill="none"/>', rarity: "rare", unlockCost: 150 },
  { id: "rain", label: "Rain", svg: '<g stroke="#88CCFF" stroke-width="1" opacity="0.4"><line x1="12" y1="0" x2="10" y2="18"/><line x1="28" y1="5" x2="26" y2="22"/><line x1="45" y1="2" x2="43" y2="20"/><line x1="62" y1="8" x2="60" y2="25"/><line x1="78" y1="0" x2="76" y2="18"/><line x1="90" y1="6" x2="88" y2="24"/><line x1="35" y1="15" x2="33" y2="32"/><line x1="55" y1="12" x2="53" y2="30"/><line x1="72" y1="18" x2="70" y2="35"/><line x1="18" y1="22" x2="16" y2="40"/><line x1="48" y1="25" x2="46" y2="42"/><line x1="82" y1="20" x2="80" y2="38"/></g>', rarity: "uncommon", unlockCost: 50 },
  { id: "snow", label: "Snow", svg: '<g fill="#ffffff" opacity="0.5"><circle cx="14" cy="15" r="2"/><circle cx="35" cy="8" r="1.5"/><circle cx="55" cy="20" r="2"/><circle cx="78" cy="12" r="1.5"/><circle cx="25" cy="40" r="2"/><circle cx="65" cy="38" r="1.5"/><circle cx="88" cy="45" r="2"/><circle cx="8" cy="60" r="1.5"/><circle cx="42" cy="55" r="2"/><circle cx="72" cy="65" r="1.5"/><circle cx="20" cy="80" r="2"/><circle cx="58" cy="85" r="1.5"/><circle cx="85" cy="90" r="2"/><circle cx="40" cy="100" r="1.5"/></g>', rarity: "rare", unlockCost: 150 },
  { id: "rainbow", label: "Rainbow", svg: '<g fill="none" stroke-width="3" opacity="0.2"><path d="M0 100 Q50 30 100 100" stroke="#FF0000"/><path d="M0 100 Q50 38 100 100" stroke="#FF8800"/><path d="M0 100 Q50 46 100 100" stroke="#FFDD00"/><path d="M0 100 Q50 54 100 100" stroke="#00CC00"/><path d="M0 100 Q50 62 100 100" stroke="#0088FF"/><path d="M0 100 Q50 70 100 100" stroke="#8800FF"/></g>', rarity: "legendary", unlockCost: 1000 },
];

// ─── Part Registry ──────────────────────────────────────────

const PART_REGISTRY: Record<PartId, { label: string; icon: string; options: PartOption[] }> = {
  head: { label: "Head", icon: "🧠", options: HEAD_OPTIONS },
  eyes: { label: "Eyes", icon: "👁️", options: EYES_OPTIONS },
  mouth: { label: "Mouth", icon: "👄", options: MOUTH_OPTIONS },
  hat: { label: "Hat", icon: "🎩", options: HAT_OPTIONS },
  body: { label: "Body", icon: "👕", options: BODY_OPTIONS },
  accessory: { label: "Accessory", icon: "💎", options: ACCESSORY_OPTIONS },
  background: { label: "Background", icon: "🖼️", options: BACKGROUND_OPTIONS },
  effect: { label: "Effect", icon: "✨", options: EFFECT_OPTIONS },
};

// ─── Presets ────────────────────────────────────────────────

const AVATAR_PRESETS: AvatarData[] = [
  {
    head: "round", eyes: "normal", mouth: "smile", hat: "cap",
    body: "default", accessory: "none", background: "plain", effect: "shadow",
    colors: { ...DEFAULT_COLORS },
  },
  {
    head: "square", eyes: "cyborg", mouth: "robot", hat: "antenna",
    body: "robotic", accessory: "none", background: "circuit", effect: "lightning",
    colors: { head: "#2C3E50", eyes: "#FF0000", mouth: "#7F8C8D", hat: "#95A5A6", body: "#34495E", accessory: "#BDC3C7", background: "#0A0A1A", effect: "#00FFFF" },
  },
  {
    head: "star", eyes: "stars", mouth: "grin", hat: "crown",
    body: "crystal", accessory: "necklace", background: "cosmic", effect: "rainbow",
    colors: { head: "#FFD700", eyes: "#FFD700", mouth: "#FF6B6B", hat: "#FFD700", body: "#E74C3C", accessory: "#FFD700", background: "#0D0D2B", effect: "#FF69B4" },
  },
  {
    head: "blob", eyes: "big", mouth: "tongue", hat: "party",
    body: "slim", accessory: "bowtie", background: "stars", effect: "fireflies",
    colors: { head: "#FF69B4", eyes: "#2C3E50", mouth: "#E74C3C", hat: "#9B59B6", body: "#1ABC9C", accessory: "#E74C3C", background: "#16213E", effect: "#FFD700" },
  },
  {
    head: "cat", eyes: "hearts", mouth: "fangs", hat: "horns",
    body: "ghost", accessory: "aura", background: "portal", effect: "sparkle",
    colors: { head: "#2C3E50", eyes: "#FF1493", mouth: "#E74C3C", hat: "#1A1A2E", body: "#A0A0C0", accessory: "#9B59B6", background: "#0D0D1A", effect: "#FFD700" },
  },
  {
    head: "diamond", eyes: "multi", mouth: "fire", hat: "wizard",
    body: "dragon", accessory: "aura", background: "firebg", effect: "lightning",
    colors: { head: "#E74C3C", eyes: "#9B59B6", mouth: "#FF4500", hat: "#4B0082", body: "#8B0000", accessory: "#FF4500", background: "#1A0A00", effect: "#FFD700" },
  },
  {
    head: "hexagon", eyes: "sleepy", mouth: "flat", hat: "halo",
    body: "default", accessory: "scarf", background: "gradient", effect: "glow",
    colors: { head: "#4ECDC4", eyes: "#2C3E50", mouth: "#95A5A6", hat: "#FFD700", body: "#3498DB", accessory: "#E74C3C", background: "#1A1A2E", effect: "#4ECDC4" },
  },
  {
    head: "oval", eyes: "wink", mouth: "smile", hat: "tophat",
    body: "armored", accessory: "monocle", background: "grid", effect: "shadow",
    colors: { head: "#D4A574", eyes: "#2C3E50", mouth: "#C0392B", hat: "#1A1A2E", body: "#7F8C8D", accessory: "#FFD700", background: "#2C3E50", effect: "#1A1A2E" },
  },
];

// ─── Local Storage Helpers ──────────────────────────────────

function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__ws_avatar_test__";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function loadState(): AvatarCustomizerState {
  if (!isLocalStorageAvailable()) {
    return createFreshState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createFreshState();
    const parsed: AvatarCustomizerState = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return createFreshState();
    if (!Array.isArray(parsed.current?.colors) && typeof parsed.current?.colors !== "object") {
      return createFreshState();
    }
    if (!parsed.history) parsed.history = [];
    if (!parsed.unlockedParts) parsed.unlockedParts = [];
    if (!parsed.outfits) parsed.outfits = [];
    if (typeof parsed.activeSlot !== "number") parsed.activeSlot = 0;
    return parsed;
  } catch {
    return createFreshState();
  }
}

function persistState(state: AvatarCustomizerState): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — silently ignore */
  }
}

function createFreshState(): AvatarCustomizerState {
  return {
    current: structuredClone(DEFAULT_AVATAR),
    outfits: [],
    unlockedParts: getAllCommonPartIds(),
    history: [],
    activeSlot: 0,
    initialized: false,
    version: STATE_VERSION,
  };
}

function getAllCommonPartIds(): string[] {
  const ids: string[] = [];
  for (const partId of ALL_PART_IDS) {
    const part = PART_REGISTRY[partId];
    for (const opt of part.options) {
      if (opt.rarity === "common") {
        ids.push(`${partId}:${opt.id}`);
      }
    }
  }
  return ids;
}

function deepCloneAvatar(avatar: AvatarData): AvatarData {
  return {
    ...avatar,
    colors: { ...avatar.colors },
  };
}

// ─── 1. initAvatarCustomizer ────────────────────────────────

export function initAvatarCustomizer(): AvatarCustomizerState {
  const state = loadState();
  if (!state.initialized) {
    const fresh = createFreshState();
    fresh.initialized = true;
    persistState(fresh);
    return fresh;
  }
  return state;
}

// ─── 2. getParts ────────────────────────────────────────────

export function getParts(): AvatarPart[] {
  return ALL_PART_IDS.map((id) => {
    const reg = PART_REGISTRY[id];
    return {
      id,
      label: reg.label,
      icon: reg.icon,
      options: reg.options,
    };
  });
}

// ─── 3. getPartOptions ──────────────────────────────────────

export function getPartOptions(partId: PartId): PartOption[] {
  return PART_REGISTRY[partId]?.options ?? [];
}

// ─── 4. getCurrentAvatarData ───────────────────────────────

export function getCurrentAvatarData(): AvatarData {
  const state = loadState();
  return deepCloneAvatar(state.current);
}

// ─── 5. setPart ─────────────────────────────────────────────

export function setPart(partId: PartId, optionId: string): AvatarData {
  const state = loadState();
  const part = PART_REGISTRY[partId];
  if (!part) return deepCloneAvatar(state.current);

  const exists = part.options.some((o) => o.id === optionId);
  if (!exists) return deepCloneAvatar(state.current);

  (state.current as unknown as Record<string, string>)[partId] = optionId;
  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 6. getRandomizeAvatar ──────────────────────────────────

export function getRandomizeAvatar(): AvatarData {
  const state = loadState();
  const unlocked = new Set(state.unlockedParts);

  for (const partId of ALL_PART_IDS) {
    const part = PART_REGISTRY[partId];
    const available = part.options.filter((o) => unlocked.has(`${partId}:${o.id}`));
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      (state.current as unknown as Record<string, string>)[partId] = pick.id;
    }
  }

  for (const partId of ALL_PART_IDS) {
    state.current.colors[partId] = randomHexColor();
  }

  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 7. getPresetAvatars ────────────────────────────────────

export function getPresetAvatars(): AvatarData[] {
  return AVATAR_PRESETS.map(deepCloneAvatar);
}

// ─── 8. applyPreset ─────────────────────────────────────────

export function applyPreset(presetIndex: number): AvatarData {
  const state = loadState();
  if (presetIndex < 0 || presetIndex >= AVATAR_PRESETS.length) {
    return deepCloneAvatar(state.current);
  }
  state.current = deepCloneAvatar(AVATAR_PRESETS[presetIndex]);
  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 9. saveOutfit ──────────────────────────────────────────

export function saveOutfit(name: string, slot?: number): Outfit {
  const state = loadState();
  const targetSlot = slot ?? state.activeSlot;
  const outfitId = `outfit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const outfit: Outfit = {
    id: outfitId,
    name: name.trim() || "Unnamed Outfit",
    avatar: deepCloneAvatar(state.current),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slot: targetSlot,
  };

  const existingIdx = state.outfits.findIndex((o) => o.slot === targetSlot);
  if (existingIdx >= 0) {
    outfit.createdAt = state.outfits[existingIdx].createdAt;
    state.outfits[existingIdx] = outfit;
  } else {
    state.outfits.push(outfit);
  }

  persistState(state);
  return { ...outfit };
}

// ─── 10. loadOutfit ─────────────────────────────────────────

export function loadOutfit(outfitId: string): AvatarData | null {
  const state = loadState();
  const outfit = state.outfits.find((o) => o.id === outfitId);
  if (!outfit) return null;
  state.current = deepCloneAvatar(outfit.avatar);
  state.activeSlot = outfit.slot;
  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 11. deleteOutfit ───────────────────────────────────────

export function deleteOutfit(outfitId: string): boolean {
  const state = loadState();
  const idx = state.outfits.findIndex((o) => o.id === outfitId);
  if (idx < 0) return false;
  state.outfits.splice(idx, 1);
  persistState(state);
  return true;
}

// ─── 12. getOutfits ─────────────────────────────────────────

export function getOutfits(): Outfit[] {
  const state = loadState();
  return state.outfits.map((o) => ({
    ...o,
    avatar: deepCloneAvatar(o.avatar),
  }));
}

// ─── 13. generateShareCode ──────────────────────────────────

export function generateShareCode(): string {
  const state = loadState();
  const av = state.current;
  const parts = ALL_PART_IDS.map((p) => av[p]).join(".");
  const colors = ALL_PART_IDS.map((p) => av.colors[p].replace("#", "")).join(",");
  const payload = `${parts}|${colors}`;
  return btoa(payload);
}

// ─── 14. importAvatarCode ──────────────────────────────────

export function importAvatarCode(code: string): AvatarData | null {
  try {
    const decoded = atob(code.trim());
    const [partsStr, colorsStr] = decoded.split("|");
    if (!partsStr || !colorsStr) return null;

    const parts = partsStr.split(".");
    const colors = colorsStr.split(",");

    if (parts.length !== ALL_PART_IDS.length || colors.length !== ALL_PART_IDS.length) {
      return null;
    }

    const avatar = deepCloneAvatar(DEFAULT_AVATAR);
    const state = loadState();
    const unlocked = new Set(state.unlockedParts);

    for (let i = 0; i < ALL_PART_IDS.length; i++) {
      const partId = ALL_PART_IDS[i];
      const optionId = parts[i];
      const part = PART_REGISTRY[partId];
      const valid = part.options.some((o) => o.id === optionId);
      if (valid) {
        avatar[partId] = optionId;
      }
      const hex = colors[i];
      if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        avatar.colors[partId] = `#${hex}`;
      }
    }

    state.current = avatar;
    pushHistory(state, state.current);
    persistState(state);
    return deepCloneAvatar(avatar);
  } catch {
    return null;
  }
}

// ─── 15. getAvatarStats ─────────────────────────────────────

export function getAvatarStats(): {
  totalUnlocked: number;
  totalParts: number;
  outfitsCount: number;
  historySize: number;
  presetsUsed: number;
} {
  const state = loadState();
  let totalParts = 0;
  for (const pid of ALL_PART_IDS) {
    totalParts += PART_REGISTRY[pid].options.length;
  }

  let presetsUsed = 0;
  for (const preset of AVATAR_PRESETS) {
    const match = ALL_PART_IDS.every((pid) => state.current[pid] === preset[pid]);
    if (match) presetsUsed = 1;
  }

  return {
    totalUnlocked: state.unlockedParts.length,
    totalParts,
    outfitsCount: state.outfits.length,
    historySize: state.history.length,
    presetsUsed,
  };
}

// ─── 16. getMostUsedPart ────────────────────────────────────

export function getMostUsedPart(): { partId: PartId; optionId: string; count: number } | null {
  const state = loadState();
  if (state.history.length === 0) return null;

  const counts: Record<string, number> = {};
  for (const entry of state.history) {
    for (const pid of ALL_PART_IDS) {
      const key = `${pid}:${entry[pid]}`;
      counts[key] = (counts[key] || 0) + 1;
    }
  }

  let maxKey = "";
  let maxCount = 0;
  for (const [key, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxKey = key;
      maxCount = count;
    }
  }

  if (!maxKey) return null;
  const [partId, optionId] = maxKey.split(":") as [PartId, string];
  return { partId, optionId, count: maxCount };
}

// ─── 17. getAvatarHistory ──────────────────────────────────

export function getAvatarHistory(limit: number = 20): AvatarData[] {
  const state = loadState();
  return state.history.slice(-limit).map(deepCloneAvatar);
}

// ─── 18. getAvatarOverview ──────────────────────────────────

export function getAvatarOverview(): {
  current: AvatarData;
  partsConfigured: number;
  totalParts: number;
  hasCustomColors: boolean;
  unlockedPercentage: number;
  recentChangeCount: number;
} {
  const state = loadState();
  let totalParts = 0;
  for (const pid of ALL_PART_IDS) totalParts += PART_REGISTRY[pid].options.length;

  const hasCustomColors = ALL_PART_IDS.some(
    (pid) => state.current.colors[pid] !== DEFAULT_COLORS[pid]
  );

  return {
    current: deepCloneAvatar(state.current),
    partsConfigured: ALL_PART_IDS.length,
    totalParts,
    hasCustomColors,
    unlockedPercentage: totalParts > 0 ? (state.unlockedParts.length / totalParts) * 100 : 0,
    recentChangeCount: Math.min(state.history.length, 20),
  };
}

// ─── 19. getAvatarCard ──────────────────────────────────────

export function getAvatarCard(): {
  avatar: AvatarData;
  rarityScore: number;
  dominantRarity: Rarity;
  svgLayers: { part: string; svg: string; color: string }[];
} {
  const avatar = getCurrentAvatarData();
  const layers: { part: string; svg: string; color: string }[] = [];
  const rarityCounts: Record<Rarity, number> = {
    common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0,
  };
  let rarityScore = 0;

  const rarityValues: Record<Rarity, number> = {
    common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16,
  };

  for (const pid of ALL_PART_IDS) {
    const reg = PART_REGISTRY[pid];
    const optId = avatar[pid];
    const opt = reg.options.find((o) => o.id === optId);
    if (opt && opt.svg) {
      layers.push({
        part: reg.label,
        svg: opt.svg,
        color: avatar.colors[pid],
      });
      rarityCounts[opt.rarity]++;
      rarityScore += rarityValues[opt.rarity];
    }
  }

  let dominantRarity: Rarity = "common";
  let maxCount = 0;
  for (const r of RARITY_ORDER) {
    if (rarityCounts[r] > maxCount) {
      maxCount = rarityCounts[r];
      dominantRarity = r;
    }
  }

  return { avatar, rarityScore, dominantRarity, svgLayers: layers };
}

// ─── 20. getPartGrid ────────────────────────────────────────

export function getPartGrid(partId: PartId): {
  partId: PartId;
  label: string;
  icon: string;
  options: {
    id: string;
    label: string;
    svg: string;
    rarity: Rarity;
    rarityColor: string;
    unlocked: boolean;
    cost: number;
  }[];
} {
  const state = loadState();
  const unlocked = new Set(state.unlockedParts);
  const reg = PART_REGISTRY[partId];

  return {
    partId,
    label: reg.label,
    icon: reg.icon,
    options: reg.options.map((opt) => ({
      id: opt.id,
      label: opt.label,
      svg: opt.svg,
      rarity: opt.rarity,
      rarityColor: RARITY_COLORS[opt.rarity],
      unlocked: unlocked.has(`${partId}:${opt.id}`),
      cost: opt.unlockCost,
    })),
  };
}

// ─── 21. getActiveSlot ──────────────────────────────────────

export function getActiveSlot(): number {
  const state = loadState();
  return state.activeSlot;
}

// ─── 22. getAvatarPreview ──────────────────────────────────

export function getAvatarPreview(avatar?: AvatarData): string {
  const av = avatar ?? getCurrentAvatarData();
  const layerOrder: PartId[] = ["background", "effect", "body", "accessory", "head", "eyes", "mouth", "hat"];
  let svgContent = "";

  for (const pid of layerOrder) {
    const optId = av[pid];
    const opt = PART_REGISTRY[pid].options.find((o) => o.id === optId);
    if (opt && opt.svg) {
      svgContent += `<g style="color:${av.colors[pid]}">${opt.svg}</g>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="200" height="280">${svgContent}</svg>`;
}

// ─── 23. getColorForPart ────────────────────────────────────

export function getColorForPart(partId: PartId): string {
  const state = loadState();
  return state.current.colors[partId] ?? DEFAULT_COLORS[partId];
}

// ─── 24. setColorForPart ────────────────────────────────────

export function setColorForPart(partId: PartId, color: string): AvatarData {
  const state = loadState();
  const hex = sanitizeHex(color);
  if (!hex) return deepCloneAvatar(state.current);
  state.current.colors[partId] = hex;
  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 25. getColors ──────────────────────────────────────────

export function getColors(): Record<PartId, string> {
  const state = loadState();
  return { ...state.current.colors };
}

// ─── 26. unlockPart ─────────────────────────────────────────

export function unlockPart(partId: PartId, optionId: string): { success: boolean; cost: number } {
  const state = loadState();
  const key = `${partId}:${optionId}`;
  if (state.unlockedParts.includes(key)) {
    return { success: true, cost: 0 };
  }

  const opt = PART_REGISTRY[partId]?.options.find((o) => o.id === optionId);
  if (!opt) return { success: false, cost: 0 };

  state.unlockedParts.push(key);
  persistState(state);
  return { success: true, cost: opt.unlockCost };
}

// ─── 27. isPartUnlocked ─────────────────────────────────────

export function isPartUnlocked(partId: PartId, optionId: string): boolean {
  const state = loadState();
  return state.unlockedParts.includes(`${partId}:${optionId}`);
}

// ─── 28. getUnlockProgress ──────────────────────────────────

export function getUnlockProgress(): {
  unlocked: number;
  total: number;
  percentage: number;
  byRarity: Record<Rarity, { unlocked: number; total: number }>;
  nextRarityToUnlock: Rarity | null;
} {
  const state = loadState();
  const unlocked = new Set(state.unlockedParts);
  let total = 0;
  const byRarity: Record<Rarity, { unlocked: number; total: number }> = {
    common: { unlocked: 0, total: 0 },
    uncommon: { unlocked: 0, total: 0 },
    rare: { unlocked: 0, total: 0 },
    epic: { unlocked: 0, total: 0 },
    legendary: { unlocked: 0, total: 0 },
  };

  for (const pid of ALL_PART_IDS) {
    for (const opt of PART_REGISTRY[pid].options) {
      total++;
      byRarity[opt.rarity].total++;
      if (unlocked.has(`${pid}:${opt.id}`)) {
        byRarity[opt.rarity].unlocked++;
      }
    }
  }

  const unlockedCount = unlocked.size;
  let nextRarityToUnlock: Rarity | null = null;
  for (const r of RARITY_ORDER) {
    if (byRarity[r].unlocked < byRarity[r].total) {
      nextRarityToUnlock = r;
      break;
    }
  }

  return {
    unlocked: unlockedCount,
    total,
    percentage: total > 0 ? (unlockedCount / total) * 100 : 0,
    byRarity,
    nextRarityToUnlock,
  };
}

// ─── 29. getFullAvatar ──────────────────────────────────────

export function getFullAvatar(): {
  data: AvatarData;
  layers: { partId: PartId; label: string; optionId: string; optionLabel: string; svg: string; color: string }[];
} {
  const state = loadState();
  const av = state.current;
  const layers = ALL_PART_IDS.map((pid) => {
    const reg = PART_REGISTRY[pid];
    const optId = av[pid];
    const opt = reg.options.find((o) => o.id === optId);
    return {
      partId: pid,
      label: reg.label,
      optionId: optId,
      optionLabel: opt?.label ?? "Unknown",
      svg: opt?.svg ?? "",
      color: av.colors[pid],
    };
  });

  return { data: deepCloneAvatar(av), layers };
}

// ─── 30. resetAvatar ────────────────────────────────────────

export function resetAvatar(): AvatarData {
  const state = loadState();
  state.current = structuredClone(DEFAULT_AVATAR);
  pushHistory(state, state.current);
  persistState(state);
  return deepCloneAvatar(state.current);
}

// ─── 31. getPartCounts ──────────────────────────────────────

export function getPartCounts(): Record<PartId, number> {
  const counts: Record<string, number> = {};
  for (const pid of ALL_PART_IDS) {
    counts[pid] = PART_REGISTRY[pid].options.length;
  }
  return counts as Record<PartId, number>;
}

// ─── 32. getRarityForPart ──────────────────────────────────

export function getRarityForPart(partId: PartId, optionId: string): Rarity | null {
  const opt = PART_REGISTRY[partId]?.options.find((o) => o.id === optionId);
  return opt?.rarity ?? null;
}

// ─── 33. getAvatarGallery ──────────────────────────────────

export function getAvatarGallery(): {
  presets: { name: string; index: number; avatar: AvatarData }[];
  outfits: Outfit[];
  recent: AvatarData[];
} {
  const state = loadState();
  const presets = AVATAR_PRESETS.map((p, i) => ({
    name: `Preset ${i + 1}`,
    index: i,
    avatar: deepCloneAvatar(p),
  }));

  return {
    presets,
    outfits: state.outfits.map((o) => ({
      ...o,
      avatar: deepCloneAvatar(o.avatar),
    })),
    recent: state.history.slice(-6).map(deepCloneAvatar),
  };
}

// ─── 34. getCollectionProgress ─────────────────────────────

export function getCollectionProgress(): {
  overall: { collected: number; total: number; percentage: number };
  byPart: Record<PartId, { collected: number; total: number; missing: string[] }>;
  completionBonus: number;
} {
  const state = loadState();
  const unlocked = new Set(state.unlockedParts);
  let totalCollected = 0;
  let totalAvailable = 0;

  const byPart: Record<string, { collected: number; total: number; missing: string[] }> = {};

  for (const pid of ALL_PART_IDS) {
    const opts = PART_REGISTRY[pid].options;
    const collected = opts.filter((o) => unlocked.has(`${pid}:${o.id}`)).length;
    const missing = opts.filter((o) => !unlocked.has(`${pid}:${o.id}`)).map((o) => o.label);
    byPart[pid] = { collected, total: opts.length, missing };
    totalCollected += collected;
    totalAvailable += opts.length;
  }

  const percentage = totalAvailable > 0 ? (totalCollected / totalAvailable) * 100 : 0;
  const completionBonus = Math.floor(percentage / 10) * 50;

  return {
    overall: { collected: totalCollected, total: totalAvailable, percentage },
    byPart: byPart as Record<PartId, { collected: number; total: number; missing: string[] }>,
    completionBonus,
  };
}

// ─── 35. suggestAvatar ─────────────────────────────────────

export function suggestAvatar(): {
  avatar: AvatarData;
  suggestionReason: string;
  partsChanged: string[];
} {
  const state = loadState();
  const current = deepCloneAvatar(state.current);
  const unlocked = new Set(state.unlockedParts);
  const partsChanged: string[] = [];
  const reasons: string[] = [];

  const hasNoneHat = current.hat === "none";
  const hasNoneAcc = current.accessory === "none";
  const hasNoneEffect = current.effect === "none";

  if (hasNoneHat) {
    const available = PART_REGISTRY.hat.options.filter(
      (o) => o.id !== "none" && unlocked.has(`hat:${o.id}`)
    );
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      current.hat = pick.id;
      partsChanged.push("hat");
      reasons.push(`Try the "${pick.label}" hat`);
    }
  }

  if (hasNoneAcc) {
    const available = PART_REGISTRY.accessory.options.filter(
      (o) => o.id !== "none" && unlocked.has(`accessory:${o.id}`)
    );
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      current.accessory = pick.id;
      partsChanged.push("accessory");
      reasons.push(`Add "${pick.label}" as an accessory`);
    }
  }

  if (hasNoneEffect) {
    const available = PART_REGISTRY.effect.options.filter(
      (o) => o.id !== "none" && unlocked.has(`effect:${o.id}`)
    );
    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      current.effect = pick.id;
      partsChanged.push("effect");
      reasons.push(`Enable "${pick.label}" effect`);
    }
  }

  if (partsChanged.length === 0) {
    const randomPart = ALL_PART_IDS[Math.floor(Math.random() * ALL_PART_IDS.length)];
    const available = PART_REGISTRY[randomPart].options.filter((o) =>
      unlocked.has(`${randomPart}:${o.id}`)
    );
    if (available.length > 1) {
      const other = available.filter((o) => o.id !== current[randomPart]);
      if (other.length > 0) {
        const pick = other[Math.floor(Math.random() * other.length)];
        current[randomPart] = pick.id;
        partsChanged.push(randomPart);
        reasons.push(`Switch to "${pick.label}" ${PART_REGISTRY[randomPart].label}`);
      }
    }
  }

  const suggestionReason =
    reasons.length > 0 ? reasons.join(". ") + "." : "Your avatar looks great already!";

  state.current = current;
  pushHistory(state, current);
  persistState(state);

  return { avatar: deepCloneAvatar(current), suggestionReason, partsChanged };
}

// ─── 36. getAvatarBanner ───────────────────────────────────

export function getAvatarBanner(): {
  svgString: string;
  width: number;
  height: number;
  title: string;
  subtitle: string;
} {
  const avatar = getCurrentAvatarData();
  const card = getAvatarCard();
  const rarityColor = RARITY_COLORS[card.dominantRarity];

  const layerOrder: PartId[] = ["background", "effect", "body", "accessory", "head", "eyes", "mouth", "hat"];
  let svgContent = "";

  for (const pid of layerOrder) {
    const optId = avatar[pid];
    const opt = PART_REGISTRY[pid].options.find((o) => o.id === optId);
    if (opt && opt.svg) {
      svgContent += `<g style="color:${avatar.colors[pid]}">${opt.svg}</g>`;
    }
  }

  const rarityBar = `<rect x="0" y="0" width="320" height="44" rx="12" fill="${rarityColor}" opacity="0.15"/>
    <rect x="0" y="42" width="320" height="2" fill="${rarityColor}" opacity="0.4"/>
    <text x="160" y="20" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="${rarityColor}">${capitalize(card.dominantRarity)}</text>
    <text x="160" y="36" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#aaa">Score: ${card.rarityScore}</text>`;

  const bannerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380" width="320" height="380">
    <defs>
      <linearGradient id="bannerBg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1A1A2E"/>
        <stop offset="100%" stop-color="#0D0D1A"/>
      </linearGradient>
    </defs>
    <rect width="320" height="380" rx="16" fill="url(#bannerBg)" stroke="${rarityColor}" stroke-width="1.5" opacity="0.9"/>
    ${rarityBar}
    <g transform="translate(110, 50) scale(1.8)">${svgContent}</g>
    <rect x="20" y="310" width="280" height="56" rx="10" fill="#ffffff" opacity="0.05"/>
    <text x="160" y="338" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="bold" fill="#ffffff">Word Snake Avatar</text>
    <text x="160" y="358" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#888">Customize your slithery style</text>
  </svg>`;

  return {
    svgString: bannerSvg,
    width: 320,
    height: 380,
    title: "Word Snake Avatar",
    subtitle: "Customize your slithery style",
  };
}

// ─── Internal Helpers ───────────────────────────────────────

function pushHistory(state: AvatarCustomizerState, avatar: AvatarData): void {
  const snapshot = deepCloneAvatar(avatar);
  const last = state.history[state.history.length - 1];
  const isSame = last && ALL_PART_IDS.every((pid) => last[pid] === snapshot[pid] && last.colors[pid] === snapshot.colors[pid]);
  if (!isSame) {
    state.history.push(snapshot);
    if (state.history.length > 100) {
      state.history = state.history.slice(-50);
    }
  }
}

function randomHexColor(): string {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function sanitizeHex(input: string): string | null {
  const cleaned = input.trim().replace(/^#/, "");
  if (/^[0-9A-Fa-f]{6}$/.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }
  if (/^[0-9A-Fa-f]{3}$/.test(cleaned)) {
    return `#${cleaned[0]}${cleaned[0]}${cleaned[1]}${cleaned[1]}${cleaned[2]}${cleaned[2]}`.toUpperCase();
  }
  return null;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
