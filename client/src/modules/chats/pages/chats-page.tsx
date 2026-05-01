import { useEffect, useRef, useState } from "react";
import { useConversations, type Conversation } from "../hooks/use-conversations";
import { useMessages } from "../hooks/use-messages";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `+${digits.slice(0, -10)} ${digits.slice(-10, -7)} ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
  }
  return `+${digits}`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function ConversationItem({
  conversation,
  selected,
  onClick,
}: {
  conversation: Conversation;
  selected: boolean;
  onClick: () => void;
}) {
  const isLastFromBot = conversation.lastType === "ai";
  const displayName = conversation.contactName ?? formatPhone(conversation.phone);
  const avatarLabel = conversation.contactName
    ? getInitials(conversation.contactName)
    : formatPhone(conversation.phone).slice(1, 3);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
        selected ? "bg-gray-100 dark:bg-gray-800" : ""
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white text-sm font-semibold">
        {avatarLabel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
            {displayName}
          </p>
          <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {conversation.messageCount} msgs
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
          {isLastFromBot ? (
            <span className="text-brand-500 dark:text-brand-400">Bot: </span>
          ) : null}
          {conversation.lastContent || "Sin mensajes"}
        </p>
      </div>
    </button>
  );
}

function MessageBubble({ content, fromMe }: { content: string; fromMe: boolean }) {
  return (
    <div className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          fromMe
            ? "rounded-tr-sm bg-brand-500 text-white"
            : "rounded-tl-sm bg-white text-gray-900 ring-1 ring-gray-200 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function EmptyMessages() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <p className="text-sm">Sin mensajes en esta conversación</p>
    </div>
  );
}

function NoConversationSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-16 w-16 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
        />
      </svg>
      <p className="text-sm">Selecciona una conversación</p>
    </div>
  );
}

const ChatsPage: React.FC = () => {
  const { conversations, loading: loadingConversations, error: convError } = useConversations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { messages, loading: loadingMessages, error: msgError } = useMessages(selectedSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = conversations.find((c) => c.sessionId === selectedSessionId);

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-600 dark:text-brand-400">
          Conversaciones
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Historial de chats procesados por el asistente.
        </p>
      </div>

      <div className="flex h-[calc(100vh-268px)] min-h-[500px] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-soft dark:border-gray-700 dark:bg-gray-950">
        {/* Panel izquierdo — lista de conversaciones */}
        <div className="flex w-72 shrink-0 flex-col border-r border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 px-4 py-6 dark:border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Chats
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex flex-col gap-3 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-2 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : convError ? (
              <p className="p-4 text-sm text-red-600 dark:text-red-400">{convError}</p>
            ) : conversations.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 dark:text-gray-500">Sin conversaciones.</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {conversations.map((conv) => (
                  <ConversationItem
                    key={conv.sessionId}
                    conversation={conv}
                    selected={conv.sessionId === selectedSessionId}
                    onClick={() => setSelectedSessionId(conv.sessionId)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel derecho — mensajes */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedConversation ? (
            <div className="border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                {selectedConversation.contactName ?? formatPhone(selectedConversation.phone)}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {formatPhone(selectedConversation.phone)}
              </p>
            </div>
          ) : null}

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto bg-gray-50 p-4 dark:bg-gray-900">
            {!selectedSessionId ? (
              <NoConversationSelected />
            ) : loadingMessages ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
              </div>
            ) : msgError ? (
              <p className="text-center text-sm text-red-600 dark:text-red-400">{msgError}</p>
            ) : messages.length === 0 ? (
              <EmptyMessages />
            ) : (
              messages.map((msg) => (
                <MessageBubble key={msg.id} content={msg.content} fromMe={msg.fromMe} />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatsPage;
