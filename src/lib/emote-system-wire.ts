// =============================================================================
// Emote System Wire — Word Snake Game
// =============================================================================
// 40+ emotes across 8 categories, 6 themed packs, 3 emote combos,
// quick-emote bar, history tracking, usage stats, and game-context suggestions.
// Persistence via localStorage (key: ws_emote_system_wire).
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Emote {
  id: string;
  emoji: string;
  name: string;
  category: string;
  animation: EmoteAnimation;
  unlockCondition: string;
  unlocked: boolean;
  useCount: number;
  packId: string | null;
}

export type EmoteAnimation = 'bounce' | 'spin' | 'shake' | 'pulse' | 'float';

export interface EmoteCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  emoteCount: number;
}

export interface EmotePack {
  id: string;
  name: string;
  description: string;
  icon: string;
  emoteIds: string[];
  price: number;
  unlocked: boolean;
}

export interface EmoteCombo {
  id: string;
  sequence: string[];
  name: string;
  description: string;
  effectClass: string;
  effectDuration: number;
  effectColor: string;
}

export interface EmoteHistoryEntry {
  emoteId: string;
  timestamp: number;
  context: string;
}

export interface QuickEmoteSlot {
  slot: number;
  emoteId: string | null;
}

export interface EmoteState {
  emotes: Emote[];
  quickSlots: QuickEmoteSlot[];
  history: EmoteHistoryEntry[];
  packs: EmotePack[];
  activeComboEffect: { effectClass: string; expiresAt: number } | null;
  initialized: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'ws_emote_system_wire';

const ANIMATION_MAP: Record<EmoteAnimation, string> = {
  bounce: 'emote-anim-bounce',
  spin: 'emote-anim-spin',
  shake: 'emote-anim-shake',
  pulse: 'emote-anim-pulse',
  float: 'emote-anim-float',
};

const BASIC_EMOTE_IDS = [
  'happy_smile',
  'happy_laugh',
  'sad_cry',
  'angry_rage',
  'cool_sunglasses',
  'celebrate_party',
  'think_hmm',
  'love_heart',
  'game_pad',
  'cool_smirk',
];

// ---------------------------------------------------------------------------
// Default Emote Definitions (42 core + 38 pack = 80 total)
// ---------------------------------------------------------------------------

function buildDefaultEmotes(): Omit<Emote, 'unlocked' | 'useCount'>[] {
  return [
    // ── Happy ────────────────────────────────────────────────────────────
    {
      id: 'happy_smile',
      emoji: '😊',
      name: 'Smile',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'happy_laugh',
      emoji: '😂',
      name: 'Laugh',
      category: 'happy',
      animation: 'shake',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'happy_grin',
      emoji: '😁',
      name: 'Grin',
      category: 'happy',
      animation: 'pulse',
      unlockCondition: 'Use 5 emotes total',
      packId: null,
    },
    {
      id: 'happy_giggle',
      emoji: '🤭',
      name: 'Giggle',
      category: 'happy',
      animation: 'float',
      unlockCondition: 'Score 100 points in a single game',
      packId: null,
    },
    {
      id: 'happy_wink',
      emoji: '😉',
      name: 'Wink',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'Win 3 games',
      packId: null,
    },
    {
      id: 'happy_star',
      emoji: '🤩',
      name: 'Star Struck',
      category: 'happy',
      animation: 'spin',
      unlockCondition: 'Reach a 5× word combo',
      packId: null,
    },

    // ── Sad ──────────────────────────────────────────────────────────────
    {
      id: 'sad_cry',
      emoji: '😢',
      name: 'Cry',
      category: 'sad',
      animation: 'bounce',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'sad_sob',
      emoji: '😭',
      name: 'Sob',
      category: 'sad',
      animation: 'shake',
      unlockCondition: 'Lose 5 games',
      packId: null,
    },
    {
      id: 'sad_frown',
      emoji: '☹️',
      name: 'Frown',
      category: 'sad',
      animation: 'pulse',
      unlockCondition: 'Miss 10 words',
      packId: null,
    },
    {
      id: 'sad_pensive',
      emoji: '😔',
      name: 'Pensive',
      category: 'sad',
      animation: 'float',
      unlockCondition: 'Have a combo broken 5 times',
      packId: null,
    },
    {
      id: 'sad_melt',
      emoji: '😰',
      name: 'Melt',
      category: 'sad',
      animation: 'shake',
      unlockCondition: 'Die 10 times total',
      packId: null,
    },

    // ── Angry ────────────────────────────────────────────────────────────
    {
      id: 'angry_rage',
      emoji: '😡',
      name: 'Rage',
      category: 'angry',
      animation: 'shake',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'angry_mad',
      emoji: '😠',
      name: 'Mad',
      category: 'angry',
      animation: 'pulse',
      unlockCondition: 'Play 10 games',
      packId: null,
    },
    {
      id: 'angry_explode',
      emoji: '🤬',
      name: 'Explode',
      category: 'angry',
      animation: 'shake',
      unlockCondition: 'Reach boss mode',
      packId: null,
    },
    {
      id: 'angry_horns',
      emoji: '👿',
      name: 'Horns',
      category: 'angry',
      animation: 'spin',
      unlockCondition: 'Survive for 60 seconds',
      packId: null,
    },
    {
      id: 'angry_skull',
      emoji: '💀',
      name: 'Skull',
      category: 'angry',
      animation: 'pulse',
      unlockCondition: 'Die 20 times total',
      packId: null,
    },

    // ── Cool ─────────────────────────────────────────────────────────────
    {
      id: 'cool_sunglasses',
      emoji: '😎',
      name: 'Sunglasses',
      category: 'cool',
      animation: 'spin',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'cool_smirk',
      emoji: '😏',
      name: 'Smirk',
      category: 'cool',
      animation: 'float',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'cool_cowboy',
      emoji: '🤠',
      name: 'Cowboy',
      category: 'cool',
      animation: 'bounce',
      unlockCondition: 'Collect 50 coins',
      packId: null,
    },
    {
      id: 'cool_robot',
      emoji: '🤖',
      name: 'Robot',
      category: 'cool',
      animation: 'pulse',
      unlockCondition: 'Unlock 15 emotes',
      packId: null,
    },
    {
      id: 'cool_ninja',
      emoji: '🥷',
      name: 'Ninja',
      category: 'cool',
      animation: 'float',
      unlockCondition: 'Complete a daily challenge',
      packId: null,
    },

    // ── Celebrate ────────────────────────────────────────────────────────
    {
      id: 'celebrate_party',
      emoji: '🎉',
      name: 'Party',
      category: 'celebrate',
      animation: 'bounce',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'celebrate_fireworks',
      emoji: '🎆',
      name: 'Fireworks',
      category: 'celebrate',
      animation: 'spin',
      unlockCondition: 'Reach level 5',
      packId: null,
    },
    {
      id: 'celebrate_trophy',
      emoji: '🏆',
      name: 'Trophy',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Reach top 10 on the leaderboard',
      packId: null,
    },
    {
      id: 'celebrate_confetti',
      emoji: '🎊',
      name: 'Confetti',
      category: 'celebrate',
      animation: 'float',
      unlockCondition: 'Win 10 games',
      packId: null,
    },
    {
      id: 'celebrate_medal',
      emoji: '🥇',
      name: 'Gold Medal',
      category: 'celebrate',
      animation: 'spin',
      unlockCondition: 'Score 1000 points in a single game',
      packId: null,
    },
    {
      id: 'celebrate_crown',
      emoji: '👑',
      name: 'Crown',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Unlock 25 emotes',
      packId: null,
    },

    // ── Thinking ─────────────────────────────────────────────────────────
    {
      id: 'think_hmm',
      emoji: '🤔',
      name: 'Hmm',
      category: 'thinking',
      animation: 'float',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'think_monocle',
      emoji: '🧐',
      name: 'Monocle',
      category: 'thinking',
      animation: 'pulse',
      unlockCondition: 'Solve a word puzzle',
      packId: null,
    },
    {
      id: 'think_bulb',
      emoji: '💡',
      name: 'Lightbulb',
      category: 'thinking',
      animation: 'spin',
      unlockCondition: 'Find 5 rare words',
      packId: null,
    },
    {
      id: 'think_zzz',
      emoji: '💤',
      name: 'Sleepy',
      category: 'thinking',
      animation: 'float',
      unlockCondition: 'Idle for 60 seconds in-game',
      packId: null,
    },
    {
      id: 'think_alien',
      emoji: '👽',
      name: 'Alien',
      category: 'thinking',
      animation: 'spin',
      unlockCondition: 'Play every game mode at least once',
      packId: null,
    },

    // ── Love ─────────────────────────────────────────────────────────────
    {
      id: 'love_heart',
      emoji: '❤️',
      name: 'Heart',
      category: 'love',
      animation: 'pulse',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'love_hearts',
      emoji: '💕',
      name: 'Two Hearts',
      category: 'love',
      animation: 'float',
      unlockCondition: 'Play a game with a friend',
      packId: null,
    },
    {
      id: 'love_kiss',
      emoji: '😘',
      name: 'Kiss',
      category: 'love',
      animation: 'bounce',
      unlockCondition: 'Send 20 emotes',
      packId: null,
    },
    {
      id: 'love_sparkle',
      emoji: '✨',
      name: 'Sparkle',
      category: 'love',
      animation: 'spin',
      unlockCondition: 'Unlock all emotes in any category',
      packId: null,
    },
    {
      id: 'love_rainbow',
      emoji: '🌈',
      name: 'Rainbow',
      category: 'love',
      animation: 'float',
      unlockCondition: 'Unlock 35 emotes',
      packId: null,
    },

    // ── Gaming ───────────────────────────────────────────────────────────
    {
      id: 'game_pad',
      emoji: '🎮',
      name: 'Gamepad',
      category: 'gaming',
      animation: 'pulse',
      unlockCondition: 'basic',
      packId: null,
    },
    {
      id: 'game_stick',
      emoji: '🕹️',
      name: 'Joystick',
      category: 'gaming',
      animation: 'bounce',
      unlockCondition: 'Play a PvP match',
      packId: null,
    },
    {
      id: 'game_dice',
      emoji: '🎲',
      name: 'Dice',
      category: 'gaming',
      animation: 'spin',
      unlockCondition: 'Play a minigame',
      packId: null,
    },
    {
      id: 'game_target',
      emoji: '🎯',
      name: 'Target',
      category: 'gaming',
      animation: 'pulse',
      unlockCondition: 'Achieve 90% word accuracy in a game',
      packId: null,
    },
    {
      id: 'game_speed',
      emoji: '⚡',
      name: 'Speed',
      category: 'gaming',
      animation: 'spin',
      unlockCondition: 'Complete a speed run under 60 seconds',
      packId: null,
    },

    // ── Pack: Animals ────────────────────────────────────────────────────
    {
      id: 'pack_animals_dog',
      emoji: '🐶',
      name: 'Dog',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },
    {
      id: 'pack_animals_cat',
      emoji: '🐱',
      name: 'Cat',
      category: 'happy',
      animation: 'float',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },
    {
      id: 'pack_animals_bear',
      emoji: '🐻',
      name: 'Bear',
      category: 'cool',
      animation: 'bounce',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },
    {
      id: 'pack_animals_fox',
      emoji: '🦊',
      name: 'Fox',
      category: 'cool',
      animation: 'float',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },
    {
      id: 'pack_animals_rabbit',
      emoji: '🐰',
      name: 'Rabbit',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },
    {
      id: 'pack_animals_panda',
      emoji: '🐼',
      name: 'Panda',
      category: 'thinking',
      animation: 'float',
      unlockCondition: 'Unlock Animals pack',
      packId: 'pack_animals',
    },

    // ── Pack: Food ───────────────────────────────────────────────────────
    {
      id: 'pack_food_pizza',
      emoji: '🍕',
      name: 'Pizza',
      category: 'celebrate',
      animation: 'bounce',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },
    {
      id: 'pack_food_burger',
      emoji: '🍔',
      name: 'Burger',
      category: 'celebrate',
      animation: 'shake',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },
    {
      id: 'pack_food_taco',
      emoji: '🌮',
      name: 'Taco',
      category: 'celebrate',
      animation: 'bounce',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },
    {
      id: 'pack_food_donut',
      emoji: '🍩',
      name: 'Donut',
      category: 'happy',
      animation: 'float',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },
    {
      id: 'pack_food_cake',
      emoji: '🧁',
      name: 'Cupcake',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },
    {
      id: 'pack_food_cookie',
      emoji: '🍪',
      name: 'Cookie',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'Unlock Food pack',
      packId: 'pack_food',
    },

    // ── Pack: Sports ─────────────────────────────────────────────────────
    {
      id: 'pack_sports_soccer',
      emoji: '⚽',
      name: 'Soccer',
      category: 'gaming',
      animation: 'bounce',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },
    {
      id: 'pack_sports_basketball',
      emoji: '🏀',
      name: 'Basketball',
      category: 'gaming',
      animation: 'shake',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },
    {
      id: 'pack_sports_tennis',
      emoji: '🎾',
      name: 'Tennis',
      category: 'gaming',
      animation: 'bounce',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },
    {
      id: 'pack_sports_boxing',
      emoji: '🥊',
      name: 'Boxing',
      category: 'angry',
      animation: 'shake',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },
    {
      id: 'pack_sports_medal_sport',
      emoji: '🏅',
      name: 'Sports Medal',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },
    {
      id: 'pack_sports_bowling',
      emoji: '🎳',
      name: 'Bowling',
      category: 'gaming',
      animation: 'spin',
      unlockCondition: 'Unlock Sports pack',
      packId: 'pack_sports',
    },

    // ── Pack: Fantasy ────────────────────────────────────────────────────
    {
      id: 'pack_fantasy_dragon',
      emoji: '🐉',
      name: 'Dragon',
      category: 'angry',
      animation: 'spin',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },
    {
      id: 'pack_fantasy_wizard',
      emoji: '🧙',
      name: 'Wizard',
      category: 'cool',
      animation: 'pulse',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },
    {
      id: 'pack_fantasy_fairy',
      emoji: '🧚',
      name: 'Fairy',
      category: 'happy',
      animation: 'float',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },
    {
      id: 'pack_fantasy_unicorn',
      emoji: '🦄',
      name: 'Unicorn',
      category: 'love',
      animation: 'bounce',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },
    {
      id: 'pack_fantasy_crystal',
      emoji: '💎',
      name: 'Crystal',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },
    {
      id: 'pack_fantasy_wand',
      emoji: '🪄',
      name: 'Magic Wand',
      category: 'cool',
      animation: 'spin',
      unlockCondition: 'Unlock Fantasy pack',
      packId: 'pack_fantasy',
    },

    // ── Pack: Space ──────────────────────────────────────────────────────
    {
      id: 'pack_space_rocket',
      emoji: '🚀',
      name: 'Rocket',
      category: 'gaming',
      animation: 'spin',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_star',
      emoji: '⭐',
      name: 'Star',
      category: 'happy',
      animation: 'pulse',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_moon',
      emoji: '🌙',
      name: 'Moon',
      category: 'thinking',
      animation: 'float',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_earth',
      emoji: '🌍',
      name: 'Earth',
      category: 'celebrate',
      animation: 'spin',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_ufo',
      emoji: '🛸',
      name: 'UFO',
      category: 'cool',
      animation: 'float',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_alien',
      emoji: '👾',
      name: 'Alien Monster',
      category: 'angry',
      animation: 'spin',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_saturn',
      emoji: '🪐',
      name: 'Saturn',
      category: 'cool',
      animation: 'float',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },
    {
      id: 'pack_space_comet',
      emoji: '☄️',
      name: 'Comet',
      category: 'angry',
      animation: 'spin',
      unlockCondition: 'Unlock Space pack',
      packId: 'pack_space',
    },

    // ── Pack: Music ──────────────────────────────────────────────────────
    {
      id: 'pack_music_note',
      emoji: '🎵',
      name: 'Musical Note',
      category: 'happy',
      animation: 'float',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
    {
      id: 'pack_music_notes',
      emoji: '🎶',
      name: 'Music Notes',
      category: 'happy',
      animation: 'bounce',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
    {
      id: 'pack_music_guitar',
      emoji: '🎸',
      name: 'Guitar',
      category: 'cool',
      animation: 'spin',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
    {
      id: 'pack_music_trumpet',
      emoji: '🎺',
      name: 'Trumpet',
      category: 'celebrate',
      animation: 'pulse',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
    {
      id: 'pack_music_drum',
      emoji: '🥁',
      name: 'Drum',
      category: 'gaming',
      animation: 'shake',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
    {
      id: 'pack_music_mic',
      emoji: '🎤',
      name: 'Microphone',
      category: 'love',
      animation: 'bounce',
      unlockCondition: 'Unlock Music pack',
      packId: 'pack_music',
    },
  ];
}

// ---------------------------------------------------------------------------
// Default Packs
// ---------------------------------------------------------------------------

function buildDefaultPacks(): EmotePack[] {
  return [
    {
      id: 'pack_animals',
      name: 'Animal Kingdom',
      description: 'Adorable animal emotes to express your wild side.',
      icon: '🐾',
      emoteIds: [
        'pack_animals_dog',
        'pack_animals_cat',
        'pack_animals_bear',
        'pack_animals_fox',
        'pack_animals_rabbit',
        'pack_animals_panda',
      ],
      price: 200,
      unlocked: false,
    },
    {
      id: 'pack_food',
      name: 'Foodie Feast',
      description: 'Tasty treats for when words make you hungry.',
      icon: '🍔',
      emoteIds: [
        'pack_food_pizza',
        'pack_food_burger',
        'pack_food_taco',
        'pack_food_donut',
        'pack_food_cake',
        'pack_food_cookie',
      ],
      price: 200,
      unlocked: false,
    },
    {
      id: 'pack_sports',
      name: 'Sports Arena',
      description: 'Get your head in the game with sporty emotes.',
      icon: '🏆',
      emoteIds: [
        'pack_sports_soccer',
        'pack_sports_basketball',
        'pack_sports_tennis',
        'pack_sports_boxing',
        'pack_sports_medal_sport',
        'pack_sports_bowling',
      ],
      price: 250,
      unlocked: false,
    },
    {
      id: 'pack_fantasy',
      name: 'Fantasy Realm',
      description: 'Enchanted emotes from a world of magic and wonder.',
      icon: '🏰',
      emoteIds: [
        'pack_fantasy_dragon',
        'pack_fantasy_wizard',
        'pack_fantasy_fairy',
        'pack_fantasy_unicorn',
        'pack_fantasy_crystal',
        'pack_fantasy_wand',
      ],
      price: 300,
      unlocked: false,
    },
    {
      id: 'pack_space',
      name: 'Cosmic Voyage',
      description: 'Explore the cosmos with out-of-this-world emotes.',
      icon: '🚀',
      emoteIds: [
        'pack_space_rocket',
        'pack_space_star',
        'pack_space_moon',
        'pack_space_earth',
        'pack_space_ufo',
        'pack_space_alien',
        'pack_space_saturn',
        'pack_space_comet',
      ],
      price: 350,
      unlocked: false,
    },
    {
      id: 'pack_music',
      name: 'Sound Stage',
      description: 'Rock out with rhythmic emotes that hit the right note.',
      icon: '🎸',
      emoteIds: [
        'pack_music_note',
        'pack_music_notes',
        'pack_music_guitar',
        'pack_music_trumpet',
        'pack_music_drum',
        'pack_music_mic',
      ],
      price: 250,
      unlocked: false,
    },
  ];
}

// ---------------------------------------------------------------------------
// Default Combos
// ---------------------------------------------------------------------------

const EMOTE_COMBOS: EmoteCombo[] = [
  {
    id: 'combo_rage_quit',
    sequence: ['angry_rage', 'angry_explode', 'sad_cry'],
    name: 'Rage Quit',
    description: 'The classic rage-quit sequence. Screen shakes!',
    effectClass: 'combo-effect-screen-shake',
    effectDuration: 3000,
    effectColor: '#ff4444',
  },
  {
    id: 'combo_victory_lap',
    sequence: ['celebrate_party', 'cool_sunglasses', 'happy_grin'],
    name: 'Victory Lap',
    description: 'Winners celebrate in style. Golden glow!',
    effectClass: 'combo-effect-golden-glow',
    effectDuration: 4000,
    effectColor: '#ffd700',
  },
  {
    id: 'combo_mind_blown',
    sequence: ['think_hmm', 'think_bulb', 'happy_star'],
    name: 'Mind Blown',
    description: 'Eureka moment! Explosive sparkles everywhere!',
    effectClass: 'combo-effect-sparkle-burst',
    effectDuration: 3500,
    effectColor: '#ff69b4',
  },
];

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

const CATEGORIES: EmoteCategory[] = [
  { id: 'happy', name: 'Happy', icon: '😊', color: '#FFD93D', emoteCount: 0 },
  { id: 'sad', name: 'Sad', icon: '😢', color: '#6EC1E4', emoteCount: 0 },
  { id: 'angry', name: 'Angry', icon: '😡', color: '#FF6B6B', emoteCount: 0 },
  { id: 'cool', name: 'Cool', icon: '😎', color: '#A78BFA', emoteCount: 0 },
  { id: 'celebrate', name: 'Celebrate', icon: '🎉', color: '#34D399', emoteCount: 0 },
  { id: 'thinking', name: 'Thinking', icon: '🤔', color: '#F59E0B', emoteCount: 0 },
  { id: 'love', name: 'Love', icon: '❤️', color: '#EC4899', emoteCount: 0 },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#3B82F6', emoteCount: 0 },
];

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function isBrowser(): boolean {
  return typeof globalThis.window !== 'undefined';
}

function loadState(): EmoteState {
  if (!isBrowser()) {
    return buildFreshState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EmoteState;
      if (parsed && Array.isArray(parsed.emotes) && parsed.emotes.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Corrupted data — fall through to fresh state
  }

  return buildFreshState();
}

function saveState(state: EmoteState): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function buildFreshState(): EmoteState {
  const templates = buildDefaultEmotes();
  const emotes: Emote[] = templates.map((t) => ({
    ...t,
    unlocked: BASIC_EMOTE_IDS.includes(t.id),
    useCount: 0,
  }));

  const quickSlots: QuickEmoteSlot[] = Array.from({ length: 6 }, (_, i) => ({
    slot: i,
    emoteId: i < BASIC_EMOTE_IDS.length ? BASIC_EMOTE_IDS[i] : null,
  }));

  const packs = buildDefaultPacks();

  return {
    emotes,
    quickSlots,
    history: [],
    packs,
    activeComboEffect: null,
    initialized: true,
  };
}

// ---------------------------------------------------------------------------
// 1. initEmoteSystem
// ---------------------------------------------------------------------------

export function initEmoteSystem(): EmoteState {
  const existing = loadState();

  // Merge any new emotes/packs added in code updates
  const templates = buildDefaultEmotes();
  const existingIds = new Set(existing.emotes.map((e) => e.id));
  const mergedEmotes = [...existing.emotes];

  for (const tpl of templates) {
    if (!existingIds.has(tpl.id)) {
      mergedEmotes.push({
        ...tpl,
        unlocked: BASIC_EMOTE_IDS.includes(tpl.id),
        useCount: 0,
      });
    }
  }

  const defaultPacks = buildDefaultPacks();
  const existingPackIds = new Set(existing.packs.map((p) => p.id));
  const mergedPacks = [...existing.packs];

  for (const dp of defaultPacks) {
    if (!existingPackIds.has(dp.id)) {
      mergedPacks.push(dp);
    }
  }

  const state: EmoteState = {
    ...existing,
    emotes: mergedEmotes,
    packs: mergedPacks,
    initialized: true,
  };

  saveState(state);
  return state;
}

// ---------------------------------------------------------------------------
// 2. getEmotes
// ---------------------------------------------------------------------------

export function getEmotes(): Emote[] {
  const state = loadState();
  return state.emotes;
}

// ---------------------------------------------------------------------------
// 3. getUnlockedEmotes
// ---------------------------------------------------------------------------

export function getUnlockedEmotes(): Emote[] {
  const state = loadState();
  return state.emotes.filter((e) => e.unlocked);
}

// ---------------------------------------------------------------------------
// 4. getLockedEmotes
// ---------------------------------------------------------------------------

export function getLockedEmotes(): Emote[] {
  const state = loadState();
  return state.emotes.filter((e) => !e.unlocked);
}

// ---------------------------------------------------------------------------
// 5. unlockEmote
// ---------------------------------------------------------------------------

export function unlockEmote(emoteId: string): boolean {
  const state = loadState();
  const idx = state.emotes.findIndex((e) => e.id === emoteId);
  if (idx === -1) return false;
  if (state.emotes[idx].unlocked) return true; // already unlocked

  state.emotes[idx].unlocked = true;
  saveState(state);
  return true;
}

// ---------------------------------------------------------------------------
// 6. getEmote
// ---------------------------------------------------------------------------

export function getEmote(emoteId: string): Emote | null {
  const state = loadState();
  return state.emotes.find((e) => e.id === emoteId) ?? null;
}

// ---------------------------------------------------------------------------
// 7. getEmotesByCategory
// ---------------------------------------------------------------------------

export function getEmotesByCategory(category: string): Emote[] {
  const state = loadState();
  return state.emotes.filter((e) => e.category === category);
}

// ---------------------------------------------------------------------------
// 8. getCategories
// ---------------------------------------------------------------------------

export function getCategories(): EmoteCategory[] {
  const state = loadState();

  const counts: Record<string, number> = {};
  for (const emote of state.emotes) {
    counts[emote.category] = (counts[emote.category] ?? 0) + 1;
  }

  return CATEGORIES.map((cat) => ({
    ...cat,
    emoteCount: counts[cat.id] ?? 0,
  }));
}

// ---------------------------------------------------------------------------
// 9. playEmote
// ---------------------------------------------------------------------------

export function playEmote(emoteId: string, context: string = 'manual'): {
  emote: Emote | null;
  animationClass: string;
  triggeredCombo: EmoteCombo | null;
} | null {
  const state = loadState();
  const idx = state.emotes.findIndex((e) => e.id === emoteId);

  if (idx === -1) return null;
  if (!state.emotes[idx].unlocked) return null;

  // Increment usage
  state.emotes[idx].useCount += 1;

  // Append to history (keep last 200)
  state.history.push({ emoteId, timestamp: Date.now(), context });
  if (state.history.length > 200) {
    state.history = state.history.slice(-200);
  }

  // Check for combo trigger using the last N emotes
  let triggeredCombo: EmoteCombo | null = null;
  const recentIds = state.history.slice(-5).map((h) => h.emoteId);

  for (const combo of EMOTE_COMBOS) {
    const seq = combo.sequence;
    if (seq.length > recentIds.length) continue;

    const tail = recentIds.slice(-seq.length);
    if (tail.every((id, i) => id === seq[i])) {
      triggeredCombo = combo;
      state.activeComboEffect = {
        effectClass: combo.effectClass,
        expiresAt: Date.now() + combo.effectDuration,
      };
      break;
    }
  }

  // Expire old combo effect
  if (state.activeComboEffect && Date.now() > state.activeComboEffect.expiresAt) {
    state.activeComboEffect = null;
  }

  saveState(state);

  const emote = state.emotes[idx];
  return {
    emote,
    animationClass: ANIMATION_MAP[emote.animation],
    triggeredCombo,
  };
}

// ---------------------------------------------------------------------------
// 10. getQuickEmotes
// ---------------------------------------------------------------------------

export function getQuickEmotes(): QuickEmoteSlot[] {
  const state = loadState();
  return state.quickSlots;
}

// ---------------------------------------------------------------------------
// 11. setQuickEmote
// ---------------------------------------------------------------------------

export function setQuickEmote(slot: number, emoteId: string | null): QuickEmoteSlot[] {
  if (slot < 0 || slot > 5) {
    throw new Error(`Invalid quick-emote slot: ${slot}. Must be 0–5.`);
  }

  const state = loadState();

  // Validate emoteId if provided
  if (emoteId !== null) {
    const exists = state.emotes.find((e) => e.id === emoteId);
    if (!exists) {
      throw new Error(`Emote not found: ${emoteId}`);
    }
  }

  state.quickSlots[slot] = { slot, emoteId };
  saveState(state);
  return state.quickSlots;
}

// ---------------------------------------------------------------------------
// 12. getRecentEmotes
// ---------------------------------------------------------------------------

export function getRecentEmotes(count: number = 10): Emote[] {
  const state = loadState();
  const recentIds = state.history
    .slice(-count)
    .reverse()
    .map((h) => h.emoteId);

  const seen = new Set<string>();
  const unique: Emote[] = [];

  for (const id of recentIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const emote = state.emotes.find((e) => e.id === id);
    if (emote) unique.push(emote);
  }

  return unique;
}

// ---------------------------------------------------------------------------
// 13. getEmoteHistory
// ---------------------------------------------------------------------------

export function getEmoteHistory(): EmoteHistoryEntry[] {
  const state = loadState();
  return [...state.history];
}

// ---------------------------------------------------------------------------
// 14. getEmoteStats
// ---------------------------------------------------------------------------

export function getEmoteStats(): {
  totalEmotes: number;
  unlockedCount: number;
  lockedCount: number;
  totalUsage: number;
  mostUsedEmote: Emote | null;
  unlockPercentage: number;
} {
  const state = loadState();
  const total = state.emotes.length;
  const unlocked = state.emotes.filter((e) => e.unlocked).length;
  const locked = total - unlocked;
  const totalUsage = state.emotes.reduce((sum, e) => sum + e.useCount, 0);

  let mostUsedEmote: Emote | null = null;
  if (totalUsage > 0) {
    mostUsedEmote = state.emotes.reduce((best, e) =>
      e.useCount > best.useCount ? e : best,
    );
  }

  return {
    totalEmotes: total,
    unlockedCount: unlocked,
    lockedCount: locked,
    totalUsage,
    mostUsedEmote,
    unlockPercentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
  };
}

// ---------------------------------------------------------------------------
// 15. getMostUsedEmotes
// ---------------------------------------------------------------------------

export function getMostUsedEmotes(count: number = 5): Emote[] {
  const state = loadState();
  return [...state.emotes]
    .filter((e) => e.useCount > 0)
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, count);
}

// ---------------------------------------------------------------------------
// 16. getLeastUsedEmotes
// ---------------------------------------------------------------------------

export function getLeastUsedEmotes(count: number = 5): Emote[] {
  const state = loadState();
  return [...state.emotes]
    .filter((e) => e.unlocked) // Only consider unlocked emotes
    .sort((a, b) => a.useCount - b.useCount)
    .slice(0, count);
}

// ---------------------------------------------------------------------------
// 17. getFavoriteEmote
// ---------------------------------------------------------------------------

export function getFavoriteEmote(): Emote | null {
  const stats = getEmoteStats();
  return stats.mostUsedEmote;
}

// ---------------------------------------------------------------------------
// 18. getEmoteAnimation
// ---------------------------------------------------------------------------

export function getEmoteAnimation(emoteId: string): {
  animationClass: string;
  animationName: EmoteAnimation;
  keyframes: string;
} | null {
  const state = loadState();
  const emote = state.emotes.find((e) => e.id === emoteId);
  if (!emote) return null;

  const animationClass = ANIMATION_MAP[emote.animation];

  const keyframesMap: Record<EmoteAnimation, string> = {
    bounce: `
      @keyframes emoteBounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-12px); }
      }
    `,
    spin: `
      @keyframes emoteSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `,
    shake: `
      @keyframes emoteShake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
    `,
    pulse: `
      @keyframes emotePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.2); }
      }
    `,
    float: `
      @keyframes emoteFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        33% { transform: translateY(-8px) rotate(2deg); }
        66% { transform: translateY(-4px) rotate(-2deg); }
      }
    `,
  };

  return {
    animationClass,
    animationName: emote.animation,
    keyframes: keyframesMap[emote.animation],
  };
}

// ---------------------------------------------------------------------------
// 19. getEmotePack
// ---------------------------------------------------------------------------

export function getEmotePack(packId: string): EmotePack | null {
  const state = loadState();
  return state.packs.find((p) => p.id === packId) ?? null;
}

// ---------------------------------------------------------------------------
// 20. getEmotePacks
// ---------------------------------------------------------------------------

export function getEmotePacks(): EmotePack[] {
  const state = loadState();
  return state.packs.map((pack) => {
    const emotesInPack = state.emotes.filter((e) => e.packId === pack.id);
    return {
      ...pack,
      emoteIds: emotesInPack.map((e) => e.id),
    };
  });
}

// ---------------------------------------------------------------------------
// 21. getPackProgress
// ---------------------------------------------------------------------------

export function getPackProgress(packId: string): {
  total: number;
  unlocked: number;
  percentage: number;
  emotes: { id: string; emoji: string; name: string; unlocked: boolean }[];
} {
  const state = loadState();
  const pack = state.packs.find((p) => p.id === packId);
  if (!pack) {
    return { total: 0, unlocked: 0, percentage: 0, emotes: [] };
  }

  const packEmotes = state.emotes.filter(
    (e) => e.packId === packId,
  );

  const emotes = packEmotes.map((e) => ({
    id: e.id,
    emoji: e.emoji,
    name: e.name,
    unlocked: e.unlocked,
  }));

  const total = emotes.length;
  const unlocked = emotes.filter((e) => e.unlocked).length;

  return {
    total,
    unlocked,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    emotes,
  };
}

// ---------------------------------------------------------------------------
// 22. unlockPack
// ---------------------------------------------------------------------------

export function unlockPack(packId: string): boolean {
  const state = loadState();
  const packIdx = state.packs.findIndex((p) => p.id === packId);
  if (packIdx === -1) return false;
  if (state.packs[packIdx].unlocked) return true; // already unlocked

  state.packs[packIdx].unlocked = true;

  // Unlock all emotes in this pack
  for (let i = 0; i < state.emotes.length; i++) {
    if (state.emotes[i].packId === packId) {
      state.emotes[i].unlocked = true;
    }
  }

  saveState(state);
  return true;
}

// ---------------------------------------------------------------------------
// 23. checkEmoteCombo
// ---------------------------------------------------------------------------

export function checkEmoteCombo(sequence: string[]): EmoteCombo | null {
  for (const combo of EMOTE_COMBOS) {
    if (combo.sequence.length !== sequence.length) continue;
    const matches = combo.sequence.every(
      (id, i) => id === sequence[i],
    );
    if (matches) return combo;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 24. getActiveComboEffect
// ---------------------------------------------------------------------------

export function getActiveComboEffect(): {
  effectClass: string;
  combo: EmoteCombo | null;
  remainingMs: number;
} | null {
  const state = loadState();

  if (!state.activeComboEffect) return null;

  const remaining = state.activeComboEffect.expiresAt - Date.now();
  if (remaining <= 0) {
    // Expired — clean up
    state.activeComboEffect = null;
    saveState(state);
    return null;
  }

  // Find the matching combo definition
  const combo = EMOTE_COMBOS.find(
    (c) => c.effectClass === state.activeComboEffect!.effectClass,
  );

  return {
    effectClass: state.activeComboEffect.effectClass,
    combo: combo ?? null,
    remainingMs: remaining,
  };
}

// ---------------------------------------------------------------------------
// 25. getEmoteUnlockProgress
// ---------------------------------------------------------------------------

export function getEmoteUnlockProgress(): {
  unlocked: number;
  total: number;
  percentage: number;
  recentUnlocks: { id: string; emoji: string; name: string }[];
} {
  const state = loadState();
  const total = state.emotes.length;
  const unlocked = state.emotes.filter((e) => e.unlocked).length;

  // Recent unlocks = emotes with 0 useCount that are unlocked (just unlocked)
  const recentUnlocks = state.emotes
    .filter((e) => e.unlocked && e.useCount === 0)
    .map((e) => ({ id: e.id, emoji: e.emoji, name: e.name }));

  return {
    unlocked,
    total,
    percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
    recentUnlocks,
  };
}

// ---------------------------------------------------------------------------
// 26. getEmoteSystemOverview
// ---------------------------------------------------------------------------

export function getEmoteSystemOverview(): {
  emotes: Emote[];
  categories: EmoteCategory[];
  packs: EmotePack[];
  quickSlots: QuickEmoteSlot[];
  stats: ReturnType<typeof getEmoteStats>;
  recentEmotes: Emote[];
  activeCombo: ReturnType<typeof getActiveComboEffect>;
  unlockProgress: ReturnType<typeof getEmoteUnlockProgress>;
} {
  return {
    emotes: getEmotes(),
    categories: getCategories(),
    packs: getEmotePacks(),
    quickSlots: getQuickEmotes(),
    stats: getEmoteStats(),
    recentEmotes: getRecentEmotes(8),
    activeCombo: getActiveComboEffect(),
    unlockProgress: getEmoteUnlockProgress(),
  };
}

// ---------------------------------------------------------------------------
// 27. getEmoteGrid
// ---------------------------------------------------------------------------

export function getEmoteGrid(
  category: string | null = null,
): {
  columns: number;
  rows: number;
  cells: {
    emote: Emote | null;
    locked: boolean;
    highlight: boolean;
  }[];
} {
  const state = loadState();
  let emotes = state.emotes;

  if (category) {
    emotes = emotes.filter((e) => e.category === category);
  }

  const mostUsed = getMostUsedEmotes(3).map((e) => e.id);

  const columns = 6;
  const rows = Math.ceil(emotes.length / columns);

  const cells: { emote: Emote | null; locked: boolean; highlight: boolean }[] = emotes.map((emote) => ({
    emote,
    locked: !emote.unlocked,
    highlight: mostUsed.includes(emote.id),
  }));

  // Pad to fill grid
  while (cells.length < rows * columns) {
    cells.push({ emote: null, locked: false, highlight: false });
  }

  return { columns, rows, cells };
}

// ---------------------------------------------------------------------------
// 28. getEmoteCard
// ---------------------------------------------------------------------------

export function getEmoteCard(emoteId: string): {
  emote: Emote | null;
  animationClass: string;
  keyframes: string;
  isFavorite: boolean;
  packName: string | null;
  categoryInfo: EmoteCategory | null;
  rankByUsage: number;
} {
  const state = loadState();
  const emote = state.emotes.find((e) => e.id === emoteId) ?? null;

  if (!emote) {
    return {
      emote: null,
      animationClass: '',
      keyframes: '',
      isFavorite: false,
      packName: null,
      categoryInfo: null,
      rankByUsage: 0,
    };
  }

  const animData = getEmoteAnimation(emoteId);
  const fav = getFavoriteEmote();
  const pack = emote.packId
    ? state.packs.find((p) => p.id === emote.packId)
    : null;
  const cats = getCategories();
  const catInfo = cats.find((c) => c.id === emote.category) ?? null;

  // Rank by usage (1 = most used)
  const sorted = [...state.emotes]
    .filter((e) => e.useCount > 0)
    .sort((a, b) => b.useCount - a.useCount);
  const rankByUsage =
    emote.useCount > 0
      ? sorted.findIndex((e) => e.id === emoteId) + 1
      : 0;

  return {
    emote,
    animationClass: animData?.animationClass ?? '',
    keyframes: animData?.keyframes ?? '',
    isFavorite: fav?.id === emoteId,
    packName: pack?.name ?? null,
    categoryInfo: catInfo,
    rankByUsage,
  };
}

// ---------------------------------------------------------------------------
// 29. getEmoteStatsGrid
// ---------------------------------------------------------------------------

export function getEmoteStatsGrid(): {
  totalUnlocked: number;
  totalLocked: number;
  totalUsage: number;
  favoriteEmoji: string | null;
  favoriteName: string | null;
  topEmotes: { emoji: string; name: string; count: number }[];
  categoryBreakdown: { category: string; icon: string; color: string; count: number }[];
  packBreakdown: { packId: string; name: string; icon: string; progress: number }[];
  streakInfo: {
    currentDayStreak: number;
    longestStreak: number;
  };
} {
  const state = loadState();
  const stats = getEmoteStats();
  const fav = stats.mostUsedEmote;
  const topEmotes = getMostUsedEmotes(5).map((e) => ({
    emoji: e.emoji,
    name: e.name,
    count: e.useCount,
  }));

  // Category breakdown
  const catBreakdown = CATEGORIES.map((cat) => ({
    category: cat.id,
    icon: cat.icon,
    color: cat.color,
    count: state.emotes.filter(
      (e) => e.category === cat.id && e.unlocked,
    ).length,
  }));

  // Pack breakdown
  const packBreakdown = state.packs.map((pack) => {
    const progress = getPackProgress(pack.id);
    return {
      packId: pack.id,
      name: pack.name,
      icon: pack.icon,
      progress: progress.percentage,
    };
  });

  // Streak calculation from history
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayMs = 86400000;

  const uniqueDays = new Set<number>();
  for (const entry of state.history) {
    const d = new Date(entry.timestamp);
    d.setHours(0, 0, 0, 0);
    uniqueDays.add(d.getTime());
  }

  let currentDayStreak = 0;
  const checkDate = new Date(today);
  while (uniqueDays.has(checkDate.getTime())) {
    currentDayStreak++;
    checkDate.setTime(checkDate.getTime() - dayMs);
  }

  // Longest streak
  const sortedDays = Array.from(uniqueDays).sort((a, b) => a - b);
  let longestStreak = 0;
  let tempStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    if (sortedDays[i] - sortedDays[i - 1] === dayMs) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    totalUnlocked: stats.unlockedCount,
    totalLocked: stats.lockedCount,
    totalUsage: stats.totalUsage,
    favoriteEmoji: fav?.emoji ?? null,
    favoriteName: fav?.name ?? null,
    topEmotes,
    categoryBreakdown: catBreakdown,
    packBreakdown,
    streakInfo: {
      currentDayStreak,
      longestStreak,
    },
  };
}

// ---------------------------------------------------------------------------
// 30. getQuickEmoteBar
// ---------------------------------------------------------------------------

export function getQuickEmoteBar(): {
  slots: {
    slot: number;
    emoteId: string | null;
    emoji: string | null;
    name: string | null;
    animationClass: string;
  }[];
  defaultEmotes: { id: string; emoji: string; name: string }[];
} {
  const state = loadState();

  const slots = state.quickSlots.map((qs) => {
    if (!qs.emoteId) {
      return {
        slot: qs.slot,
        emoteId: null as string | null,
        emoji: null as string | null,
        name: null as string | null,
        animationClass: '',
      };
    }

    const emote = state.emotes.find((e) => e.id === qs.emoteId);
    return {
      slot: qs.slot,
      emoteId: qs.emoteId,
      emoji: emote?.emoji ?? null,
      name: emote?.name ?? null,
      animationClass: emote ? ANIMATION_MAP[emote.animation] : '',
    };
  });

  const defaultEmotes = BASIC_EMOTE_IDS.map((id) => {
    const emote = state.emotes.find((e) => e.id === id);
    return {
      id,
      emoji: emote?.emoji ?? '?',
      name: emote?.name ?? 'Unknown',
    };
  });

  return { slots, defaultEmotes };
}

// ---------------------------------------------------------------------------
// 31. suggestEmote
// ---------------------------------------------------------------------------

export function suggestEmote(context: string): Emote[] {
  const state = loadState();
  const unlocked = state.emotes.filter((e) => e.unlocked);

  const ctx = context.toLowerCase();

  // Map context keywords to category preferences
  const categoryMap: Record<string, string[]> = {
    achievement: ['celebrate', 'happy'],
    win: ['celebrate', 'happy', 'cool'],
    lose: ['sad', 'angry'],
    death: ['sad', 'angry'],
    combo: ['celebrate', 'gaming', 'happy'],
    'high_score': ['celebrate', 'cool', 'happy'],
    'new_word': ['think', 'happy'],
    'boss_mode': ['angry', 'cool', 'gaming'],
    pvp: ['gaming', 'angry', 'cool'],
    friend: ['love', 'happy'],
    challenge: ['thinking', 'angry', 'cool'],
    idle: ['thinking', 'sad'],
    speed: ['gaming', 'cool'],
    level_up: ['celebrate', 'happy', 'cool'],
    daily: ['celebrate', 'happy'],
    puzzle: ['thinking', 'happy'],
    tutorial: ['thinking', 'happy'],
  };

  // Direct emote suggestions for specific contexts
  const directMap: Record<string, string[]> = {
    achievement_unlocked: ['celebrate_trophy', 'happy_star', 'celebrate_party'],
    combo_hit: ['game_speed', 'happy_grin', 'cool_sunglasses'],
    death: ['sad_cry', 'angry_rage', 'sad_melt'],
    victory: ['celebrate_confetti', 'cool_sunglasses', 'celebrate_medal'],
    defeat: ['sad_sob', 'angry_mad', 'sad_pensive'],
    new_word_found: ['think_bulb', 'happy_giggle', 'celebrate_party'],
    pvp_win: ['cool_cowboy', 'celebrate_crown', 'game_target'],
    pvp_lose: ['angry_explode', 'sad_frown', 'angry_horns'],
    boss_defeated: ['celebrate_fireworks', 'cool_ninja', 'celebrate_medal'],
    level_complete: ['celebrate_confetti', 'happy_star', 'celebrate_trophy'],
    daily_complete: ['celebrate_party', 'happy_wink', 'cool_robot'],
    streak_broken: ['sad_pensive', 'angry_mad', 'sad_frown'],
    friend_online: ['love_hearts', 'happy_wink', 'happy_smile'],
  };

  // Check direct matches first
  if (directMap[ctx]) {
    const ids = directMap[ctx];
    const results: Emote[] = [];
    for (const id of ids) {
      const emote = unlocked.find((e) => e.id === id);
      if (emote) results.push(emote);
    }
    if (results.length > 0) return results;
  }

  // Check category-based matching
  const matchedCategories = categoryMap[ctx];
  if (matchedCategories) {
    const categoryEmotes = unlocked.filter((e) =>
      matchedCategories.includes(e.category),
    );

    // Sort by useCount ascending so we suggest lesser-used emotes first
    categoryEmotes.sort((a, b) => a.useCount - b.useCount);
    return categoryEmotes.slice(0, 4);
  }

  // Fallback: return recent favorites sorted by use count
  const recent = getRecentEmotes(3);
  if (recent.length > 0) return recent;

  // Ultimate fallback: top 3 by usage
  return unlocked
    .sort((a, b) => b.useCount - a.useCount)
    .slice(0, 3);
}

// ---------------------------------------------------------------------------
// Bonus helper: resetEmoteSystem (useful for testing)
// ---------------------------------------------------------------------------

export function resetEmoteSystem(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// ---------------------------------------------------------------------------
// Bonus helper: getAllCombos (inspects defined combos)
// ---------------------------------------------------------------------------

export function getAllCombos(): EmoteCombo[] {
  return [...EMOTE_COMBOS];
}

// ---------------------------------------------------------------------------
// Bonus helper: getEmoteCountByCategory
// ---------------------------------------------------------------------------

export function getEmoteCountByCategory(): Record<string, { total: number; unlocked: number }> {
  const state = loadState();
  const result: Record<string, { total: number; unlocked: number }> = {};

  for (const emote of state.emotes) {
    if (!result[emote.category]) {
      result[emote.category] = { total: 0, unlocked: 0 };
    }
    result[emote.category].total += 1;
    if (emote.unlocked) {
      result[emote.category].unlocked += 1;
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Bonus helper: searchEmotes
// ---------------------------------------------------------------------------

export function searchEmotes(query: string): Emote[] {
  const state = loadState();
  const q = query.toLowerCase().trim();

  if (!q) return state.emotes.filter((e) => e.unlocked);

  return state.emotes.filter((e) => {
    if (!e.unlocked && e.packId) return false; // hide locked pack emotes
    const nameMatch = e.name.toLowerCase().includes(q);
    const idMatch = e.id.toLowerCase().includes(q);
    const catMatch = e.category.toLowerCase().includes(q);
    return nameMatch || idMatch || catMatch;
  });
}
