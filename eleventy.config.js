const CATS = {
  "Resenhas Literárias": { slug: "resenhas-literarias", cor: "resenha",
    desc: "Livros lidos, discutidos e resenhados pelos alunos do Year 7." },
  "Podcast": { slug: "podcast", cor: "podcast",
    desc: "Cartas históricas que viraram episódios, narradas pelos alunos." },
  "Artigos de Opinião": { slug: "artigos-de-opiniao", cor: "opiniao",
    desc: "O que a turma pensa sobre esporte, sociedade e o mundo." },
  "Manifestos": { slug: "manifestos", cor: "manifesto",
    desc: "Textos coletivos em que as turmas tomam posição sobre um tema e fazem pedidos ao mundo." },
  "Nossos Livros": { slug: "nossos-livros", cor: "livros",
    desc: "Os livros de contos escritos e publicados pelos próprios alunos." },
  "Geral": { slug: "geral", cor: "geral", desc: "Publicações do blog." }
};

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/admin": "admin" });

  eleventyConfig.setLibrary("md", require("markdown-it")({ html: true, breaks: false, linkify: true }));

  eleventyConfig.addCollection("posts", (c) =>
    c.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("editorias", (c) => {
    const posts = c.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date);
    return Object.keys(CATS)
      .map((nome) => ({
        nome,
        ...CATS[nome],
        posts: posts.filter((p) => p.data.categoria === nome)
      }))
      .filter((e) => e.posts.length > 0);
  });

  // A capa não é uma lista cronológica pura: se fosse, uma editoria muito
  // ativa tomaria o jornal inteiro. A manchete é sempre o post mais recente
  // do site; a partir dela, faz-se um rodízio entre as editorias, pegando de
  // cada uma a publicação mais recente ainda não usada. Assim a capa mistura
  // resenha, podcast, opinião e manifesto sem deixar de privilegiar o novo.
  eleventyConfig.addCollection("capa", (c) => {
    const posts = c.getFilteredByGlob("src/posts/*.md").sort((a, b) => b.date - a.date);
    if (!posts.length) return [];

    const porEditoria = {};
    for (const p of posts) {
      const cat = p.data.categoria || "Geral";
      (porEditoria[cat] = porEditoria[cat] || []).push(p);
    }

    const manchete = posts[0];
    const usados = new Set([manchete.url]);
    const saida = [manchete];

    // começa o rodízio pela editoria seguinte à da manchete
    let ordem = Object.keys(CATS).filter((n) => porEditoria[n]);
    const i = ordem.indexOf(manchete.data.categoria);
    if (i > -1) ordem = ordem.slice(i + 1).concat(ordem.slice(0, i + 1));

    let achou = true;
    while (achou && saida.length < 11) {
      achou = false;
      for (const cat of ordem) {
        if (saida.length >= 11) break;
        const proximo = porEditoria[cat].find((p) => !usados.has(p.url));
        if (proximo) {
          saida.push(proximo);
          usados.add(proximo.url);
          achou = true;
        }
      }
    }
    return saida;
  });

  // remove de uma lista tudo que já apareceu em outra (evita repetir card)
  eleventyConfig.addFilter("foraDe", (arr, outros) => {
    const urls = new Set((outros || []).map((p) => p.url));
    return (arr || []).filter((p) => !urls.has(p.url));
  });

  eleventyConfig.addFilter("catSlug", (n) => (CATS[n] || CATS["Geral"]).slug);
  eleventyConfig.addFilter("catCor", (n) => (CATS[n] || CATS["Geral"]).cor);
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));
  eleventyConfig.addFilter("skip", (arr, n) => (arr || []).slice(n));
  eleventyConfig.addFilter("exceto", (arr, url) => (arr || []).filter((p) => p.url !== url));

  eleventyConfig.addFilter("dataBR", (d) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "UTC" }).format(d)
  );
  eleventyConfig.addFilter("dataCurta", (d) =>
    new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(d)
  );
  eleventyConfig.addFilter("iso", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("semTags", (s) => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
  eleventyConfig.addFilter("jsonify", (v) => JSON.stringify(v));

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
