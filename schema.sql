-- ============================================================
-- SCRIPT DE ESTRUTURA E RLS COM TYPE CAST (SuperDB Auth)
-- Projeto: Gestão de Patrimônio - Prefeitura da Estância de Atibaia
-- Versão do Schema: 1.1.0.17
-- ============================================================

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

ALTER TABLE patrimonios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acesso total via API" ON patrimonios;
DROP POLICY IF EXISTS "Usuário lê apenas seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário insere seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário atualiza apenas seus patrimônios" ON patrimonios;
DROP POLICY IF EXISTS "Usuário deleta apenas seus patrimônios" ON patrimonios;

CREATE POLICY "Usuário lê apenas seus patrimônios"
ON patrimonios FOR SELECT USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Usuário insere seus patrimônios"
ON patrimonios FOR INSERT WITH CHECK (usuario_id::text = auth.uid()::text);

CREATE POLICY "Usuário atualiza apenas seus patrimônios"
ON patrimonios FOR UPDATE USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Usuário deleta apenas seus patrimônios"
ON patrimonios FOR DELETE USING (usuario_id::text = auth.uid()::text);
