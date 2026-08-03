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
