'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { getDeviceInfo, getResponsiveConfig, type DeviceInfo, type ResponsiveConfig } from './responsive-ux'
import {
  calculateLayout, getCanvasScaleFactor, shouldUseCompactUI,
  getSidebarStyle, getCanvasStyle, getGameContainerStyle, type LayoutMetrics,
} from './responsive-layout'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResponsiveLayoutState = {
  device: DeviceInfo | null
  metrics: LayoutMetrics | null
  isCompact: boolean
  scaleFactor: number
  containerStyle: Record<string, string | number>
  sidebarStyle: Record<string, string | number>
  canvasStyle: Record<string, string | number>
  canvasWrapperStyle: Record<string, string | number>
  headerStyle: Record<string, string | number>
  transitionClass: string
  orientation: 'portrait' | 'landscape' | 'square'
}

export type ResponsiveLayoutConfig = {
  baseCanvasWidth?: number
  baseCanvasHeight?: number
  transitionDuration?: number
  enableTransitions?: boolean
}

// ─── useResponsiveLayout ─────────────────────────────────────────────────────

export function useResponsiveLayout(config?: ResponsiveLayoutConfig): ResponsiveLayoutState {
  const baseW = config?.baseCanvasWidth ?? 800
  const baseH = config?.baseCanvasHeight ?? 600
  const duration = config?.transitionDuration ?? 300
  const transitions = config?.enableTransitions ?? true
  const [device, setDevice] = useState<DeviceInfo | null>(null)
  const [layoutConfig, setLayoutConfig] = useState<ResponsiveConfig | null>(null)
  const [transitionClass, setTransitionClass] = useState('')
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('landscape')
  const prevKeyRef = useRef('')

  const measure = useCallback(() => {
    if (typeof window === 'undefined') return
    const d = getDeviceInfo()
    setDevice(d)
    setLayoutConfig(getResponsiveConfig(d))
    const { screenWidth: sw, screenHeight: sh } = d
    setOrientation(sw > sh * 1.1 ? 'landscape' : sh > sw * 1.1 ? 'portrait' : 'square')
  }, [])

  useEffect(() => {
    measure()
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => { clearTimeout(timer); timer = setTimeout(measure, 200) }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize) }
  }, [measure])

  const metrics = useMemo<LayoutMetrics | null>(
    () => (!device || !layoutConfig) ? null : calculateLayout(device, layoutConfig, baseW, baseH),
    [device, layoutConfig, baseW, baseH],
  )

  useEffect(() => {
    if (!metrics) return
    const key = `${metrics.canvasWidth}x${metrics.canvasHeight}`
    if (prevKeyRef.current && prevKeyRef.current !== key && transitions) {
      setTransitionClass('layout-transition-smooth')
      const t = setTimeout(() => setTransitionClass(''), duration)
      return () => clearTimeout(t)
    }
    prevKeyRef.current = key
  }, [metrics, transitions, duration])

  const isCompact = device ? shouldUseCompactUI(device) : false
  const scaleFactor = device ? getCanvasScaleFactor(device, baseW) : 1

  const containerStyle = useMemo(() => device ? getGameContainerStyle(device) : {}, [device])
  const sidebarStyle = useMemo(() => device && layoutConfig ? getSidebarStyle(device, layoutConfig) : {}, [device, layoutConfig])
  const canvasStyle = useMemo(() => device && layoutConfig ? getCanvasStyle(device, layoutConfig) : {}, [device, layoutConfig])

  const canvasWrapperStyle = useMemo(() => {
    if (!metrics) return {}
    return {
      position: 'relative',
      width: `${metrics.canvasWidth}px`,
      height: `${metrics.canvasHeight}px`,
      overflow: 'hidden' as unknown as string,
      borderRadius: device?.isMobile ? '8px' : '12px',
    }
  }, [metrics, device])

  const headerStyle = useMemo(() => {
    if (!metrics) return {}
    return {
      height: `${metrics.headerHeight}px`,
      display: 'flex' as const,
      alignItems: 'center' as const,
      padding: device?.isMobile ? '0 12px' : '0 24px',
    }
  }, [metrics, device])

  return { device, metrics, isCompact, scaleFactor, containerStyle, sidebarStyle, canvasStyle, canvasWrapperStyle, headerStyle, transitionClass, orientation }
}

// ─── useOrientation ───────────────────────────────────────────────────────────

export function useOrientation(): { orientation: 'portrait' | 'landscape' | 'square'; isLandscape: boolean; isPortrait: boolean } {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'square'>('landscape')

  const update = useCallback(() => {
    if (typeof window === 'undefined') return
    const w = window.innerWidth, h = window.innerHeight
    setOrientation(w > h * 1.1 ? 'landscape' : h > w * 1.1 ? 'portrait' : 'square')
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    update()
    const mql = window.matchMedia('(orientation: portrait)')
    const so = screen.orientation
    mql.addEventListener('change', update)
    window.addEventListener('resize', update)
    so?.addEventListener?.('change', update)
    return () => {
      mql.removeEventListener('change', update)
      window.removeEventListener('resize', update)
      so?.removeEventListener?.('change', update)
    }
  }, [update])

  return { orientation, isLandscape: orientation === 'landscape', isPortrait: orientation === 'portrait' }
}

// ─── useCanvasSize ───────────────────────────────────────────────────────────

export function useCanvasSize(
  containerRef: React.RefObject<HTMLElement | null>,
  baseWidth: number,
  baseHeight: number,
): { width: number; height: number; scale: number } {
  const [size, setSize] = useState({ width: baseWidth, height: baseHeight, scale: 1 })

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return
    const el = containerRef.current
    const aspect = baseWidth / baseHeight
    const observer = new ResizeObserver((entries) => {
      const { width: cw, height: ch } = entries[0]?.contentRect ?? { width: 0, height: 0 }
      const w = cw / ch > aspect ? ch * aspect : cw
      const h = cw / ch > aspect ? ch : cw / aspect
      setSize({ width: Math.floor(w), height: Math.floor(h), scale: w / baseWidth })
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [containerRef, baseWidth, baseHeight])

  return size
}

// ─── useMediaQuery ───────────────────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

// ─── useBreakpoint ───────────────────────────────────────────────────────────

export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    if (typeof window === 'undefined') return 'desktop'
    const w = window.innerWidth
    return w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    let timer: ReturnType<typeof setTimeout>
    const onResize = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        const w = window.innerWidth
        setBp(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
      }, 150)
    }
    window.addEventListener('resize', onResize)
    return () => { clearTimeout(timer); window.removeEventListener('resize', onResize) }
  }, [])
  return bp
}

// ─── useSafeArea ─────────────────────────────────────────────────────────────

export function useSafeArea(): { top: number; bottom: number; left: number; right: number } {
  const [insets, setInsets] = useState({ top: 0, bottom: 0, left: 0, right: 0 })

  useEffect(() => {
    if (typeof document === 'undefined') return
    const measure = () => {
      const el = document.createElement('div')
      el.style.cssText =
        'position:fixed;inset:0;pointer-events:none;visibility:hidden;' +
        'padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)'
      document.body.appendChild(el)
      const cs = getComputedStyle(el)
      setInsets({
        top: parseFloat(cs.paddingTop) || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left: parseFloat(cs.paddingLeft) || 0,
        right: parseFloat(cs.paddingRight) || 0,
      })
      document.body.removeChild(el)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])
  return insets
}

// ─── Preset Tailwind Class Generators ────────────────────────────────────────

export function getFontScaleClasses(device: DeviceInfo): string {
  if (device.isDesktop) return 'text-base leading-normal'
  if (device.isTablet) return 'text-sm leading-snug'
  return 'text-xs leading-tight'
}

export function getSpacingClasses(device: DeviceInfo): string {
  if (device.isDesktop) return 'p-4 gap-4 space-y-3'
  if (device.isTablet) return 'p-3 gap-3 space-y-2'
  return 'p-2 gap-2 space-y-1'
}

export function getButtonSizeClasses(device: DeviceInfo): string {
  if (device.isDesktop) return 'px-5 py-2.5 text-base rounded-lg'
  if (device.isTablet) return 'px-4 py-2 text-sm rounded-md'
  return 'px-3 py-1.5 text-xs rounded-md min-h-[44px]'
}
