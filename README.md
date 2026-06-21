# Detetive — Marcador de Pistas

App **100% client-side** (sem backend) para ajudar na marcação do jogo **Clue / Detetive**,
nos modos **Mansão** e **Praia**. Substitui o bloco de papel: você registra apenas os
*eventos* da partida (palpites e quem mostrou/passou carta) e o app **deduz automaticamente**
toda a grade, indicando quem tem cada carta e qual é a solução do crime.

Funciona como **PWA instalável e offline**, ideal para usar no celular durante a partida.

## ✨ Recursos

- **Dedução automática completa**: motor de inferência por propagação de restrições
  (unicidade, capacidade da mão, regra do envelope, disjunção) + busca por contradição
  com raciocínio aninhado, que deduz certezas que não dá para fazer no papel.
- **Dois modos**: Mansão (cartas transcritas do cartão físico) e Praia.
- **Edição dos nomes** das cartas (útil para acertar os locais do modo Praia).
- **Painel de solução** atualizado a cada palpite, com candidatos restantes por categoria.
- **Histórico** de palpites com desfazer.
- **Marcação manual** tocando nas células da grade.
- **Offline / PWA**: estado da partida salvo localmente (localStorage).

## 🚀 Desenvolvimento

```bash
npm install        # instala dependências
npm run dev        # servidor de desenvolvimento (http://localhost:5173/clue-app/)
npm test           # testes do motor de inferência (Vitest)
npm run lint       # ESLint
npm run build      # build de produção (gera dist/)
npm run preview    # pré-visualiza o build
```

## 📦 Deploy no GitHub Pages

1. Faça push deste repositório no GitHub com o nome **`clue-app`** (o caminho base está
   configurado como `/clue-app/` em `vite.config.ts`). Se usar outro nome de repositório,
   ajuste a constante `BASE` nesse arquivo.
2. Em **Settings → Pages**, defina o *Source* como **GitHub Actions**.
3. A cada push na branch `main`, o workflow `.github/workflows/deploy.yml` roda lint,
   testes e build, e publica automaticamente.
4. O app ficará acessível em `https://<seu-usuario>.github.io/clue-app/`.

## 🧠 Como o motor funciona

O estado da partida é uma lista de eventos (fonte da verdade). A grade (carta × dono) é
derivada por inferência lógica até o ponto-fixo, e a solução do crime é apontada quando
restar um único candidato por categoria. Detalhes em `src/engine/inference.ts`.

## 📁 Estrutura

```
src/
  domain/      # tipos e edições (Mansão / Praia)
  engine/      # motor de inferência + testes
  state/       # store (Zustand) com persistência
  components/  # telas e UI (Home, Setup, Grid, palpite, solução, histórico)
```
