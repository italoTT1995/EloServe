# 🛡️ Guia Oficial de Restauração & Backup - EloServe

Este diretório contém o **backup completo e seguro** de todo o ecossistema EloServe (Código-fonte completo, Schemas DDL, Regras de Segurança RLS e Dados Reais do Banco de Dados Supabase).

---

## 📦 Arquivos Gerados Neste Backup

| Arquivo | Descrição | Como Usar |
| :--- | :--- | :--- |
| **`backup_database_live_2026-11-05.sql`** | **Script SQL Completo do Banco de Dados.** Contém a criação de todas as 8 tabelas, chaves estrangeiras, campos novos (como `na_lixeira` e `deletado_em`), políticas RLS e os inserts com dados reais de restaurantes e usuários cadastrados. | Executável diretamente no **SQL Editor** do Supabase. |
| **`backup_database_live_2026-11-05.json`** | **Snapshot em formato JSON** de todos os registros existentes nas tabelas do Supabase. | Útil para migrações, scripts automatizados ou visualização rápida. |
| **`EloServe_completo_backup_2026-11-05.zip`** | **Arquivo compactado com todo o código-fonte** da aplicação (React 19, Vite, Tailwind CSS, ícones, logos em alta resolução, componentes, páginas e stores). | Descompactar em qualquer computador para ter o sistema idêntico. |
| **`../scripts/gerarBackup.cjs`** | **Script de Backup Automatizado.** Permite gerar uma nova cópia do banco a qualquer momento. | Executar `npm run backup` no terminal. |

---

## 🗄️ 1. Como Restaurar o Banco de Dados no Supabase

Se você precisar recriar o banco do zero ou restaurar em um novo projeto Supabase:

1. Acesse o painel do **Supabase** ([supabase.com](https://supabase.com)) e selecione o seu projeto.
2. No menu lateral esquerdo, clique no ícone de terminal **SQL Editor** (`</>`).
3. Clique no botão **New Query** (ou Nova Consulta).
4. Abra o arquivo **`backup_database_live_2026-11-05.sql`** em um editor de texto (VS Code, Bloco de Notas, etc.), copie todo o seu conteúdo e cole no SQL Editor do Supabase.
5. Clique no botão verde **Run** (Executar) no canto inferior direito.
6. **Pronto!** 
   - Todas as 8 tabelas serão criadas/atualizadas com integridade referencial.
   - As políticas de segurança RLS serão habilitadas e configuradas.
   - Os restaurantes (incluindo o Master e o tenant real *"Resenha da Naty"*) e todos os usuários cadastrados (*Ítalo, Wendel, Clara*) serão restaurados com integridade garantida via `ON CONFLICT DO UPDATE`.

---

## 💻 2. Como Restaurar e Rodar o Sistema Localmente

### A partir do arquivo ZIP (`EloServe_completo_backup_2026-11-05.zip`):
1. Copie o arquivo `.zip` para a pasta desejada e extraia seu conteúdo.
2. Abra o terminal na pasta extraída e instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente criando o arquivo `.env` com as chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=https://jjyexujkbipbiqeyrdfj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqeWV4dWprYmlwYmlxZXlyZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg4MTMsImV4cCI6MjA1NjgxNDgxM30.rL5k0j80_Z6Lz6L5k0j80_Z6Lz
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Para gerar a build de produção:
   ```bash
   npm run build
   ```

---

## 🔄 3. Como Gerar Novos Backups no Futuro

Sempre que cadastrar novos restaurantes, produtos ou mesas e quiser gerar um snapshot atualizado do banco:

Basta rodar no terminal do projeto:
```bash
npm run backup
```
O script se conectará automaticamente à API do Supabase e gerará novos arquivos `.sql` e `.json` atualizados dentro da pasta `backups/`.
