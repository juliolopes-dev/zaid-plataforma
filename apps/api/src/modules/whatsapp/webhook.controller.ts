import { Controller, Post, Body, Headers, HttpCode, HttpStatus, All, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MensagensService } from '../mensagens/mensagens.service';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhookController {
  constructor(
    private readonly mensagensService: MensagensService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('evolution')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook da Evolution API' })
  async evolutionWebhook(
    @Body() body: any,
  ) {
    return this.processWebhook(body);
  }

  @All('evolution/:event')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook da Evolution API por evento' })
  async evolutionWebhookByEvent(
    @Param('event') event: string,
    @Body() body: any,
  ) {
    console.log(`[Webhook] Evento recebido: ${event}`, JSON.stringify(body).substring(0, 500));
    return this.processWebhook({ ...body, event: event.replace('-', '.') });
  }

  private async processWebhook(body: any) {
    const event = body.event;
    console.log(`[Webhook] Processando evento: ${event}`);

    // QR Code atualizado
    if (event === 'qrcode.updated' || event === 'QRCODE_UPDATED') {
      const qrcode = body.data?.qrcode?.base64 || body.qrcode?.base64 || body.base64;
      const instanceName = body.instance || body.data?.instance || body.instanceName;
      
      console.log(`[Webhook] QR Code recebido para instância: ${instanceName}`);
      
      if (qrcode && instanceName) {
        await this.prisma.instanciaWhatsApp.upsert({
          where: { nomeInstancia: instanceName },
          update: {
            status: 'conectando',
            qrCode: qrcode,
          },
          create: {
            nomeInstancia: instanceName,
            status: 'conectando',
            qrCode: qrcode,
          },
        });
      }
      return { received: true };
    }

    // Status de conexão atualizado
    if (event === 'connection.update' || event === 'CONNECTION_UPDATE') {
      const state = body.data?.state || body.state;
      const instanceName = body.instance || body.data?.instance || body.instanceName;
      
      console.log(`[Webhook] Status de conexão: ${state} para instância: ${instanceName}`);
      
      if (instanceName) {
        const status = state === 'open' ? 'conectado' : state === 'close' ? 'desconectado' : 'conectando';
        await this.prisma.instanciaWhatsApp.upsert({
          where: { nomeInstancia: instanceName },
          update: {
            status,
            qrCode: state === 'open' ? null : undefined,
          },
          create: {
            nomeInstancia: instanceName,
            status,
          },
        });
      }
      return { received: true };
    }

    // Mensagens recebidas
    if (event === 'messages.upsert' || event === 'MESSAGES_UPSERT') {
      const data = body.data;
      const key = data?.key;

      if (!key || key.fromMe) {
        return { received: true };
      }

      const whatsappId = key.remoteJid;
      const messageId = key.id;
      const message = data.message;

      if (!message) {
        return { received: true };
      }

      let conteudo = '';
      let tipo = 'TEXTO';
      let midiaUrl = '';

      if (message.conversation) {
        conteudo = message.conversation;
      } else if (message.extendedTextMessage) {
        conteudo = message.extendedTextMessage.text;
      } else if (message.imageMessage) {
        tipo = 'IMAGEM';
        conteudo = message.imageMessage.caption || '';
      } else if (message.audioMessage) {
        tipo = 'AUDIO';
      } else if (message.videoMessage) {
        tipo = 'VIDEO';
        conteudo = message.videoMessage.caption || '';
      } else if (message.documentMessage) {
        tipo = 'DOCUMENTO';
        conteudo = message.documentMessage.fileName || '';
      }

      await this.mensagensService.receberDoWhatsapp(whatsappId, {
        messageId,
        conteudo,
        tipo,
        midiaUrl,
        timestamp: data.messageTimestamp,
      });
    }

    return { received: true };
  }
}
