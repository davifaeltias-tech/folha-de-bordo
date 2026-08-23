// Comentários do público.
//   GET  /api/comentarios?post=/2026/03/27/peter-pan/  -> só os aprovados
//   POST /api/comentarios                              -> grava como pendente
//
// Nada do que chega pelo POST aparece no site antes de o professor aprovar.
// O e-mail é guardado, mas nunca é devolvido pelo GET — só a moderação o vê.

import { json, marcaDoVisitante, limpar } from "./_comum.js";

const LIMITE_POR_JANELA = 3;      // envios permitidos...
const JANELA_MINUTOS = 10;        // ...a cada 10 minutos, por visitante

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const post = limpar(url.searchParams.get("post"), 200);
  if (!post.startsWith("/")) return json({ erro: "post inválido" }, 400);

  const { results } = await env.DB.prepare(
    "SELECT id, nome, texto, criado_em FROM comentarios WHERE post = ? AND aprovado = 1 ORDER BY criado_em ASC"
  ).bind(post).all();

  return json({ comentarios: results || [] });
}

export async function onRequestPost({ request, env }) {
  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return json({ erro: "envio malformado" }, 400);
  }

  // Campo-isca: fica escondido no formulário. Gente não preenche; robô sim.
  if (limpar(corpo.site, 50) !== "") return json({ ok: true });

  const post = limpar(corpo.post, 200);
  const nome = limpar(corpo.nome, 60);
  const email = limpar(corpo.email, 120);
  const texto = limpar(corpo.texto, 2000);

  if (!post.startsWith("/")) return json({ erro: "post inválido" }, 400);
  if (nome.length < 2) return json({ erro: "Escreva seu nome." }, 400);
  if (texto.length < 2) return json({ erro: "Escreva seu comentário." }, 400);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ erro: "Esse e-mail não parece válido." }, 400);
  }

  const marca = await marcaDoVisitante(request);
  const desde = new Date(Date.now() - JANELA_MINUTOS * 60000).toISOString();
  const recentes = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM comentarios WHERE marca = ? AND criado_em > ?"
  ).bind(marca, desde).first();

  if (recentes && recentes.total >= LIMITE_POR_JANELA) {
    return json({ erro: "Você já enviou vários comentários agora há pouco. Tente de novo mais tarde." }, 429);
  }

  await env.DB.prepare(
    "INSERT INTO comentarios (post, nome, email, texto, criado_em, aprovado, marca) VALUES (?, ?, ?, ?, ?, 0, ?)"
  ).bind(post, nome, email || null, texto, new Date().toISOString(), marca).run();

  return json({ ok: true, mensagem: "Comentário enviado! Ele aparece assim que o professor aprovar." });
}
