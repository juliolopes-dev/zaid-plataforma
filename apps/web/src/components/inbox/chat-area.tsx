'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, MoreVertical, User, ArrowRightLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatarData } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

interface Mensagem {
  id: string;
  conteudo: string | null;
  tipo: string;
  direcao: string;
  status: string;
  criadoEm: string;
  remetente?: {
    id: string;
    nome: string;
    avatarUrl: string | null;
  };
}

interface ChatAreaProps {
  conversaId: string | null;
}

export function ChatArea({ conversaId }: ChatAreaProps) {
  const [mensagem, setMensagem] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { usuario } = useAuthStore();

  const { data: conversa } = useQuery({
    queryKey: ['conversa', conversaId],
    queryFn: async () => {
      const response = await api.get(`/conversas/${conversaId}`);
      return response.data;
    },
    enabled: !!conversaId,
  });

  const { data: mensagensData } = useQuery({
    queryKey: ['mensagens', conversaId],
    queryFn: async () => {
      const response = await api.get(`/conversas/${conversaId}/mensagens`);
      return response.data;
    },
    enabled: !!conversaId,
    refetchInterval: 5000,
  });

  const mensagens: Mensagem[] = mensagensData?.data || [];

  const enviarMutation = useMutation({
    mutationFn: async (conteudo: string) => {
      const response = await api.post(`/conversas/${conversaId}/mensagens`, {
        conteudo,
        tipo: 'TEXTO',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mensagens', conversaId] });
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
    },
  });

  const atribuirMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(`/conversas/${conversaId}/atribuir`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversa', conversaId] });
      queryClient.invalidateQueries({ queryKey: ['conversas'] });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensagens]);

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensagem.trim()) return;
    enviarMutation.mutate(mensagem);
    setMensagem('');
  };

  if (!conversaId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Selecione uma conversa</p>
          <p className="text-sm">para começar a atender</p>
        </div>
      </div>
    );
  }

  const naoAtribuida = !conversa?.atribuidoParaId;
  const atribuidoParaMim = conversa?.atribuidoParaId === usuario?.id;

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium">
            {conversa?.contato?.nome?.charAt(0).toUpperCase() || conversa?.contato?.telefone?.charAt(0)}
          </div>
          <div>
            <p className="font-medium">
              {conversa?.contato?.nome || conversa?.contato?.telefone}
            </p>
            <p className="text-xs text-gray-500">{conversa?.contato?.telefone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {naoAtribuida && (
            <button
              onClick={() => atribuirMutation.mutate()}
              className="flex items-center gap-2 px-3 py-2 bg-whatsapp-light text-white rounded-lg text-sm hover:bg-whatsapp-dark transition"
            >
              <CheckCircle className="w-4 h-4" />
              Atribuir para mim
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowRightLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <MoreVertical className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {mensagens.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'max-w-[70%] p-3 rounded-lg',
              msg.direcao === 'ENVIADA'
                ? 'bg-whatsapp-light text-white ml-auto rounded-br-none'
                : 'bg-white shadow-sm rounded-bl-none'
            )}
          >
            <p className="text-sm whitespace-pre-wrap">{msg.conteudo}</p>
            <p
              className={cn(
                'text-xs mt-1',
                msg.direcao === 'ENVIADA' ? 'text-white/70' : 'text-gray-400'
              )}
            >
              {formatarData(msg.criadoEm)}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(atribuidoParaMim || naoAtribuida) && (
        <form onSubmit={handleEnviar} className="bg-white border-t p-4">
          <div className="flex items-center gap-3">
            <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
            />
            <button
              type="submit"
              disabled={!mensagem.trim() || enviarMutation.isPending}
              className="p-3 bg-whatsapp-light text-white rounded-full hover:bg-whatsapp-dark transition disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
