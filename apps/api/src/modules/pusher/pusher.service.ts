import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Pusher from 'pusher';

@Injectable()
export class PusherService {
  private pusher: Pusher | null = null;

  constructor(private configService: ConfigService) {
    const appId = this.configService.get<string>('PUSHER_APP_ID');
    const key = this.configService.get<string>('PUSHER_KEY');
    const secret = this.configService.get<string>('PUSHER_SECRET');
    
    if (appId && key && secret) {
      this.pusher = new Pusher({
        appId,
        key,
        secret,
        cluster: this.configService.get<string>('PUSHER_CLUSTER') || 'sa1',
        useTLS: true,
      });
    }
  }

  async trigger(channel: string, event: string, data: any) {
    if (!this.pusher) {
      console.warn('Pusher não configurado - evento ignorado:', event);
      return;
    }
    try {
      await this.pusher.trigger(channel, event, data);
    } catch (error) {
      console.error('Erro ao enviar evento Pusher:', error);
    }
  }

  async authenticateUser(socketId: string, channel: string, userId: string) {
    if (!this.pusher) {
      return null;
    }
    return this.pusher.authorizeChannel(socketId, channel, {
      user_id: userId,
    });
  }
}
