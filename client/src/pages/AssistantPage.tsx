import { Bot, SendHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';

import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MOCK_PROPERTIES } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
}

const SUGGESTED_PROMPTS = [
  'A 2-bed rental near Dhanmondi Lake under ৳ 40,000',
  'Family house with a garden in Uttara',
  'Commercial space for a small office in Dhaka',
] as const;

// Canned demo reply — replaced by the streaming RAG endpoint in phase 6.
function buildDemoReply(id: number): ChatMessage {
  return {
    id,
    role: 'assistant',
    content:
      'Here are two listings that fit what you described. Both are active and available for a visit this week — want me to narrow by budget or area?',
    properties: MOCK_PROPERTIES.slice(1, 3),
  };
}

export function AssistantPage(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');

  const send = (text: string): void => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: 'user', content: trimmed },
      buildDemoReply(prev.length + 1),
    ]);
    setInput('');
  };

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col py-8">
      <h1 className="sr-only">AI assistant</h1>

      <div className="flex-1 space-y-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Sparkles size={24} className="text-primary" strokeWidth={2} aria-hidden />
            </span>
            <h2 className="mt-4 text-2xl">What are you looking for?</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Describe your ideal home in plain language — budget, area, size, anything.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => send(prompt)}
                  className="rounded-full border px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex gap-3', message.role === 'user' && 'justify-end')}
          >
            {message.role === 'assistant' && (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Bot size={16} className="text-primary" strokeWidth={2} aria-hidden />
              </span>
            )}
            <div className={cn('max-w-[85%] space-y-3', message.role === 'user' && 'text-right')}>
              <p
                className={cn(
                  'inline-block rounded-lg px-4 py-2 text-sm text-left',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary',
                )}
              >
                {message.content}
              </p>
              {message.properties && (
                <div className="grid gap-3 sm:grid-cols-2">
                  {message.properties.map((property) => (
                    <PropertyCard key={property.id} property={property} variant="compact" />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-4 mt-8 flex gap-3 rounded-lg border bg-card p-3 shadow-md"
      >
        <Input
          aria-label="Message the assistant"
          placeholder="e.g. 3-bed under ৳ 40 lakh in Uttara…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" size="icon" aria-label="Send message">
          <SendHorizontal size={20} strokeWidth={2} />
        </Button>
      </form>
    </div>
  );
}
