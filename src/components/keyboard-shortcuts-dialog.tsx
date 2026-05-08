'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ShortcutGroup {
  title: string
  emoji: string
  shortcuts: { key: string; description: string }[]
}

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: 'Movement',
    emoji: '🕹️',
    shortcuts: [
      { key: '↑ ↓ ← →', description: 'Move snake direction' },
      { key: 'W A S D', description: 'Alternative movement keys' },
    ],
  },
  {
    title: 'Game Controls',
    emoji: '🎮',
    shortcuts: [
      { key: 'Space', description: 'Start / Pause / Resume' },
      { key: 'R', description: 'Restart game' },
      { key: 'Escape', description: 'Pause / Resume' },
      { key: 'S', description: 'Start new game' },
      { key: 'D', description: 'Daily Challenge' },
    ],
  },
  {
    title: 'Audio',
    emoji: '🔊',
    shortcuts: [
      { key: 'M', description: 'Mute / Unmute sounds' },
    ],
  },
  {
    title: 'Navigation',
    emoji: '🗺️',
    shortcuts: [
      { key: 'Tab', description: 'Toggle mini-map' },
      { key: '?', description: 'Show keyboard shortcuts' },
    ],
  },
  {
    title: 'Display',
    emoji: '🖥️',
    shortcuts: [
      { key: 'G', description: 'Cycle grid themes' },
      { key: '1', description: 'Select Easy difficulty' },
      { key: '2', description: 'Select Medium difficulty' },
      { key: '3', description: 'Select Hard difficulty' },
    ],
  },
]

export default function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-slate-900 border-slate-700/50 text-slate-100 sm:max-w-md"
        overlayClassName="modal-backdrop-enhanced"
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
            ⌨️ Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            All available keyboard controls for Word Snake
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto scrollbar-fancy pr-1">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{group.emoji}</span>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {group.title}
                </h3>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>
              <div className="space-y-1.5">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center justify-between gap-3 py-1 px-2 rounded-md hover:bg-slate-800/50 transition-colors"
                  >
                    <span className="text-sm text-slate-300">{shortcut.description}</span>
                    <kbd className="shortcut-key-cap">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-1">
          <p className="text-[10px] text-slate-500">
            Desktop only • Press <kbd className="shortcut-key-cap text-[10px] px-1 py-0">?</kbd> to toggle this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
