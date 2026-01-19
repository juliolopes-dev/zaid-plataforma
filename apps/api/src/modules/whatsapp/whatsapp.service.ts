import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WhatsappService {
  private baseUrl: string;
  private apiKey: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    private prisma: PrismaService,
  ) {
    this.baseUrl = this.configService.get<string>('EVOLUTION_API_URL') || '';
    this.apiKey = this.configService.get<string>('EVOLUTION_API_KEY') || '';
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      apikey: this.apiKey,
    };
  }

  // Listar instâncias do banco de dados (filtradas por empresa se necessário)
  async listarInstancias(empresaId?: string) {
    try {
      const instancias = await this.prisma.instanciaWhatsApp.findMany({
        where: empresaId ? { empresaId } : undefined,
        orderBy: { criadoEm: 'desc' },
      });

      return instancias.map((inst) => ({
        id: inst.id,
        name: inst.nomeInstancia,
        connectionStatus: inst.status,
        number: inst.telefone,
      }));
    } catch (error: any) {
      console.error('Erro ao listar instâncias:', error?.message);
      return [];
    }
  }

  // Criar nova instância
  async criarInstancia(nomeInstancia: string) {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/instance/create`,
          {
            instanceName: nomeInstancia,
            qrcode: true,
            integration: 'WHATSAPP-BAILEYS',
          },
          { headers: this.getHeaders() },
        ),
      );

      // Salva no banco local
      await this.prisma.instanciaWhatsApp.upsert({
        where: { nomeInstancia },
        update: { status: 'criada' },
        create: { nomeInstancia, status: 'criada' },
      });

      return {
        success: true,
        instance: response.data?.instance,
        qrCode: response.data?.qrcode?.base64,
      };
    } catch (error: any) {
      console.error('Erro ao criar instância:', error?.response?.data || error?.message);
      throw new Error(error?.response?.data?.message || 'Erro ao criar instância');
    }
  }

  // Deletar instância
  async deletarInstancia(nomeInstancia: string) {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.baseUrl}/instance/delete/${nomeInstancia}`,
          { headers: this.getHeaders() },
        ),
      );

      // Remove do banco local
      await this.prisma.instanciaWhatsApp.deleteMany({
        where: { nomeInstancia },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao deletar instância:', error?.response?.data || error?.message);
      throw new Error('Erro ao deletar instância');
    }
  }

  // Obter status de uma instância específica
  async obterStatusInstancia(nomeInstancia: string) {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/instance/connectionState/${nomeInstancia}`,
          { headers: this.getHeaders() },
        ),
      );

      const instanciaDb = await this.prisma.instanciaWhatsApp.findUnique({
        where: { nomeInstancia },
      });

      const state = response.data?.instance?.state || response.data?.state || 'close';

      return {
        instanceName: nomeInstancia,
        status: state,
        state: state,
        qrCode: instanciaDb?.qrCode || null,
      };
    } catch (error) {
      const instanciaDb = await this.prisma.instanciaWhatsApp.findUnique({
        where: { nomeInstancia },
      });

      return {
        instanceName: nomeInstancia,
        status: instanciaDb?.status || 'desconectado',
        state: 'close',
        qrCode: instanciaDb?.qrCode || null,
      };
    }
  }

  // Conectar uma instância (gera QR Code)
  async conectarInstancia(nomeInstancia: string) {
    try {
      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/instance/connect/${nomeInstancia}`,
          { headers: this.getHeaders() },
        ),
      );

      const qrCodeBase64 = response.data?.base64 || response.data?.qrcode?.base64;
      console.log('[WhatsApp] QR Code recebido:', qrCodeBase64 ? 'Sim (' + qrCodeBase64.substring(0, 30) + '...)' : 'Não');

      if (qrCodeBase64) {
        await this.prisma.instanciaWhatsApp.upsert({
          where: { nomeInstancia },
          update: { status: 'conectando', qrCode: qrCodeBase64 },
          create: { nomeInstancia, status: 'conectando', qrCode: qrCodeBase64 },
        });
      }

      return {
        status: 'conectando',
        qrCode: qrCodeBase64,
        pairingCode: response.data?.pairingCode,
      };
    } catch (error: any) {
      console.error('Erro ao conectar:', error?.response?.data || error?.message);
      throw new Error('Erro ao conectar instância');
    }
  }

  // Desconectar uma instância
  async desconectarInstancia(nomeInstancia: string) {
    try {
      await firstValueFrom(
        this.httpService.delete(
          `${this.baseUrl}/instance/logout/${nomeInstancia}`,
          { headers: this.getHeaders() },
        ),
      );

      await this.prisma.instanciaWhatsApp.updateMany({
        where: { nomeInstancia },
        data: { status: 'desconectado', qrCode: null },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao desconectar:', error?.response?.data || error?.message);
      throw new Error('Erro ao desconectar instância');
    }
  }

  // Enviar mensagem via uma instância específica
  async enviarMensagem(
    nomeInstancia: string,
    destinatario: string,
    texto: string,
    tipo?: string,
    midiaUrl?: string,
  ): Promise<{ messageId: string }> {
    try {
      let endpoint = 'sendText';
      let body: any = {
        number: destinatario.replace('@s.whatsapp.net', ''),
        text: texto,
      };

      if (tipo === 'IMAGEM' && midiaUrl) {
        endpoint = 'sendMedia';
        body = {
          number: destinatario.replace('@s.whatsapp.net', ''),
          mediatype: 'image',
          media: midiaUrl,
          caption: texto,
        };
      } else if (tipo === 'AUDIO' && midiaUrl) {
        endpoint = 'sendWhatsAppAudio';
        body = {
          number: destinatario.replace('@s.whatsapp.net', ''),
          audio: midiaUrl,
        };
      } else if (tipo === 'DOCUMENTO' && midiaUrl) {
        endpoint = 'sendMedia';
        body = {
          number: destinatario.replace('@s.whatsapp.net', ''),
          mediatype: 'document',
          media: midiaUrl,
          caption: texto,
        };
      }

      const response: AxiosResponse<any> = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/message/${endpoint}/${nomeInstancia}`,
          body,
          { headers: this.getHeaders() },
        ),
      );

      return {
        messageId: response.data?.key?.id || response.data?.messageId || '',
      };
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error('Erro ao enviar mensagem via WhatsApp');
    }
  }
}
