// SMSMass - registro do app instalavel e botao "Instalar no celular"
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js').catch(function () {});
    });
  }

  var pedidoInstalacao = null;

  function mostrarBotoes(mostrar) {
    var botoes = document.querySelectorAll('.pwa-instalar');
    for (var i = 0; i < botoes.length; i++) {
      botoes[i].style.display = mostrar ? '' : 'none';
    }
  }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    pedidoInstalacao = e;
    mostrarBotoes(true);
  });

  window.addEventListener('appinstalled', function () {
    pedidoInstalacao = null;
    mostrarBotoes(false);
  });

  document.addEventListener('click', function (e) {
    var alvo = e.target.closest ? e.target.closest('.pwa-instalar') : null;
    if (!alvo) { return; }
    e.preventDefault();
    if (!pedidoInstalacao) { return; }
    pedidoInstalacao.prompt();
    pedidoInstalacao.userChoice.then(function () {
      pedidoInstalacao = null;
      mostrarBotoes(false);
    });
  });
})();

// SMSMass - origem da visita (UTM) repassada para o checkout do Kiwify
(function () {
  var CHAVES = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'src', 'sck'];
  var GUARDA = 'smsmass_origem';
  var VALIDADE = 30 * 24 * 60 * 60 * 1000;

  function ler() {
    try {
      var o = JSON.parse(localStorage.getItem(GUARDA) || 'null');
      if (o && o.quando && (Date.now() - o.quando) < VALIDADE) { return o.dados; }
    } catch (e) {}
    return null;
  }

  function salvar(dados) {
    try { localStorage.setItem(GUARDA, JSON.stringify({ quando: Date.now(), dados: dados })); } catch (e) {}
  }

  function nomeDoSite(host) {
    host = host.replace(/^www\./, '').replace(/^(l|lm|m|out)\./, '');
    if (/youtube\.com$|youtu\.be$/.test(host)) { return 'youtube'; }
    if (/instagram\.com$/.test(host)) { return 'instagram'; }
    if (/facebook\.com$|fb\.com$/.test(host)) { return 'facebook'; }
    if (/whatsapp\.com$/.test(host)) { return 'whatsapp'; }
    if (/google\./.test(host)) { return 'google'; }
    if (/bing\.com$/.test(host)) { return 'bing'; }
    return host;
  }

  // 1. Guarda a origem quando a pessoa chega ao site
  var dados = {};
  var achou = false;
  try {
    var params = new URLSearchParams(window.location.search);
    for (var i = 0; i < CHAVES.length; i++) {
      var v = params.get(CHAVES[i]);
      if (v) { dados[CHAVES[i]] = v.slice(0, 100); achou = true; }
    }
    if (!achou && document.referrer) {
      var ref = new URL(document.referrer);
      if (ref.hostname && ref.hostname.replace(/^www\./, '') !== window.location.hostname.replace(/^www\./, '')) {
        var nome = nomeDoSite(ref.hostname);
        dados = { utm_source: nome, utm_medium: /google|bing/.test(nome) ? 'busca' : 'link' };
        achou = true;
      }
    }
  } catch (e) {}
  if (achou) { salvar(dados); }

  // 2. Ao clicar em comprar, leva a origem junto para o Kiwify
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) { return; }
    var origem = ler();
    if (!origem) { return; }
    try {
      var u = new URL(a.href);
      if (!/(^|\.)kiwify\.com\.br$/.test(u.hostname)) { return; }
      for (var k in origem) {
        if (origem.hasOwnProperty(k) && !u.searchParams.get(k)) { u.searchParams.set(k, origem[k]); }
      }
      a.href = u.toString();
    } catch (err) {}
  }, true);
})();
