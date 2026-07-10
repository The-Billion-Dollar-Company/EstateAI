---
name: rag-ui
description: Build the RAG chat interface — streaming messages, property recommendation cards, conversation history, citations. Use for anything in the assistant chat experience.
---

# RAG UI

The assistant page is the capstone's showcase. Backend contract: `POST /api/v1/assistant/chat` (SSE), citations as `[P:<id>]` tokens (docs/architecture.md).

## Layout

`ChatLayout`: history sidebar (lg+; Sheet on mobile) + main column (MessageList grows, ChatInput pinned bottom). Max message width `max-w-2xl`. Empty state = SuggestedPrompts.

## Message rendering

- User: right-aligned, `bg-primary text-primary-foreground`. Assistant: left, `bg-secondary`, AI badge.
- Assistant content is markdown (react-markdown, sanitized; allow p/ul/ol/strong/em only).
- **Citation parsing**: stream buffer scans for `[P:<id>]`; each resolved id renders a `PropertyRecCard` (compact PropertyCard variant: thumb, price, title, location, 1-row specs, Save + View) inline after the paragraph that cited it. Dedupe repeated ids per message.
- Cards stagger in 80 ms (animation-system.md).

## Streaming states (all must exist)

1. **Sending**: input disabled, user message rendered optimistically.
2. **Waiting**: TypingIndicator (3 dots) until first token.
3. **Streaming**: tokens append with caret pulse; auto-scroll ONLY if user is at bottom (respect manual scroll-up; show "↓ New message" pill otherwise).
4. **Done**: caret gone, cards settled, input re-enabled + focused.
5. **Error**: inline retry-able error bubble, user message preserved in input.
6. **Aborted**: user can stop generation (Esc / stop button) — abort the fetch reader.

## State

`chatStore` (Zustand): conversations, activeId, messages, streamStatus. `useChatStream` hook owns the SSE reader + abort controller. History list via TanStack Query.

## A11y (non-negotiable)

`role="log"` aria-live="polite" on the list; announce full message post-stream; Enter send / Shift+Enter newline; focus management on send/complete; cards are proper links.
