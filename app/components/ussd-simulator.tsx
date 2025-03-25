'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hash, Send } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface USSDSimulatorProps {
  onSubmit: (code: string, response: string) => void;
}

export function USSDSimulator({ onSubmit }: USSDSimulatorProps) {
  const [code, setCode] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(code, response);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          USSD Code Simulator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">USSD Code</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="*123#"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Response</label>
            <Input
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="1 for emergency, 2 for status..."
              required
            />
          </div>
          <Button type="submit" className="w-full">
            <Send className="h-4 w-4 mr-2" />
            Send USSD Command
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}