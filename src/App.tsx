import { ModelManager } from '@/components/ModelManager';
import { SettingsModal } from '@/components/SettingsModal';
import { ErrorHistory } from '@/components/ErrorHistory';
import { useState } from 'react';

interface ErrorEntry {
  id: string;
  timestamp: number;
  modelId: string;
  promptHash: string;
  errorMessage: string;
  matchedPatternId?: string;
  rotated: boolean;
  rotationTargetModelId?: string;
}

export const App = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorHistoryOpen, setErrorHistoryOpen] = useState(false);
  const [history, setHistory] = useState<ErrorEntry[]>([]);

  const addErrorToHistory = (error: Omit<ErrorEntry, 'id'>) => {
    setHistory(prev => [
      ...prev,
      {
        ...error,
        id: Math.random().toString(36).substr(2, 9),
      }
    ] as ErrorEntry[]);
  };

  const clearHistory = async () => {
    setHistory([]);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ModelManager
        onError={addErrorToHistory}
        onSettingsOpen={() => setSettingsOpen(true)}
        onErrorHistoryOpen={() => setErrorHistoryOpen(true)}
      />
      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onClearHistory={clearHistory}
        history={history}
      />
      <ErrorHistory
        open={errorHistoryOpen}
        onOpenChange={setErrorHistoryOpen}
        history={history}
        onClearHistory={clearHistory}
      />
    </div>
  );
};