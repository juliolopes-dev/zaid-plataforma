import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { ContatosModule } from './modules/contatos/contatos.module';
import { ConversasModule } from './modules/conversas/conversas.module';
import { MensagensModule } from './modules/mensagens/mensagens.module';
import { WhatsappModule } from './modules/whatsapp/whatsapp.module';
import { PusherModule } from './modules/pusher/pusher.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UsuariosModule,
    ContatosModule,
    ConversasModule,
    MensagensModule,
    WhatsappModule,
    PusherModule,
  ],
})
export class AppModule {}
