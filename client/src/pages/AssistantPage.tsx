import { Bot, FileText, Paperclip, SendHorizontal, Sparkles, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadPdf, type PdfUploadResult } from '@/hooks/queries/use-upload';
import { streamAssistantChat } from '@/lib/assistant';
import { cn } from '@/lib/utils';
import type { Property } from '@/types/property';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  properties?: Property[];
  mode?: string;
}

const SUGGESTED_PROMPTS = [
  'A 2-bed rental near Dhanmondi Lake under ৳ 40,000',
  'Family house with a garden in Uttara',
  'Commercial space for a small office in Dhaka',
] as const;

function TypingIndicator(): React.JSX.Element {
  return (
    <span
      className="inline-flex gap-1 rounded-2xl rounded-bl-md bg-secondary px-4 py-3.5"
      aria-label="Assistant is typing"
    >
      <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground" />
      <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground [animation-delay:150ms]" />
      <i className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-muted-foreground [animation-delay:300ms]" />
    </span>
  );
}

export function AssistantPage(): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const conversationId = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [activePdf, setActivePdf] = useState<PdfUploadResult | null>(null);
  const uploadPdf = useUploadPdf();
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isStreaming]);

  const handlePdfSelect = (files: FileList | null): void => {
    const file = files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Please select a PDF file');
      return;
    }
    uploadPdf.mutate(file, {
      onSuccess: (result) => {
        setActivePdf(result);
        toast.success(`PDF "${result.filename}" uploaded. You can now ask questions about it.`);
      },
      onError: () => {
        toast.error('PDF upload failed. Make sure the server is running.');
      },
    });
  };

  const send = useCallback(
    async (text: string): Promise<void> => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;
      setInput('');
      setIsStreaming(true);

      let assistantId = 0;
      setMessages((prev) => {
        assistantId = prev.length + 1;
        return [
          ...prev,
          { id: prev.length, role: 'user', content: trimmed },
          { id: assistantId, role: 'assistant', content: '' },
        ];
      });

      const patchAssistant = (patch: Partial<ChatMessage>): void => {
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, ...patch } : m)));
      };

      try {
        await streamAssistantChat(trimmed, conversationId.current, activePdf?.pdfId ?? null, {
          onToken: (chunk) =>
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m)),
            ),
          onProperties: (properties) => patchAssistant({ properties }),
          onDone: (id) => {
            conversationId.current = id;
          },
        });
      } catch {
        patchAssistant({
          content:
            "Sorry — I couldn't reach the assistant just now. Please make sure the server is running and try again.",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming, activePdf],
  );

  // Land on /assistant?q=... (e.g. from the home page search bar) and auto-send it once.
  const ranInitialQuery = useRef(false);
  useEffect(() => {
    if (ranInitialQuery.current) return;
    ranInitialQuery.current = true;
    const q = searchParams.get('q');
    if (q?.trim()) {
      void send(q);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, send]);

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col py-8">
      <h1 className="sr-only">AI assistant</h1>

      {/* Active PDF indicator */}
      {activePdf && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
          <FileText size={16} className="shrink-0 text-primary" strokeWidth={1.75} />
          <span className="min-w-0 flex-1 truncate font-medium">{activePdf.filename}</span>
          <span className="shrink-0 text-xs text-muted-foreground">
            {(activePdf.sizeBytes / 1024).toFixed(0)} KB
          </span>
          <button
            type="button"
            onClick={() => setActivePdf(null)}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Remove PDF"
          >
            <X size={13} strokeWidth={2.25} />
          </button>
        </div>
      )}

      <div className="flex-1 space-y-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="py-14 text-center md:py-20">
            <span className="mx-auto flex h-14 w-14 animate-scale-in items-center justify-center rounded-2xl border border-border bg-surface">
              <Sparkles size={22} className="text-primary" strokeWidth={1.75} aria-hidden />
            </span>
            <h2 className="type-h2 mt-6 animate-fade-up" style={{ animationDelay: '60ms' }}>
              What are you looking for?
            </h2>
            <p
              className="mx-auto mt-3 max-w-md animate-fade-up text-sm leading-7 text-muted-foreground"
              style={{ animationDelay: '120ms' }}
            >
              Describe your ideal home in plain language, or upload a PDF to ask questions about it.
            </p>
            <div className="mt-9 flex flex-col items-center gap-2.5">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void send(prompt)}
                  className="press-scale animate-fade-up rounded-full border border-border bg-card px-4 py-2.5 text-sm transition-colors duration-200 hover:border-foreground/25 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  style={{ animationDelay: `${180 + i * 60}ms` }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isEmptyAssistant = message.role === 'assistant' && message.content === '';
          return (
            <div
              key={message.id}
              className={cn('flex animate-fade-up gap-3', message.role === 'user' && 'justify-end')}
            >
              {message.role === 'assistant' && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-surface">
                  <Bot size={15} className="text-foreground" strokeWidth={1.75} aria-hidden />
                </span>
              )}
              <div className={cn('max-w-[85%] space-y-3', message.role === 'user' && 'text-right')}>
                {isEmptyAssistant ? (
                  <TypingIndicator />
                ) : (
                  <p
                    className={cn(
                      'inline-block whitespace-pre-line rounded-2xl px-4 py-3 text-left text-sm leading-7',
                      message.role === 'user'
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-secondary text-secondary-foreground',
                    )}
                  >
                    {message.content}
                  </p>
                )}
                {message.properties && message.properties.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {message.properties.map((property) => (
                      <PropertyCard key={property.id} property={property} variant="compact" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="sticky bottom-4 mt-8 flex items-center gap-2 rounded-xl border border-border bg-card p-2 shadow-lift"
      >
        {/* PDF upload button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="shrink-0"
          aria-label="Upload PDF"
          disabled={uploadPdf.isPending || isStreaming}
          onClick={() => pdfInputRef.current?.click()}
          title="Upload a PDF to ask questions about it"
        >
          {uploadPdf.isPending ? (
            <span className="text-xs">…</span>
          ) : (
            <Paperclip size={18} strokeWidth={2} className={activePdf ? 'text-primary' : ''} />
          )}
        </Button>
        <input
          ref={pdfInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => handlePdfSelect(e.target.files)}
        />

        <Input
          aria-label="Message the assistant"
          placeholder={
            activePdf
              ? `Ask a question about "${activePdf.filename}"…`
              : 'e.g. 3-bed under ৳ 40 lakh in Uttara…'
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isStreaming}
          className="h-11 flex-1 border-0 bg-transparent shadow-none hover:border-0 focus-visible:ring-0"
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          className="press-scale shrink-0"
          disabled={isStreaming || !input.trim()}
        >
          <SendHorizontal size={20} strokeWidth={2} />
        </Button>
      </form>
    </div>
  );
}
