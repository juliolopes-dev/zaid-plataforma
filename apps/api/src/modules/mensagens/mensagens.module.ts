import { Module, forwardRef } from '@nestjs/common';
import { MensagensService } from './mensagens.service';
import { MensagensController } from './mensagens.controller';
import { ConversasModule } from '../conversas/conversas.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { PusherModule } from '../pusher/pusher.module';

@Module({
  imports: [ConversasModule, forwardRef(() => WhatsappModule), PusherModule],
  controllers: [MensagensController],
  providers: [MensagensService],
  exports: [MensagensService],
})
export class MensagensModule {}
