-- CreateEnum
CREATE TYPE "PlanoEmpresa" AS ENUM ('GRATUITO', 'BASICO', 'PROFISSIONAL', 'EMPRESARIAL');

-- CreateEnum
CREATE TYPE "StatusEmpresa" AS ENUM ('ATIVA', 'SUSPENSA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "CargoUsuario" ADD VALUE 'SUPER_ADMIN';

-- CreateTable
CREATE TABLE "empresas" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "cnpj" TEXT,
    "email" TEXT NOT NULL,
    "telefone" TEXT,
    "logoUrl" TEXT,
    "plano" "PlanoEmpresa" NOT NULL DEFAULT 'GRATUITO',
    "status" "StatusEmpresa" NOT NULL DEFAULT 'ATIVA',
    "limiteInstancias" INTEGER NOT NULL DEFAULT 1,
    "limiteUsuarios" INTEGER NOT NULL DEFAULT 3,
    "limiteConversas" INTEGER NOT NULL DEFAULT 100,
    "dataAssinatura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVencimento" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_slug_key" ON "empresas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_key" ON "empresas"("cnpj");

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN "empresaId" TEXT;

-- AlterTable
ALTER TABLE "contatos" ADD COLUMN "empresaId" TEXT;

-- AlterTable
ALTER TABLE "conversas" ADD COLUMN "empresaId" TEXT;

-- AlterTable
ALTER TABLE "instancias_whatsapp" ADD COLUMN "empresaId" TEXT;

-- AlterTable
ALTER TABLE "respostas_rapidas" ADD COLUMN "empresaId" TEXT;

-- CreateIndex
CREATE INDEX "usuarios_empresaId_idx" ON "usuarios"("empresaId");

-- CreateIndex
CREATE INDEX "contatos_empresaId_idx" ON "contatos"("empresaId");

-- CreateIndex
CREATE INDEX "conversas_empresaId_idx" ON "conversas"("empresaId");

-- CreateIndex
CREATE INDEX "instancias_whatsapp_empresaId_idx" ON "instancias_whatsapp"("empresaId");

-- CreateIndex
CREATE INDEX "respostas_rapidas_empresaId_idx" ON "respostas_rapidas"("empresaId");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contatos" ADD CONSTRAINT "contatos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversas" ADD CONSTRAINT "conversas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instancias_whatsapp" ADD CONSTRAINT "instancias_whatsapp_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "respostas_rapidas" ADD CONSTRAINT "respostas_rapidas_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropIndex
DROP INDEX IF EXISTS "contatos_whatsappId_key";

-- DropIndex
DROP INDEX IF EXISTS "conversas_protocolo_key";

-- DropIndex
DROP INDEX IF EXISTS "instancias_whatsapp_nomeInstancia_key";

-- DropIndex
DROP INDEX IF EXISTS "respostas_rapidas_atalho_key";

-- CreateIndex
CREATE UNIQUE INDEX "contatos_whatsappId_empresaId_key" ON "contatos"("whatsappId", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "conversas_protocolo_empresaId_key" ON "conversas"("protocolo", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "instancias_whatsapp_nomeInstancia_empresaId_key" ON "instancias_whatsapp"("nomeInstancia", "empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "respostas_rapidas_atalho_empresaId_key" ON "respostas_rapidas"("atalho", "empresaId");
