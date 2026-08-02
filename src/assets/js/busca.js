(function () {
  var campo = document.getElementById("q");
  var lista = document.getElementById("resultados");
  var status = document.getElementById("status");
  var dados = null;

  function normal(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function pintar(itens, termo) {
    lista.innerHTML = "";
    itens.forEach(function (it) {
      var li = document.createElement("li");
      li.innerHTML =
        '<a href="' + it.u + '"><time>' + it.d + "</time>" +
        '<span class="etiqueta etiqueta--busca">' + it.c + "</span>" +
        '<span class="arquivo__titulo"></span></a>';
      li.querySelector(".arquivo__titulo").textContent = it.t;
      lista.appendChild(li);
    });
    if (!termo) status.textContent = "";
    else if (!itens.length) status.textContent = 'Nada encontrado para "' + termo + '".';
    else status.textContent = itens.length + (itens.length === 1 ? " resultado" : " resultados") + ' para "' + termo + '".';
  }

  function buscar() {
    var termo = campo.value.trim();
    if (!dados || termo.length < 2) { pintar([], termo.length ? termo : ""); return; }
    var t = normal(termo);
    var achados = dados.filter(function (it) {
      return normal(it.t).indexOf(t) > -1 || normal(it.c).indexOf(t) > -1 || normal(it.r).indexOf(t) > -1;
    });
    pintar(achados.slice(0, 60), termo);
  }

  fetch("/indice.json").then(function (r) { return r.json(); }).then(function (j) {
    dados = j;
    var inicial = new URLSearchParams(location.search).get("q");
    if (inicial) { campo.value = inicial; }
    buscar();
  });

  campo.addEventListener("input", buscar);
})();
