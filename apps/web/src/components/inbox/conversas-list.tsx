'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Inbox } from 'lucide-react';
import { api } from '@/lib/api';
import { cn, formatarData } from '@/lib/utils';

interface Conversa {
  id: string;
  status: string;
  contato: {
    id: string;
    nome: string | null;
    telefone: string;
    fotoPerfilUrl: string | null;
  };
  previewUltimaMensagem: string | null;
  ultimaMensagemEm: string | null;
  quantidadeNaoLidas: number;
}

interface ConversasListProps {
  conversaSelecionadaId: string | null;
  onSelecionarConversa: (id: string) => void;
}

export function ConversasList({ conversaSelecionadaId, onSelecionarConversa }: ConversasListProps) {
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<'todas' | 'minhas' | 'pendentes'>('todas');

  const { data, isLoading } = useQuery({
    queryKey: ['conversas', filtro],
    queryFn: async () => {
      const params: any = {};
      if (filtro === 'pendentes') {
        params.naoAtribuidas = true;
      }
      const response = await api.get('/conversas', { params });
      return response.data;
    },
  });

  const conversas: Conversa[] = data?.data || [];

  const conversasFiltradas = conversas.filter((c) => {
    if (!busca) return true;
    const nome = c.contato.nome?.toLowerCase() || '';
    const telefone = c.contato.telefone.toLowerCase();
    return nome.includes(busca.toLowerCase()) || telefone.includes(busca.toLowerCase());
  });

  return (
    <div className="w-80 bg-white border-r flex flex-col">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar conversa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
          />
        </div>

        <div className="flex gap-2 mt-3">
          {(['todas', 'minhas', 'pendentes'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={cn(
                'px-3 py-1 text-xs rounded-full transition',
                filtro === f
                  ? 'bg-whatsapp-light text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Carregando...</div>
        ) : conversasFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma conversa encontrada</p>
          </div>
        ) : (
          conversasFiltradas.map((conversa) => (
            <button
              key={conversa.id}
              onClick={() => onSelecionarConversa(conversa.id)}
              className={cn(
                'w-full p-4 flex gap-3 hover:bg-gray-50 transition border-b text-left',
                conversaSelecionadaId === conversa.id && 'bg-gray-100'
              )}
            >
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-medium flex-shrink-0">
                {conversa.contato.nome?.charAt(0).toUpperCase() || conversa.contato.telefone.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <p className="font-medium truncate">
                    {conversa.contato.nome || conversa.contato.telefone}
                  </p>
                  {conversa.ultimaMensagemEm && (
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                      {formatarData(conversa.ultimaMensagemEm)}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-500 truncate">
                    {conversa.previewUltimaMensagem || 'Nova conversa'}
                  </p>
                  {conversa.quantidadeNaoLidas > 0 && (
                    <span className="bg-whatsapp-light text-white text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2">
                      {conversa.quantidadeNaoLidas}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
