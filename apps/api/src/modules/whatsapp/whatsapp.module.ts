import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { WebhookController } from './webhook.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MensagensModule } from '../mensagens/mensagens.module';

@Module({
  imports: [HttpModule, PrismaModule, forwardRef(() => MensagensModule)],
  controllers: [WhatsappController, WebhookController],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
