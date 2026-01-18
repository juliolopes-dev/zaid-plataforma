-- CreateEnum
CREATE TYPE "CargoUsuario" AS ENUM ('ADMIN', 'SUPERVISOR', 'ATENDENTE');

-- CreateEnum
CREATE TYPE "StatusConversa" AS ENUM ('PENDENTE', 'EM_ANDAMENTO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "TipoMensagem" AS ENUM ('TEXTO', 'IMAGEM', 'AUDIO', 'VIDEO', 'DOCUMENTO', 'STICKER', 'LOCALIZACAO', 'CONTATO');

-- CreateEnum
CREATE TYPE "StatusMensagem" AS ENUM ('PENDENTE', 'ENVIADA', 'ENTREGUE', 'LIDA', 'FALHA');

-- CreateEnum
CREATE TYPE "DirecaoMensagem" AS ENUM ('RECEBIDA', 'ENVIADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "cargo" "CargoUsuario" NOT NULL DEFAULT 'ATENDENTE',
    "avatarUrl" TEXT,
    "estaOnline" BOOLEAN NOT NULL DEFAULT false,
    "ultimoAcessoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contatos" (
    "id" TEXT NOT NULL,
    "whatsappId" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "nome" TEXT,
    "fotoPerfilUrl" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contatos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversas" (
    "id" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "status" "StatusConversa" NOT NULL DEFAULT 'PENDENTE',
    "contatoId" TEXT NOT NULL,
    "atribuidoParaId" TEXT,
    "ultimaMensagemEm" TIMESTAMP(3),
    "previewUltimaMensagem" TEXT,
    "quantidadeNaoLidas" INTEGER NOT NULL DEFAULT 0,
    "iniciadoEm" TIMESTAMP(3),
    "finalizadoEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "whatsappMensagemId" TEXT,
    "conteudo" TEXT,
    "tipo" "TipoMensagem" NOT NULL DEFAULT 'TEXTO',
    "direcao" "DirecaoMensagem" NOT NULL,
    "status" "StatusMensagem" NOT NULL DEFAULT 'PENDENTE',
    "midiaUrl" TEXT,
    "midiaTipo" TEXT,
    "midiaTamanho" INTEGER,
    "midiaNome" TEXT,
    "conversaId" TEXT NOT NULL,
    "remetenteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias" (
    "id" TEXT NOT NULL,
    "conversaId" TEXT NOT NULL,
    "deUsuarioId" TEXT NOT NULL,
    "paraUsuarioId" TEXT NOT NULL,
    "motivo" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transferencias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instancias_whatsapp" (
    "id" TEXT NOT NULL,
    "nomeInstancia" TEXT NOT NULL,
    "instanciaId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'desconectado',
    "qrCode" TEXT,
    "telefone" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instancias_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "respostas_rapidas" (
    "id" TEXT NOT NULL,
    "atalho" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "respostas_rapidas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contatos_whatsappId_key" ON "contatos"("whatsappId");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_protocolo_key" ON "conversas"("protocolo");

-- CreateIndex
CREATE INDEX "conversas_status_idx" ON "conversas"("status");

-- CreateIndex
CREATE INDEX "conversas_atribuidoParaId_idx" ON "conversas"("atribuidoParaId");

-- CreateIndex
CREATE INDEX "conversas_ultimaMensagemEm_idx" ON "conversas"("ultimaMensagemEm");

-- CreateIndex
CREATE UNIQUE INDEX "mensagens_whatsappMensagemId_key" ON "mensagens"("whatsappMensagemId");

-- CreateIndex
CREATE INDEX "mensagens_conversaId_idx" ON "mensagens"("conversaId");

-- CreateIndex
CREATE INDEX "mensagens_criadoEm_idx" ON "mensagens"("criadoEm");

-- CreateIndex
CREATE UNIQUE INDEX "instancias_whatsapp_nomeInstancia_key" ON "instancias_whatsapp"("nomeInstancia");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_rapidas_atalho_key" ON "respostas_rapidas"("atalho");

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_contatoId_fkey" FOREIGN KEY ("contatoId") REFERENCES "contatos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_atribuidoParaId_fkey" FOREIGN KEY ("atribuidoParaId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_conversaId_fkey" FOREIGN KEY ("conversaId") REFERENCES "conversas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_deUsuarioId_fkey" FOREIGN KEY ("deUsuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias" ADD CONSTRAINT "transferencias_paraUsuarioId_fkey" FOREIGN KEY ("paraUsuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
