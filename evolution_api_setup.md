# GUIA RÁPIDO: SUBIR EVOLUTION API PARA O ELOSERVE (WHATSAPP)

A **Evolution API** é o servidor de código aberto que conecta o WhatsApp dos restaurantes ao EloServe PDV.

---

## OPÇÃO 1: Subir em Servidor VPS (Docker) em 2 minutos

Se você tem uma VPS (Ubuntu/Debian) na Hetzner, DigitalOcean, Contabo, AWS ou Oracle Cloud:

### 1. Crie o arquivo `docker-compose.yml`:
```bash
mkdir -p /root/evolution && cd /root/evolution
nano docker-compose.yml
```

### 2. Cole este conteúdo:
```yaml
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:v2.1.2
    container_name: evolution_api
    restart: always
    ports:
      - "8080:8080"
    environment:
      - SERVER_URL=https://whatsapp.seudominio.com.br # Ou http://SEU_IP:8080
      - AUTHENTICATION_API_KEY=EloServeWhatsApp2026 # Defina sua senha aqui
      - DATABASE_PROVIDER=local
      - CACHE_REDIS_ENABLED=false
    volumes:
      - evolution_instances:/evolution/instances

volumes:
  evolution_instances:
```

### 3. Inicie o servidor:
```bash
docker compose up -d
```

Pronto! Sua API estará rodando na porta 8080.

---

## OPÇÃO 2: Hospedagem Gratuita / Cloud com 1 Clique (Sem gerenciar VPS)

Você pode subir a Evolution API em serviços em nuvem gerenciados que têm plano gratuito ou de baixo custo:
1. **Render.com** (Docker Service)
2. **Railway.app** (Deploy direto com 1 clique do repositório da Evolution API)
3. **Evolution Cloud** ou serviços gerenciados de API WhatsApp (Z-API, Z-Stack, etc.)

---

## Como Preencher no EloServe PDV

No EloServe, acesse o menu **EloBot (WhatsApp)** -> aba **5. Conexão QR**:

- **URL do Gateway:** `https://whatsapp.seudominio.com.br` (ou `http://SEU_IP:8080`)
- **API Key / Token:** `EloServeWhatsApp2026` (ou a senha que você definiu no SERVER_KEY)
- **Nome da Instância:** `eloserve-restaurante` (ou o nome que desejar)
- **Número do WhatsApp:** Digite o número com DDD (ex: `(11) 99999-8888`) e clique em **Salvar Número**.
