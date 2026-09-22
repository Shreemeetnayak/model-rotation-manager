import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Slider, SliderTrack, SliderRange } from '@/components/ui/slider';

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

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClearHistory: () => Promise<void>;
  history: Array<{
    id: string;
    timestamp: number;
    modelId: string;
    promptHash: string;
    errorMessage: string;
    matchedPatternId?: string;
    rotated: boolean;
    rotationTargetModelId?: string;
  }>;
}

export const SettingsModal = ({ open, onOpenChange, onClearHistory, history }: SettingsModalProps) => {
  const [settings, setSettings] = useState<Settings>({
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

  const [newModelId, setNewModelId] = useState('');
  const [newModelName, setNewModelName] = useState('');
  const [newModelEnvVar, setNewModelEnvVar] = useState('');

  const toggleModel = (id: string) => {
    setSettings(prev => ({
      ...prev,
      models: prev.models.map(m =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    }));
  };

  const removeModel = (id: string) => {
    if (settings.models.length <= 1) return;
    setSettings(prev => ({
      ...prev,
      models: prev.models.filter(m => m.id !== id),
    }));
  };

  const addModel = () => {
    if (!newModelId || !newModelName) return;
    setSettings(prev => ({
      ...prev,
      models: [
        ...prev.models,
        { id: newModelId, name: newModelName, enabled: true, envVar: newModelEnvVar || undefined },
      ],
    }));
    setNewModelId('');
    setNewModelName('');
    setNewModelEnvVar('');
  };

  const togglePattern = (id: string) => {
    setSettings(prev => ({
      ...prev,
      errorPatterns: prev.errorPatterns.map(p =>
        p.id === id ? { ...p, enabled: !p.enabled } : p
      ),
    }));
  };

  const addPattern = () => {
    const id = `custom-${Date.now()}`;
    setSettings(prev => ({
      ...prev,
      errorPatterns: [
        ...prev.errorPatterns,
        { id, name: `Custom ${prev.errorPatterns.length + 1}`, pattern: '', enabled: true },
      ],
    }));
  };

  const removePattern = (id: string) => {
    setSettings(prev => ({
      ...prev,
      errorPatterns: prev.errorPatterns.filter(p => p.id !== id),
    }));
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure models, error patterns, and rotation behavior</DialogDescription>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <Tabs defaultValue="models" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="models" className="flex-1">Models</TabsTrigger>
              <TabsTrigger value="patterns" className="flex-1">Error Patterns</TabsTrigger>
              <TabsTrigger value="rotation" className="flex-1">Rotation</TabsTrigger>
            </TabsList>

            <TabsContent value="models" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configured Models</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {settings.models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={model.enabled}
                          onChange={() => toggleModel(model.id)}
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{model.name}</p>
                          <p className="text-sm text-muted-foreground font-mono truncate">{model.id}</p>
                        </div>
                        {model.envVar && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                            {model.envVar}
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModel(model.id)}
                        disabled={settings.models.length <= 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add New Model</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label>Model ID</Label>
                      <Input
                        placeholder="opus"
                        value={newModelId}
                        onChange={e => setNewModelId(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Display Name</Label>
                      <Input
                        placeholder="Opus"
                        value={newModelName}
                        onChange={e => setNewModelName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Environment Variable</Label>
                      <Input
                        placeholder="ANTHROPIC_MODEL=opus"
                        value={newModelEnvVar}
                        onChange={e => setNewModelEnvVar(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button onClick={addModel} disabled={!newModelId || !newModelName}>
                    Add Model
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="patterns" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Error Patterns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {settings.errorPatterns.map((pattern) => (
                    <div key={pattern.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Checkbox
                          checked={pattern.enabled}
                          onChange={() => togglePattern(pattern.id)}
                        />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{pattern.name}</p>
                          <p className="text-sm text-muted-foreground font-mono truncate">{pattern.pattern}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePattern(pattern.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" onClick={addPattern} className="w-full">
                    Add Custom Pattern
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rotation" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Rotation Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Rotate on Error</Label>
                      <p className="text-sm text-muted-foreground">Automatically switch to the next model when an error pattern matches</p>
                    </div>
                    <Checkbox
                      checked={settings.autoRotate}
                      onChange={e => setSettings(prev => ({ ...prev, autoRotate: e.target.checked }))}
                    />
                  </div>

                  <div>
                    <Label>Max Retries: {settings.maxRetries}</Label>
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={settings.maxRetries}
                      onValueChange={value => setSettings(prev => ({ ...prev, maxRetries: value }))}
                    >
                      <SliderTrack>
                        <SliderRange />
                      </SliderTrack>
                    </Slider>
                  </div>

                  <div>
                    <Label>Retry Delay: {settings.retryDelay}ms</Label>
                    <Slider
                      min={500}
                      max={10000}
                      step={500}
                      value={settings.retryDelay}
                      onValueChange={value => setSettings(prev => ({ ...prev, retryDelay: value }))}
                    >
                      <SliderTrack>
                        <SliderRange />
                      </SliderTrack>
                    </Slider>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Error History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {history.length} errors recorded
                  </p>
                  {history.length > 0 && (
                    <Button variant="destructive" onClick={onClearHistory} className="w-full">
                      Clear All History
                    </Button>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};