/* Garagem Front-End: lógica da interface (estado, arrastar e soltar, painel). */
(function () {
  'use strict';

  var G = window.GARAGEM;
  var SLOTS = G.SLOTS, ORDER = G.SLOT_ORDER, KINDS = G.KINDS, INFO = G.INFO, PARTS = G.PARTS, BY_ID = G.BY_ID;
  var ZONE_ORDER = ['porta', 'rodaT', 'rodaF', 'luzes', 'aerofolio', 'painel', 'motor', 'tanque'];
  var STORE = 'garagem-front-end-v1';
  var FINISHES = ['brilhante', 'fosco'];
  var SCENES = ['dia', 'noite', 'estudio'];
  var SWATCHES = [
    ['#c8433a', 'Vermelho'], ['#2f6fe0', 'Azul'], ['#1f9d6b', 'Verde'], ['#f0b429', 'Amarelo'],
    ['#6b4fd6', 'Roxo'], ['#e8eaee', 'Branco'], ['#1b2026', 'Preto']
  ];
  var FRONT_SLOTS = ORDER.filter(function (s) { return SLOTS[s].layer === 'front'; }).length;
  var BACK_SLOTS = ORDER.filter(function (s) { return SLOTS[s].layer === 'back'; }).length;
  var DEFAULT = {
    parts: { rodaT: 'roda-esportiva', rodaF: 'roda-esportiva', luzes: 'farol-led' },
    color: '#c8433a', finish: 'brilhante', scene: 'dia', decal: 'FRONT-END 01', tab: 'front'
  };

  var state = JSON.parse(JSON.stringify(DEFAULT));
  var selected = { kind: 'carroceria' };
  var held = null;
  var drag = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function setStatus(msg) { $('status').textContent = msg; }
  function slotsOfKind(kind) { return ORDER.filter(function (s) { return SLOTS[s].kind === kind; }); }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  /* ---------- Cor ---------- */
  function rgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function hex(a) {
    return '#' + a.map(function (v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? '0' : '') + v.toString(16); }).join('');
  }
  function mix(h, t, k) { var c = rgb(h), d = rgb(t); return hex([0, 1, 2].map(function (i) { return c[i] + (d[i] - c[i]) * k; })); }

  function applyColor() {
    var svg = $('svg'), c = state.color, flat = state.finish === 'fosco';
    svg.style.setProperty('--car', c);
    svg.style.setProperty('--car-light', mix(c, '#ffffff', flat ? 0.08 : 0.3));
    svg.style.setProperty('--car-dark', mix(c, '#000000', flat ? 0.18 : 0.36));
    var r = rgb(c), lum = (0.299 * r[0] + 0.587 * r[1] + 0.114 * r[2]) / 255;
    svg.style.setProperty('--decal', lum > 0.62 ? '#1b2026' : '#ffffff');
    svg.dataset.finish = state.finish;
    $('tray').style.setProperty('--car', c);
    $('color-input').value = c;
    var sw = document.querySelectorAll('.swatch');
    for (var i = 0; i < sw.length; i++) sw[i].setAttribute('aria-pressed', String(sw[i].dataset.color === c.toLowerCase()));
  }

  /* ---------- Peças no palco ---------- */
  function renderParts() {
    ORDER.forEach(function (slot) {
      var id = state.parts[slot], p = id && BY_ID[id], html = '', base = SLOTS[slot].base || 0;
      if (p) for (var i = 0; i < SLOTS[slot].zones.length; i++) html += '<g>' + p.draw(i + base) + '</g>';
      $('L-' + slot).innerHTML = html;
    });
    renderCables();
  }

  function cable(d, label, lx, ly) {
    var w = label.length * 6.8 + 18;
    return '<path class="cable" d="' + d + '"/>' +
      '<g class="cable-chip" data-api="1" transform="translate(' + lx + ' ' + ly + ')" tabindex="0" role="button" aria-label="Cabo: ' + label + '">' +
      '<rect x="' + (-w / 2) + '" y="-10" width="' + w + '" height="20" rx="10"/>' +
      '<text y="4" text-anchor="middle">' + label + '</text></g>';
  }

  function renderCables() {
    var has = function (s) { return !!state.parts[s]; }, html = '';
    if (has('motor') && has('painel')) html += cable('M708 272 C660 246 604 238 562 214', 'API', 632, 248);
    if (has('motor') && has('tanque')) html += cable('M132 328 L132 346 L752 346 L752 300', 'consulta', 440, 346);
    $('L-cables').innerHTML = html;
  }

  function center(z) { return [z[0] + z[2] / 2, z[1] + z[3] / 2]; }

  function buildZones() {
    var html = '';
    ZONE_ORDER.forEach(function (slot) {
      SLOTS[slot].zones.forEach(function (z, i) {
        html += '<g class="zone" data-slot="' + slot + '" data-i="' + i + '" data-layer="' + SLOTS[slot].layer + '">' +
          '<rect class="zone-rect" x="' + z[0] + '" y="' + z[1] + '" width="' + z[2] + '" height="' + z[3] + '" rx="12"/></g>';
      });
    });
    $('L-zones').innerHTML = html;
  }

  function renderPins() {
    var html = '';
    ORDER.forEach(function (slot) {
      if (state.parts[slot]) return;
      SLOTS[slot].zones.forEach(function (z) {
        var c = center(z);
        html += '<g class="pin" data-slot="' + slot + '" data-layer="' + SLOTS[slot].layer + '" tabindex="0" role="button" ' +
          'aria-label="Encaixe vazio: ' + esc(SLOTS[slot].label) + '" transform="translate(' + c[0] + ' ' + c[1] + ')">' +
          '<title>' + esc(SLOTS[slot].label) + '</title><circle class="ping" r="13"/><circle r="13"/><path d="M-5 0H5M0 -5V5"/></g>';
      });
    });
    $('L-pins').innerHTML = html;
  }

  function markSelection() {
    var zs = document.querySelectorAll('.zone');
    for (var i = 0; i < zs.length; i++) zs[i].classList.toggle('sel', selected.kind === 'slot' && zs[i].dataset.slot === selected.slot);
    $('car-body').classList.toggle('sel', selected.kind === 'carroceria');
    var cc = document.querySelectorAll('.cable-chip');
    for (var j = 0; j < cc.length; j++) cc[j].classList.toggle('sel', selected.kind === 'api');
  }

  function setCompat(kind) {
    var zs = document.querySelectorAll('.zone');
    for (var i = 0; i < zs.length; i++) {
      zs[i].classList.toggle('compat', !!kind && SLOTS[zs[i].dataset.slot].kind === kind);
      zs[i].classList.remove('armed');
    }
    $('stage').classList.toggle('seeking', !!kind);
  }

  /* ---------- Catálogo (bandeja) ---------- */
  function backdrop(kind, z) {
    var r = '<rect x="' + z[0] + '" y="' + z[1] + '" width="' + z[2] + '" height="' + z[3] + '" ';
    if (kind === 'painel') return r + 'fill="#a9cde3"/>';
    if (kind === 'aerofolio') return r + 'fill="#d3dee7"/>';
    if (kind === 'rodas') return r + 'style="fill:var(--car)"/><circle cx="235" cy="310" r="57" fill="#0d1115"/>';
    return r + 'style="fill:var(--car)"/>';
  }

  function chipArt(p) {
    var first = slotsOfKind(p.slot)[0], z = SLOTS[first].zones[0];
    return '<span class="chip-art"><svg viewBox="' + z.join(' ') + '" aria-hidden="true">' + backdrop(p.slot, z) + p.draw(SLOTS[first].base || 0) + '</svg></span>';
  }

  function buildTray() {
    ['front', 'back'].forEach(function (layer) {
      var html = '';
      KINDS.filter(function (k) { return SLOTS[slotsOfKind(k)[0]].layer === layer; }).forEach(function (kind) {
        html += '<section class="group" id="g-' + kind + '"><h3>' + esc(INFO[kind].title) + '</h3><p class="tagline">' + esc(INFO[kind].tags) + '</p><div class="chips">';
        PARTS.filter(function (p) { return p.slot === kind; }).forEach(function (p) {
          html += '<button type="button" class="chip" data-id="' + p.id + '" data-slot="' + kind + '" data-layer="' + layer + '">' +
            chipArt(p) + '<span class="chip-name">' + esc(p.name) + '</span><span class="chip-on"></span></button>';
        });
        html += '</div></section>';
      });
      $('tray-' + layer).innerHTML = html;
    });
    var chips = document.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('pointerdown', onChipDown);
      chips[i].addEventListener('click', function (e) { if (e.detail === 0) toggleHeld(this.dataset.id); });
    }
  }

  function usageLabel(c) {
    var where = slotsOfKind(c.dataset.slot).filter(function (s) { return state.parts[s] === c.dataset.id; });
    if (!where.length) return '';
    if (where.length > 1) return where.length === 2 && c.dataset.slot === 'rodas' ? 'nas duas' : 'no carro';
    return c.dataset.slot === 'rodas' ? (where[0] === 'rodaF' ? 'dianteira' : 'traseira') : 'no carro';
  }

  function renderTray() {
    var chips = document.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i], label = usageLabel(c);
      c.classList.toggle('on', !!label);
      c.querySelector('.chip-on').textContent = label;
      c.classList.toggle('held', held === c.dataset.id);
      c.setAttribute('aria-pressed', String(held === c.dataset.id));
    }
    ['front', 'back'].forEach(function (l) {
      $('tray-' + l).hidden = state.tab !== l;
      $('tab-' + l).setAttribute('aria-selected', String(state.tab === l));
    });
  }

  function showSlotInTray(slot) {
    state.tab = SLOTS[slot].layer;
    renderTray();
    var g = $('g-' + SLOTS[slot].kind);
    if (g && g.scrollIntoView) {
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      g.scrollIntoView({ block: 'nearest', behavior: calm ? 'auto' : 'smooth' });
    }
  }

  /* ---------- Painel ---------- */
  function renderPanel() {
    var key = selected.kind === 'slot' ? selected.slot : selected.kind;
    var info = INFO[key], p = selected.kind === 'slot' && state.parts[selected.slot] ? BY_ID[state.parts[selected.slot]] : null;
    var badge = $('sel-layer');
    badge.textContent = info.layer === 'front' ? 'Front-end' : info.layer === 'back' ? 'Back-end' : 'Conexão';
    badge.className = 'badge ' + info.layer;
    $('sel-title').textContent = info.title;
    $('sel-carro').textContent = info.carro;
    $('sel-site').textContent = info.site;
    $('sel-tags').textContent = info.tags;
    var note = $('sel-note'), vars = $('sel-variants'), rm = $('sel-remove'), cp = $('sel-copy');
    vars.innerHTML = '';
    rm.hidden = true;
    cp.hidden = true;
    if (selected.kind === 'slot') {
      var slot = selected.slot, kind = SLOTS[slot].kind;
      note.textContent = p ? 'Instalada: ' + p.name + '. ' + p.note : 'Encaixe vazio. Arraste uma peça do catálogo até ele.';
      PARTS.filter(function (x) { return x.slot === kind; }).forEach(function (x) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'vbtn'; b.textContent = x.name; b.dataset.id = x.id;
        b.setAttribute('aria-pressed', String(!!p && p.id === x.id));
        vars.appendChild(b);
      });
      rm.hidden = !p;
      var twin = SLOTS[slot].twin;
      if (p && twin && state.parts[twin] !== p.id) {
        cp.textContent = 'Copiar para a roda ' + (twin === 'rodaF' ? 'dianteira' : 'traseira');
        cp.hidden = false;
      }
    } else if (selected.kind === 'api') {
      var n = apiCount();
      note.textContent = n ? 'Conexões ativas: ' + n + ' de 2.' : 'Instale o motor e o painel (ou o tanque) para ligar os cabos.';
    } else {
      note.textContent = 'Clique em qualquer encaixe ou peça do carro para ver o que ela representa.';
    }
  }

  function apiCount() {
    return (state.parts.motor && state.parts.painel ? 1 : 0) + (state.parts.motor && state.parts.tanque ? 1 : 0);
  }

  function renderProgress() {
    var f = 0, b = 0;
    ORDER.forEach(function (s) { if (state.parts[s]) { if (SLOTS[s].layer === 'front') f++; else b++; } });
    var a = apiCount();
    $('prog-front').textContent = f + ' de ' + FRONT_SLOTS;
    $('prog-back').textContent = b + ' de ' + BACK_SLOTS;
    $('prog-api').textContent = a + ' de 2';
    $('bar-front').style.width = (f / FRONT_SLOTS * 100) + '%';
    $('bar-back').style.width = (b / BACK_SLOTS * 100) + '%';
    $('bar-api').style.width = (a / 2 * 100) + '%';
    $('done').hidden = !(f === FRONT_SLOTS && b === BACK_SLOTS);
  }

  function renderAll() {
    renderParts();
    renderPins();
    markSelection();
    renderPanel();
    renderProgress();
    renderTray();
  }

  /* ---------- Ações ---------- */
  function popSlot(slot) {
    var kids = $('L-' + slot).children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].classList.add('pop');
      kids[i].addEventListener('animationend', function () { this.classList.remove('pop'); });
    }
  }

  function install(id, slot) {
    var p = BY_ID[id];
    if (!slot) {
      var cands = slotsOfKind(p.slot);
      slot = cands.filter(function (s) { return !state.parts[s]; })[0] || cands[0];
    }
    state.parts[slot] = id;
    selected = { kind: 'slot', slot: slot };
    held = null;
    setCompat(null);
    renderAll();
    popSlot(slot);
    setStatus('Instalado: ' + p.name + ' em "' + lower(SLOTS[slot].label) + '". ' + INFO[slot].carro);
  }

  function removeSlot(slot) {
    delete state.parts[slot];
    renderAll();
    setStatus('Peça removida: ' + lower(SLOTS[slot].label) + '. O encaixe voltou a ficar vazio.');
  }

  function copyToTwin() {
    if (selected.kind !== 'slot') return;
    var twin = SLOTS[selected.slot].twin, id = state.parts[selected.slot];
    if (!twin || !id) return;
    state.parts[twin] = id;
    renderAll();
    popSlot(twin);
    setStatus('Pronto: a ' + lower(SLOTS[twin].label) + ' agora usa a mesma peça. É a ideia de reutilizar um componente.');
  }

  function selectSlot(slot) {
    selected = { kind: 'slot', slot: slot };
    markSelection();
    renderPanel();
    showSlotInTray(slot);
  }

  function toggleHeld(id) {
    if (held === id) {
      held = null;
      setCompat(null);
      setStatus('Peça solta. Escolha outra no catálogo.');
    } else {
      held = id;
      setCompat(BY_ID[id].slot);
      setStatus('Peça escolhida: ' + BY_ID[id].name + '. Toque no encaixe destacado do carro, ou arraste a peça até ele.');
    }
    renderTray();
  }

  function mismatch(part, wrongSlot) {
    setStatus(part.name + ' não encaixa em "' + lower(SLOTS[wrongSlot].label) + '". O encaixe certo é "' + lower(SLOTS[slotsOfKind(part.slot)[0]].label.replace(/ (traseira|dianteira)/, 's')) + '", e está destacado.');
    var zs = document.querySelectorAll('.zone[data-slot="' + wrongSlot + '"]');
    for (var i = 0; i < zs.length; i++) {
      zs[i].classList.add('wrong');
      (function (el) { setTimeout(function () { el.classList.remove('wrong'); }, 600); })(zs[i]);
    }
  }

  /* ---------- Arrastar e soltar ---------- */
  function svgPoint(e) {
    var svg = $('svg'), m = svg.getScreenCTM();
    if (!m) return { x: -999, y: -999 };
    var pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    return pt.matrixTransform(m.inverse());
  }

  function inZone(z, p, pad) {
    return p.x >= z[0] - pad && p.x <= z[0] + z[2] + pad && p.y >= z[1] - pad && p.y <= z[1] + z[3] + pad;
  }

  function onChipDown(e) {
    if (e.button) return;
    var chip = e.currentTarget;
    drag = { id: chip.dataset.id, chip: chip, x: e.clientX, y: e.clientY, active: false, pid: e.pointerId, ghost: null, hover: null, wrong: null };
    try { chip.setPointerCapture(e.pointerId); } catch (err) { /* sem captura, segue igual */ }
    chip.addEventListener('pointermove', onMove);
    chip.addEventListener('pointerup', onUp);
    chip.addEventListener('pointercancel', onCancel);
  }

  function startDrag() {
    var p = BY_ID[drag.id];
    drag.active = true;
    held = null;
    renderTray();
    setCompat(p.slot);
    var g = document.createElement('div');
    g.className = 'ghost';
    g.innerHTML = drag.chip.querySelector('.chip-art').outerHTML + '<span>' + esc(p.name) + '</span>';
    g.style.setProperty('--car', state.color);
    document.body.appendChild(g);
    drag.ghost = g;
    document.body.classList.add('is-dragging');
    setStatus('Arrastando: ' + p.name + '. Solte sobre o encaixe destacado.');
  }

  function onMove(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    if (!drag.active) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 7) return;
      startDrag();
    }
    drag.ghost.style.transform = 'translate(' + (e.clientX - 60) + 'px,' + (e.clientY - 44) + 'px)';
    var p = BY_ID[drag.id], pt = svgPoint(e), hit = null, wrong = null, i, s;
    var mine = slotsOfKind(p.slot);
    for (var m = 0; m < mine.length && !hit; m++) {
      for (i = 0; i < SLOTS[mine[m]].zones.length; i++) {
        if (inZone(SLOTS[mine[m]].zones[i], pt, 14)) { hit = { slot: mine[m], i: i }; break; }
      }
    }
    if (!hit) {
      for (var k = ZONE_ORDER.length - 1; k >= 0 && !wrong; k--) {
        s = ZONE_ORDER[k];
        if (SLOTS[s].kind === p.slot) continue;
        for (i = 0; i < SLOTS[s].zones.length; i++) if (inZone(SLOTS[s].zones[i], pt, 0)) { wrong = s; break; }
      }
    }
    drag.hover = hit; drag.wrong = wrong;
    var zs = document.querySelectorAll('.zone');
    for (i = 0; i < zs.length; i++) {
      zs[i].classList.toggle('armed', !!hit && zs[i].dataset.slot === hit.slot && Number(zs[i].dataset.i) === hit.i);
    }
  }

  function endDrag() {
    if (drag && drag.ghost && drag.ghost.parentNode) drag.ghost.parentNode.removeChild(drag.ghost);
    document.body.classList.remove('is-dragging');
    if (drag) {
      drag.chip.removeEventListener('pointermove', onMove);
      drag.chip.removeEventListener('pointerup', onUp);
      drag.chip.removeEventListener('pointercancel', onCancel);
    }
  }

  function onUp(e) {
    if (!drag || e.pointerId !== drag.pid) return;
    var d = drag, p = BY_ID[d.id];
    endDrag();
    drag = null;
    if (!d.active) { toggleHeld(d.id); return; }
    setCompat(null);
    if (d.hover) install(d.id, d.hover.slot);
    else if (d.wrong) mismatch(p, d.wrong);
    else setStatus('Solte a peça sobre o carro, no encaixe destacado.');
  }

  function onCancel() {
    endDrag();
    drag = null;
    setCompat(null);
  }

  /* ---------- Cliques no palco ---------- */
  function onStageClick(e) {
    var t = e.target;
    if (t.closest && t.closest('.cable-chip')) { selected = { kind: 'api' }; markSelection(); renderPanel(); return; }
    var zone = t.closest && t.closest('.zone'), pin = t.closest && t.closest('.pin');
    var slot = zone ? zone.dataset.slot : pin ? pin.dataset.slot : null;
    if (slot) {
      if (held) {
        if (BY_ID[held].slot === SLOTS[slot].kind) install(held, slot); else mismatch(BY_ID[held], slot);
      } else selectSlot(slot);
      return;
    }
    if (t.closest && t.closest('#car-body')) {
      if (held) { setStatus('Solte a peça num encaixe destacado, não na lataria.'); return; }
      selected = { kind: 'carroceria' };
      markSelection(); renderPanel();
      setStatus('Carroceria e pintura: o HTML, o CSS e o JavaScript do carro.');
    }
  }

  /* ---------- Salvar e restaurar ---------- */
  function sanitize(raw) {
    var s = JSON.parse(JSON.stringify(DEFAULT));
    if (!raw || typeof raw !== 'object') return s;
    s.parts = {};
    if (raw.parts && typeof raw.parts === 'object') {
      if (BY_ID[raw.parts.rodas] && BY_ID[raw.parts.rodas].slot === 'rodas') {
        s.parts.rodaT = raw.parts.rodas;
        s.parts.rodaF = raw.parts.rodas;
      }
      Object.keys(raw.parts).forEach(function (slot) {
        var p = BY_ID[raw.parts[slot]];
        if (p && SLOTS[slot] && p.slot === SLOTS[slot].kind) s.parts[slot] = p.id;
      });
    }
    if (typeof raw.color === 'string' && /^#[0-9a-f]{6}$/i.test(raw.color)) s.color = raw.color.toLowerCase();
    if (FINISHES.indexOf(raw.finish) > -1) s.finish = raw.finish;
    if (SCENES.indexOf(raw.scene) > -1) s.scene = raw.scene;
    if (typeof raw.decal === 'string') s.decal = raw.decal.slice(0, 16);
    if (raw.tab === 'front' || raw.tab === 'back') s.tab = raw.tab;
    return s;
  }

  function applyControls() {
    $('stage').dataset.scene = state.scene;
    var sb = document.querySelectorAll('.scene-btn');
    for (var i = 0; i < sb.length; i++) sb[i].setAttribute('aria-pressed', String(sb[i].dataset.scene === state.scene));
    $('finish').value = state.finish;
    $('decal').value = state.decal;
    $('decal-text').textContent = state.decal;
    applyColor();
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      setStatus('Projeto salvo neste navegador. Num sistema real, o back-end guardaria isso no banco de dados.');
    } catch (err) {
      setStatus('Não foi possível salvar: o navegador bloqueou o armazenamento local.');
    }
  }

  function loadSaved(quiet) {
    var raw = null;
    try { raw = localStorage.getItem(STORE); } catch (err) { raw = null; }
    if (!raw) { if (!quiet) setStatus('Ainda não há projeto salvo neste navegador.'); return false; }
    try { state = sanitize(JSON.parse(raw)); } catch (err2) { if (!quiet) setStatus('O projeto salvo estava corrompido e foi ignorado.'); return false; }
    selected = { kind: 'carroceria' };
    applyControls();
    renderAll();
    setStatus(quiet ? 'Último projeto salvo restaurado.' : 'Projeto restaurado.');
    return true;
  }

  function reset() {
    state = JSON.parse(JSON.stringify(DEFAULT));
    selected = { kind: 'carroceria' };
    held = null;
    setCompat(null);
    applyControls();
    renderAll();
    setStatus('Projeto novo: só rodas e faróis instalados. Monte o resto.');
  }

  /* ---------- Ligações ---------- */
  function bind() {
    var sw = '';
    SWATCHES.forEach(function (s) {
      sw += '<button type="button" class="swatch" data-color="' + s[0] + '" aria-label="Pintar de ' + s[1] + '" aria-pressed="false" style="--sw:' + s[0] + '"></button>';
    });
    $('swatches').innerHTML = sw;
    $('swatches').addEventListener('click', function (e) {
      var b = e.target.closest('.swatch');
      if (!b) return;
      state.color = b.dataset.color; applyColor();
    });
    $('color-input').addEventListener('input', function () { state.color = this.value.toLowerCase(); applyColor(); });
    $('finish').addEventListener('change', function () { state.finish = this.value; applyColor(); });
    $('decal').addEventListener('input', function () { state.decal = this.value.toUpperCase().slice(0, 16); $('decal-text').textContent = state.decal; });
    var sb = document.querySelectorAll('.scene-btn');
    for (var i = 0; i < sb.length; i++) {
      sb[i].addEventListener('click', function () {
        state.scene = this.dataset.scene; applyControls();
        setStatus(state.scene === 'noite' ? 'Cenário noite: os faróis e lanternas instalados acendem.' : 'Cenário trocado.');
      });
    }
    $('tab-front').addEventListener('click', function () { state.tab = 'front'; renderTray(); });
    $('tab-back').addEventListener('click', function () { state.tab = 'back'; renderTray(); });
    $('stage').addEventListener('click', onStageClick);
    $('stage').addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('.pin, .cable-chip')) { e.preventDefault(); onStageClick(e); }
    });
    $('sel-variants').addEventListener('click', function (e) {
      var b = e.target.closest('.vbtn');
      if (b && selected.kind === 'slot') install(b.dataset.id, selected.slot);
    });
    $('sel-remove').addEventListener('click', function () { if (selected.kind === 'slot') removeSlot(selected.slot); });
    $('sel-copy').addEventListener('click', copyToTwin);
    $('btn-save').addEventListener('click', save);
    $('btn-load').addEventListener('click', function () { loadSaved(false); });
    $('btn-reset').addEventListener('click', reset);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && held) { held = null; setCompat(null); renderTray(); setStatus('Peça solta.'); }
    });
  }

  function start() {
    buildZones();
    buildTray();
    bind();
    applyControls();
    renderAll();
    loadSaved(true);
  }

  start();
})();
