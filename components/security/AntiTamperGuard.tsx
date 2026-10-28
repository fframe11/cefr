'use client';

import React, { useEffect } from 'react';

/**
 * Key combination matcher for DevTools and source inspection
 */
export function isInspectionKeyEvent(e: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
}): boolean {
  if (e.key === 'F12') {
    return true;
  }
  const isCtrlOrCmd = Boolean(e.ctrlKey || e.metaKey);
  const keyUpper = e.key.toUpperCase();

  // Ctrl+Shift+I (DevTools), Ctrl+Shift+J (Console), Ctrl+Shift+C (Inspect Element)
  if (isCtrlOrCmd && e.shiftKey && ['I', 'J', 'C'].includes(keyUpper)) {
    return true;
  }

  // Ctrl+U (View Source), Ctrl+S (Save Page)
  if (isCtrlOrCmd && ['U', 'S'].includes(keyUpper)) {
    return true;
  }

  return false;
}

/**
 * AntiTamperGuard:
 * Client-side defense-in-depth deterrence against casual DevTools inspection,
 * right-click context menu, and shortcut keys.
 *
 * NOTE: The server-authoritative zero-trust architecture guarantees that answer keys
 * and explanations are never sent to unverified clients.
 */
export const AntiTamperGuard: React.FC<{ forceEnable?: boolean }> = ({ forceEnable = false }) => {
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === 'production' || forceEnable;
    if (!isProduction) {
      return;
    }

    const handleContextMenu = (e: MouseEvent) => {
      // Do not block context menu if target is an editable input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isInspectionKeyEvent(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const bannerStyle = 'color: #ef4444; font-size: 16px; font-weight: bold;';
    const textStyle = 'color: #94a3b8; font-size: 12px;';
    console.log('%c⚠ CEFR Security Alert', bannerStyle);
    console.log(
      '%cUnauthorized inspection, scraping, or extraction of assessment items is strictly prohibited and actively audited.',
      textStyle
    );

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [forceEnable]);

  return null;
};
