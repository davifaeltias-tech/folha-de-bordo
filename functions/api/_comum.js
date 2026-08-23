// Utilidades compartilhadas pelas funções de comentário.

export function json(dados, status = 200) {
  return new Response(JSON.stringify(dados), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

// Guarda-se um hash do IP, nunca o IP em si. Serve só para limitar
// envios seguidos do mesmo visitante; não identifica ninguém.
export async function marcaDoVisitante(request) {
  const ip = request.headers.get("CF-Connecting-IP") || "sem-ip";
  const dados = new TextEncoder().encode(ip + "|folha-de-bordo");
  const hash = await crypto.subtle.digest("SHA-256", dados);
  return [...new Uint8Array(hash)].slice(0, 8).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Confere se quem chama é um dos moderadores, usando o token do GitHub
// que a pessoa obteve no login. Não guardamos token nenhum do lado de cá.
export async function ehModerador(request, env) {
  const cabecalho = request.headers.get("Authorization") || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : "";
  if (!token) return false;

  const resposta = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: "Bearer " + token,
      "User-Agent": "folha-de-bordo",
      Accept: "application/vnd.github+json"
    }
  });
  if (!resposta.ok) return false;

  const usuario = await resposta.json();
  const permitidos = (env.MODERADORES || "").split(",").map((s) => s.trim().toLowerCase());
  return permitidos.includes((usuario.login || "").toLowerCase());
}

export function limpar(texto, max) {
  return String(texto == null ? "" : texto).replace(/\s+/g, " ").trim().slice(0, max);
}
