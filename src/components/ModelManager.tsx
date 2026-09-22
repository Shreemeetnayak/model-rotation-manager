import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ModelConfig {
  id: string;
  name: string;
  enabled: boolean;
  envVar?: string;
}

interface ErrorPattern {
  id: string;
  name: string;
  pattern: string;
  enabled: boolean;
}

interface Settings {
  models: ModelConfig[];
  errorPatterns: ErrorPattern[];
  maxRetries: number;
  retryDelay: number;
  autoRotate: boolean;
}

interface ModelManagerProps {
  onError: (error: {
    timestamp: number;
    modelId: string;
    promptHash: string;
    errorMessage: string;
    matchedPatternId?: string;
    rotated: boolean;
    rotationTargetModelId?: string;
  }) => void;
  onSettingsOpen: () => void;
  onErrorHistoryOpen: () => void;
}

export const ModelManager = ({ onError, onSettingsOpen, onErrorHistoryOpen }: ModelManagerProps) => {
  const [settings] = useState<Settings>({
    models: [
      { id: 'opus', name: 'Opus', enabled: true, envVar: 'ANTHROPIC_MODEL=opus' },
      { id: 'sonnet', name: 'Sonnet', enabled: true, envVar: 'ANTHROPIC_MODEL=sonnet' },
      { id: 'haiku', name: 'Haiku', enabled: true, envVar: 'ANTHROPIC_MODEL=haiku' },
    ],
    errorPatterns: [
      { id: 'rate-limit', name: 'Rate Limit', pattern: 'rate limit|too many requests', enabled: true },
      { id: 'timeout', name: 'Timeout', pattern: 'timeout|timed out', enabled: true },
      { id: 'overload', name: 'Model Overload', pattern: 'overloaded|at capacity|model overloaded', enabled: true },
      { id: 'context-length', name: 'Context Length', pattern: 'context length|maximum context', enabled: true },
      { id: 'auth', name: 'Authentication', pattern: 'authentication|invalid api key|unauthorized', enabled: true },
    ],
    maxRetries: 3,
    retryDelay: 1000,
    autoRotate: true,
  });

  const [currentModelIndex, setCurrentModelIndex] = useState(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [rotationCount, setRotationCount] = useState(0);
  const [toasts, setToasts] = useState<Array<{id: string, title: string, description: string}>>([]);

  const enabledModels = settings.models.filter(m => m.enabled);
  const currentModel = enabledModels[currentModelIndex] || settings.models[0];

  const showToast = (title: string, description: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, title, description }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const matchErrorPattern = (errorMessage: string): ErrorPattern | null => {
    for (const pattern of settings.errorPatterns) {
      if (pattern.enabled && new RegExp(pattern.pattern, 'i').test(errorMessage)) {
        return pattern;
      }
    }
    return null;
  };

  const rotateModel = async (errorMessage: string) => {
    const matchedPattern = matchErrorPattern(errorMessage);

    onError({
      timestamp: Math.floor(Date.now() / 1000),
      modelId: currentModel.id,
      promptHash: Math.random().toString(36).substr(2, 16),
      errorMessage,
      matchedPatternId: matchedPattern?.id,
      rotated: false,
    });

    if (!settings.autoRotate || !matchedPattern) {
      showToast('Error Detected', `Error: ${errorMessage}`);
      return;
    }

    if (currentModelIndex >= enabledModels.length - 1) {
      showToast('Rotation Exhausted', 'All models have been tried');
      return;
    }

    const nextIndex = currentModelIndex + 1;
    const nextModel = enabledModels[nextIndex];

    setCurrentModelIndex(nextIndex);
    setRotationCount(prev => prev + 1);
    setLastError(errorMessage);

    showToast('Model Rotated', `Switched from ${currentModel.name} to ${nextModel.name}`);

    onError({
      timestamp: Math.floor(Date.now() / 1000),
      modelId: currentModel.id,
      promptHash: Math.random().toString(36).substr(2, 16),
      errorMessage,
      matchedPatternId: matchedPattern?.id,
      rotated: true,
      rotationTargetModelId: nextModel.id,
    });

    await new Promise(resolve => setTimeout(resolve, settings.retryDelay));
  };

  const simulateError = (errorType: string) => {
    const errorMessages: Record<string, string> = {
      'rate-limit': 'Error: Rate limit exceeded. Too many requests.',
      'timeout': 'Error: Request timed out after 30 seconds.',
      'overload': 'Error: Model is currently overloaded. Please try again later.',
      'context-length': 'Error: Context length exceeded. Maximum context length is 200000 tokens.',
      'auth': 'Error: Invalid API key. Authentication failed.',
    };
    rotateModel(errorMessages[errorType] || 'Unknown error');
  };

  const handleManualRotate = () => {
    if (currentModelIndex >= enabledModels.length - 1) {
      showToast('No More Models', 'Already on the last available model');
      return;
    }
    const nextIndex = currentModelIndex + 1;
    const nextModel = enabledModels[nextIndex];
    setCurrentModelIndex(nextIndex);
    showToast('Manual Rotation', `Switched to ${nextModel.name}`);
  };

  const resetRotation = () => {
    setCurrentModelIndex(0);
    setRotationCount(0);
    setLastError(null);
    showToast('Rotation Reset', 'Back to first model');
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Model Rotation Manager</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onErrorHistoryOpen} size="sm">
            Error History
          </Button>
          <Button variant="outline" onClick={onSettingsOpen} size="sm">
            Settings
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary mb-2">
                {currentModel.name}
              </div>
              <Badge variant={currentModel.enabled ? 'success' : 'secondary'}>
                {currentModel.enabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>Model {currentModelIndex + 1} of {enabledModels.length}</p>
              <p>Rotations: {rotationCount}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleManualRotate} disabled={currentModelIndex >= enabledModels.length - 1} className="flex-1">
                Rotate to Next
              </Button>
              <Button variant="outline" onClick={resetRotation} className="flex-1">
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isMonitoring ? 'Monitoring' : 'Idle'}
              </span>
            </div>
            <Button
              className="w-full"
              onClick={() => setIsMonitoring(!isMonitoring)}
              variant={isMonitoring ? 'destructive' : 'default'}
            >
              {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
            </Button>
            {lastError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
                <p className="font-medium">Last Error:</p>
                <p>{lastError}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Test Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {settings.errorPatterns.map(pattern => (
                  <Button
                    key={pattern.id}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => simulateError(pattern.id)}
                    disabled={!isMonitoring}
                  >
                    {pattern.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Click to simulate errors (requires monitoring)
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-0 right-0 flex flex-col gap-2 p-4 z-50">
        {toasts.map(toast => (
          <div key={toast.id} className="flex w-full items-center gap-2 p-4 rounded-lg border bg-background shadow-lg">
            <div className="grid gap-1">
              <div className="font-semibold">{toast.title}</div>
              <div className="text-sm text-muted-foreground">{toast.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};