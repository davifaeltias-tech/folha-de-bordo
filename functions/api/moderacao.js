// Fila de moderação. Só responde a quem se autentica com uma conta do GitHub
// listada em MODERADORES.
//   GET  /api/moderacao            -> comentários pendentes
//   POST /api/moderacao            -> { id, acao: "aprovar" | "excluir" }

import { json, ehModerador } from "./_comum.js";

export async function onRequestGet({ request, env }) {
  if (!(await ehModerador(request, env))) return json({ erro: "não autorizado" }, 401);

  const { results } = await env.DB.prepare(
    "SELECT id, post, nome, email, texto, criado_em FROM comentarios WHERE aprovado = 0 ORDER BY criado_em ASC"
  ).all();

  const aprovados = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM comentarios WHERE aprovado = 1"
  ).first();

  return json({ pendentes: results || [], aprovados: aprovados ? aprovados.total : 0 });
}

export async function onRequestPost({ request, env }) {
  if (!(await ehModerador(request, env))) return json({ erro: "não autorizado" }, 401);

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return json({ erro: "envio malformado" }, 400);
  }

  const id = parseInt(corpo.id, 10);
  if (!id) return json({ erro: "id inválido" }, 400);

  if (corpo.acao === "aprovar") {
    await env.DB.prepare("UPDATE comentarios SET aprovado = 1 WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }
  if (corpo.acao === "excluir") {
    await env.DB.prepare("DELETE FROM comentarios WHERE id = ?").bind(id).run();
    return json({ ok: true });
  }
  return json({ erro: "ação desconhecida" }, 400);
}
