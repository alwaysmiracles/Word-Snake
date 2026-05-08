'use client';

import type { DeviceInfo, ResponsiveConfig } from './responsive-ux';

// ─── Layout Metrics ──────────────────────────────────────────────────────────

/** Pixel-perfect layout dimensions for every screen configuration. */
export type LayoutMetrics = {
  canvasWidth: number;
  canvasHeight: number;
  sidebarWidth: number;
  sidebarHeight: number;
  containerWidth: number;
  containerHeight: number;
  gameAreaGap: number;
  headerHeight: number;
  footerHeight: number;
};

// ─── Constants ───────────────────────────────────────────────────────────────

/** CSS class names that can be applied for animated layout transitions. */
export const ANIMATED_LAYOUT_TRANSITIONS: string[] = [
  'layout-transition-smooth',
  'layout-transition-bounce',
  'layout-transition-fade',
];

/** Standard breakpoints used across the layout system. */
export const LAYOUT_BREAKPOINTS = { mobile: 768, tablet: 1024, desktop: 1024 } as const;

// ─── Layout Calculation ──────────────────────────────────────────────────────

/**
 * Calculates pixel-perfect layout metrics based on device info and responsive
 * configuration.  Each device category targets a specific canvas-to-sidebar
 * ratio so the game canvas is always prominent yet the sidebar remains usable.
 */
export function calculateLayout(
  device: DeviceInfo,
  config: ResponsiveConfig,
  baseCanvasWidth: number = 800,
  baseCanvasHeight: number = 600,
): LayoutMetrics {
  const sw = device.screenWidth;
  const sh = device.screenHeight;
  const safeTop = device.safeAreaTop;
  const safeBottom = device.safeAreaBottom;

  // --- Desktop -----------------------------------------------------------
  if (device.isDesktop) {
    const header = 52;
    const footer = 40;
    const gap = 16;
    const availW = sw - 280 - gap;
    const availH = sh - header - footer - safeTop - safeBottom;
    return {
      canvasWidth: Math.floor(availW * 0.6),
      canvasHeight: Math.min(availH, Math.floor(Math.floor(availW * 0.6) * (baseCanvasHeight / baseCanvasWidth))),
      sidebarWidth: 280,
      sidebarHeight: availH,
      containerWidth: sw,
      containerHeight: sh,
      gameAreaGap: gap,
      headerHeight: header,
      footerHeight: footer,
    };
  }

  // --- Tablet ------------------------------------------------------------
  if (device.isTablet) {
    const header = 48;
    const footer = 40;
    const gap = 12;
    const availW = sw - 240 - gap;
    const availH = sh - header - footer - safeTop - safeBottom;
    const canvasW = Math.floor(availW * 0.55);
    return {
      canvasWidth: canvasW,
      canvasHeight: Math.min(availH, Math.floor(canvasW * (baseCanvasHeight / baseCanvasWidth))),
      sidebarWidth: 240,
      sidebarHeight: availH,
      containerWidth: sw,
      containerHeight: sh,
      gameAreaGap: gap,
      headerHeight: header,
      footerHeight: footer,
    };
  }

  // --- Mobile landscape --------------------------------------------------
  if (device.orientation === 'landscape') {
    const header = 40;
    const footer = 36;
    const gap = 10;
    const availH = sh - header - footer - safeTop - safeBottom;
    const canvasH = Math.floor(availH * 0.7);
    const canvasW = Math.floor(sw - 180 - gap);
    return {
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      sidebarWidth: 180,
      sidebarHeight: canvasH,
      containerWidth: sw,
      containerHeight: sh,
      gameAreaGap: gap,
      headerHeight: header,
      footerHeight: footer,
    };
  }

  // --- Mobile portrait ---------------------------------------------------
  const header = 36;
  const footer = 32;
  const gap = 8;
  const availW = sw - gap * 2;
  const availH = sh - header - footer - safeTop - safeBottom;
  const canvasH = Math.floor(availH * 0.6);
  return {
    canvasWidth: availW,
    canvasHeight: canvasH,
    sidebarWidth: availW,
    sidebarHeight: Math.floor(availH * 0.4),
    containerWidth: sw,
    containerHeight: sh,
    gameAreaGap: gap,
    headerHeight: header,
    footerHeight: footer,
  };
}

// ─── Scale & UI Helpers ─────────────────────────────────────────────────────

/** Returns a scale factor so the base canvas dimensions fit the current device. */
export function getCanvasScaleFactor(device: DeviceInfo, baseWidth: number): number {
  if (device.isDesktop) return 1.0;
  if (device.isTablet) return 0.8;
  return 0.65;
}

/** True when the device should render a compact, touch-friendly UI. */
export function shouldUseCompactUI(device: DeviceInfo): boolean {
  return device.isMobile || device.isTablet;
}

// ─── Style Generators ───────────────────────────────────────────────────────

/** Returns inline CSS for the sidebar — right-placed on desktop/tablet, below on mobile portrait. */
export function getSidebarStyle(device: DeviceInfo, config: ResponsiveConfig): Record<string, string | number> {
  if (device.isMobile && device.orientation === 'portrait') {
    return {
      width: '100%',
      maxWidth: '100%',
      height: '40%',
      flexShrink: 0,
      overflowY: 'auto' as unknown as string,
    };
  }
  const widthPx = device.isDesktop ? 280 : device.isTablet ? 240 : 180;
  return {
    width: `${widthPx}px`,
    minWidth: `${widthPx}px`,
    height: '100%',
    flexShrink: 0,
    overflowY: 'auto' as unknown as string,
  };
}

/** Returns inline CSS for the canvas container. */
export function getCanvasStyle(device: DeviceInfo, config: ResponsiveConfig): Record<string, string | number> {
  return {
    flex: device.isMobile && device.orientation === 'portrait' ? '0 0 auto' : '1 1 0%',
    minWidth: 0,
    minHeight: 0,
    overflow: 'hidden' as unknown as string,
  };
}

/** Returns inline CSS for the root game container — row on desktop/tablet, column on mobile portrait. */
export function getGameContainerStyle(device: DeviceInfo): Record<string, string | number> {
  return {
    display: 'flex',
    flexDirection: device.isMobile && device.orientation === 'portrait' ? 'column' : 'row',
    width: '100%',
    height: '100%',
  };
}
