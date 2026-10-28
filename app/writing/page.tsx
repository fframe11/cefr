'use client';

import React from 'react';
import { PenTool, Sparkles } from 'lucide-react';
import { WritingWorkspace } from '@/components/writing/WritingWorkspace';

export default function WritingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Top Header Navigation */}
      <header className="border-b border-border/40 bg-card/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <PenTool className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-tight text-foreground">
                CEFR Writing Studio
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Automated Essay Scoring & Cambridge 4-Axis NLP Grader
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-muted/60 text-muted-foreground border border-border/40">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              TASK-02 AES Engine Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <WritingWorkspace />
      </div>
    </main>
  );
}
