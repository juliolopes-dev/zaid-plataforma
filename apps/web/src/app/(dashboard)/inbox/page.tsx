'use client';

import { useState } from 'react';
import { ConversasList } from '@/components/inbox/conversas-list';
import { ChatArea } from '@/components/inbox/chat-area';

export default function InboxPage() {
  const [conversaSelecionada, setConversaSelecionada] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <ConversasList
        conversaSelecionadaId={conversaSelecionada}
        onSelecionarConversa={setConversaSelecionada}
      />
      <ChatArea conversaId={conversaSelecionada} />
    </div>
  );
}
