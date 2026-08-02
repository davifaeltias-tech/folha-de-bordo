// Início do login do painel: manda o usuário para o GitHub.
export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  const estado = crypto.randomUUID();

  const destino = new URL("https://github.com/login/oauth/authorize");
  destino.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  destino.searchParams.set("redirect_uri", `${url.origin}/api/callback`);
  destino.searchParams.set("scope", "repo,user");
  destino.searchParams.set("state", estado);

  return new Response(null, {
    status: 302,
    headers: {
      Location: destino.toString(),
      "Set-Cookie": `oauth_state=${estado}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
    }
  });
}
