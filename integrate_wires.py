#!/usr/bin/env python3
"""
Integration script for Round 71 wire files into snake-game.tsx.
Generates 5 code blocks per wire: import, useState, hook call, sidebar button, modal panel.
"""

# Wire definitions: (wire-name, hook-name, 2-letter-prefix, color, emoji, display-name, short-name)
wires = [
    ("gem-crusher", "useGemCrusher", "gc", "amber", "💎", "Gem Crusher", "GemCru"),
    ("frost-fury", "useFrostFury", "ff", "cyan", "❄️", "Frost Fury", "FrosFur"),
    ("dawn-tower", "useDawnTower", "dt", "rose", "🌅", "Dawn Tower", "DawTow"),
    ("flame-painter", "useFlamePainter", "fp", "orange", "🔥", "Flame Painter", "FlaPai"),
]

ROUND = "r71"

# ─── Block 1: Imports ───────────────────────────────────────────
print("=" * 60)
print("BLOCK 1: IMPORTS (insert after line 446)")
print("=" * 60)
for wire, hook, prefix, color, emoji, display, short in wires:
    print(f"import {hook} from '@/lib/{wire}-wire'")

print()

# ─── Block 2: useState declarations ─────────────────────────────
print("=" * 60)
print("BLOCK 2: USESTATE (insert after line 1503)")
print("=" * 60)
for wire, hook, prefix, color, emoji, display, short in wires:
    # Convert wire-name to CamelCase for panel state
    parts = wire.split("-")
    panel_name = "".join(p.capitalize() for p in parts) + "Panel"
    state_var = f"show{panel_name}"
    setter = f"setShow{panel_name}"
    print(f"  const [{state_var}, {setter}] = useState(false)")

print()

# ─── Block 3: Hook calls ────────────────────────────────────────
print("=" * 60)
print("BLOCK 3: HOOK CALLS (insert after line 1842)")
print("=" * 60)
for wire, hook, prefix, color, emoji, display, short in wires:
    parts = wire.split("-")
    abbrev = "".join(p[0] for p in parts)
    api_var = f"{abbrev}API"
    print(f"  const {api_var} = {hook}()")

print()

# ─── Block 4: Sidebar buttons ───────────────────────────────────
print("=" * 60)
print("BLOCK 4: SIDEBAR BUTTONS (insert after line 9195)")
print("=" * 60)
for wire, hook, prefix, color, emoji, display, short in wires:
    parts = wire.split("-")
    panel_name = "".join(p.capitalize() for p in parts) + "Panel"
    state_var = f"show{panel_name}"
    setter = f"setShow{panel_name}"
    print(f'                    <Button onClick={{() => {setter}(!{state_var})}} variant="outline" className="border-{color}-400/50 text-{color}-200 hover:bg-{color}-900/20 active:scale-95 transition-transform {ROUND}-{prefix}-btn" title="{display}">{emoji} {short}</Button>')

print()

# ─── Block 5: Modal panels ─────────────────────────────────────
print("=" * 60)
print("BLOCK 5: MODAL PANELS (insert before the closing </div> at end)")
print("=" * 60)
for wire, hook, prefix, color, emoji, display, short in wires:
    parts = wire.split("-")
    panel_name = "".join(p.capitalize() for p in parts) + "Panel"
    state_var = f"show{panel_name}"
    setter = f"setShow{panel_name}"
    abbrev = "".join(p[0] for p in parts)
    api_var = f"{abbrev}API"

    # Determine stat fields based on the wire
    if wire == "gem-crusher":
        stats = f"""<div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Level</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.level || 1) : 1}}</div></div>
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Gems Crushed</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.gemsCrushed || 0) : 0}}</div></div>
        </div>"""
    elif wire == "frost-fury":
        stats = f"""<div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Level</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.player?.level || 1) : 1}}</div></div>
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Streak</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.streak || 0) : 0}}</div></div>
        </div>"""
    elif wire == "dawn-tower":
        stats = f"""<div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Floor</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.currentFloor || 1) : 1}}</div></div>
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Best Floor</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.bestFloor || 1) : 1}}</div></div>
        </div>"""
    elif wire == "flame-painter":
        stats = f"""<div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Level</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.playerLevel || 1) : 1}}</div></div>
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Gallery</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? (({api_var}.gallery || []).length) : 0}}</div></div>
        </div>"""
    else:
        stats = f"""<div className="grid grid-cols-2 gap-1.5 mb-3">
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Level</div><div className="text-xs font-bold text-{color}-200">{{typeof {api_var} === 'object' && {api_var} !== null ? ({api_var}.level || 1) : 1}}</div></div>
          <div className="p-2 bg-gradient-to-br from-{color}-900/30 to-{color}-800/20 rounded-lg border border-{color}-500/10 {ROUND}-{prefix}-stat"><div className="text-[9px] text-{color}-300">Status</div><div className="text-xs font-bold text-{color}-200">{emoji}</div></div>
        </div>"""

    modal = f"""      {{{state_var} && mounted && (() => {{
        const {prefix}State = {api_var}
        return (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={{() => {setter}(false)}}>
            <div className="bg-{color}-950/95 border border-{color}-400/30 rounded-xl p-4 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto shadow-2xl" onClick={{e => e.stopPropagation()}}>
              <div className="flex items-center justify-between mb-3"><h3 className="text-sm font-bold text-{color}-200">{emoji} {display}</h3><button onClick={{() => {setter}(false)}} className="text-{color}-400 hover:text-white text-xs">✕</button></div>
              {stats}
              <div className="flex gap-1.5 mb-3">
                <button onClick={{() => {{ toast({{ title: '{display} reset!' }}) }}}} className="flex-1 px-2 py-1.5 bg-gradient-to-br from-{color}-800/30 to-{color}-900/20 hover:opacity-80 text-{color}-200 text-[8px] font-semibold rounded-lg transition-all active:scale-95 {ROUND}-{prefix}-action">Reset</button>
              </div>
            </div>
          </div>
        )
      }})()}}"""

    print(modal)
    print()
    print()
