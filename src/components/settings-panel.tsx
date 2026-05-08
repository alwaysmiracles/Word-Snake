'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAllSkins, saveSnakeSkin, isSkinUnlocked, getCustomSkin, saveCustomSkin, deleteCustomSkin, DEFAULT_CUSTOM_SKIN, customSkinToConfig, type SnakeSkin, type CustomSkinData, type SnakeSkinConfig } from '@/lib/snake-skins'
import { Lock } from 'lucide-react'
import { getAllGridThemes, saveGridTheme, type GridThemeId } from '@/lib/grid-themes'
import { getAllSoundThemes, saveSoundTheme, type SoundThemeId } from '@/lib/sound-themes'
import { getAllTrails, saveTrail, type SnakeTrailType } from '@/lib/snake-trails'
import { setSoundTheme, playThemePreviewSound } from '@/lib/sounds'
import { getVisualizerConfig, saveVisualizerConfig, COLOR_SCHEMES, DEFAULT_VISUALIZER_CONFIG, type VisualizerConfig, type VisualizerStyle, type VisualizerColorScheme } from '@/lib/sound-visualizer'

interface SettingsPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSkin: SnakeSkin
  onSkinChange: (skin: SnakeSkin) => void
  currentGridTheme: GridThemeId
  onGridThemeChange: (theme: GridThemeId) => void
  currentSoundTheme: SoundThemeId
  onSoundThemeChange: (theme: SoundThemeId) => void
  currentTrail: SnakeTrailType
  onTrailChange: (trail: SnakeTrailType) => void
}

interface SettingSectionProps {
  title: string
  emoji: string
  children: React.ReactNode
}

function SettingSection({ title, emoji, children }: SettingSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm">{emoji}</span>
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
        <div className="flex-1 h-px bg-slate-700/50" />
      </div>
      {children}
    </div>
  )
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 0, b: 0 }
}

function ColorPickerField({ label, value, onChange }: { label: string; value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-7 h-7 rounded-md border border-white/10 cursor-pointer bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-none"
          style={{ backgroundColor: value }}
        />
      </div>
      <span className="text-[10px] text-slate-400 min-w-[50px]">{label}</span>
      <span className="text-[9px] text-slate-600 font-mono">{value}</span>
    </div>
  )
}

export default function SettingsPanel({
  open,
  onOpenChange,
  currentSkin,
  onSkinChange,
  currentGridTheme,
  onGridThemeChange,
  currentSoundTheme,
  onSoundThemeChange,
  currentTrail,
  onTrailChange,
}: SettingsPanelProps) {
  const gridThemes = getAllGridThemes()
  const soundThemes = getAllSoundThemes()
  const trails = getAllTrails()

  const [gridThemeRipple, setGridThemeRipple] = useState<GridThemeId | null>(null)
  const [skinBounce, setSkinBounce] = useState<string | null>(null)
  const [soundWavePulse, setSoundWavePulse] = useState<SoundThemeId | null>(null)

  // Custom skin creator state
  const [skinsVersion, setSkinsVersion] = useState(0)
  const [customCreatorOpen, setCustomCreatorOpen] = useState(false)
  const [customForm, setCustomForm] = useState<CustomSkinData>({ ...DEFAULT_CUSTOM_SKIN })
  const [customPreview, setCustomPreview] = useState(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Re-derive skins list (reactive to custom skin creation/deletion)
  const skins = useMemo(() => getAllSkins(), [skinsVersion])

  // Draw snake preview on a small canvas
  useEffect(() => {
    if (!customPreview || !previewCanvasRef.current) return
    const canvas = previewCanvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#1e293b'
    ctx.fillRect(0, 0, w, h)

    // Simple snake body: 5 segments from right to left
    const segSize = 14
    const segGap = 16
    const baseX = 10
    const baseY = h / 2 - segSize / 2
    const segments = 5

    for (let i = segments - 1; i >= 0; i--) {
      const ratio = 1 - i / segments
      const c0 = hexToRgb(customForm.tailColor)
      const c1 = hexToRgb(customForm.bodyColor)
      const r = Math.floor(c0.r + (c1.r - c0.r) * ratio)
      const g = Math.floor(c0.g + (c1.g - c0.g) * ratio)
      const b = Math.floor(c0.b + (c1.b - c0.b) * ratio)
      const alpha = 0.6 + ratio * 0.4
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`

      // Glow for head
      if (i === 0) {
        ctx.shadowColor = customForm.glowColor
        ctx.shadowBlur = 8
        ctx.fillStyle = customForm.headColor
      }

      ctx.beginPath()
      ctx.roundRect(baseX + i * segGap, baseY, segSize, segSize, i === 0 ? 4 : 2)
      ctx.fill()
      ctx.shadowBlur = 0
    }

    // Eyes on head
    const headX = baseX + 3
    const headY = baseY + 3
    ctx.fillStyle = '#ffffff'
    ctx.beginPath(); ctx.arc(headX + 6, headY + 3, 2, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(headX + 6, headY + 8, 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#1e293b'
    ctx.beginPath(); ctx.arc(headX + 6, headY + 3, 1, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(headX + 6, headY + 8, 1, 0, Math.PI * 2); ctx.fill()
  }, [customPreview, customForm])

  const handleOpenCustomCreator = useCallback(() => {
    const existing = getCustomSkin()
    setCustomForm(existing ? { ...existing } : { ...DEFAULT_CUSTOM_SKIN })
    setCustomPreview(false)
    setCustomCreatorOpen(true)
  }, [])

  const handleSaveCustomSkin = useCallback(() => {
    const trimmed = { ...customForm, name: customForm.name.trim() || 'My Custom' }
    saveCustomSkin(trimmed)
    setCustomCreatorOpen(false)
    setSkinsVersion((v) => v + 1)
    // Auto-select the custom skin
    const config = customSkinToConfig(trimmed)
    onSkinChange(config)
    saveSnakeSkin('custom')
  }, [customForm, onSkinChange])

  const handleDeleteCustomSkin = useCallback(() => {
    deleteCustomSkin()
    setCustomCreatorOpen(false)
    setSkinsVersion((v) => v + 1)
    // If custom was selected, fall back to classic
    // Runtime currentSkin may be a string or SnakeSkinConfig object
    const skinId: string = (currentSkin as any)?.id ?? currentSkin
    if (skinId === 'custom') {
      const classic = getAllSkins().find(s => s.id === 'classic')!
      onSkinChange(classic)
      saveSnakeSkin('classic')
    }
  }, [currentSkin, onSkinChange])

  const handleSkinChange = (skin: SnakeSkin) => {
    onSkinChange(skin)
    saveSnakeSkin(skin.id)
    setSkinBounce(skin.id)
    setTimeout(() => setSkinBounce(null), 300)
  }

  const handleGridThemeChange = (theme: GridThemeId) => {
    onGridThemeChange(theme)
    saveGridTheme(theme)
    setGridThemeRipple(theme)
    setTimeout(() => setGridThemeRipple(null), 500)
  }

  const handleSoundThemeChange = (theme: SoundThemeId) => {
    onSoundThemeChange(theme)
    setSoundTheme(theme)
    saveSoundTheme(theme)
    playThemePreviewSound(theme)
    setSoundWavePulse(theme)
    setTimeout(() => setSoundWavePulse(null), 600)
  }

  const handleTrailChange = (trail: SnakeTrailType) => {
    onTrailChange(trail)
    saveTrail(trail)
  }

  // Visualizer state
  const [vizConfig, setVizConfig] = useState<VisualizerConfig>(DEFAULT_VISUALIZER_CONFIG)

  // Load visualizer config when dialog opens
  useEffect(() => {
    if (open) {
      setVizConfig(getVisualizerConfig())
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-slate-900 border-slate-700/50 text-slate-100 sm:max-w-lg"
        overlayClassName="modal-backdrop-enhanced"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⚙️ Settings
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Customize your Word Snake experience
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh] pr-2">
          <div className="space-y-5 pb-2">

            {/* Snake Skins */}
            <SettingSection title="Snake Skin" emoji="🐍">
              <div className="flex flex-wrap gap-2">
                {skins.map((skin) => {
                  const locked = !isSkinUnlocked(skin.id)
                  return (
                    <button
                      key={skin.id}
                      onClick={() => !locked && handleSkinChange(skin)}
                      title={locked ? skin.unlockLabel ?? 'Locked' : skin.description}
                      className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-200 min-w-[60px] ${
                        locked
                          ? 'opacity-50 pointer-events-none border-slate-700/30 bg-slate-800/20 locked-skin-shimmer'
                          : currentSkin.id === skin.id
                            ? 'border-white/40 bg-slate-800/80 shadow-lg scale-105 breathing-border'
                            : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/60 skin-card-hover'
                      } ${!locked && skinBounce === skin.id ? 'scale-110' : ''}`}
                    >
                      {/* Lock overlay */}
                      {locked && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/40">
                          <Lock className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                      <div
                        className={`w-7 h-7 rounded-md border border-white/10 ${locked ? 'grayscale' : ''}`}
                        style={{
                          background: `linear-gradient(135deg, ${skin.headColor}, ${skin.bodyGradient[skin.bodyGradient.length - 1] || skin.headColor})`,
                        }}
                      />
                      <span className={`text-lg leading-none ${locked ? 'grayscale' : ''}`}>{skin.emoji}</span>
                      <span className={`text-[9px] truncate max-w-[56px] ${locked ? 'text-slate-600' : 'text-slate-400'}`}>{skin.name}</span>
                      {locked && skin.unlockLabel && (
                        <span className="text-[8px] text-amber-500/70 truncate max-w-[56px]">{skin.unlockLabel}</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </SettingSection>

            {/* Custom Skin Creator */}
            <div className="space-y-2">
              <button
                onClick={handleOpenCustomCreator}
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed border-slate-600/50 bg-slate-800/30 hover:bg-slate-800/50 hover:border-slate-500/50 text-slate-400 hover:text-slate-300 text-xs transition-all duration-200"
              >
                <span>🎨</span>
                <span>Create Custom Skin</span>
              </button>

              {customCreatorOpen && (
                <div className="p-3 rounded-xl border border-slate-700/50 bg-slate-800/50 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300">🎨 Custom Skin Creator</h4>

                  {/* Preview */}
                  <div className="flex justify-center">
                    <canvas
                      ref={previewCanvasRef}
                      width={120}
                      height={30}
                      className="rounded-lg border border-white/10"
                      style={{ display: customPreview ? 'block' : 'none' }}
                    />
                  </div>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCustomPreview(true)}
                      className="text-[10px] px-3 py-1 rounded-md bg-slate-700/50 text-slate-300 hover:bg-slate-700/80 transition-colors"
                    >
                      Preview
                    </button>
                  </div>

                  {/* Color Pickers */}
                  <div className="grid grid-cols-2 gap-2">
                    <ColorPickerField label="Head Color" value={customForm.headColor} onChange={(c) => setCustomForm((f) => ({ ...f, headColor: c }))} />
                    <ColorPickerField label="Body Color" value={customForm.bodyColor} onChange={(c) => setCustomForm((f) => ({ ...f, bodyColor: c }))} />
                    <ColorPickerField label="Tail Color" value={customForm.tailColor} onChange={(c) => setCustomForm((f) => ({ ...f, tailColor: c }))} />
                    <ColorPickerField label="Glow Color" value={customForm.glowColor} onChange={(c) => setCustomForm((f) => ({ ...f, glowColor: c }))} />
                  </div>

                  {/* Name input */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400">Skin Name</label>
                    <input
                      type="text"
                      value={customForm.name}
                      onChange={(e) => setCustomForm((f) => ({ ...f, name: e.target.value }))}
                      maxLength={20}
                      placeholder="My Custom"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-700/50 bg-slate-900/50 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-500/50 focus:ring-1 focus:ring-slate-500/30"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveCustomSkin}
                      className="flex-1 text-[11px] font-medium px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition-colors"
                    >
                      Save Skin
                    </button>
                    {getCustomSkin() && (
                      <button
                        onClick={handleDeleteCustomSkin}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-red-600/40 hover:bg-red-600/60 text-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    <button
                      onClick={() => setCustomCreatorOpen(false)}
                      className="text-[11px] px-3 py-1.5 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 text-slate-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Grid Themes */}
            <SettingSection title="Canvas Theme" emoji="🖥️">
              <div className="flex flex-wrap gap-2">
                {gridThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleGridThemeChange(theme.id)}
                    title={theme.description}
                    className={`relative flex flex-col items-center gap-1 p-2 rounded-lg border transition-all duration-200 min-w-[60px] hover:bg-slate-800/60 ${
                      currentGridTheme === theme.id
                        ? 'border-white/40 bg-slate-800/80 shadow-lg scale-105'
                        : 'border-slate-700/40 bg-slate-800/30'
                    } ${gridThemeRipple === theme.id ? 'theme-switch-ripple' : ''} ${
                      currentGridTheme === theme.id ? 'grid-theme-badge-glow' : ''
                    }`}
                  >
                    <div
                      className="w-7 h-5 rounded border border-white/10 overflow-hidden relative"
                      style={{ backgroundColor: theme.bgColor }}
                    >
                      {/* Mini grid preview dots */}
                      <svg width="28" height="20" className="absolute inset-0 opacity-40">
                        {theme.gridType === 'dots' && (
                          Array.from({ length: 16 }).map((_, i) => (
                            <circle key={i} cx={4 + (i % 4) * 6} cy={4 + Math.floor(i / 4) * 5} r="0.5" fill={theme.gridColor} />
                          ))
                        )}
                        {theme.gridType === 'lines' && (
                          <>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <line key={`v${i}`} x1={4 + i * 6} y1="0" x2={4 + i * 6} y2="20" stroke={theme.gridColor} strokeWidth="0.5" />
                            ))}
                            {Array.from({ length: 4 }).map((_, i) => (
                              <line key={`h${i}`} x1="0" y1={4 + i * 5} x2="28" y2={4 + i * 5} stroke={theme.gridColor} strokeWidth="0.5" />
                            ))}
                          </>
                        )}
                        {theme.gridType === 'crosshatch' && (
                          <>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <line key={`v${i}`} x1={4 + i * 6} y1="0" x2={4 + i * 6} y2="20" stroke={theme.gridColor} strokeWidth="0.5" />
                            ))}
                            {Array.from({ length: 4 }).map((_, i) => (
                              <line key={`h${i}`} x1="0" y1={4 + i * 5} x2="28" y2={4 + i * 5} stroke={theme.gridColor} strokeWidth="0.5" />
                            ))}
                            <line x1="0" y1="0" x2="28" y2="20" stroke={theme.gridColor} strokeWidth="0.3" opacity="0.5" />
                            <line x1="28" y1="0" x2="0" y2="20" stroke={theme.gridColor} strokeWidth="0.3" opacity="0.5" />
                          </>
                        )}
                        {theme.gridType === 'organic' && (
                          Array.from({ length: 12 }).map((_, i) => {
                            const hash = ((i * 7919 + 42) % 100) / 100
                            return (
                              <circle key={i} cx={4 + (i % 4) * 6} cy={4 + Math.floor(i / 4) * 5} r={0.5 + hash * 0.5} fill={theme.gridColor} opacity={0.4 + hash * 0.3} />
                            )
                          })
                        )}
                      </svg>
                      {theme.scanlines && (
                        <div className="absolute inset-0" style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.15) 1px, rgba(0,0,0,0.15) 2px)',
                        }} />
                      )}
                    </div>
                    <span className="text-lg leading-none">{theme.emoji}</span>
                    <span className="text-[9px] text-slate-400">{theme.name}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            {/* Sound Themes */}
            <SettingSection title="Sound Theme" emoji="🔊">
              <div className="flex flex-wrap gap-2">
                {soundThemes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleSoundThemeChange(st.id)}
                    title={st.description}
                    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 hover:bg-slate-800/60 ${
                      currentSoundTheme === st.id
                        ? 'border-white/40 bg-slate-800/80 shadow-lg scale-105'
                        : 'border-slate-700/40 bg-slate-800/30'
                    } ${soundWavePulse === st.id ? 'sound-wave-pulse' : ''} ${
                      currentSoundTheme === st.id ? 'grid-theme-badge-glow' : ''
                    }`}
                  >
                    <span className="text-xl leading-none">{st.emoji}</span>
                    <span className="text-[10px] text-slate-300 font-medium">{st.name}</span>
                    <span className="text-[8px] text-slate-500">{st.description}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            {/* Trail Effects */}
            <SettingSection title="Trail Effect" emoji="✨">
              <div className="flex flex-wrap gap-2">
                {trails.map((trail) => (
                  <button
                    key={trail.id}
                    onClick={() => handleTrailChange(trail.id)}
                    title={trail.description}
                    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 hover:bg-slate-800/60 ${
                      currentTrail === trail.id
                        ? 'border-white/40 bg-slate-800/80 shadow-lg scale-105'
                        : 'border-slate-700/40 bg-slate-800/30'
                    }`}
                    style={currentTrail === trail.id ? { boxShadow: `0 0 12px ${trail.glowColor}` } : {}}
                  >
                    <span className="text-xl leading-none">{trail.emoji}</span>
                    <span className="text-[10px] text-slate-300 font-medium">{trail.name}</span>
                    <span className="text-[8px] text-slate-500">{trail.description}</span>
                  </button>
                ))}
              </div>
            </SettingSection>

            {/* Sound Visualizer */}
            <SettingSection title="Sound Visualizer" emoji="🎵">
              {/* Enable/Disable toggle */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Enable Visualizer</span>
                <button
                  onClick={() => {
                    const next = !vizConfig.enabled
                    setVizConfig((c) => ({ ...c, enabled: next }))
                    saveVisualizerConfig({ enabled: next })
                  }}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                    vizConfig.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      vizConfig.enabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {vizConfig.enabled && (
                <>
                  {/* Style selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500">Style</span>
                    <div className="flex gap-1.5">
                      {(
                        [
                          { id: 'bars' as VisualizerStyle, emoji: '📊', label: 'Bars' },
                          { id: 'wave' as VisualizerStyle, emoji: '🌊', label: 'Wave' },
                          { id: 'ring' as VisualizerStyle, emoji: '⭕', label: 'Ring' },
                          { id: 'particles' as VisualizerStyle, emoji: '✨', label: 'Particles' },
                        ] as const
                      ).map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            setVizConfig((c) => ({ ...c, style: s.id }))
                            saveVisualizerConfig({ style: s.id })
                          }}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            vizConfig.style === s.id
                              ? 'bg-white/15 text-white border border-white/30'
                              : 'bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:bg-slate-800/60'
                          }`}
                        >
                          <span>{s.emoji}</span>
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color scheme selector */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-500">Color Scheme</span>
                    <div className="flex gap-1.5">
                      {(
                        [
                          { id: 'neon' as VisualizerColorScheme, label: 'Neon' },
                          { id: 'rainbow' as VisualizerColorScheme, label: 'Rainbow' },
                          { id: 'pastel' as VisualizerColorScheme, label: 'Pastel' },
                          { id: 'fire' as VisualizerColorScheme, label: 'Fire' },
                        ] as const
                      ).map((cs) => (
                        <button
                          key={cs.id}
                          onClick={() => {
                            setVizConfig((c) => ({ ...c, colorScheme: cs.id }))
                            saveVisualizerConfig({ colorScheme: cs.id })
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-all duration-200 ${
                            vizConfig.colorScheme === cs.id
                              ? 'bg-white/15 text-white border border-white/30'
                              : 'bg-slate-800/40 text-slate-400 border border-slate-700/30 hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="flex gap-0.5">
                            {COLOR_SCHEMES[cs.id].slice(0, 3).map((color, ci) => (
                              <span
                                key={ci}
                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </span>
                          <span>{cs.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intensity slider */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Intensity</span>
                      <span className="text-[10px] text-slate-400 font-mono">{vizConfig.intensity.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.1"
                      value={vizConfig.intensity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value)
                        setVizConfig((c) => ({ ...c, intensity: val }))
                        saveVisualizerConfig({ intensity: val })
                      }}
                      className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                </>
              )}
            </SettingSection>

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
