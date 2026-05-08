'use client';

import { useState, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type DeviceInfo = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  dpr: number;
  touchSupport: boolean;
  safeAreaTop: number;
  safeAreaBottom: number;
  hasNotch: boolean;
};

export type ResponsiveConfig = {
  canvasScale: number;
  cellSize: number;
  gridWidth: number;
  gridHeight: number;
  sidebarWidth: string;
  sidebarPosition: 'bottom' | 'right';
  fontSize: 'sm' | 'md' | 'lg';
  buttonSize: 'sm' | 'md' | 'lg';
  dpadSize: number;
  showDpad: boolean;
  compactMode: boolean;
};

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'success'
  | 'warning'
  | 'error';

// ─── Device Detection ────────────────────────────────────────────────────────

export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      screenWidth: 1024,
      screenHeight: 768,
      orientation: 'landscape',
      dpr: 1,
      touchSupport: false,
      safeAreaTop: 0,
      safeAreaBottom: 0,
      hasNotch: false,
    };
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const orientation: 'portrait' | 'landscape' =
    screenWidth > screenHeight ? 'landscape' : 'portrait';
  const dpr = window.devicePixelRatio ?? 1;
  const touchSupport =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Safe area from CSS env()
  const safeAreaTop =
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)')
        .replace('px', ''),
    ) || 0;
  const safeAreaBottom =
    parseInt(
      getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-bottom)')
        .replace('px', ''),
    ) || 0;

  const hasNotch = safeAreaTop > 20;

  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  const isDesktop = screenWidth >= 1024;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    orientation,
    dpr,
    touchSupport,
    safeAreaTop,
    safeAreaBottom,
    hasNotch,
  };
}

// ─── Responsive Config ───────────────────────────────────────────────────────

export function getResponsiveConfig(device: DeviceInfo): ResponsiveConfig {
  if (device.isDesktop) {
    return {
      canvasScale: 1.0,
      cellSize: 20,
      gridWidth: Math.floor((device.screenWidth * 0.6) / 20),
      gridHeight: Math.floor((device.screenHeight * 0.8) / 20),
      sidebarWidth: '280px',
      sidebarPosition: 'right',
      fontSize: 'lg',
      buttonSize: 'lg',
      dpadSize: 0,
      showDpad: false,
      compactMode: false,
    };
  }

  if (device.isTablet) {
    return {
      canvasScale: 0.8,
      cellSize: 18,
      gridWidth: Math.floor((device.screenWidth * 0.55) / 18),
      gridHeight: Math.floor((device.screenHeight * 0.75) / 18),
      sidebarWidth: '240px',
      sidebarPosition: 'right',
      fontSize: 'md',
      buttonSize: 'md',
      dpadSize: 140,
      showDpad: true,
      compactMode: false,
    };
  }

  // Mobile
  if (device.orientation === 'landscape') {
    return {
      canvasScale: 0.7,
      cellSize: 16,
      gridWidth: Math.floor((device.screenHeight * 0.8) / 16),
      gridHeight: Math.floor((device.screenWidth * 0.5) / 16),
      sidebarWidth: '180px',
      sidebarPosition: 'right',
      fontSize: 'sm',
      buttonSize: 'sm',
      dpadSize: 100,
      showDpad: true,
      compactMode: true,
    };
  }

  // Mobile portrait
  return {
    canvasScale: 0.65,
    cellSize: 16,
    gridWidth: Math.floor((device.screenWidth * 0.9) / 16),
    gridHeight: Math.floor((device.screenHeight * 0.45) / 16),
    sidebarWidth: '100%',
    sidebarPosition: 'bottom',
    fontSize: 'sm',
    buttonSize: 'sm',
    dpadSize: 120,
    showDpad: true,
    compactMode: true,
  };
}

// ─── React Hooks ─────────────────────────────────────────────────────────────

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(getDeviceInfo);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(getDeviceInfo());
    };

    const handleOrientationChange = () => {
      // Small delay to let the browser finish rotating
      setTimeout(() => {
        setDeviceInfo(getDeviceInfo());
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
}

export function useResponsiveConfig(): ResponsiveConfig {
  const deviceInfo = useDeviceInfo();
  return getResponsiveConfig(deviceInfo);
}

// ─── Haptic Feedback ─────────────────────────────────────────────────────────

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: [10],
  medium: [20],
  heavy: [30],
  selection: [5],
  success: [10, 50, 10],
  warning: [20, 50, 20],
  error: [30, 50, 30, 50, 30],
};

export function hapticFeedback(type: HapticType): void {
  if (!canHaptic()) return;

  const pattern = HAPTIC_PATTERNS[type];
  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration is not supported
  }
}

export function canHaptic(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    'vibrate' in navigator &&
    typeof navigator.vibrate === 'function'
  );
}

// ─── Pinch-Zoom Prevention ───────────────────────────────────────────────────

export function preventPinchZoom(): () => void {
  if (typeof document === 'undefined') {
    return () => {};
  }

  // Add touch-action: manipulation to prevent browser handling of gestures
  const prevTouchAction = document.documentElement.style.touchAction;
  document.documentElement.style.touchAction = 'manipulation';

  // Prevent gesture events (Safari)
  const preventGesture = (e: Event) => e.preventDefault();
  document.addEventListener('gesturestart', preventGesture, { passive: false });
  document.addEventListener('gesturechange', preventGesture, { passive: false });

  // Prevent touchmove with more than one touch (pinch zoom)
  const preventMultiTouch = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  };
  document.addEventListener('touchmove', preventMultiTouch, { passive: false });

  // Return cleanup function
  return () => {
    document.documentElement.style.touchAction = prevTouchAction;
    document.removeEventListener('gesturestart', preventGesture);
    document.removeEventListener('gesturechange', preventGesture);
    document.removeEventListener('touchmove', preventMultiTouch);
  };
}
