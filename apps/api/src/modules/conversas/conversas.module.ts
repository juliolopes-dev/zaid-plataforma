import { Module } from '@nestjs/common';
import { ConversasService } from './conversas.service';
import { ConversasController } from './conversas.controller';
import { PusherModule } from '../pusher/pusher.module';

@Module({
  imports: [PusherModule],
  controllers: [ConversasController],
  providers: [ConversasService],
  exports: [ConversasService],
})
export class ConversasModule {}
