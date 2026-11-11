# Deploy

O Algoky roda como **um único container**: a API serve o frontend e guarda tudo num arquivo SQLite no volume `/data`.

## 1. Subir com Docker Compose

```bash
git clone https://github.com/CaioRenatoDot/Algoky.git && cd Algoky
cp .env.example .env
docker compose up -d --build
docker compose ps        # deve aparecer "healthy"
```

Acesse `http://SEU_HOST:3333` e crie sua conta.

### Instância pessoal

Depois de criar sua conta, feche os cadastros:

```bash
sed -i 's/^ALLOW_REGISTRATION=.*/ALLOW_REGISTRATION=false/' .env
docker compose up -d
```

## 2. HTTPS com proxy reverso

Para expor na internet, coloque um proxy com TLS na frente e ative cookies seguros:

```bash
# .env
COOKIE_SECURE=true
```

### Caddy (certificado automático)

```caddyfile
algoky.seudominio.com {
	encode zstd gzip
	reverse_proxy localhost:3333
}
```

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name algoky.seudominio.com;
    # ssl_certificate / ssl_certificate_key ...

    location / {
        proxy_pass http://127.0.0.1:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

A API confia nos cabeçalhos `X-Forwarded-*` (`trustProxy`), então o rate limit vê o IP real do cliente. Exponha a porta 3333 só para o proxy, por exemplo com `ports: ["127.0.0.1:3333:3333"]` no compose.

## 3. Backup e restauração

### Backup

O script usa `VACUUM INTO`, que gera uma cópia consistente mesmo com o servidor rodando:

```bash
docker compose exec algoky node scripts/backup.mjs
# Backup salvo em /data/algoky-backup-2026-11-11T03-00-00.db

docker compose cp algoky:/data/algoky-backup-2026-11-11T03-00-00.db ./backups/
```

Exemplo de backup diário via cron no host:

```cron
0 4 * * * cd /opt/algoky && docker compose exec -T algoky node scripts/backup.mjs >> backup.log 2>&1
```

Cada usuário também pode exportar o próprio progresso em JSON em **Configurações → Seus dados**.

### Restauração

```bash
docker compose stop algoky
docker compose cp ./backups/algoky-backup-XXXX.db algoky:/data/algoky.db
docker compose start algoky
```

> Com o container parado, o `docker compose cp` ainda funciona porque o volume continua montado. Se existirem `algoky.db-wal` e `algoky.db-shm` antigos no volume, remova-os antes de iniciar.

## 4. Atualizar

```bash
git pull
docker compose up -d --build
```

As migrações do banco rodam automaticamente na inicialização e são incrementais e transacionais. Faça um backup antes de atualizar.

## 5. Sem Docker

```bash
npm ci --ignore-scripts
npm run build
NODE_ENV=production WEB_DIST=apps/web/dist DATABASE_PATH=/var/lib/algoky/algoky.db \
  node apps/api/dist/index.js
```

Exemplo de unit do systemd:

```ini
[Unit]
Description=Algoky
After=network.target

[Service]
WorkingDirectory=/opt/algoky
Environment=NODE_ENV=production WEB_DIST=/opt/algoky/apps/web/dist DATABASE_PATH=/var/lib/algoky/algoky.db COOKIE_SECURE=true
ExecStart=/usr/bin/node apps/api/dist/index.js
Restart=on-failure
User=algoky

[Install]
WantedBy=multi-user.target
```

## Solução de problemas

| Sintoma                               | Causa provável                                                             |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Login funciona mas a sessão "some"    | `COOKIE_SECURE=true` sem HTTPS: o navegador descarta o cookie              |
| `429 Muitas tentativas`               | Rate limit de autenticação; ajuste `AUTH_RATE_LIMIT`                       |
| Container `unhealthy`                 | Veja `docker compose logs algoky`; confira as permissões do volume `/data` |
| Streak/meta virando no horário errado | Ajuste o fuso horário em Configurações                                     |
