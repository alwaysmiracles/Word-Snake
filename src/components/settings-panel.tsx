'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getAllSkins, saveSnakeSkin, isSkinUnlocked, type SnakeSkin } from '@/lib/snake-skins'
import { Lock } from 'lucide-react'
import { getAllGridThemes, saveGridTheme, type GridThemeId } from '@/lib/grid-themes'
import { getAllSoundThemes, saveSoundTheme, type SoundThemeId } from '@/lib/sound-themes'
import { getAllTrails, saveTrail, type SnakeTrailType } from '@/lib/snake-trails'
import { setSoundTheme, playThemePreviewSound } from '@/lib/sounds'

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
  const skins = getAllSkins()
  const gridThemes = getAllGridThemes()
  const soundThemes = getAllSoundThemes()
  const trails = getAllTrails()

  const [gridThemeRipple, setGridThemeRipple] = useState<GridThemeId | null>(null)
  const [skinBounce, setSkinBounce] = useState<string | null>(null)
  const [soundWavePulse, setSoundWavePulse] = useState<SoundThemeId | null>(null)

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

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
