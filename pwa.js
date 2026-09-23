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
