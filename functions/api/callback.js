// Volta do GitHub: troca o código por um token e devolve para o painel.
//
// O Decap CMS espera um aperto de mão em duas etapas:
//   1. esta janela anuncia "authorizing:github" para quem a abriu;
//   2. o painel responde, e só então passa a escutar o resultado;
//   3. esta janela envia o token e se fecha.
// Mandar o token direto, sem a etapa 1, faz o painel ignorar a mensagem
// silenciosamente — o usuário clica em entrar e nada acontece.
function pagina(mensagem, origem) {
  return `<!doctype html><meta charset="utf-8"><body><script>
(function () {
  var origem = ${JSON.stringify(origem)};
  var recado = ${JSON.stringify(mensagem)};
  var respondido = false;

  function enviar(m) {
    if (window.opener) window.opener.postMessage(m, origem);
  }

  window.addEventListener("message", function (e) {
    if (respondido || e.origin !== origem) return;
    respondido = true;
    clearInterval(timer);
    enviar(recado);
    setTimeout(function () { window.close(); }, 500);
  });

  // Repete o anúncio por alguns segundos, caso o painel ainda não
  // tenha terminado de registrar o ouvinte quando esta janela abriu.
  enviar("authorizing:github");
  var timer = setInterval(function () {
    if (!respondido) enviar("authorizing:github");
  }, 300);
  setTimeout(function () { clearInterval(timer); }, 8000);
})();
</script><p>Autenticando… pode fechar esta janela se ela não sumir sozinha.</p></body>`;
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
