// Volta do GitHub: troca o código por um token e devolve para o painel.
function pagina(mensagem, origem) {
  return `<!doctype html><meta charset="utf-8"><body><script>
(function () {
  function avisar() {
    window.opener && window.opener.postMessage(${JSON.stringify(mensagem)}, ${JSON.stringify(origem)});
  }
  window.addEventListener("message", avisar, { once: true });
  avisar();
  setTimeout(function () { window.close(); }, 800);
})();
</script><p>Pode fechar esta janela.</p></body>`;
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const codigo = url.searchParams.get("code");
  const estado = url.searchParams.get("state");
  const cookie = request.headers.get("Cookie") || "";
  const esperado = (cookie.match(/oauth_state=([^;]+)/) || [])[1];

  const html = (m) =>
    new Response(pagina(m, url.origin), { headers: { "Content-Type": "text/html; charset=utf-8" } });

  if (!codigo) return html("authorization:github:error:" + JSON.stringify({ message: "Código ausente." }));
  if (!estado || estado !== esperado)
    return html("authorization:github:error:" + JSON.stringify({ message: "Estado inválido. Tente entrar de novo." }));

  const resposta = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code: codigo,
      redirect_uri: `${url.origin}/api/callback`
    })
  });

  const dados = await resposta.json();
  if (dados.error || !dados.access_token)
    return html("authorization:github:error:" + JSON.stringify({ message: dados.error_description || "Falha ao autenticar." }));

  return html(
    "authorization:github:success:" + JSON.stringify({ token: dados.access_token, provider: "github" })
  );
}
