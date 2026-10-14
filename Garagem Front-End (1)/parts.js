/* Catálogo de encaixes e peças da Garagem Front-End.
   Todo desenho usa coordenadas absolutas do SVG do palco (viewBox 0 0 900 420).
   Chão em y=358. Rodas: traseira em x=235, dianteira em x=640. */
(function () {
  'use strict';

  var CARBON = '#14181c';
  var WX = [235, 640];

  /* ---------- Encaixes ---------- */
  var SLOTS = {
    porta:     { label: 'Porta', layer: 'front', zones: [[318, 164, 266, 162]] },
    painel:    { label: 'Painel e volante', layer: 'front', zones: [[466, 168, 118, 62]] },
    aerofolio: { label: 'Aerofólio', layer: 'front', zones: [[58, 172, 152, 66]] },
    luzes:     { label: 'Faróis e lanternas', layer: 'front', zones: [[788, 244, 56, 50], [62, 236, 60, 34]] },
    rodaT:     { label: 'Roda traseira', layer: 'front', kind: 'rodas', base: 0, twin: 'rodaF', zones: [[172, 248, 126, 120]] },
    rodaF:     { label: 'Roda dianteira', layer: 'front', kind: 'rodas', base: 1, twin: 'rodaT', zones: [[577, 248, 126, 120]] },
    motor:     { label: 'Motor', layer: 'back', zones: [[700, 252, 98, 60]] },
    tanque:    { label: 'Tanque (banco de dados)', layer: 'back', zones: [[96, 278, 76, 56]] }
  };
  Object.keys(SLOTS).forEach(function (k) { if (!SLOTS[k].kind) SLOTS[k].kind = k; });
  var SLOT_ORDER = ['rodaT', 'rodaF', 'porta', 'luzes', 'aerofolio', 'painel', 'motor', 'tanque'];
  var KINDS = ['rodas', 'porta', 'luzes', 'aerofolio', 'painel', 'motor', 'tanque'];

  /* ---------- Textos de apoio ---------- */
  var WHEEL_SITE = 'Componente reutilizável: a mesma peça pode valer para as duas rodas, ou cada roda pode ter a sua versão, como um botão que muda de estilo em cada tela.';
  var INFO = {
    rodas: {
      title: 'Rodas', layer: 'front',
      carro: 'Tocam o chão e aparecem dos dois lados do carro.',
      site: WHEEL_SITE, tags: 'componentes · React · CSS'
    },
    rodaF: {
      title: 'Roda dianteira', layer: 'front',
      carro: 'É a roda que vira quando o motorista gira o volante. Pode ter um modelo só dela.',
      site: WHEEL_SITE, tags: 'componentes · React · CSS'
    },
    rodaT: {
      title: 'Roda traseira', layer: 'front',
      carro: 'Sustenta a traseira e acompanha o desenho do carro. Pode ter um modelo só dela.',
      site: WHEEL_SITE, tags: 'componentes · React · CSS'
    },
    porta: {
      title: 'Porta', layer: 'front',
      carro: 'É por onde a pessoa entra e sai do carro.',
      site: 'Navegação e interação: menus, links e botões que levam o usuário de uma tela para outra.',
      tags: 'HTML · links · menus'
    },
    luzes: {
      title: 'Faróis e lanternas', layer: 'front',
      carro: 'Mostram o que o carro está fazendo e iluminam o caminho. Teste o cenário Noite.',
      site: 'Feedback visual: carregando, sucesso, erro e avisos. A interface responde ao que a pessoa fez.',
      tags: 'estados · animações · mensagens'
    },
    aerofolio: {
      title: 'Aerofólio', layer: 'front',
      carro: 'Não é obrigatório, mas dá identidade esportiva ao carro.',
      site: 'Acabamento visual: sombras, transições, responsividade e microinterações feitas em CSS.',
      tags: 'CSS · animações · responsivo'
    },
    painel: {
      title: 'Painel e volante', layer: 'front',
      carro: 'É onde o motorista dá os comandos.',
      site: 'Controles da tela: formulários, campos, botões e o próprio arrastar e soltar. Tudo que lê o que a pessoa faz.',
      tags: 'formulários · eventos · JavaScript'
    },
    motor: {
      title: 'Motor', layer: 'back',
      carro: 'Fica escondido sob o capô e faz o carro andar.',
      site: 'Lógica do servidor: regras do negócio, cálculos, login e permissões. A pessoa não vê, mas nada funciona sem ele.',
      tags: 'Java · Python · Node.js'
    },
    tanque: {
      title: 'Tanque (banco de dados)', layer: 'back',
      carro: 'Guarda o combustível até alguém precisar.',
      site: 'Banco de dados: guarda usuários, pedidos e projetos para que a informação continue lá depois de fechar o site.',
      tags: 'SQL · NoSQL · armazenamento'
    },
    carroceria: {
      title: 'Carroceria e pintura', layer: 'front',
      carro: 'É a estrutura e a aparência do carro.',
      site: 'HTML é a estrutura, CSS é a pintura e JavaScript é a parte elétrica que reage aos comandos. Mude a cor ao lado e veja o CSS trabalhando.',
      tags: 'HTML · CSS · JavaScript'
    },
    api: {
      title: 'Cabos (API)', layer: 'bridge',
      carro: 'Ligam o painel ao motor e o motor ao tanque.',
      site: 'A API é a ponte: o front-end faz um pedido (requisição) e o back-end devolve a resposta, em geral como JSON.',
      tags: 'HTTP · REST · JSON'
    }
  };

  /* ---------- Rodas ---------- */
  function wheelClassic(cx) {
    var cy = 312, s = '<circle cx="' + cx + '" cy="' + cy + '" r="46" fill="#15181c"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="40" fill="none" stroke="#252b31" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="31" fill="#b9c2ca" stroke="#8d97a0" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="15" fill="#d9dfe4" stroke="#8d97a0" stroke-width="1.5"/>';
    for (var k = 0; k < 5; k++) {
      var a = k * 72 * Math.PI / 180;
      s += '<circle cx="' + (cx + Math.sin(a) * 8).toFixed(1) + '" cy="' + (cy - Math.cos(a) * 8).toFixed(1) + '" r="2.2" fill="#6a747d"/>';
    }
    return s;
  }

  function wheelSport(cx) {
    var cy = 310, s = '<circle cx="' + cx + '" cy="' + cy + '" r="48" fill="#15181c"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="43" fill="none" stroke="#2a3138" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="#1c2228"/>' +
      '<rect x="' + (cx + 14) + '" y="' + (cy - 29) + '" width="16" height="23" rx="3" fill="#d1352c" transform="rotate(22 ' + cx + ' ' + cy + ')"/>';
    for (var k = 0; k < 5; k++) {
      s += '<path d="M' + (cx - 5) + ' ' + (cy - 7) + ' L' + (cx - 3) + ' ' + (cy - 35) + ' L' + (cx + 3) + ' ' + (cy - 35) + ' L' + (cx + 5) + ' ' + (cy - 7) + ' Z" fill="#d3dae0" transform="rotate(' + (k * 72) + ' ' + cx + ' ' + cy + ')"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="none" stroke="#d3dae0" stroke-width="2.5"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="#eef2f5"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#7d8791"/>';
    return s;
  }

  function wheelGold(cx) {
    var cy = 310, s = '<circle cx="' + cx + '" cy="' + cy + '" r="48" fill="#15181c"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="42" fill="none" stroke="#2a3138" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="#0f1215"/>';
    for (var k = 0; k < 6; k++) {
      s += '<rect x="' + (cx - 3) + '" y="' + (cy - 35) + '" width="6" height="35" rx="2" fill="#d9a441" transform="rotate(' + (k * 60) + ' ' + cx + ' ' + cy + ')"/>' +
        '<rect x="' + (cx - 3) + '" y="' + (cy - 35) + '" width="6" height="35" rx="2" fill="#d9a441" transform="rotate(' + (k * 60 + 30) + ' ' + cx + ' ' + cy + ')" opacity=".55"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="none" stroke="#d9a441" stroke-width="3"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="#e9c26f"/><circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#14181c"/>';
    return s;
  }

  function wheelOffroad(cx) {
    var cy = 306, s = '<circle cx="' + cx + '" cy="' + cy + '" r="52" fill="#14171a"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="48" fill="none" stroke="#2d343b" stroke-width="7" stroke-dasharray="6 5"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="36" fill="#1f252b"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="26" fill="#8b95a0" stroke="#626c76" stroke-width="2"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="9" fill="#2a3036"/>';
    for (var k = 0; k < 8; k++) {
      var a = k * 45 * Math.PI / 180;
      s += '<circle cx="' + (cx + Math.sin(a) * 17).toFixed(1) + '" cy="' + (cy - Math.cos(a) * 17).toFixed(1) + '" r="2" fill="#3b434b"/>';
    }
    return s;
  }

  /* ---------- Faróis, porta, painel ---------- */
  var BEAM = '<path class="beam" d="M826 258 L900 224 L900 300 L826 270 Z" fill="url(#beamGrad)"/>';
  function glow(cx, cy) { return '<circle class="glow" cx="' + cx + '" cy="' + cy + '" r="20" fill="#ff3a2e"/>'; }

  var DOOR_D = 'M320 228 C330 204 346 182 366 170 L496 168 Q506 168 512 174 L574 228 L580 322 L328 322 Z';
  var WIN_D = 'M314 226 C324 200 340 180 362 168 L498 166 Q510 166 518 174 L578 224 Z';
  var MIRROR = '<path d="M518 212 L542 212 Q548 218 538 225 L522 225 Z" fill="' + CARBON + '"/>';

  function door(tint, extra) {
    return '<path d="' + WIN_D + '" fill="' + tint + '"/>' +
      '<path d="M430 167 L430 226" style="stroke:var(--car-dark)" stroke-width="7"/>' +
      '<path d="' + DOOR_D + '" fill="none" stroke="rgba(0,0,0,.4)" stroke-width="2.2" stroke-linejoin="round"/>' +
      '<rect x="372" y="244" width="40" height="6" rx="3" fill="#cfd6dc" stroke="rgba(0,0,0,.35)"/>' +
      (extra || '');
  }

  function steering(flat) {
    var wheel = flat
      ? '<rect x="492" y="178" width="12" height="32" rx="5" fill="none" stroke="#10141a" stroke-width="4" transform="rotate(18 498 194)"/><rect x="494" y="175" width="8" height="3" fill="#e0392f" transform="rotate(18 498 194)"/>'
      : '<ellipse cx="498" cy="194" rx="5.5" ry="17" fill="none" stroke="#10141a" stroke-width="4" transform="rotate(18 498 194)"/>';
    return wheel +
      '<line x1="500" y1="200" x2="530" y2="213" stroke="#10141a" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="498" cy="194" r="3.5" fill="#10141a"/>';
  }

  /* ---------- Motor e tanque (reduzidos para caber no carro) ---------- */
  function bay(x, y, w, h) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="9" fill="#0f1418" stroke="#f09a45" stroke-opacity=".8" stroke-width="1.5" stroke-dasharray="5 3"/>';
  }
  function motorWrap(inner) { return '<g transform="translate(206.3 80) scale(.74)">' + inner + '</g>'; }
  function tankWrap(inner) { return '<g transform="translate(-18.65 -10.19) scale(1.13)">' + inner + '</g>'; }

  function cylinder(fill, dark, label) {
    return '<ellipse cx="135" cy="291" rx="17" ry="5" fill="' + fill + '"/>' +
      '<rect x="118" y="273" width="34" height="18" fill="' + fill + '"/>' +
      '<ellipse cx="135" cy="273" rx="17" ry="5" fill="' + dark + '"/>' +
      '<path d="M118 279 A17 5 0 0 0 152 279 M118 285 A17 5 0 0 0 152 285" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1.4"/>' +
      (label ? '<text x="135" y="290" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="500" fill="#0f1418">' + label + '</text>' : '');
  }

  /* ---------- Peças ---------- */
  var PARTS = [
    { id: 'roda-classica', slot: 'rodas', name: 'Roda clássica', note: 'Aro de aço simples, o botão padrão do sistema.',
      draw: function (i) { return wheelClassic(WX[i]); } },
    { id: 'roda-esportiva', slot: 'rodas', name: 'Roda esportiva', note: 'Aro de liga leve com pinça de freio vermelha.',
      draw: function (i) { return wheelSport(WX[i]); } },
    { id: 'roda-dourada', slot: 'rodas', name: 'Roda de competição', note: 'Seis raios dourados e porca central, visual de pista.',
      draw: function (i) { return wheelGold(WX[i]); } },
    { id: 'roda-offroad', slot: 'rodas', name: 'Roda off-road', note: 'Pneu alto e rugoso. Levanta um pouco o carro.',
      draw: function (i) { return wheelOffroad(WX[i]); } },

    { id: 'porta-classica', slot: 'porta', name: 'Porta clássica', note: 'Vidro claro e maçaneta discreta.',
      draw: function () { return door('rgba(190,222,240,.28)', MIRROR); } },
    { id: 'porta-fume', slot: 'porta', name: 'Porta vidro fumê', note: 'Vidro escuro para mais privacidade.',
      draw: function () { return door('rgba(8,14,20,.66)', MIRROR); } },
    { id: 'porta-esportiva', slot: 'porta', name: 'Porta esportiva', note: 'Vidro escuro, faixa lateral e retrovisor preto.',
      draw: function () {
        return door('rgba(8,14,20,.66)',
          '<path d="M328 306 L580 304 L580 312 L328 314 Z" fill="#f4f6f8"/><path d="M328 316 L580 314 L580 319 L328 321 Z" fill="#f4f6f8" opacity=".7"/>' + MIRROR);
      } },

    { id: 'farol-redondo', slot: 'luzes', name: 'Farol redondo', note: 'Faróis redondos clássicos.',
      draw: function (i) {
        if (i === 0) return BEAM + '<circle cx="808" cy="263" r="12" fill="#f6efc9" stroke="#b9b08a" stroke-width="1.5"/><circle cx="808" cy="263" r="6.5" fill="#fffbe0"/>';
        return glow(88, 256) + '<rect x="82" y="245" width="12" height="23" rx="5" fill="#c8262d"/>';
      } },
    { id: 'farol-led', slot: 'luzes', name: 'Faixa de LED', note: 'Faixa de LED fina na frente e atrás.',
      draw: function (i) {
        if (i === 0) return BEAM + '<path d="M786 257 L832 261 L831 268 L787 264 Z" fill="#eaf6ff"/><rect x="792" y="271" width="26" height="3" rx="1.5" fill="#bfe3ff"/>';
        return glow(86, 256) + '<rect x="82" y="242" width="8" height="30" rx="4" fill="#ff4a40"/>';
      } },
    { id: 'farol-angular', slot: 'luzes', name: 'Farol angular', note: 'Faróis angulares de luz azulada.',
      draw: function (i) {
        if (i === 0) return BEAM + '<path d="M786 253 L832 259 L830 274 L790 272 Z" fill="#dff3ff" stroke="#7aa9c4" stroke-width="1.5" stroke-linejoin="round"/>';
        return glow(90, 256) + '<path d="M80 244 L104 249 L102 270 L80 266 Z" fill="#d12a31" stroke="#8e1a20" stroke-linejoin="round"/>';
      } },

    { id: 'aero-lip', slot: 'aerofolio', name: 'Aba discreta', note: 'Pequena aba no topo do porta-malas.',
      draw: function () { return '<path d="M82 245 L100 236 L142 223 L147 227 L112 242 Q96 248 82 245 Z" fill="' + CARBON + '"/>'; } },
    { id: 'aero-asa', slot: 'aerofolio', name: 'Asa de corrida', note: 'Asa alta com suportes duplos.',
      draw: function () {
        return '<rect x="100" y="214" width="6" height="26" fill="#20252a"/><rect x="128" y="205" width="6" height="26" fill="#20252a"/>' +
          '<path d="M64 197 L178 188 L180 206 Q120 214 70 212 Z" fill="#20252a"/><path d="M72 204 L174 196" stroke="#8fa0ae" stroke-width="2.5" stroke-linecap="round"/>';
      } },
    { id: 'aero-duplo', slot: 'aerofolio', name: 'Asa dupla', note: 'Asa de dois planos com acabamento nas pontas.',
      draw: function () {
        return '<rect x="102" y="216" width="6" height="24" fill="#20252a"/><rect x="132" y="206" width="6" height="26" fill="#20252a"/>' +
          '<path d="M64 194 L176 186 L178 198 L68 206 Z" fill="#20252a"/><path d="M72 212 L172 204 L174 213 L76 221 Z" fill="#2e353c"/>' +
          '<path d="M62 190 L70 190 L74 224 L66 224 Z" fill="#20252a"/>';
      } },

    { id: 'painel-classico', slot: 'painel', name: 'Volante clássico', note: 'Volante redondo tradicional.',
      draw: function () { return steering(false); } },
    { id: 'painel-esportivo', slot: 'painel', name: 'Volante esportivo', note: 'Volante achatado com marcação de centro.',
      draw: function () { return steering(true); } },
    { id: 'painel-digital', slot: 'painel', name: 'Painel com tela', note: 'Volante e tela sensível ao toque.',
      draw: function () {
        return steering(false) +
          '<g transform="rotate(-26 550 198)"><rect x="542" y="186" width="16" height="22" rx="2.5" fill="#0c2231" stroke="#42596a"/>' +
          '<rect x="545" y="190" width="10" height="2.5" rx="1" fill="#59d0ff"/><rect x="545" y="195" width="7" height="2.5" rx="1" fill="#59d0ff" opacity=".7"/><rect x="545" y="200" width="9" height="2.5" rx="1" fill="#59d0ff" opacity=".5"/></g>';
      } },

    { id: 'motor-java', slot: 'motor', name: 'Motor Java', note: 'Quatro cilindros: robusto e muito usado em sistemas grandes (Java, Spring).',
      draw: function () {
        var s = bay(678, 246, 116, 50) + '<rect x="694" y="269" width="84" height="22" rx="3" fill="#86919b"/>';
        for (var k = 0; k < 4; k++) {
          s += '<rect class="pist" style="animation-delay:' + (k * 0.14).toFixed(2) + 's" x="698" y="256" width="14" height="14" rx="2" transform="translate(' + (k * 20) + ' 0)" fill="#e0524a"/>';
        }
        return motorWrap(s);
      } },
    { id: 'motor-python', slot: 'motor', name: 'Motor Python', note: 'Seis cilindros: fácil de ler e rápido de começar (Python, Flask).',
      draw: function () {
        var s = bay(678, 246, 116, 50) + '<rect x="692" y="272" width="88" height="19" rx="3" fill="#3b6ea5"/>';
        for (var k = 0; k < 3; k++) {
          s += '<rect class="pist" style="animation-delay:' + (k * 0.16).toFixed(2) + 's" x="700" y="255" width="20" height="8" rx="2" transform="translate(' + (k * 26) + ' 0)" fill="#f2c94c"/>' +
               '<rect class="pist" style="animation-delay:' + (k * 0.16 + 0.08).toFixed(2) + 's" x="700" y="264" width="20" height="8" rx="2" transform="translate(' + (k * 26) + ' 0)" fill="#e0b13a"/>';
        }
        return motorWrap(s);
      } },
    { id: 'motor-node', slot: 'motor', name: 'Motor Node.js', note: 'Motor elétrico: usa JavaScript também no servidor (Node.js, Express).',
      draw: function () {
        return motorWrap(bay(678, 246, 116, 50) +
          '<rect x="694" y="270" width="86" height="20" rx="4" fill="#3c873a"/>' +
          '<polygon points="742,272 732,282 739,282 736,289 748,277 741,277" fill="#f5f5ec"/>' +
          '<rect x="700" y="254" width="34" height="15" rx="4" fill="#9aa5af"/><rect class="pist" x="738" y="258" width="22" height="8" rx="3" fill="#c9d0d6"/>');
      } },

    { id: 'tanque-sql', slot: 'tanque', name: 'Banco SQL', note: 'Tabelas com linhas e colunas (MySQL, PostgreSQL).',
      draw: function () { return tankWrap(bay(105, 263, 60, 36) + cylinder('#e8963a', '#f4b04d', '')); } },
    { id: 'tanque-nosql', slot: 'tanque', name: 'Banco de documentos', note: 'Documentos flexíveis em formato JSON (MongoDB).',
      draw: function () { return tankWrap(bay(105, 263, 60, 36) + cylinder('#4fae85', '#74c9a2', '{ }')); } },
    { id: 'tanque-nuvem', slot: 'tanque', name: 'Armazenamento na nuvem', note: 'Dados guardados em servidores na nuvem.',
      draw: function () {
        return tankWrap(bay(105, 263, 60, 36) +
          '<path d="M122 292 Q112 292 113 284 Q114 277 123 277 Q125 268 136 270 Q146 267 150 276 Q159 276 159 284 Q159 292 150 292 Z" fill="#7cc0ee"/>');
      } }
  ];

  var BY_ID = {};
  PARTS.forEach(function (p) { BY_ID[p.id] = p; });

  window.GARAGEM = {
    SLOTS: SLOTS, SLOT_ORDER: SLOT_ORDER, KINDS: KINDS, INFO: INFO, PARTS: PARTS, BY_ID: BY_ID
  };
})();
