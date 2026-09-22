import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

interface ErrorHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: ErrorEntry[];
  onClearHistory: () => Promise<void>;
}

export const ErrorHistory = ({ open, onOpenChange, history, onClearHistory }: ErrorHistoryProps) => {
  const [filter, setFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredHistory = history
    .filter(entry =>
      entry.errorMessage.toLowerCase().includes(filter.toLowerCase()) ||
      entry.modelId.toLowerCase().includes(filter.toLowerCase()) ||
      entry.matchedPatternId?.toLowerCase().includes(filter.toLowerCase())
    )
    .sort((a, b) => sortOrder === 'desc' ? b.timestamp - a.timestamp : a.timestamp - b.timestamp);

  const formatTimestamp = (ts: number) => {
    return new Date(ts * 1000).toLocaleString();
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[900px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Error History</DialogTitle>
          <DialogDescription>{history.length} total errors recorded</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filter</Label>
              <Input
                placeholder="Search errors..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Label>Sort</Label>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-40 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>
          </div>

          <ScrollArea className="h-[60vh]">
            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  {history.length === 0 ? 'No errors recorded yet' : 'No matching errors found'}
                </p>
              ) : (
                filteredHistory.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-mono text-sm">{entry.modelId}</span>
                            <Badge variant={entry.rotated ? 'success' : 'destructive'}>
                              {entry.rotated ? 'Rotated' : 'Failed'}
                            </Badge>
                            <Badge variant="secondary">{entry.matchedPatternId || 'No Match'}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatTimestamp(entry.timestamp)}
                          </p>
                          <p className="font-mono text-xs text-muted-foreground">
                            Prompt: {entry.promptHash}
                          </p>
                          {entry.rotated && entry.rotationTargetModelId && (
                            <p className="text-sm text-green-600 mt-1">
                              Rotated to: {entry.rotationTargetModelId}
                            </p>
                          )}
                        </div>
                        <div className="flex-1 min-w-[300px]">
                          <Label className="text-xs text-muted-foreground mb-1">Error Message</Label>
                          <p className="text-sm font-mono bg-muted p-2 rounded max-h-24 overflow-auto">
                            {entry.errorMessage}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {history.length > 0 && (
            <Button variant="destructive" onClick={onClearHistory} className="w-full">
              Clear All History
            </Button>
          )}
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