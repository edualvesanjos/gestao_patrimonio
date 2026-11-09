-- ============================================================
-- SCRIPT DE ESTRUTURA E RLS (SuperDB Nativo / auth.users)
-- Projeto: Gestão de Patrimônio - Prefeitura da Estância de Atibaia
-- Versão do Schema: 1.1.0.5
-- ============================================================

-- Tabela de Itens de Patrimônio
-- O usuario_id referencia diretamente a tabela nativa de autenticação do SuperDB (auth.users)
CREATE TABLE IF NOT EXISTS patrimonios (
    id VARCHAR(50) PRIMARY KEY,
    usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    item VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    fabricante VARCHAR(100),
    modelo VARCHAR(100),
    num_patrimonio VARCHAR(100) NOT NULL,
    baixado BOOLEAN DEFAULT FALSE,
    transferido BOOLEAN DEFAULT FALSE,
    observacoes TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patrimonios_num ON patrimonios(num_patrimonio);
CREATE INDEX IF NOT EXISTS idx_patrimonios_categoria ON patrimonios(categoria);
CREATE INDEX IF NOT EXISTS idx_patrimonios_usuario ON patrimonios(usuario_id);

-- ============================================================
-- POLÍTICAS RLS: ISOLAMENTO TOTAL UTILIZANDO auth.uid()
-- ============================================================

ALTER TABLE patrimonios ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas anteriores
DROP POLICY IF EXISTS "Permitir acesso total via API" ON patrimonios;
DROP POLICY IF EXISTS "Usuário lê apenas seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário insere seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário atualiza apenas seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário deleta apenas seus patrimônios" ON patrimonios;

-- SELECT: Servidor vê apenas os ativos vinculados ao seu UUID nativo
CREATE POLICY "Usuário lê apenas seus patrimônios"
ON patrimonios
FOR SELECT
USING (auth.uid() = usuario_id);

-- INSERT: Servidor grava apenas vinculando ao seu UUID nativo
CREATE POLICY "Usuário insere seus patrimônios"
ON patrimonios
FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- UPDATE: Servidor edita/baixa apenas seus ativos
CREATE POLICY "Usuário atualiza apenas seus patrimônios"
ON patrimonios
FOR UPDATE
USING (auth.uid() = usuario_id);

-- DELETE: Servidor exclui apenas seus ativos
CREATE POLICY "Usuário deleta apenas seus patrimônios"
ON patrimonios
FOR DELETE
USING (auth.uid() = usuario_id);
