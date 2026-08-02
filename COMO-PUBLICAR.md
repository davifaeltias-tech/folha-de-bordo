# Folha de Bordo — guia do jornal

O jornal dos alunos do Year 6 e do Year 7 da Maple Bear João Pessoa.

**Site:** <https://folha-de-bordo.pages.dev>
**Painel:** <https://folha-de-bordo.pages.dev/admin/>
**Código:** <https://github.com/davifaeltias-tech/folha-de-bordo>

Está tudo no ar e funcionando. Este guia é para o dia a dia.

---

## Parte 1 — Publicar um post

1. Entre em <https://folha-de-bordo.pages.dev/admin/> e clique em
   **Entrar com o GitHub**.
2. **New Publicações**.
3. Preencha:
   - **Título** — o que aparece na capa.
   - **Data de publicação** — já vem com a data de hoje.
   - **Editoria** — Resenhas Literárias, Podcast, Artigos de Opinião ou Nossos Livros.
   - **Endereço (slug)** — só minúsculas e hífens. Ex.: `o-ladrao-de-raios`.
     É o que vai no link, então escolha com calma e não mude depois de publicar.
   - **Resumo** — duas linhas. Aparece na capa e no Google. Entre 40 e 300 letras.
   - **Imagem de capa** — deitada funciona melhor. Pode arrastar do computador.
   - **Texto** — o post. Dá para negritar, criar títulos, listas e links.
4. **Save** guarda como rascunho. O post fica em *Drafts*.
5. Arraste o card para **Ready** e depois **Publish** → **Publish now**.
6. O site se reconstrói sozinho. Em cerca de um minuto o post está no ar.

### Colocar um episódio do Spotify

No campo **Texto**, mude para o modo de código (o botão `</>` no topo do editor)
e cole isto, trocando só o código do episódio:

```html
<div class="embed embed--spotify">
  <iframe src="https://open.spotify.com/embed/episode/COLE-O-CODIGO-AQUI"
          width="100%" height="232" frameborder="0" loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          title="Player do Spotify"></iframe>
</div>
```

O código do episódio é o pedaço que vem depois de `/episode/` no link do Spotify,
antes do `?`.

### Dar acesso a um aluno

No GitHub: **Settings** → **Collaborators** → **Add people**. Quem for adicionado
entra no `/admin` com a própria conta do GitHub.

Sugestão de fluxo: os alunos salvam em *Drafts*, você lê, e só então move para
*Ready* e publica. O painel já está configurado assim.

---

## Parte 2 — Como o site está montado

| Peça | Onde | Para quê |
|---|---|---|
| GitHub | `davifaeltias-tech/folha-de-bordo` | Guarda textos e imagens. É o backup. |
| Cloudflare Pages | projeto `folha-de-bordo` | Reconstrói e publica a cada commit. |
| Decap CMS | `/admin` | O painel onde vocês escrevem. |
| App OAuth do GitHub | `Folha de Bordo - Painel` | Faz o login do painel funcionar. |

O `GITHUB_CLIENT_ID` fica no `wrangler.toml` (é público). O
`GITHUB_CLIENT_SECRET` é um **Secret** no painel da Cloudflare, criptografado —
não está em lugar nenhum do código, e é assim que deve ser.

### Onde fica cada coisa

| O quê | Arquivo |
|---|---|
| Os posts | `src/posts/*.md` |
| Imagens e o e-book | `src/assets/img/` |
| Aparência (cores, fontes, layout) | `src/assets/css/style.css` |
| Capa | `src/index.njk` |
| Página de post | `src/_includes/post.njk` |
| Cabeçalho e rodapé | `src/_includes/base.njk` |
| Nome e descrição do site | `src/_data/site.js` |
| Editorias e suas cores | `eleventy.config.js`, no topo |
| Configuração do painel | `src/admin/config.yml` |
| Login do painel | `functions/api/` |

### Trocar as cores

No começo de `src/assets/css/style.css`:

```css
--marca:#c8102e;    /* o vermelho do jornal */
--resenha:#c8102e;  /* Resenhas Literárias */
--podcast:#6d28d9;  /* Podcast */
--opiniao:#0b6bcb;  /* Artigos de Opinião */
--livros:#0f766e;   /* Nossos Livros */
```

O nome do jornal fica em dois lugares: `src/_data/site.js` (campo `nome`) e o
logotipo em `src/_includes/base.njk`, onde está `Folha<em> de Bordo</em>` — o que
vem dentro do `<em>` é a parte vermelha.

### Mexer no site na sua máquina

```bash
npm install
npm start
```

Abra <http://localhost:8080>.

---

## Parte 3 — Endereço próprio, quando quiser

Hoje o site está em `folha-de-bordo.pages.dev`. Duas formas de melhorar isso:

**Subdomínio da escola** (grátis) — algo como `folhadebordo.maplebearjp.com.br`.
O TI da escola aponta um CNAME para `folha-de-bordo.pages.dev` e pronto.

**Domínio próprio** — um `.com.br` custa R$ 40 por ano no Registro.br, preço
oficial, mesma tarifa na renovação. A Cloudflare aceita domínio próprio sem
custo adicional, em **Workers & Pages → folha-de-bordo → Custom domains**.

Em qualquer um dos dois casos, três coisas precisam ser atualizadas junto:
`src/_data/site.js` (campo `url`), `src/admin/config.yml` (`base_url`,
`site_url`, `display_url`) e a **Authorization callback URL** do app OAuth no
GitHub. Se esquecer a última, o login do painel para de funcionar.

---

## O site antigo

O `blogyear7.wordpress.com` continua no ar e não foi alterado. Os links que você
já compartilhou seguem funcionando. Os endereços aqui usam a mesma estrutura de
data (`/2025/11/13/nome-do-post/`), então, se um dia quiser redirecionar, os
links batem um a um.

---

## Pendências conhecidas

**Cinco posts na editoria "Geral"** — eram os que estavam sem categoria no
WordPress. Três são resenhas (*Hanako-kun*, *A Seleção*, *O Conto da Ilha
Desconhecida*) e dois são podcasts de carta (*Pero Vaz de Caminha*, *Gandhi e
Hitler*). Dá para arrumar pelo painel em dois minutos cada. Quando o último
sair, a editoria Geral desaparece sozinha da navegação.

**O e-book "O Que Eu Não Vi"** foi recomprimido de 150 MB para 0,7 MB para caber
no GitHub — o limite de arquivo lá é 100 MB. As 113 páginas e o texto
selecionável foram preservados e conferidos página a página. O arquivo original
era 112 cópias da mesma imagem de fundo, praticamente em branco.
