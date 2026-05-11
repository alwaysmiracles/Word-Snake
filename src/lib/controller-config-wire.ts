// controller-config-wire.ts — Controller/input configuration wire for Word Snake game.
// Manages keyboard keybinds, controller profiles, input sensitivity, touch controls,
// gamepad support, input history/stats, accessibility input, and UI helpers.

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GameAction =
  | 'moveUp'
  | 'moveDown'
  | 'moveLeft'
  | 'moveRight'
  | 'pause'
  | 'resume'
  | 'start'
  | 'restart'
  | 'mute'
  | 'unmute'
  | 'volumeUp'
  | 'volumeDown'
  | 'toggleMusic'
  | 'toggleSFX'
  | 'openSettings'
  | 'openHelp'
  | 'zoomIn'
  | 'zoomOut'
  | 'boost'
  | 'shield';

export type Keybinds = Record<GameAction, string>;

export interface Sensitivity {
  moveRepeatDelay: number;   // ms before key repeat starts
  moveRepeatRate: number;    // ms between repeated moves
  deadZone: number;          // 0-1 joystick deadzone
  diagonalSensitivity: number; // 0-2 multiplier for diagonal movement
  tapSensitivity: number;    // 0-500ms max duration for a tap
}

export interface TouchConfig {
  swipeThreshold: number;    // min px for a swipe
  swipeSensitivity: number;  // 0-2 multiplier
  tapThreshold: number;      // max ms for a tap
  hapticEnabled: boolean;
  touchArea: 'full' | 'left' | 'right' | 'bottom';
}

export type GestureType = 'swipe' | 'double-tap' | 'long-press' | 'pinch-zoom';
export type GesturesEnabled = Record<GestureType, boolean>;

export interface ControllerConfig {
  deadzone: number;           // 0-1
  sensitivity: number;        // 0-2
  vibration: boolean;
  buttonLayout: 'standard' | 'lefty' | 'custom';
}

export type GamepadButton =
  | 'a' | 'b' | 'x' | 'y'
  | 'lb' | 'rb' | 'lt' | 'rt'
  | 'back' | 'start'
  | 'ls' | 'rs'
  | 'dpad-up' | 'dpad-down' | 'dpad-left' | 'dpad-right';

export type ControllerMappings = Partial<Record<GamepadButton, GameAction>>;

export interface InputEvent {
  action: GameAction;
  timestamp: number;
  key: string;
}

export interface InputHeatmap {
  totalEvents: number;
  actions: Record<GameAction, number>;
  keys: Record<string, number>;
  sessionDuration: number;
}

export interface KeybindProfile {
  id: string;
  name: string;
  keybinds: Keybinds;
  createdAt: number;
}

export interface AccessibilityInput {
  oneSwitchMode: boolean;
  oneSwitchSpeed: number;        // ms per step
  autoFire: boolean;
  autoFireDelay: number;         // ms
  autoMove: boolean;
  autoMoveDirection: 'none' | 'up' | 'down' | 'left' | 'right' | 'follow';
  stickyKeys: boolean;
  slowKeys: boolean;
  slowKeysDelay: number;         // ms
}

export type AutoPlayMode = 'full' | 'partial';

export interface AutoPlayConfig {
  enabled: boolean;
  mode: AutoPlayMode;
  speed: number;                // 0-100
}

export type PlayStyle = 'aggressive' | 'casual' | 'accessibility';

// ---------------------------------------------------------------------------
// Internal storage shape
// ---------------------------------------------------------------------------

interface ControllerConfigStorage {
  keybinds: Keybinds;
  sensitivity: Sensitivity;
  touchConfig: TouchConfig;
  gesturesEnabled: GesturesEnabled;
  controllerConfig: ControllerConfig;
  controllerMappings: ControllerMappings;
  inputHistory: InputEvent[];
  profiles: KeybindProfile[];
  accessibilityInput: AccessibilityInput;
  autoPlayConfig: AutoPlayConfig;
  inputAssistLevel: number;
  inputTestResults: Record<string, boolean>;
  preferredPlayStyle: PlayStyle;
}

const STORAGE_KEY = 'ws_controller_config';

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

function defaultKeybinds(): Keybinds {
  return {
    moveUp: 'ArrowUp',
    moveDown: 'ArrowDown',
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    pause: 'Escape',
    resume: 'Escape',
    start: 'Enter',
    restart: 'KeyR',
    mute: 'KeyM',
    unmute: 'KeyM',
    volumeUp: 'Equal',
    volumeDown: 'Minus',
    toggleMusic: 'Digit1',
    toggleSFX: 'Digit2',
    openSettings: 'KeyO',
    openHelp: 'Slash',
    zoomIn: 'BracketRight',
    zoomOut: 'BracketLeft',
    boost: 'ShiftLeft',
    shield: 'Space',
  };
}

function defaultSensitivity(): Sensitivity {
  return {
    moveRepeatDelay: 180,
    moveRepeatRate: 50,
    deadZone: 0.15,
    diagonalSensitivity: 1.0,
    tapSensitivity: 200,
  };
}

function defaultTouchConfig(): TouchConfig {
  return {
    swipeThreshold: 30,
    swipeSensitivity: 1.0,
    tapThreshold: 250,
    hapticEnabled: true,
    touchArea: 'bottom',
  };
}

function defaultGesturesEnabled(): GesturesEnabled {
  return {
    swipe: true,
    'double-tap': true,
    'long-press': false,
    'pinch-zoom': true,
  };
}

function defaultControllerConfig(): ControllerConfig {
  return {
    deadzone: 0.2,
    sensitivity: 1.0,
    vibration: true,
    buttonLayout: 'standard',
  };
}

function defaultControllerMappings(): ControllerMappings {
  return {
    'dpad-up': 'moveUp',
    'dpad-down': 'moveDown',
    'dpad-left': 'moveLeft',
    'dpad-right': 'moveRight',
    'a': 'boost',
    'b': 'shield',
    'start': 'pause',
    'back': 'openSettings',
    'lb': 'toggleMusic',
    'rb': 'toggleSFX',
    'y': 'restart',
    'x': 'openHelp',
  };
}

function defaultAccessibilityInput(): AccessibilityInput {
  return {
    oneSwitchMode: false,
    oneSwitchSpeed: 500,
    autoFire: false,
    autoFireDelay: 300,
    autoMove: false,
    autoMoveDirection: 'none',
    stickyKeys: false,
    slowKeys: false,
    slowKeysDelay: 300,
  };
}

function defaultAutoPlayConfig(): AutoPlayConfig {
  return {
    enabled: false,
    mode: 'partial',
    speed: 50,
  };
}

function defaultStorage(): ControllerConfigStorage {
  return {
    keybinds: defaultKeybinds(),
    sensitivity: defaultSensitivity(),
    touchConfig: defaultTouchConfig(),
    gesturesEnabled: defaultGesturesEnabled(),
    controllerConfig: defaultControllerConfig(),
    controllerMappings: defaultControllerMappings(),
    inputHistory: [],
    profiles: [],
    accessibilityInput: defaultAccessibilityInput(),
    autoPlayConfig: defaultAutoPlayConfig(),
    inputAssistLevel: 0,
    inputTestResults: {},
    preferredPlayStyle: 'casual',
  };
}

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

function loadStorage(): ControllerConfigStorage {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw) as Partial<ControllerConfigStorage>;
    const base = defaultStorage();
    return { ...base, ...parsed };
  } catch {
    return defaultStorage();
  }
}

function saveStorage(data: ControllerConfigStorage): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

function read<T>(selector: (s: ControllerConfigStorage) => T, fallback: T): T {
  try {
    return selector(loadStorage());
  } catch {
    return fallback;
  }
}

function mutate(
  updater: (s: ControllerConfigStorage) => ControllerConfigStorage,
): void {
  try {
    const current = loadStorage();
    const next = updater(current);
    saveStorage(next);
  } catch {
    // no-op
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// 1. Keybind Management
// ---------------------------------------------------------------------------

export function getDefaultKeybinds(): Keybinds {
  return defaultKeybinds();
}

export function getKeybinds(): Keybinds {
  return read((s) => ({ ...s.keybinds }), defaultKeybinds());
}

export function setKeybind(action: GameAction, key: string): void {
  mutate((s) => ({
    ...s,
    keybinds: { ...s.keybinds, [action]: key },
  }));
}

export function resetKeybind(action: GameAction): void {
  mutate((s) => ({
    ...s,
    keybinds: { ...s.keybinds, [action]: defaultKeybinds()[action] },
  }));
}

export function resetAllKeybinds(): void {
  mutate((s) => ({
    ...s,
    keybinds: defaultKeybinds(),
  }));
}

export function getKeybindForAction(action: GameAction): string {
  return read(
    (s) => s.keybinds[action],
    defaultKeybinds()[action],
  );
}

export function getActionForKey(key: string): GameAction | null {
  return read((s) => {
    const entry = Object.entries(s.keybinds).find(
      ([, v]) => v.toLowerCase() === key.toLowerCase(),
    );
    return entry ? (entry[0] as GameAction) : null;
  }, null);
}

// ---------------------------------------------------------------------------
// 2. Keybind Profiles
// ---------------------------------------------------------------------------

export function getProfiles(): KeybindProfile[] {
  return read((s) => [...s.profiles], []);
}

export function createProfile(name: string): KeybindProfile {
  const currentKeybinds = getKeybinds();
  const profile: KeybindProfile = {
    id: uid(),
    name,
    keybinds: { ...currentKeybinds },
    createdAt: Date.now(),
  };
  mutate((s) => ({
    ...s,
    profiles: [...s.profiles, profile],
  }));
  return profile;
}

export function deleteProfile(id: string): void {
  mutate((s) => ({
    ...s,
    profiles: s.profiles.filter((p) => p.id !== id),
  }));
}

export function loadProfile(id: string): boolean {
  const profile = getProfiles().find((p) => p.id === id);
  if (!profile) return false;
  mutate((s) => ({
    ...s,
    keybinds: { ...profile.keybinds },
  }));
  return true;
}

export function renameProfile(id: string, newName: string): boolean {
  const profiles = getProfiles();
  const idx = profiles.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  profiles[idx] = { ...profiles[idx], name: newName };
  mutate((s) => ({ ...s, profiles: [...profiles] }));
  return true;
}

export function getDefaultProfiles(): KeybindProfile[] {
  const wasd: Keybinds = {
    ...defaultKeybinds(),
    moveUp: 'KeyW',
    moveDown: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
  };

  const ijkl: Keybinds = {
    ...defaultKeybinds(),
    moveUp: 'KeyI',
    moveDown: 'KeyK',
    moveLeft: 'KeyJ',
    moveRight: 'KeyL',
    boost: 'KeyU',
    shield: 'KeyO',
  };

  const compact: Keybinds = {
    ...defaultKeybinds(),
    moveUp: 'KeyW',
    moveDown: 'KeyS',
    moveLeft: 'KeyA',
    moveRight: 'KeyD',
    pause: 'KeyQ',
    start: 'KeyE',
    restart: 'KeyR',
    mute: 'Tab',
    boost: 'ShiftLeft',
    shield: 'ControlLeft',
    openSettings: 'F1',
    openHelp: 'F2',
  };

  const leftHanded: Keybinds = {
    ...defaultKeybinds(),
    moveUp: 'KeyE',
    moveDown: 'KeyD',
    moveLeft: 'KeyS',
    moveRight: 'KeyF',
    pause: 'KeyQ',
    resume: 'KeyQ',
    start: 'KeyR',
    restart: 'KeyW',
    mute: 'Digit1',
    unmute: 'Digit1',
    boost: 'Tab',
    shield: 'CapsLock',
    openSettings: 'Digit2',
    openHelp: 'Digit3',
    volumeUp: 'KeyZ',
    volumeDown: 'KeyX',
  };

  const now = Date.now();
  return [
    { id: '__default', name: 'Default', keybinds: defaultKeybinds(), createdAt: now },
    { id: '__wasd', name: 'WASD', keybinds: wasd, createdAt: now },
    { id: '__ijkl', name: 'IJKL', keybinds: ijkl, createdAt: now },
    { id: '__compact', name: 'Compact', keybinds: compact, createdAt: now },
    { id: '__left-handed', name: 'Left-Handed', keybinds: leftHanded, createdAt: now },
  ];
}

export function exportProfile(id: string): string | null {
  try {
    const profile = getProfiles().find((p) => p.id === id);
    if (!profile) {
      const builtIn = getDefaultProfiles().find((p) => p.id === id);
      if (!builtIn) return null;
      return JSON.stringify(builtIn, null, 2);
    }
    return JSON.stringify(profile, null, 2);
  } catch {
    return null;
  }
}

export function importProfile(data: string): KeybindProfile | null {
  try {
    const parsed = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object' || !parsed.name || !parsed.keybinds) {
      return null;
    }
    const profile: KeybindProfile = {
      id: uid(),
      name: String(parsed.name),
      keybinds: { ...defaultKeybinds(), ...parsed.keybinds },
      createdAt: typeof parsed.createdAt === 'number' ? parsed.createdAt : Date.now(),
    };
    mutate((s) => ({
      ...s,
      profiles: [...s.profiles, profile],
    }));
    return profile;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// 3. Input Sensitivity
// ---------------------------------------------------------------------------

export function getDefaultSensitivity(): Sensitivity {
  return defaultSensitivity();
}

export function getSensitivity(): Sensitivity {
  return read((s) => ({ ...s.sensitivity }), defaultSensitivity());
}

export function setSensitivity(config: Partial<Sensitivity>): void {
  mutate((s) => ({
    ...s,
    sensitivity: { ...s.sensitivity, ...config },
  }));
}

export function getSensitivityPresets(): Record<string, Sensitivity> {
  return {
    Low: {
      moveRepeatDelay: 300,
      moveRepeatRate: 100,
      deadZone: 0.25,
      diagonalSensitivity: 0.7,
      tapSensitivity: 350,
    },
    Medium: defaultSensitivity(),
    High: {
      moveRepeatDelay: 100,
      moveRepeatRate: 30,
      deadZone: 0.1,
      diagonalSensitivity: 1.3,
      tapSensitivity: 120,
    },
    Ultra: {
      moveRepeatDelay: 50,
      moveRepeatRate: 15,
      deadZone: 0.05,
      diagonalSensitivity: 1.8,
      tapSensitivity: 60,
    },
  };
}

export function applySensitivityPreset(presetName: string): boolean {
  const presets = getSensitivityPresets();
  const preset = presets[presetName];
  if (!preset) return false;
  setSensitivity(preset);
  return true;
}

// ---------------------------------------------------------------------------
// 4. Touch Controls
// ---------------------------------------------------------------------------

export function getTouchConfig(): TouchConfig {
  return read((s) => ({ ...s.touchConfig }), defaultTouchConfig());
}

export function setTouchConfig(config: Partial<TouchConfig>): void {
  mutate((s) => ({
    ...s,
    touchConfig: { ...s.touchConfig, ...config },
  }));
}

export function getTouchPresets(): Record<string, TouchConfig> {
  return {
    Default: defaultTouchConfig(),
    Sensitive: {
      swipeThreshold: 15,
      swipeSensitivity: 1.5,
      tapThreshold: 180,
      hapticEnabled: true,
      touchArea: 'full',
    },
    Precise: {
      swipeThreshold: 50,
      swipeSensitivity: 0.6,
      tapThreshold: 300,
      hapticEnabled: false,
      touchArea: 'bottom',
    },
    Casual: {
      swipeThreshold: 20,
      swipeSensitivity: 1.2,
      tapThreshold: 350,
      hapticEnabled: true,
      touchArea: 'full',
    },
  };
}

export function applyTouchPreset(presetName: string): boolean {
  const presets = getTouchPresets();
  const preset = presets[presetName];
  if (!preset) return false;
  setTouchConfig(preset);
  return true;
}

export function getGesturesEnabled(): GesturesEnabled {
  return read((s) => ({ ...s.gesturesEnabled }), defaultGesturesEnabled());
}

export function toggleGesture(gesture: GestureType): void {
  mutate((s) => ({
    ...s,
    gesturesEnabled: {
      ...s.gesturesEnabled,
      [gesture]: !s.gesturesEnabled[gesture],
    },
  }));
}

// ---------------------------------------------------------------------------
// 5. Controller / Gamepad Support
// ---------------------------------------------------------------------------

export function getControllerConfig(): ControllerConfig {
  return read((s) => ({ ...s.controllerConfig }), defaultControllerConfig());
}

export function setControllerConfig(config: Partial<ControllerConfig>): void {
  mutate((s) => ({
    ...s,
    controllerConfig: { ...s.controllerConfig, ...config },
  }));
}

export function getControllerMappings(): ControllerMappings {
  return read((s) => ({ ...s.controllerMappings }), defaultControllerMappings());
}

export function setControllerMapping(button: GamepadButton, action: GameAction): void {
  mutate((s) => ({
    ...s,
    controllerMappings: { ...s.controllerMappings, [button]: action },
  }));
}

export function getConnectedControllers(): string[] {
  try {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) return [];
    const gamepads = navigator.getGamepads();
    const ids: string[] = [];
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (gp) {
        ids.push(`${gp.id} (index ${gp.index})`);
      }
    }
    return ids;
  } catch {
    return [];
  }
}

export function testController(): Record<string, boolean | string> {
  const results: Record<string, boolean | string> = {};
  try {
    if (typeof navigator === 'undefined' || !navigator.getGamepads) {
      return { error: 'Gamepad API not available' };
    }
    const gamepads = navigator.getGamepads();
    let found = false;
    for (let i = 0; i < gamepads.length; i++) {
      const gp = gamepads[i];
      if (!gp) continue;
      found = true;
      results[`controller_${i}_id`] = gp.id;
      results[`controller_${i}_connected`] = gp.connected;
      results[`controller_${i}_buttons`] = String(gp.buttons.length);
      results[`controller_${i}_axes`] = String(gp.axes.length);
      // Check if any button is currently pressed
      let anyPressed = false;
      for (let b = 0; b < gp.buttons.length; b++) {
        if (gp.buttons[b].pressed) {
          anyPressed = true;
          results[`controller_${i}_button_${b}_pressed`] = true;
          results[`controller_${i}_button_${b}_value`] = gp.buttons[b].value.toFixed(2);
        }
      }
      if (!anyPressed) {
        results[`controller_${i}_anyButtonPressed`] = false;
      }
      // Check axis positions
      for (let a = 0; a < gp.axes.length; a++) {
        const val = gp.axes[a];
        if (Math.abs(val) > 0.1) {
          results[`controller_${i}_axis_${a}`] = val.toFixed(3);
        }
      }
    }
    if (!found) {
      results.noController = true;
      results.message = 'No gamepad detected. Press a button on your controller and try again.';
    }
    // Persist test results
    mutate((s) => ({
      ...s,
      inputTestResults: results as Record<string, boolean>,
    }));
    return results;
  } catch {
    return { error: 'Failed to access gamepads' };
  }
}

// ---------------------------------------------------------------------------
// 6. Input History & Stats
// ---------------------------------------------------------------------------

export function recordInputEvent(action: GameAction, timestamp?: number): void {
  const key = getKeybindForAction(action);
  const event: InputEvent = {
    action,
    timestamp: timestamp ?? Date.now(),
    key,
  };
  mutate((s) => {
    // Keep only last 10,000 events to prevent unbounded growth
    const history = [...s.inputHistory, event].slice(-10000);
    return { ...s, inputHistory: history };
  });
}

export function getInputHeatmap(): InputHeatmap {
  return read((s) => {
    const actions: Record<string, number> = {} as Record<GameAction, number>;
    const keys: Record<string, number> = {};
    let totalEvents = s.inputHistory.length;
    let sessionDuration = 0;

    for (const event of s.inputHistory) {
      actions[event.action] = (actions[event.action] || 0) + 1;
      keys[event.key] = (keys[event.key] || 0) + 1;
    }

    if (s.inputHistory.length >= 2) {
      const first = s.inputHistory[0].timestamp;
      const last = s.inputHistory[s.inputHistory.length - 1].timestamp;
      sessionDuration = last - first;
    }

    return {
      totalEvents,
      actions: actions as Record<GameAction, number>,
      keys,
      sessionDuration,
    };
  }, {
    totalEvents: 0,
    actions: {} as Record<GameAction, number>,
    keys: {},
    sessionDuration: 0,
  });
}

export function getAPM(): number {
  return read((s) => {
    const now = Date.now();
    // Calculate APM over the last 60 seconds
    const recentEvents = s.inputHistory.filter(
      (e) => now - e.timestamp <= 60000,
    );
    // Scale to per-minute if less than 60s of data
    if (recentEvents.length < 2) return 0;
    const durationMs = now - recentEvents[0].timestamp;
    const durationMin = Math.max(durationMs / 60000, 0.01);
    return Math.round(recentEvents.length / durationMin);
  }, 0);
}

export function getInputLatency(): number {
  // Since we cannot measure real hardware latency from JS alone,
  // we estimate based on system settings and sensitivity config
  return read((s) => {
    let estimated = 16; // base ~1 frame at 60fps
    estimated += s.sensitivity.moveRepeatDelay * 0.05;
    if (s.accessibilityInput.slowKeys) {
      estimated += s.accessibilityInput.slowKeysDelay * 0.5;
    }
    if (s.sensitivity.deadZone > 0.3) {
      estimated += 8; // higher deadzone = more perceived latency
    }
    return Math.round(estimated);
  }, 16);
}

export function getMostUsedKeys(): Array<{ key: string; count: number; action: GameAction | null }> {
  return read((s) => {
    const keyCounts: Record<string, number> = {};
    for (const event of s.inputHistory) {
      keyCounts[event.key] = (keyCounts[event.key] || 0) + 1;
    }
    const sorted = Object.entries(keyCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({
        key,
        count,
        action: getActionForKey(key),
      }));
    return sorted;
  }, []);
}

export function getRarelyUsedActions(): Array<{ action: GameAction; count: number; percentage: number }> {
  return read((s) => {
    const total = s.inputHistory.length || 1;
    const actionCounts: Record<GameAction, number> = {} as Record<GameAction, number>;
    const allActions = Object.keys(defaultKeybinds()) as GameAction[];

    for (const event of s.inputHistory) {
      actionCounts[event.action] = (actionCounts[event.action] || 0) + 1;
    }

    return allActions
      .map((action) => ({
        action,
        count: actionCounts[action] || 0,
        percentage: ((actionCounts[action] || 0) / total) * 100,
      }))
      .filter((a) => a.percentage < 2) // less than 2% usage
      .sort((a, b) => a.percentage - b.percentage);
  }, []);
}

// ---------------------------------------------------------------------------
// 7. Accessibility Input
// ---------------------------------------------------------------------------

export function getAccessibilityInput(): AccessibilityInput {
  return read((s) => ({ ...s.accessibilityInput }), defaultAccessibilityInput());
}

export function setAccessibilityInput(config: Partial<AccessibilityInput>): void {
  mutate((s) => ({
    ...s,
    accessibilityInput: { ...s.accessibilityInput, ...config },
  }));
}

export function getAutoPlayConfig(): AutoPlayConfig {
  return read((s) => ({ ...s.autoPlayConfig }), defaultAutoPlayConfig());
}

export function setAutoPlayConfig(config: Partial<AutoPlayConfig>): void {
  mutate((s) => ({
    ...s,
    autoPlayConfig: { ...s.autoPlayConfig, ...config },
  }));
}

export function getInputAssistLevel(): number {
  return read((s) => s.inputAssistLevel, 0);
}

export function setInputAssistLevel(level: number): void {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  mutate((s) => ({
    ...s,
    inputAssistLevel: clamped,
  }));
}

// ---------------------------------------------------------------------------
// 8. UI Helpers
// ---------------------------------------------------------------------------

export interface ControllerOverview {
  totalProfiles: number;
  activeProfile: string;
  sensitivityPreset: string;
  touchPreset: string;
  controllersConnected: number;
  totalInputEvents: number;
  currentAPM: number;
  assistLevel: number;
  playStyle: PlayStyle;
  featuresEnabled: {
    touch: boolean;
    gamepad: boolean;
    accessibility: boolean;
    autoPlay: boolean;
    gestures: number;
  };
}

export function getControllerOverview(): ControllerOverview {
  try {
    const profiles = getProfiles();
    const sensitivity = getSensitivity();
    const autoPlay = getAutoPlayConfig();
    const accessibility = getAccessibilityInput();
    const assistLevel = getInputAssistLevel();
    const gestures = getGesturesEnabled();
    const controllers = getConnectedControllers();
    const heatmap = getInputHeatmap();

    const isAccessibilityEnabled =
      accessibility.oneSwitchMode ||
      accessibility.autoFire ||
      accessibility.autoMove ||
      accessibility.stickyKeys ||
      accessibility.slowKeys;

    const gestureCount = Object.values(gestures).filter(Boolean).length;

    // Determine closest sensitivity preset
    let closestPreset = 'Medium';
    let minDiff = Infinity;
    for (const [name, preset] of Object.entries(getSensitivityPresets())) {
      const diff =
        Math.abs(preset.moveRepeatDelay - sensitivity.moveRepeatDelay) +
        Math.abs(preset.moveRepeatRate - sensitivity.moveRepeatRate);
      if (diff < minDiff) {
        minDiff = diff;
        closestPreset = name;
      }
    }

    // Determine closest touch preset
    const touch = getTouchConfig();
    let closestTouchPreset = 'Default';
    let minTouchDiff = Infinity;
    for (const [name, preset] of Object.entries(getTouchPresets())) {
      const diff =
        Math.abs(preset.swipeThreshold - touch.swipeThreshold) +
        Math.abs(preset.swipeSensitivity - touch.swipeSensitivity) * 10;
      if (diff < minTouchDiff) {
        minTouchDiff = diff;
        closestTouchPreset = name;
      }
    }

    const playStyle: PlayStyle =
      assistLevel > 60
        ? 'accessibility'
        : getAPM() > 200
          ? 'aggressive'
          : 'casual';

    return {
      totalProfiles: profiles.length,
      activeProfile: 'Custom',
      sensitivityPreset: closestPreset,
      touchPreset: closestTouchPreset,
      controllersConnected: controllers.length,
      totalInputEvents: heatmap.totalEvents,
      currentAPM: getAPM(),
      assistLevel,
      playStyle,
      featuresEnabled: {
        touch: gestureCount > 0,
        gamepad: controllers.length > 0,
        accessibility: isAccessibilityEnabled,
        autoPlay: autoPlay.enabled,
        gestures: gestureCount,
      },
    };
  } catch {
    return {
      totalProfiles: 0,
      activeProfile: 'Default',
      sensitivityPreset: 'Medium',
      touchPreset: 'Default',
      controllersConnected: 0,
      totalInputEvents: 0,
      currentAPM: 0,
      assistLevel: 0,
      playStyle: 'casual',
      featuresEnabled: {
        touch: false,
        gamepad: false,
        accessibility: false,
        autoPlay: false,
        gestures: 0,
      },
    };
  }
}

export interface KeybindGridEntry {
  action: GameAction;
  label: string;
  key: string;
  category: 'movement' | 'audio' | 'game' | 'ui' | 'power';
  isModified: boolean;
}

export function getKeybindGrid(): KeybindGridEntry[] {
  const current = getKeybinds();
  const defaults = defaultKeybinds();

  const categoryMap: Record<GameAction, KeybindGridEntry['category']> = {
    moveUp: 'movement',
    moveDown: 'movement',
    moveLeft: 'movement',
    moveRight: 'movement',
    pause: 'game',
    resume: 'game',
    start: 'game',
    restart: 'game',
    mute: 'audio',
    unmute: 'audio',
    volumeUp: 'audio',
    volumeDown: 'audio',
    toggleMusic: 'audio',
    toggleSFX: 'audio',
    openSettings: 'ui',
    openHelp: 'ui',
    zoomIn: 'ui',
    zoomOut: 'ui',
    boost: 'power',
    shield: 'power',
  };

  const labelMap: Record<GameAction, string> = {
    moveUp: 'Move Up',
    moveDown: 'Move Down',
    moveLeft: 'Move Left',
    moveRight: 'Move Right',
    pause: 'Pause',
    resume: 'Resume',
    start: 'Start Game',
    restart: 'Restart',
    mute: 'Mute',
    unmute: 'Unmute',
    volumeUp: 'Volume Up',
    volumeDown: 'Volume Down',
    toggleMusic: 'Toggle Music',
    toggleSFX: 'Toggle SFX',
    openSettings: 'Open Settings',
    openHelp: 'Open Help',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    boost: 'Boost',
    shield: 'Shield',
  };

  // Format key code to human-readable
  function formatKey(code: string): string {
    if (code.startsWith('Arrow')) return code.replace('Arrow', '');
    if (code.startsWith('Key')) return code.replace('Key', '');
    if (code.startsWith('Digit')) return code.replace('Digit', '');
    if (code === 'ShiftLeft') return 'L-Shift';
    if (code === 'ShiftRight') return 'R-Shift';
    if (code === 'ControlLeft') return 'L-Ctrl';
    if (code === 'ControlRight') return 'R-Ctrl';
    if (code === 'AltLeft') return 'L-Alt';
    if (code === 'AltRight') return 'R-Alt';
    if (code === 'Space') return 'Space';
    if (code === 'Escape') return 'Esc';
    if (code === 'Enter') return 'Enter';
    if (code === 'Tab') return 'Tab';
    if (code === 'Backspace') return 'Backspace';
    if (code === 'CapsLock') return 'Caps';
    if (code === 'BracketLeft') return '[';
    if (code === 'BracketRight') return ']';
    if (code === 'Equal') return '=';
    if (code === 'Minus') return '-';
    if (code === 'Slash') return '/';
    if (code === 'Semicolon') return ';';
    if (code === 'Quote') return "'";
    if (code === 'Backslash') return '\\';
    if (code === 'Period') return '.';
    if (code === 'Comma') return ',';
    if (code === 'Backquote') return '`';
    return code;
  }

  return (Object.keys(defaults) as GameAction[]).map((action) => ({
    action,
    label: labelMap[action],
    key: formatKey(current[action]),
    category: categoryMap[action],
    isModified: current[action] !== defaults[action],
  }));
}

export interface QuickSetting {
  key: string;
  label: string;
  value: string | number | boolean;
  type: 'toggle' | 'slider' | 'select';
  options?: string[];
}

export function getQuickSettings(): QuickSetting[] {
  try {
    const sensitivity = getSensitivity();
    const touch = getTouchConfig();
    const controller = getControllerConfig();
    const autoPlay = getAutoPlayConfig();
    const assist = getInputAssistLevel();

    return [
      {
        key: 'moveRepeatDelay',
        label: 'Move Repeat Delay',
        value: sensitivity.moveRepeatDelay,
        type: 'slider',
      },
      {
        key: 'moveRepeatRate',
        label: 'Move Repeat Rate',
        value: sensitivity.moveRepeatRate,
        type: 'slider',
      },
      {
        key: 'deadZone',
        label: 'Joystick Deadzone',
        value: Math.round(controller.deadzone * 100),
        type: 'slider',
      },
      {
        key: 'vibration',
        label: 'Controller Vibration',
        value: controller.vibration,
        type: 'toggle',
      },
      {
        key: 'hapticEnabled',
        label: 'Touch Haptics',
        value: touch.hapticEnabled,
        type: 'toggle',
      },
      {
        key: 'buttonLayout',
        label: 'Button Layout',
        value: controller.buttonLayout,
        type: 'select',
        options: ['standard', 'lefty', 'custom'],
      },
      {
        key: 'touchArea',
        label: 'Touch Area',
        value: touch.touchArea,
        type: 'select',
        options: ['full', 'left', 'right', 'bottom'],
      },
      {
        key: 'autoPlayEnabled',
        label: 'Auto-Play',
        value: autoPlay.enabled,
        type: 'toggle',
      },
      {
        key: 'inputAssistLevel',
        label: 'Input Assist Level',
        value: assist,
        type: 'slider',
      },
      {
        key: 'diagonalSensitivity',
        label: 'Diagonal Sensitivity',
        value: Math.round(sensitivity.diagonalSensitivity * 100),
        type: 'slider',
      },
    ];
  } catch {
    return [];
  }
}

export function getInputTestResults(): Record<string, boolean | string> {
  return read((s) => ({ ...s.inputTestResults }), {});
}

export interface RecommendedSettings {
  playStyle: PlayStyle;
  sensitivity: Sensitivity;
  touchConfig: TouchConfig;
  controllerConfig: ControllerConfig;
  assistLevel: number;
  recommendedGestures: GesturesEnabled;
  reason: string;
}

export function getRecommendedSettings(style: PlayStyle): RecommendedSettings {
  switch (style) {
    case 'aggressive':
      return {
        playStyle: 'aggressive',
        sensitivity: getSensitivityPresets().Ultra,
        touchConfig: getTouchPresets().Sensitive,
        controllerConfig: {
          deadzone: 0.1,
          sensitivity: 1.6,
          vibration: true,
          buttonLayout: 'standard',
        },
        assistLevel: 0,
        recommendedGestures: {
          swipe: true,
          'double-tap': true,
          'long-press': false,
          'pinch-zoom': false,
        },
        reason:
          'Aggressive play benefits from ultra-low input latency and high sensitivity. ' +
          'Vibration and haptics are enabled for maximum feedback during fast gameplay.',
      };

    case 'accessibility':
      return {
        playStyle: 'accessibility',
        sensitivity: getSensitivityPresets().Low,
        touchConfig: getTouchPresets().Casual,
        controllerConfig: {
          deadzone: 0.3,
          sensitivity: 0.6,
          vibration: true,
          buttonLayout: 'standard',
        },
        assistLevel: 75,
        recommendedGestures: {
          swipe: true,
          'double-tap': true,
          'long-press': true,
          'pinch-zoom': true,
        },
        reason:
          'Accessibility mode uses slower repeat rates, larger deadzones, and higher assist levels ' +
          'for comfortable, guided play. All gestures are enabled for flexible input methods.',
      };

    case 'casual':
    default:
      return {
        playStyle: 'casual',
        sensitivity: getSensitivityPresets().Medium,
        touchConfig: getTouchPresets().Default,
        controllerConfig: {
          deadzone: 0.2,
          sensitivity: 1.0,
          vibration: true,
          buttonLayout: 'standard',
        },
        assistLevel: 25,
        recommendedGestures: {
          swipe: true,
          'double-tap': true,
          'long-press': false,
          'pinch-zoom': true,
        },
        reason:
          'Balanced settings for relaxed gameplay with moderate sensitivity and comfortable touch controls. ' +
          'A small assist level helps prevent accidental inputs.',
      };
  }
}
