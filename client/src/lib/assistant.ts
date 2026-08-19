import { useAuthStore } from '@/stores/auth-store';
import type { Property } from '@/types/property';

interface StreamHandlers {
  onToken: (chunk: string) => void;
  onProperties: (properties: Property[]) => void;
  onDone: (conversationId: string | null) => void;
  signal?: AbortSignal;
}

export async function streamAssistantChat(
  message: string,
  conversationId: string | null,
  pdfId: string | null,
  handlers: StreamHandlers,
): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch('/api/v1/assistant/chat', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      message,
      conversationId: conversationId ?? undefined,
      pdfId: pdfId ?? undefined,
    }),
    signal: handlers.signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Assistant request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const frames = buffer.split('\n\n');
    buffer = frames.pop() ?? '';
    for (const frame of frames) {
      const line = frame.split('\n').find((l) => l.startsWith('data:'));
      if (!line) continue;
      const payload = JSON.parse(line.slice(5).trim()) as
        | { type: 'token'; value: string }
        | { type: 'properties'; value: Property[] }
        | { type: 'done'; conversationId: string | null };
      if (payload.type === 'token') handlers.onToken(payload.value);
      else if (payload.type === 'properties') handlers.onProperties(payload.value);
      else if (payload.type === 'done') handlers.onDone(payload.conversationId);
    }
  }
}
