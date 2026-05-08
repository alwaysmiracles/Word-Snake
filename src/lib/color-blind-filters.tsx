'use client'

import React from 'react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'

// ---------------------------------------------------------------------------
// Filter configurations – 3×3 colour matrices (rows → RGB output channels)
// ---------------------------------------------------------------------------

export const COLOR_BLIND_FILTER_CONFIGS: Record<ColorBlindMode, {
  id: string
  label: string
  description: string
  matrix: number[][]
}> = {
  none: {
    id: 'none-filter',
    label: 'None',
    description: 'No color correction',
    matrix: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
  },
  protanopia: {
    id: 'protanopia-filter',
    label: 'Protanopia',
    description: 'Red-blind (most common)',
    matrix: [
      [0.567, 0.433, 0],
      [0.558, 0.442, 0],
      [0, 0.242, 0.758],
    ],
  },
  deuteranopia: {
    id: 'deuteranopia-filter',
    label: 'Deuteranopia',
    description: 'Green-blind',
    matrix: [
      [0.625, 0.375, 0],
      [0.7, 0.3, 0],
      [0, 0.3, 0.7],
    ],
  },
  tritanopia: {
    id: 'tritanopia-filter',
    label: 'Tritanopia',
    description: 'Blue-blind',
    matrix: [
      [0.95, 0.05, 0],
      [0, 0.433, 0.567],
      [0, 0.475, 0.525],
    ],
  },
}

// ---------------------------------------------------------------------------
// SVG filter definitions component
// ---------------------------------------------------------------------------

export function ColorBlindFilterSVG() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', overflow: 'hidden' }}
      aria-hidden="true"
    >
      <defs>
        {Object.values(COLOR_BLIND_FILTER_CONFIGS).map((config) =>
          config.id !== 'none-filter' ? (
            <filter
              key={config.id}
              id={config.id}
              colorInterpolationFilters="linearRGB"
            >
              <feColorMatrix
                type="matrix"
                values={config.matrix.flat().join(' ')}
              />
            </filter>
          ) : null,
        )}
      </defs>
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Returns the CSS `filter` property value for the given mode.
 * Usage:  `style={{ filter: getFilterCSS(mode) }}`
 */
export function getFilterCSS(mode: ColorBlindMode): string {
  if (mode === 'none') return 'none'
  return `url(#${COLOR_BLIND_FILTER_CONFIGS[mode].id})`
}

/**
 * Returns inline styles for applying a colour-blind filter as an overlay.
 * Returns an empty object when mode is `'none'` so no unnecessary style is
 * applied to the DOM.
 */
export function getColorBlindOverlayStyle(mode: ColorBlindMode): React.CSSProperties {
  if (mode === 'none') return {}
  return { filter: getFilterCSS(mode) }
}
