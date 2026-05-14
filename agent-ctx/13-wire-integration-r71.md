---
Task ID: 13 (Round 71 Wire Integration)
Agent: Integration Agent
Task: Integrate unintegrated wire files into snake-game.tsx

Work Log:
- **Analysis**: Checked all 108 wires from the integration list against snake-game.tsx
- **Finding**: Only 4 wires were NOT yet integrated (104 were already done in previous rounds)
- **New wires**: gem-crusher, frost-fury, dawn-tower, flame-painter
- **Export pattern**: All 4 use `export default function useXxx()` hook pattern
- **Conflict**: `gcAPI` prefix was already taken by `useGhostCarnival()` → renamed to `gemcrAPI`
- **Integration points verified**:
  - Imports: after line 446 (useZephyrVault)
  - useState: after line 1503 (showZephyrVaultPanel)
  - Hook calls: after line 1842 (zvAPI)
  - Sidebar buttons: after line 9195 (ZepVau button)
  - Modal panels: before closing </div> at end of JSX

Integration Details:
| Wire | Prefix | Color | Emoji | Hook |
|------|--------|-------|-------|------|
| gem-crusher | gc | amber | 💎 | useGemCrusher → gemcrAPI |
| frost-fury | ff | cyan | ❄️ | useFrostFury → ffAPI |
| dawn-tower | dt | rose | 🌅 | useDawnTower → dtAPI |
| flame-painter | fp | orange | 🔥 | useFlamePainter → fpAPI |

- **Build**: ✅ Compiled successfully in 47s (Next.js 16.1.3 Turbopack)
- **Errors fixed**: 1 (gcAPI naming conflict → renamed to gemcrAPI)

Stage Summary:
- 4 wires integrated into snake-game.tsx (+88 lines: 20,595 → 20,684)
- 4 new imports, 4 useState, 4 hook calls, 4 sidebar buttons, 4 modal panels
- Python script generated at `/home/z/my-project/integrate_wires.py`
- CSS round prefix: r71
- Build passes cleanly
- Note: The other 104 wires from the list were already integrated in previous rounds (r64-r70)
