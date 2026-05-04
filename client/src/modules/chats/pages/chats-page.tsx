import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useConversations, type Conversation } from "../hooks/use-conversations";
import { useMessages } from "../hooks/use-messages";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return `+${digits.slice(0, -10)} (${digits.slice(-10, -7)}) ${digits.slice(-7, -4)}-${digits.slice(-4)}`;
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

function getAvatarColor(seed: string): string {
  const colors = [
    "bg-[#e17055] text-white",
    "bg-[#00b894] text-white",
    "bg-[#0984e3] text-white",
    "bg-[#6c5ce7] text-white",
    "bg-[#fdcb6e] text-gray-800",
    "bg-[#e84393] text-white",
    "bg-[#00cec9] text-white",
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash += seed.charCodeAt(i);
  return colors[hash % colors.length];
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
  const displayName = conversation.contactName ?? formatPhone(conversation.phone);
  const avatarLabel = conversation.contactName
    ? getInitials(conversation.contactName)
    : conversation.phone.replace(/\D/g, "").slice(-2);
  const avatarColor = getAvatarColor(conversation.sessionId);
  const isBot = conversation.lastType === "ai";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-gray-100 dark:border-gray-800 ${
        selected
          ? "bg-[#f0f2f5] dark:bg-[#2a3942]"
          : "hover:bg-[#f5f6f6] dark:hover:bg-[#1f2c33]"
      }`}
    >
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}>
        {avatarLabel}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between">
          <p className="truncate text-[15px] font-medium text-gray-900 dark:text-white">
            {displayName}
          </p>
          <span className="ml-2 shrink-0 text-xs text-gray-400 dark:text-gray-500">
            {conversation.messageCount} msgs
          </span>
        </div>
        <p className="mt-0.5 truncate text-sm text-gray-500 dark:text-gray-400">
          {isBot && (
            <span className="text-gray-400 dark:text-gray-500">🤖 </span>
          )}
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
        className={`relative max-w-[65%] px-3 py-2 text-sm leading-relaxed shadow-sm ${
          fromMe
            ? "rounded-lg rounded-tr-none bg-[#DCF8C6] text-gray-900 dark:bg-[#005C4B] dark:text-white"
            : "rounded-lg rounded-tl-none bg-white text-gray-900 dark:bg-[#1F2C33] dark:text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function NoConversationSelected() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400 dark:text-gray-500">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Bienvenido a Chats</p>
        <p className="mt-1 text-sm">Selecciona una conversación para ver los mensajes</p>
      </div>
    </div>
  );
}

const ChatsPage: React.FC = () => {
  const { conversations, loading: loadingConversations, error: convError } = useConversations();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const { messages, loading: loadingMessages } = useMessages(selectedSessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = conversations.find((c) => c.sessionId === selectedSessionId);

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.sessionId.toLowerCase().includes(q) ||
      (c.contactName?.toLowerCase().includes(q) ?? false) ||
      c.phone.includes(q)
    );
  });

  const displayName = selectedConversation
    ? (selectedConversation.contactName ?? formatPhone(selectedConversation.phone))
    : "";
  const avatarLabel = selectedConversation
    ? selectedConversation.contactName
      ? getInitials(selectedConversation.contactName)
      : selectedConversation.phone.replace(/\D/g, "").slice(-2)
    : "";
  const avatarColor = selectedConversation ? getAvatarColor(selectedConversation.sessionId) : "";

  return (
    <div className="flex h-[calc(100vh-152px)] min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-soft dark:border-gray-700 dark:bg-[#111B21]">

      <div className="flex flex-1 overflow-hidden">
        {/* Panel izquierdo */}
        <div className="flex w-[340px] shrink-0 flex-col border-r border-gray-200 dark:border-gray-700">

          {/* Header izquierdo */}
          <div className="flex min-h-[61px] items-center justify-between bg-[#f0f2f5] px-4 py-2.5 dark:bg-[#1F2C33]">
            <span className="text-base font-semibold text-gray-800 dark:text-white">Conversaciones</span>
            {!loadingConversations && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {conversations.length} chats
              </span>
            )}
          </div>

          {/* Buscador */}
          <div className="bg-white px-3 py-2 dark:bg-[#111B21]">
            <div className="flex items-center gap-2 rounded-lg bg-[#f0f2f5] px-3 py-1.5 dark:bg-[#202C33]">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar o empezar un chat"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none dark:text-gray-200 dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="flex flex-col py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                      <div className="h-2.5 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : convError ? (
              <p className="p-4 text-sm text-red-500">{convError}</p>
            ) : filtered.length === 0 ? (
              <p className="p-4 text-sm text-gray-400 dark:text-gray-500">
                {search ? "Sin resultados." : "Sin conversaciones."}
              </p>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.sessionId}
                  conversation={conv}
                  selected={conv.sessionId === selectedSessionId}
                  onClick={() => setSelectedSessionId(conv.sessionId)}
                />
              ))
            )}
          </div>
        </div>

        {/* Panel derecho */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {selectedConversation ? (
            /* Header del chat */
            <div className="flex items-center gap-3 bg-[#f0f2f5] px-4 py-2.5 dark:bg-[#1F2C33]">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor}`}>
                {avatarLabel}
              </div>
              <div>
                <p className="text-[15px] font-medium text-gray-900 dark:text-white">{displayName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatPhone(selectedConversation.phone)}
                </p>
              </div>
            </div>
          ) : null}

          {/* Área de mensajes */}
          <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4 bg-[#efeae2] dark:bg-[#0D1418]">
            {!selectedSessionId ? (
              <NoConversationSelected />
            ) : loadingMessages ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent dark:border-[#00a884] dark:border-t-transparent" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="rounded-lg bg-white/90 px-4 py-2 text-sm text-gray-500 shadow-sm dark:bg-[#1F2C33]/90 dark:text-gray-400">
                  Sin mensajes en esta conversación
                </p>
              </div>
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
