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
  var TELEFONO = "tel:+34972746643";
  var COMO_LLEGAR = "https://www.google.com/maps/dir/?api=1&destination=Aroma%20caf%C3%A9%20Blanes%2C%20Passeig%20de%20Dintre%204%2C%2017300%20Blanes";

  var raiz = document.documentElement;
  var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var movil = window.matchMedia("(max-width: 719px)");

  function safe(fn, nombre) {
    try { fn(); } catch (e) { if (window.console) console.warn("[aroma] " + nombre, e); }
  }
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function hhmm(m) { return Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0"); }

  /* ---------- Hora de Blanes ---------- */
  function ahoraEnBlanes() {
    var partes = new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short"
    }).formatToParts(new Date());
    var v = {};
    partes.forEach(function (p) { v[p.type] = p.value; });
    return {
      minutos: (Number(v.hour) % 24) * 60 + Number(v.minute),
      fecha: v.year + "-" + v.month + "-" + v.day,
      dia: String(v.weekday).slice(0, 3).toLowerCase()
    };
  }
  function enTemporada(t) { return !!(CIERRE_TEMPORADA && t.fecha >= CIERRE_TEMPORADA.desde && t.fecha <= CIERRE_TEMPORADA.hasta); }
  function abiertoA(m, t) { return !enTemporada(t) && m >= APERTURA && m < CIERRE; }

  /* ---------- Pantalla de entrada: se levanta cuando la página está lista ---------- */
  function initAterrizaje() {
    var panel = $("[data-aterrizaje]");
    var inicio = Date.now();
    function lista() { raiz.classList.add("es-lista"); }
    if (!panel) { lista(); return; }
    var hecho = false;
    function salir() {
      if (hecho) return;
      hecho = true;
      var espera = Math.max(0, (reducido ? 400 : 1500) - (Date.now() - inicio));
      setTimeout(function () {
        panel.classList.add("is-fuera");
        setTimeout(lista, reducido ? 0 : 350);
        setTimeout(function () { panel.remove(); raiz.classList.remove("con-aterrizaje"); }, 1100);
      }, espera);
    }
    if (document.readyState === "complete") salir();
    else window.addEventListener("load", salir);
    setTimeout(salir, 3000); // si alguna imagen tarda, no se hace esperar a nadie
  }

  /* ---------- Abierto / cerrado: faro de la carta, tabla de hoy y barra de llamada ---------- */
  function initEstado() {
    var textos = $$("[data-estado-texto]");
    var barra = $("[data-estado-barra]");
    var faro = $("[data-estado-carta]");
    var tabla = $("[data-tabla]");

    function pintar() {
      var t = ahoraEnBlanes();
      var abierto = abiertoA(t.minutos, t);
      var largo, corto, carta;
      if (enTemporada(t)) {
        largo = "Cerrado por temporada"; corto = largo; carta = "Luz apagada por temporada";
      } else if (abierto) {
        largo = "Abierto ahora · hasta las 23:00"; corto = largo; carta = "Luz verde encendida hasta las 23:00";
      } else {
        largo = t.minutos < APERTURA ? "Cerrado ahora · abre a las 8:30" : "Cerrado ahora · abre mañana a las 8:30";
        corto = "Cerrado · abre a las 8:30";
        carta = "Luz verde de 8:30 a 23:00";
      }
      document.body.setAttribute("data-estado", abierto ? "abierto" : "cerrado");
      textos.forEach(function (n) {
        n.textContent = largo;
        var caja = n.closest("[data-estado]");
        if (caja) caja.classList.toggle("is-cerrado", !abierto);
      });
      if (barra) barra.textContent = corto;
      if (faro) faro.textContent = carta;
      if (tabla) {
        $$("tbody tr", tabla).forEach(function (tr) {
          var hoy = tr.getAttribute("data-dia") === t.dia;
          tr.classList.toggle("is-hoy", hoy);
          if (hoy) tr.setAttribute("aria-current", "date"); else tr.removeAttribute("aria-current");
        });
      }
    }
    pintar();
    setInterval(pintar, 60 * 1000);
  }

  /* ---------- Carta náutica: encuadre, acercar, fichas de los puntos ---------- */
  function initMapa() {
    var mapa = $(".mapa");
    var svg = $(".carta-nautica");
    if (!mapa || !svg) return;
    var ficha = $("[data-ficha]", mapa);
    var cuerpo = $("[data-ficha-cuerpo]", mapa);
    var boton = $("[data-zoom]", mapa);
    var textoBoton = $("[data-zoom-texto]", mapa);
    var dPlaya = svg.getAttribute("data-dist-playa") || "90";
    var dPalomera = svg.getAttribute("data-dist-palomera") || "280";
    var cerca = false;
    var actual = null;
    var animando = 0;

    function vistaBase() { return movil.matches ? [590, 170, 900, 900] : [0, 0, 1800, 1000]; }
    function vistaCerca() { return movil.matches ? [770, 300, 420, 420] : [690, 250, 640, 356]; }
    function poner(v) { svg.setAttribute("viewBox", v.map(function (n) { return Math.round(n * 10) / 10; }).join(" ")); actual = v; }
    function ir(destino) {
      var desde = actual || vistaBase();
      if (reducido) { poner(destino); return; }
      var t0 = performance.now(), dur = 900, id = ++animando;
      function paso(t) {
        if (id !== animando) return;
        var k = Math.min(1, (t - t0) / dur);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        poner(desde.map(function (a, i) { return a + (destino[i] - a) * e; }));
        if (k < 1) requestAnimationFrame(paso);
      }
      requestAnimationFrame(paso);
    }
    poner(vistaBase());
    if (movil.addEventListener) movil.addEventListener("change", function () { cerca = false; actualizarBoton(); poner(vistaBase()); cerrar(); });

    function actualizarBoton() {
      if (!boton) return;
      boton.setAttribute("aria-pressed", cerca ? "true" : "false");
      if (textoBoton) textoBoton.textContent = cerca ? "Ver toda la bahía" : "Acercar al café";
    }
    if (boton) boton.addEventListener("click", function () {
      cerrar();
      cerca = !cerca;
      actualizarBoton();
      ir(cerca ? vistaCerca() : vistaBase());
      mapa.classList.add("is-usada");
    });

    var FICHAS = {
      aroma: function () {
        var estado = $("[data-estado-texto]");
        return { tipo: "Cafetería · bar", titulo: "Aroma Café", foto: "assets/img/fachada-1000.webp",
          texto: "Passeig de Dintre, 4. Café, cocina y terraza, todos los días de 8:30 a 23:00.",
          estado: estado ? estado.textContent : "",
          acciones: [["Llamar para reservar", TELEFONO], ["Cómo llegar", COMO_LLEGAR]] };
      },
      playa: function () {
        return { tipo: "Playa", titulo: "Platja de Blanes", texto: "La playa del centro de Blanes, a unos " + dPlaya + " m del café.",
          acciones: [["Ver la carta del café", "#carta"]] };
      },
      palomera: function () {
        return { tipo: "Roca", titulo: "Sa Palomera", texto: "La roca que marca el inicio de la Costa Brava, a unos " + dPalomera + " m del café.",
          acciones: [["Cómo llegar al café", COMO_LLEGAR]] };
      },
      puerto: function () {
        return { tipo: "Puerto", titulo: "Port de Blanes", texto: "El puerto de Blanes, al otro extremo de la playa.",
          acciones: [["Cómo llegar al café", COMO_LLEGAR]] };
      }
    };

    function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
    var activo = null;
    function abrir(punto) {
      var datos = FICHAS[punto.getAttribute("data-punto")];
      if (!datos || !ficha) return;
      var f = datos();
      cuerpo.innerHTML =
        (f.foto ? '<figure class="ficha__foto"><img src="' + f.foto + '" alt=""></figure>' : "") +
        '<p class="ficha__tipo">' + esc(f.tipo) + "</p>" +
        '<h3 class="ficha__titulo">' + esc(f.titulo) + "</h3>" +
        '<p class="ficha__texto">' + esc(f.texto) + "</p>" +
        (f.estado ? '<p class="ficha__estado">' + esc(f.estado) + "</p>" : "") +
        '<p class="ficha__acciones">' + f.acciones.map(function (a) {
          var externo = /^https/.test(a[1]);
          return '<a href="' + a[1] + '"' + (externo ? ' target="_blank" rel="noopener"' : "") + ">" + esc(a[0]) + "</a>";
        }).join("") + "</p>";
      if (activo) activo.classList.remove("is-activo");
      activo = punto;
      punto.classList.add("is-activo");
      ficha.hidden = false;
      mapa.classList.add("is-usada");
      if (!movil.matches) {
        var rm = mapa.getBoundingClientRect(), rp = punto.getBoundingClientRect();
        var x = rp.left + rp.width / 2 - rm.left, y = rp.top + rp.height / 2 - rm.top;
        var w = ficha.offsetWidth, h = ficha.offsetHeight;
        var left = x + 22, top = y - h - 18;
        if (left + w > rm.width - 12) left = x - w - 22;
        if (top < 12) top = Math.min(rm.height - h - 12, y + 22);
        ficha.style.left = Math.max(12, left) + "px";
        ficha.style.top = Math.max(12, top) + "px";
      }
      var cerrarBtn = $("[data-ficha-cerrar]", ficha);
      if (cerrarBtn) cerrarBtn.focus({ preventScroll: true });
    }
    function cerrar() {
      if (!ficha || ficha.hidden) return;
      ficha.hidden = true;
      if (activo) { activo.classList.remove("is-activo"); }
    }
    $$(".punto", svg).forEach(function (p) {
      p.addEventListener("click", function (e) { e.stopPropagation(); if (activo === p && !ficha.hidden) cerrar(); else abrir(p); });
      p.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(p); }
      });
    });
    var cerrarBtn = $("[data-ficha-cerrar]", ficha);
    if (cerrarBtn) cerrarBtn.addEventListener("click", function () { var a = activo; cerrar(); if (a) a.focus(); });
    document.addEventListener("click", function (e) { if (ficha && !ficha.hidden && !ficha.contains(e.target)) cerrar(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { var a = activo; cerrar(); if (a) a.focus(); } });
  }

  /* ---------- Selector de hora: ¿abierto a esa hora y qué se sirve? ---------- */
  function initReloj() {
    var caja = $("[data-reloj]");
    if (!caja) return;
    var rango = $("[data-reloj-rango]", caja);
    var hora = $("[data-reloj-hora]", caja);
    var estado = $("[data-reloj-estado]", caja);
    var momento = $("[data-reloj-momento]", caja);
    var ahora = $("[data-reloj-ahora]", caja);
    var fotos = $$("[data-momento]", caja);

    function mostrar(m) {
      var t = ahoraEnBlanes();
      var abierto = abiertoA(m, t);
      var clave, texto;
      if (enTemporada(t)) { clave = "cerrado"; texto = "Cerrado por temporada."; }
      else if (!abierto) { clave = "cerrado"; texto = m < APERTURA ? "Aún cerrado: abre a las 8:30 con el primer café." : "Cerrado: vuelve a abrir mañana a las 8:30."; }
      else if (m < 750) { clave = "manana"; texto = "Por la mañana: café, tostadas y bollería."; }
      else if (m < 990) { clave = "mediodia"; texto = "Al mediodía: bocadillos, platos combinados y ensaladas."; }
      else { clave = "tarde"; texto = "Tarde y noche: tapas, cerveza, sangría y cócteles en la terraza."; }
      hora.textContent = hhmm(m);
      estado.textContent = abierto ? "Abierto" : "Cerrado";
      estado.classList.toggle("is-abierto", abierto);
      momento.textContent = texto;
      rango.setAttribute("aria-valuetext", hhmm(m) + ", " + (abierto ? "abierto" : "cerrado"));
      fotos.forEach(function (f) { f.classList.toggle("is-activa", f.getAttribute("data-momento") === clave); });
    }
    function marcarAhora() {
      var m = ahoraEnBlanes().minutos;
      if (ahora) ahora.style.setProperty("--x", (m / 1440 * 100).toFixed(2) + "%");
      return m;
    }
    var m0 = marcarAhora();
    rango.value = String(Math.min(1425, Math.round(m0 / 15) * 15));
    mostrar(Number(rango.value));
    rango.addEventListener("input", function () { mostrar(Number(rango.value)); });
    setInterval(marcarAhora, 60 * 1000);
  }

  /* ---------- Carta del local: foto e índice siguen a la sección que se lee ---------- */
  function initCartaEscena() {
    var cursos = $$("[data-curso]");
    var imgs = $$("[data-escena]");
    var pie = $("[data-escena-pie]");
    var enlaces = $$(".indice-carta a");
    if (!cursos.length || !("IntersectionObserver" in window)) return;
    function activar(id, nombre) {
      imgs.forEach(function (i) { i.classList.toggle("is-activa", i.getAttribute("data-escena") === id); });
      if (pie) pie.textContent = nombre;
      enlaces.forEach(function (a) {
        var si = a.getAttribute("href") === "#" + id;
        if (si) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        if (si && a.parentNode.scrollWidth > a.parentNode.clientWidth) {
          a.parentNode.scrollTo({ left: a.offsetLeft - 16, behavior: reducido ? "auto" : "smooth" });
        }
      });
    }
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { if (e.isIntersecting) activar(e.target.id, e.target.getAttribute("data-curso")); });
    }, { rootMargin: "-35% 0px -60% 0px" });
    cursos.forEach(function (c) { io.observe(c); });
  }

  /* ---------- La nota de Google cuenta hasta su valor ---------- */
  function initContar() {
    var caja = $(".nota-google");
    if (!caja) return;
    var nums = $$("[data-contar]", caja);
    function contar() {
      caja.classList.add("is-contada");
      nums.forEach(function (n) {
        var fin = parseFloat(n.getAttribute("data-contar"));
        var dec = Number(n.getAttribute("data-decimales") || 0);
        var fmt = function (v) { return v.toFixed(dec).replace(".", ","); };
        if (reducido) { n.textContent = fmt(fin); return; }
        var t0 = performance.now(), dur = 1600;
        (function paso(t) {
          var k = Math.min(1, (t - t0) / dur);
          n.textContent = fmt(fin * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(paso);
        })(t0);
      });
    }
    if (!("IntersectionObserver" in window)) { contar(); return; }
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { contar(); io.disconnect(); }
    }, { threshold: 0.4 });
    io.observe(caja);
  }

  /* ---------- Barra de llamada en móvil: se recoge mientras se ven las notas de la carta ---------- */
  function initBarra() {
    var barra = $("[data-barra-llamar]");
    var notas = $("[data-notas]");
    if (!barra || !notas || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) { barra.classList.toggle("is-recogida", e.isIntersecting); });
    }).observe(notas);
  }

  /* ---------- Apariciones al bajar ---------- */
  function initApariciones() {
    var els = $$("[data-revela]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) { els.forEach(function (el) { el.classList.add("is-visible"); }); return; }
    var io = new IntersectionObserver(function (entradas) {
      entradas.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
        var el = e.target;
        el.style.transitionDelay = Math.min(i * 90, 360) + "ms";
        el.classList.add("is-visible");
        io.unobserve(el);
        setTimeout(function () { el.style.transitionDelay = ""; }, 1600);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
    setTimeout(function () {
      els.forEach(function (el) {
        if (!el.classList.contains("is-visible") && el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-visible");
      });
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

  safe(initAterrizaje, "aterrizaje");
  safe(initEstado, "estado");
  safe(initMapa, "mapa");
  safe(initReloj, "reloj");
  safe(initCartaEscena, "carta");
  safe(initContar, "contar");
  safe(initApariciones, "apariciones");
  safe(initBarra, "barra");
  safe(initVisor, "visor");
  safe(initAnio, "anio");
})();
