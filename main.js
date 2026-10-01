/* AROMA CAFÉ BLANES · interacción de la página.
   Sin dependencias ni módulos: un solo archivo que se carga con defer.
   Cada parte va protegida para que un fallo no deje al resto sin funcionar. */
(function () {
  "use strict";

  window.__aroma = true;

  // Horario: todos los días de 8:30 a 23:00 (hora de Blanes).
  var APERTURA = 8 * 60 + 30;
  var CIERRE = 23 * 60;
  // Si el local cierra por temporada, indicar aquí las fechas (AAAA-MM-DD),
  // por ejemplo { desde: "2027-01-07", hasta: "2027-02-14" }. null = sin cierre.
  var CIERRE_TEMPORADA = null;

  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function safe(fn, nombre) {
    try { fn(); } catch (e) { if (window.console) console.warn("[aroma] " + nombre, e); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Hora de Blanes ---------- */
  function ahoraEnBlanes() {
    var partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short"
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return {
      minutos: Number(v.hour) * 60 + Number(v.minute),
      fecha: v.year + "-" + v.month + "-" + v.day,
      dia: String(v.weekday).slice(0, 3).toLowerCase()
    };
  }

  /* ---------- Abierto / cerrado y día de hoy ---------- */
  function initEstado() {
    var titulo = $("[data-estado-titulo]");
    var detalle = $("[data-estado-detalle]");
    var tira = $("[data-estado-tira]");
    var semana = $("[data-semana]");

    function pintar() {
      var t = ahoraEnBlanes();
      var estado, linea, corto;
      if (CIERRE_TEMPORADA && t.fecha >= CIERRE_TEMPORADA.desde && t.fecha <= CIERRE_TEMPORADA.hasta) {
        estado = "Cerrado por temporada";
        linea = "Volvemos pronto";
        corto = "Cerrado por temporada";
      } else if (t.minutos >= APERTURA && t.minutos < CIERRE) {
        estado = "Abierto ahora";
        linea = "Hasta las 23:00 de hoy";
        corto = "Abierto ahora · hasta las 23:00";
      } else if (t.minutos < APERTURA) {
        estado = "Cerrado ahora";
        linea = "Abre hoy a las 8:30";
        corto = "Cerrado · abre a las 8:30";
      } else {
        estado = "Cerrado ahora";
        linea = "Abre mañana a las 8:30";
        corto = "Cerrado · abre a las 8:30";
      }
      if (titulo) titulo.textContent = estado;
      if (detalle) detalle.textContent = linea;
      if (tira) tira.textContent = corto;
      if (semana) {
        $$("li", semana).forEach(function (li) {
          var hoy = li.getAttribute("data-dia") === t.dia;
          li.classList.toggle("is-hoy", hoy);
          if (hoy) li.setAttribute("aria-current", "date"); else li.removeAttribute("aria-current");
        });
      }
    }
    pintar();
    setInterval(pintar, 60 * 1000);
  }

  /* ---------- Apariciones al bajar ---------- */
  function initApariciones() {
    var els = $$("[data-revela]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      var visibles = entradas.filter(function (e) { return e.isIntersecting; });
      visibles.forEach(function (e, i) {
        var el = e.target;
        if (!el.style.transitionDelay) el.style.transitionDelay = Math.min(i * 90, 360) + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
        // el retardo solo vale para la entrada; después, el giro al pasar el ratón responde al instante
        setTimeout(function () { el.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    // Red de seguridad: a los 6 s se muestra lo que ya esté en pantalla o por encima
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
    }, 6000);
  }

  /* ---------- Sellos de la carta: cada uno se estampa al entrar en pantalla ---------- */
  function initSellos() {
    var sellos = $$("[data-sello]");
    if (!sellos.length) return;
    if (!("IntersectionObserver" in window)) { sellos.forEach(function (s) { s.classList.add("is-estampado"); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
        var s = e.target;
        setTimeout(function () { s.classList.add("is-estampado"); }, reducido ? 0 : 250 + i * 160);
        io.unobserve(s);
      });
    }, { threshold: 0.6, rootMargin: "0px 0px -12% 0px" });
    sellos.forEach(function (s) { io.observe(s); });
    setTimeout(function () {
      sellos.forEach(function (s) { if (s.getBoundingClientRect().top < window.innerHeight) s.classList.add("is-estampado"); });
    }, 6000);
  }

  /* ---------- Visor de fotos ---------- */
  function initVisor() {
    var dialogo = $("[data-visor-dialogo]");
    var items = $$("[data-visor]");
    if (!dialogo || !items.length || typeof dialogo.showModal !== "function") return;
    var pie = $("[data-visor-pie]", dialogo);
    var img = document.createElement("img");
    img.className = "visor__img";
    img.decoding = "async";
    pie.parentNode.insertBefore(img, pie);
    var indice = 0;

    // La versión más grande de cada foto
    var fotos = items.map(function (b) {
      var im = $("img", b);
      var src = im.getAttribute("src");
      var set = im.getAttribute("srcset");
      if (set) {
        var mejor = 0;
        set.split(",").forEach(function (c) {
          var p = c.trim().split(/\s+/);
          var w = parseInt(p[1], 10) || 0;
          if (w > mejor) { mejor = w; src = p[0]; }
        });
      }
      return { src: src, alt: im.getAttribute("alt") || "" };
    });

    function mostrar(i) {
      indice = (i + fotos.length) % fotos.length;
      var f = fotos[indice];
      img.classList.add("is-cambiando");
      var nueva = new Image();
      nueva.onload = nueva.onerror = function () {
        img.src = f.src;
        img.alt = f.alt;
        pie.textContent = f.alt;
        img.classList.remove("is-cambiando");
      };
      nueva.src = f.src;
    }
    items.forEach(function (b, i) {
      b.addEventListener("click", function () {
        mostrar(i);
        dialogo.showModal();
        document.body.style.overflow = "hidden";
      });
    });
    $("[data-visor-cerrar]", dialogo).addEventListener("click", function () { dialogo.close(); });
    $("[data-visor-ant]", dialogo).addEventListener("click", function () { mostrar(indice - 1); });
    $("[data-visor-sig]", dialogo).addEventListener("click", function () { mostrar(indice + 1); });
    dialogo.addEventListener("close", function () {
      document.body.style.overflow = "";
      if (items[indice]) items[indice].focus();
    });
    dialogo.addEventListener("click", function (e) { if (e.target === dialogo) dialogo.close(); });
    dialogo.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") mostrar(indice + 1);
      if (e.key === "ArrowLeft") mostrar(indice - 1);
    });
    var x0 = null;
    dialogo.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") x0 = e.clientX; });
    dialogo.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 50) mostrar(indice + (dx < 0 ? 1 : -1));
    });
  }

  function initAnio() {
    var n = $("[data-anio]");
    if (n) n.textContent = String(new Date().getFullYear());
  }

  safe(initEstado, "estado");
  safe(initApariciones, "apariciones");
  safe(initSellos, "sellos");
  safe(initVisor, "visor");
  safe(initAnio, "anio");
})();
