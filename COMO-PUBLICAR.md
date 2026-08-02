# Folha de Bordo — como colocar no ar e como publicar

Este é o site novo da Folha de Bordo — o jornal dos alunos do Year 6 e do Year 7 da
Maple Bear João Pessoa: 79 posts, 5 editorias, busca, RSS e um painel de
administração para você e os alunos escreverem sem mexer em código.

Ele não depende mais do WordPress. Todas as imagens e o e-book estão dentro do
projeto, na pasta `src/assets/img`.

---

## Parte 1 — Colocar no ar (uma vez só)

Você vai precisar de duas contas gratuitas: **GitHub** e **Cloudflare**.
Reserve uns 30 minutos. É a parte chata; depois disso nunca mais.

### 1. Criar a conta e o repositório no GitHub

1. Crie uma conta em <https://github.com> (se ainda não tiver).
2. Clique em **New repository**.
3. Nome: `folha-de-bordo`. Deixe **Public**. Não marque nada mais. **Create repository**.
4. Na tela seguinte, clique em **uploading an existing file**.
5. Arraste para lá **todo o conteúdo desta pasta** — menos `previa/`, `_site/` e
   `node_modules/`, se existirem. Confirme com **Commit changes**.

> O GitHub guarda os textos e serve de backup automático. Cada alteração fica
> registrada, então nada se perde.

### 2. Criar o aplicativo OAuth (é o que faz o login do painel funcionar)

1. Vá em <https://github.com/settings/developers> → **OAuth Apps** → **New OAuth App**.
2. Preencha:
   - **Application name**: `Folha de Bordo Painel`
   - **Homepage URL**: `https://folha-de-bordo.pages.dev` (ajuste depois, se mudar)
   - **Authorization callback URL**: `https://folha-de-bordo.pages.dev/api/callback`
3. **Register application**.
4. Anote o **Client ID**.
5. Clique em **Generate a new client secret** e anote o **Client Secret**.
   Ele só aparece uma vez. Guarde num lugar seguro.

> Esses dois valores são senhas. Não coloque em nenhum arquivo do projeto,
> não mande por mensagem e não publique em lugar nenhum.

### 3. Publicar na Cloudflare

1. Crie uma conta em <https://dash.cloudflare.com>.
2. Menu lateral: **Workers & Pages** → **Create** → aba **Pages** →
   **Connect to Git**.
3. Autorize o GitHub e escolha o repositório `folha-de-bordo`.
4. Configure a build:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `_site`
5. Ainda nessa tela, abra **Environment variables** e adicione duas:
   - `GITHUB_CLIENT_ID` = o Client ID do passo 2
   - `GITHUB_CLIENT_SECRET` = o Client Secret do passo 2
6. **Save and Deploy**. Em dois ou três minutos o site está no ar em
   `https://folha-de-bordo.pages.dev`.

### 4. Ajustar dois arquivos com o endereço real

Se a Cloudflare tiver dado outro endereço (ela às vezes acrescenta letras),
abra no GitHub e corrija:

- `src/admin/config.yml` → nas linhas `repo:`, `base_url:`, `site_url:` e `display_url:`
- `src/_data/site.js` → na linha `url:`

E volte no aplicativo OAuth do GitHub para corrigir a **callback URL**.

### 5. Testar o painel

Abra `https://folha-de-bordo.pages.dev/admin/`. Deve aparecer o botão
**Login with GitHub**. Entrou? Está pronto.

---

## Parte 2 — Publicar um post (o dia a dia)

1. Entre em `https://folha-de-bordo.pages.dev/admin/`.
2. **New Publicações**.
3. Preencha:
   - **Título** — o que aparece na capa.
   - **Data de publicação** — já vem com a data de hoje.
   - **Editoria** — Resenhas Literárias, Podcast, Artigos de Opinião ou Nossos Livros.
   - **Endereço (slug)** — só minúsculas e hífens. Ex.: `o-ladrao-de-raios`.
     É o que vai no link, então escolha e não mude depois.
   - **Resumo** — duas linhas. Aparece na capa e no Google. Entre 40 e 300 letras.
   - **Imagem de capa** — deitada funciona melhor. Pode arrastar do computador.
   - **Texto** — o post. Dá para negritar, criar títulos, listas e links.
4. **Save** guarda como rascunho. O post fica em *Drafts*.
5. Arraste o card para **Ready** e depois **Publish** → **Publish now**.
6. O site se reconstrói sozinho. Em cerca de um minuto o post está no ar.

### Para colocar um podcast do Spotify

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

No GitHub, no repositório: **Settings** → **Collaborators** → **Add people**.
Quem for adicionado consegue entrar no `/admin` com a própria conta do GitHub.

Sugestão: use o fluxo de rascunho. Os alunos salvam em *Drafts*, você lê e só
então move para *Ready* e publica.

---

## Parte 3 — Mexer no site (opcional)

Para rodar na sua máquina e ver as mudanças ao vivo:

```bash
npm install
npm start
```

Abra <http://localhost:8080>.

### Onde fica cada coisa

| O quê | Onde |
|---|---|
| Os posts | `src/posts/*.md` |
| Imagens e o e-book | `src/assets/img/` |
| Aparência (cores, fontes, layout) | `src/assets/css/style.css` |
| Capa | `src/index.njk` |
| Página de post | `src/_includes/post.njk` |
| Cabeçalho e rodapé | `src/_includes/base.njk` |
| Nome e descrição do site | `src/_data/site.js` |
| Editorias e suas cores | `.eleventy.js`, no topo |
| Configuração do painel | `src/admin/config.yml` |
| Login do painel | `functions/api/` |

### Trocar as cores

No começo de `src/assets/css/style.css`:

```css
--marca:#c8102e;    /* o vermelho do site */
--resenha:#c8102e;  /* cor da editoria Resenhas */
--podcast:#6d28d9;  /* cor da editoria Podcast */
--opiniao:#0b6bcb;  /* cor da editoria Opinião */
--livros:#0f766e;   /* cor da editoria Nossos Livros */
```

O nome do jornal fica em dois lugares: `src/_data/site.js` (campo `nome`) e o
logotipo em `src/_includes/base.njk`, onde está `Folha<em> de Bordo</em>` — o que
vem dentro do `<em>` é a parte vermelha.

---

## Endereço próprio (quando quiser)

A Cloudflare aceita domínio próprio sem custo adicional — você paga só o registro
do domínio (algo como `folhadebordo.com.br`, num registrador como o Registro.br).
Em **Workers & Pages → seu projeto → Custom domains**, é só apontar.

---

## O que ficou para trás

O `blogyear7.wordpress.com` continua no ar e não foi alterado — os links antigos
que você já compartilhou seguem funcionando. Quando quiser, dá para pôr um aviso
lá apontando para o endereço novo, ou desativar de vez.

Os posts que estavam sem categoria no WordPress foram reunidos numa editoria
chamada **Geral**. Os dois e-books já saíram de lá para **Nossos Livros**. Sobraram
**cinco**, e todos são reconhecíveis pelo título: três são resenhas (*Hanako-kun*,
*A Seleção*, *O Conto da Ilha Desconhecida*) e dois são podcasts de carta
(*Pero Vaz de Caminha*, *Gandhi e Hitler*). Dá para arrumar pelo painel em dois
minutos: abrir o post, mudar o campo **Editoria** e publicar. Quando o último sair,
a editoria Geral desaparece sozinha da navegação.
