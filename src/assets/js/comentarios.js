(function () {
  var raiz = document.getElementById("comentarios");
  if (!raiz) return;

  var post = raiz.getAttribute("data-post");
  var lista = raiz.querySelector(".coment__lista");
  var contagem = raiz.querySelector(".coment__contagem");
  var form = raiz.querySelector(".coment__form");
  var aviso = raiz.querySelector(".coment__aviso");
  var botao = form.querySelector("button[type=submit]");

  function dataBR(iso) {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit", month: "long", year: "numeric"
      }).format(new Date(iso));
    } catch (e) { return ""; }
  }

  function pintar(comentarios) {
    lista.innerHTML = "";
    if (!comentarios.length) {
      contagem.textContent = "Seja o primeiro a comentar.";
      return;
    }
    contagem.textContent = comentarios.length === 1
      ? "1 comentário" : comentarios.length + " comentários";

    comentarios.forEach(function (c) {
      var li = document.createElement("li");
      li.className = "coment__item";
      var cab = document.createElement("div");
      cab.className = "coment__cab";
      var nome = document.createElement("span");
      nome.className = "coment__nome";
      nome.textContent = c.nome;
      var quando = document.createElement("time");
      quando.className = "coment__data";
      quando.dateTime = c.criado_em;
      quando.textContent = dataBR(c.criado_em);
      cab.appendChild(nome); cab.appendChild(quando);
      var texto = document.createElement("p");
      texto.className = "coment__texto";
      texto.textContent = c.texto;
      li.appendChild(cab); li.appendChild(texto);
      lista.appendChild(li);
    });
  }

  function carregar() {
    fetch("/api/comentarios?post=" + encodeURIComponent(post))
      .then(function (r) { return r.json(); })
      .then(function (j) { pintar(j.comentarios || []); })
      .catch(function () { contagem.textContent = "Não foi possível carregar os comentários."; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    aviso.textContent = "";
    aviso.className = "coment__aviso";
    botao.disabled = true;
    botao.textContent = "Enviando…";

    var dados = {
      post: post,
      nome: form.nome.value,
      email: form.email.value,
      texto: form.texto.value,
      site: form.site.value
    };

    fetch("/api/comentarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (res) {
        if (!res.ok) {
          aviso.textContent = res.j.erro || "Não foi possível enviar.";
          aviso.className = "coment__aviso is-erro";
        } else {
          form.reset();
          aviso.textContent = res.j.mensagem || "Comentário enviado para aprovação.";
          aviso.className = "coment__aviso is-ok";
        }
      })
      .catch(function () {
        aviso.textContent = "Não foi possível enviar. Tente de novo.";
        aviso.className = "coment__aviso is-erro";
      })
      .then(function () {
        botao.disabled = false;
        botao.textContent = "Enviar comentário";
      });
  });

  carregar();
})();
