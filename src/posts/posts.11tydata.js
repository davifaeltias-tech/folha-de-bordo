module.exports = {
  layout: "post.njk",
  tags: ["post"],
  eleventyComputed: {
    // O endereço do post é montado a partir da data e do slug,
    // para ninguém precisar digitá-lo à mão no painel.
    permalink: (data) => {
      const d = data.page.date;
      const ano = d.getUTCFullYear();
      const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dia = String(d.getUTCDate()).padStart(2, "0");
      const slug = data.slug || data.page.fileSlug.replace(/^\d{4}-\d{2}-\d{2}-/, "");
      return `/${ano}/${mes}/${dia}/${slug}/`;
    }
  }
};
