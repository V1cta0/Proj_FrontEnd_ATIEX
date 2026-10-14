/* Exemplos interativos da página explicativa. Cada bloco abaixo é independente. */
(function () {
  'use strict';

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* 1. Camadas: HTML sempre ligado, CSS e JavaScript opcionais */
  (function () {
    var lab = $('lab'), css = $('t-css'), js = $('t-js'), buy = $('buy'), msg = $('cart-msg'), note = $('lab-note'), n = 0;
    var notes = {
      'on-on': 'HTML + CSS + JavaScript: estrutura, aparência e comportamento juntos.',
      'on-off': 'HTML + CSS: está bonito, mas o botão não faz nada.',
      'off-on': 'HTML + JavaScript: o botão funciona, só que sem aparência nenhuma.',
      'off-off': 'Só HTML: o conteúdo está lá, sem aparência e sem ação.'
    };
    function sync() {
      var c = css.checked ? 'on' : 'off', j = js.checked ? 'on' : 'off';
      lab.dataset.css = c; lab.dataset.js = j;
      note.textContent = notes[c + '-' + j];
    }
    css.addEventListener('change', sync);
    js.addEventListener('change', sync);
    buy.addEventListener('click', function () {
      if (!js.checked) return;
      n++;
      msg.textContent = 'Carrinho: ' + n + (n === 1 ? ' item' : ' itens');
    });
    sync();
  })();

  /* 2. Estado: a tela é desenhada a partir de um objeto */
  (function () {
    var st = { curtido: false, curtidas: 99 };
    var btn = $('like'), label = $('like-label'), num = $('like-n'), out = $('like-state');
    function draw() {
      btn.setAttribute('aria-pressed', String(st.curtido));
      label.textContent = st.curtido ? 'Curtido' : 'Curtir';
      num.textContent = st.curtidas;
      out.textContent = 'curtido = ' + st.curtido + '\ncurtidas = ' + st.curtidas;
    }
    btn.addEventListener('click', function () {
      st.curtido = !st.curtido;
      st.curtidas += st.curtido ? 1 : -1;
      draw();
    });
    draw();
  })();

  /* 3. Formulário: validação a cada tecla */
  (function () {
    var inp = $('mail'), box = $('mail-field'), msg = $('mail-msg'), cnt = $('mail-count'), c = 0;
    inp.addEventListener('input', function () {
      c++;
      cnt.textContent = 'evento input: ' + c + (c === 1 ? ' vez' : ' vezes');
      var v = inp.value.trim(), state, text;
      if (!v) { state = 'idle'; text = 'Digite um e-mail para ver a validação.'; }
      else if (v.indexOf('@') < 1) { state = 'bad'; text = 'Falta o @ no meio do endereço.'; }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { state = 'bad'; text = 'Falta o domínio, como .com ou .br.'; }
      else { state = 'ok'; text = 'E-mail válido.'; }
      box.dataset.state = state;
      inp.setAttribute('aria-invalid', String(state === 'bad'));
      msg.textContent = text;
    });
  })();

  /* 4. Responsivo: o CSS decide quantas colunas cabem */
  (function () {
    var rng = $('rng'), box = $('resp-box'), grid = $('resp-grid'), out = $('rng-label');
    function draw() {
      box.style.width = rng.value + '%';
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
      out.textContent = Math.round(box.getBoundingClientRect().width) + ' px de largura\n' + cols + (cols === 1 ? ' coluna' : ' colunas');
    }
    rng.addEventListener('input', draw);
    window.addEventListener('resize', draw);
    draw();
  })();

  /* 5. Variáveis do CSS: o JavaScript troca o valor e o CSS cuida do resto */
  (function () {
    var col = $('pv-color'), rad = $('pv-radius'), pv = $('pv'), code = $('pv-code');
    function lum(h) { var n = parseInt(h.slice(1), 16); return (0.299 * (n >> 16 & 255) + 0.587 * (n >> 8 & 255) + 0.114 * (n & 255)) / 255; }
    function draw() {
      pv.style.setProperty('--accent', col.value);
      pv.style.setProperty('--radius', rad.value + 'px');
      pv.style.setProperty('--on-accent', lum(col.value) > 0.6 ? '#111c26' : '#ffffff');
      code.textContent = '--accent: ' + col.value + ';\n--radius: ' + rad.value + 'px;';
    }
    col.addEventListener('input', draw);
    rad.addEventListener('input', draw);
    draw();
  })();

  /* 6. API simulada: vazio, carregando, sucesso e erro */
  (function () {
    var PRODUTOS = [
      { nome: 'Pastilha de freio', preco: 'R$ 89,90' },
      { nome: 'Filtro de óleo', preco: 'R$ 39,90' },
      { nome: 'Vela de ignição', preco: 'R$ 24,50' }
    ];
    var go = $('api-go'), err = $('api-err'), ui = $('api-ui'), log = $('api-log'), busy = false;
    var PEDIDO = 'GET /api/produtos\n\n';

    function finish(failed) {
      if (failed) {
        ui.innerHTML = '<p class="api-fail" role="alert">Não foi possível carregar os produtos.<button type="button" class="btn" id="api-retry">Tentar de novo</button></p>';
        log.textContent = PEDIDO + '500 Servidor com erro\n{ "erro": "banco de dados indisponível" }';
      } else {
        ui.innerHTML = '<ul class="plist">' + PRODUTOS.map(function (p) {
          return '<li><span>' + esc(p.nome) + '</span><b>' + esc(p.preco) + '</b></li>';
        }).join('') + '</ul>';
        log.textContent = PEDIDO + '200 OK\n' + JSON.stringify({ produtos: PRODUTOS }, null, 2);
      }
      busy = false;
      go.disabled = false;
      go.textContent = 'Buscar de novo';
    }

    function run() {
      if (busy) return;
      busy = true;
      go.disabled = true;
      go.textContent = 'Buscando...';
      ui.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
      log.textContent = PEDIDO + 'aguardando resposta...';
      setTimeout(function () { finish(err.checked); }, 1000);
    }

    go.addEventListener('click', run);
    ui.addEventListener('click', function (e) { if (e.target.id === 'api-retry') run(); });
  })();

  /* 7. Arrastar e soltar com pointer events (mouse, toque e caneta) */
  (function () {
    var tiles = document.querySelectorAll('.tile'), page = $('dd-page'), empty = $('dd-empty');
    var evs = document.querySelectorAll('#dd-events li'), reset = $('dd-reset'), drag = null;
    var BLOCKS = {
      titulo: '<span class="pl-title">Título da página</span>',
      imagem: '<span class="pl-img" aria-hidden="true"></span>',
      botao: '<span class="pl-btn">Comprar agora</span>'
    };

    function mark(name) {
      for (var i = 0; i < evs.length; i++) evs[i].classList.toggle('on', evs[i].dataset.ev === name);
    }
    function add(kind) {
      var el = document.createElement('div');
      el.className = 'placed';
      el.innerHTML = BLOCKS[kind];
      page.appendChild(el);
      empty.hidden = true;
    }
    function inside(r, e) { return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; }
    function end() {
      if (drag && drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
      document.body.classList.remove('is-dragging');
      page.classList.remove('over');
    }

    Array.prototype.forEach.call(tiles, function (t) {
      t.addEventListener('pointerdown', function (e) {
        if (e.button) return;
        drag = { kind: t.dataset.kind, x: e.clientX, y: e.clientY, moved: false, ghost: null, pid: e.pointerId };
        try { t.setPointerCapture(e.pointerId); } catch (err) { /* segue sem captura */ }
        mark('pointerdown');
      });
      t.addEventListener('pointermove', function (e) {
        if (!drag || e.pointerId !== drag.pid) return;
        if (!drag.moved) {
          if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
          drag.moved = true;
          var g = document.createElement('div');
          g.className = 'dd-ghost';
          g.textContent = t.textContent;
          document.body.appendChild(g);
          drag.ghost = g;
          document.body.classList.add('is-dragging');
        }
        drag.ghost.style.transform = 'translate(' + (e.clientX - 40) + 'px,' + (e.clientY - 18) + 'px)';
        page.classList.toggle('over', inside(page.getBoundingClientRect(), e));
        mark('pointermove');
      });
      t.addEventListener('pointerup', function (e) {
        if (!drag || e.pointerId !== drag.pid) return;
        var d = drag, dropped = !d.moved || inside(page.getBoundingClientRect(), e);
        end();
        drag = null;
        mark('pointerup');
        if (dropped) add(d.kind);
      });
      t.addEventListener('pointercancel', function () { end(); drag = null; });
      t.addEventListener('click', function (e) { if (e.detail === 0) add(t.dataset.kind); });
    });

    reset.addEventListener('click', function () {
      var olds = page.querySelectorAll('.placed');
      for (var i = 0; i < olds.length; i++) page.removeChild(olds[i]);
      empty.hidden = false;
      mark('');
    });
  })();
})();
