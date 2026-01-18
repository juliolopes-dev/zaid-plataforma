'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Instancia {
  id?: string;
  name: string;
  connectionStatus?: string;
  ownerJid?: string;
  profileName?: string;
  profilePicUrl?: string;
  number?: string;
}

interface StatusInstancia {
  instanceName: string;
  status: string;
  state?: string;
  qrCode?: string;
}

export default function WhatsAppPage() {
  const queryClient = useQueryClient();
  const [novaInstancia, setNovaInstancia] = useState('');
  const [instanciaSelecionada, setInstanciaSelecionada] = useState<string | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Listar instâncias
  const { data: instancias = [], isLoading } = useQuery<Instancia[]>({
    queryKey: ['whatsapp-instancias'],
    queryFn: async () => {
      const response = await api.get('/whatsapp/instancias');
      return response.data;
    },
    refetchInterval: 10000,
  });

  // Status da instância selecionada
  const { data: statusInstancia } = useQuery<StatusInstancia>({
    queryKey: ['whatsapp-status', instanciaSelecionada],
    queryFn: async () => {
      const response = await api.get(`/whatsapp/instancias/${instanciaSelecionada}`);
      return response.data;
    },
    enabled: !!instanciaSelecionada,
    refetchInterval: 3000,
  });

  // Criar instância
  const criarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.post('/whatsapp/instancias', { nome });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instancias'] });
      setNovaInstancia('');
      setMostrarModal(false);
    },
  });

  // Deletar instância
  const deletarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.delete(`/whatsapp/instancias/${nome}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instancias'] });
      setInstanciaSelecionada(null);
    },
  });

  // Conectar instância
  const conectarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.post(`/whatsapp/instancias/${nome}/conectar`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', instanciaSelecionada] });
    },
  });

  // Desconectar instância
  const desconectarMutation = useMutation({
    mutationFn: async (nome: string) => {
      const response = await api.post(`/whatsapp/instancias/${nome}/desconectar`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status', instanciaSelecionada] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-instancias'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
      case 'conectado':
        return 'bg-green-500';
      case 'connecting':
      case 'conectando':
        return 'bg-yellow-500';
      case 'close':
      case 'desconectado':
      default:
        return 'bg-red-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open':
        return 'Conectado';
      case 'connecting':
        return 'Conectando...';
      case 'close':
        return 'Desconectado';
      default:
        return status || 'Desconhecido';
    }
  };

  const isConectado = statusInstancia?.status === 'open' || statusInstancia?.state === 'open';

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-gray-600">Gerencie suas instâncias do WhatsApp</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Nova Instância
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de Instâncias */}
        <div className="lg:col-span-1 bg-white rounded-lg border p-4">
          <h2 className="text-lg font-semibold mb-4">Instâncias</h2>
          
          {isLoading ? (
            <div className="text-gray-500">Carregando...</div>
          ) : instancias.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
              <p>Nenhuma instância encontrada</p>
              <p className="text-sm mt-2">Clique em "Nova Instância" para criar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {instancias.map((inst) => (
                <div
                  key={inst.id || inst.name}
                  onClick={() => setInstanciaSelecionada(inst.name)}
                  className={cn(
                    'p-3 rounded-lg cursor-pointer border transition',
                    instanciaSelecionada === inst.name
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{inst.name}</span>
                    <div className={cn('w-2 h-2 rounded-full', getStatusColor(inst.connectionStatus || 'close'))} />
                  </div>
                  {inst.number && (
                    <p className="text-sm text-gray-500 mt-1">{inst.number}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detalhes da Instância */}
        <div className="lg:col-span-2 space-y-6">
          {instanciaSelecionada ? (
            <>
              {/* Status */}
              <div className="bg-white rounded-lg border p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-lg font-semibold">{instanciaSelecionada}</h2>
                  <button
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar esta instância?')) {
                        deletarMutation.mutate(instanciaSelecionada);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Deletar
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className={cn('w-3 h-3 rounded-full', getStatusColor(statusInstancia?.status || ''))} />
                  <span className="font-medium">{getStatusText(statusInstancia?.status || '')}</span>
                </div>

                <div className="flex gap-3">
                  {!isConectado ? (
                    <button
                      onClick={() => conectarMutation.mutate(instanciaSelecionada)}
                      disabled={conectarMutation.isPending}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {conectarMutation.isPending ? 'Conectando...' : 'Conectar'}
                    </button>
                  ) : (
                    <button
                      onClick={() => desconectarMutation.mutate(instanciaSelecionada)}
                      disabled={desconectarMutation.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      {desconectarMutation.isPending ? 'Desconectando...' : 'Desconectar'}
                    </button>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-lg font-semibold mb-4">QR Code</h2>
                
                {isConectado ? (
                  <div className="flex flex-col items-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-medium">WhatsApp conectado!</p>
                  </div>
                ) : statusInstancia?.qrCode || conectarMutation.data?.qrCode ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={(() => {
                        const qr = statusInstancia?.qrCode || conectarMutation.data?.qrCode;
                        if (qr?.startsWith('data:')) return qr;
                        return `data:image/png;base64,${qr}`;
                      })()}
                      alt="QR Code"
                      className="w-64 h-64 border rounded-lg"
                    />
                    <p className="text-sm text-gray-600 mt-4">Escaneie com seu WhatsApp</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-8 text-gray-500">
                    <p>Clique em "Conectar" para gerar o QR Code</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border p-6 text-center text-gray-500">
              <p>Selecione uma instância para ver os detalhes</p>
              <p className="text-sm mt-2">Ou crie uma nova instância</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Criar Instância */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Nova Instância</h2>
            <input
              type="text"
              value={novaInstancia}
              onChange={(e) => setNovaInstancia(e.target.value)}
              placeholder="Nome da instância"
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setMostrarModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => criarMutation.mutate(novaInstancia)}
                disabled={!novaInstancia || criarMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {criarMutation.isPending ? 'Criando...' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
