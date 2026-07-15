# Revel Mix Revestimentos Ltda

Projeto completo com Next.js, Express, Prisma e PostgreSQL. Este pacote já inclui as imagens encontradas nas pastas de Uretano, Epóxi e Tecnocimento. A galeria lê essas fotos automaticamente, sem cadastro manual.

## Rodar com Docker (recomendado)

1. Instale e abra o Docker Desktop.
2. Extraia o ZIP.
3. Dê dois cliques em `INICIAR-SITE.bat`.

Ou execute no PowerShell, na pasta que contém este README:

```powershell
docker compose up --build -d
```

A primeira inicialização pode demorar alguns minutos porque o Docker baixa as imagens e compila o projeto.

Acessos:

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin
- API: http://localhost:4000/api/health

Login inicial:

- E-mail: `admin@revelmix.com.br`
- Senha: `TroqueEstaSenha123!`

## Fotos

As fotos que já estavam no projeto foram renomeadas com nomes seguros para web e incluídas automaticamente em:

- `frontend/public/images/uretano/`
- `frontend/public/images/epoxi/`
- `frontend/public/images/tecnocimento/`

O banner usa `frontend/public/images/epoxi/hero.jpeg` e a imagem institucional usa `frontend/public/images/uretano/institucional.jpeg`.

Para adicionar novas fotos futuramente, coloque os arquivos na pasta correspondente e atualize `frontend/lib/staticGallery.ts`, ou use o upload do painel administrativo. Fotos enviadas pelo painel ficam no volume Docker e no banco de dados.

## Comandos úteis

```powershell
# Ver o status
docker compose ps

# Ver registros
docker compose logs -f

# Parar preservando os dados
docker compose down

# Reconstruir após mudanças nas fotos ou código
docker compose up --build -d
```

Não use `docker compose down -v` quando houver dados importantes, pois esse comando apaga o banco e os uploads.
