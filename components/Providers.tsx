'use client';
import React, { ReactNode } from 'react';
import { I18nProvider } from '../i18n';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from './common/Toast';
import { AppProvider } from '../context/AppContext';
import { AppShell } from './AppShell';
import { AntiTamperGuard } from './security/AntiTamperGuard';

export const Providers: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <I18nProvider>
      <AuthProvider>
        <ToastProvider>
          <AppProvider>
            <AntiTamperGuard />
            <AppShell>{children}</AppShell>
          </AppProvider>
        </ToastProvider>
      </AuthProvider>
    </I18nProvider>
  );
};
