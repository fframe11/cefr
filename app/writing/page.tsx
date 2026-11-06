'use client';

import React, { useState } from 'react';
import { PenTool, Award, BookOpen } from 'lucide-react';
import { WritingWorkspace } from '@/components/writing/WritingWorkspace';
import { WritingView } from '@/components/views/WritingView';

export default function WritingPage() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'practice'>('workspace');

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
            <div className="flex items-center p-0.5 bg-muted/60 rounded-lg border border-border/40 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('workspace')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'workspace'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                Cambridge Exam Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-medium transition-all ${
                  activeTab === 'practice'
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                CEFR Practice & AES
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'workspace' ? <WritingWorkspace /> : <WritingView />}
      </div>
    </main>
  );
}
