/**
 * global-search.js — Recherche unifiée sur toutes les entités
 */
var GlobalSearch = (function() {

  function rechercher(query) {
    if (!query || query.length < 2) return [];
    var q = query.toLowerCase();
    var resultats = [];

    // --- Clients ---
    var clients = getStored(STORAGE_KEYS.clients) || [];
    clients.forEach(function(c) {
      var texte = [c.nom, c.prenom, c.entreprise, c.email, c.telephone, c.ville].join(' ').toLowerCase();
      if (texte.indexOf(q) !== -1) {
        resultats.push({
          type: 'client',
          label: (c.entreprise || (c.prenom + ' ' + c.nom)),
          detail: c.email || c.telephone || '',
          href: '#clients/' + c.id
        });
      }
    });

    // --- Factures ---
    var factures = getStored(STORAGE_KEYS.factures) || [];
    factures.forEach(function(f) {
      var texte = [f.numero, f.objet || ''].join(' ').toLowerCase();
      // Inclure le nom du client
      var client = clients.find(function(c) { return c.id === f.client_id; });
      if (client) texte += ' ' + [client.nom, client.prenom, client.entreprise].join(' ').toLowerCase();
      if (texte.indexOf(q) !== -1) {
        resultats.push({
          type: 'facture',
          label: 'Facture ' + f.numero,
          detail: formatMoney(f.total) + ' — ' + (client ? (client.entreprise || client.prenom + ' ' + client.nom) : ''),
          href: '#factures/' + f.id
        });
      }
    });

    // --- Devis ---
    var devis = getStored(STORAGE_KEYS.devis) || [];
    devis.forEach(function(d) {
      var texte = [d.numero, d.objet || ''].join(' ').toLowerCase();
      var client = clients.find(function(c) { return c.id === d.client_id; });
      if (client) texte += ' ' + [client.nom, client.prenom, client.entreprise].join(' ').toLowerCase();
      if (texte.indexOf(q) !== -1) {
        resultats.push({
          type: 'devis',
          label: 'Devis ' + d.numero,
          detail: formatMoney(d.total) + ' — ' + (client ? (client.entreprise || client.prenom + ' ' + client.nom) : ''),
          href: '#devis/' + d.id
        });
      }
    });

    // --- Achats ---
    var achats = getStored(STORAGE_KEYS.achats) || [];
    achats.forEach(function(a) {
      var texte = [a.numero, a.fournisseur, a.description || ''].join(' ').toLowerCase();
      if (texte.indexOf(q) !== -1) {
        resultats.push({
          type: 'achat',
          label: 'Achat ' + (a.numero || a.fournisseur),
          detail: formatMoney(a.total) + ' — ' + (a.fournisseur || ''),
          href: '#achats/' + a.id
        });
      }
    });

    // --- Projets / Tâches (retroplanning) ---
    var projets = getStored(STORAGE_KEYS.retroplanning) || [];
    projets.forEach(function(p) {
      var texte = [p.nom, p.description || '', p.client_nom || ''].join(' ').toLowerCase();
      if (texte.indexOf(q) !== -1) {
        resultats.push({
          type: 'projet',
          label: p.nom,
          detail: p.client_nom || 'Projet',
          href: '#retroplanning'
        });
      }
    });

    // Limiter à 20 résultats
    return resultats.slice(0, 20);
  }

  function renderResultats(container, resultats) {
    if (!container) return;
    if (resultats.length === 0) {
      container.innerHTML = '<div class="gs-no-result">Aucun résultat</div>';
      return;
    }

    var icons = {
      client: '👤',
      facture: '🧾',
      devis: '📋',
      achat: '🛒',
      projet: '📁'
    };

    var html = resultats.map(function(r) {
      return '<a href="' + r.href + '" class="gs-result-item" onclick="GlobalSearch.close()">' +
        '<span class="gs-icon">' + (icons[r.type] || '📄') + '</span>' +
        '<span class="gs-info"><strong>' + escapeHtml(r.label) + '</strong><br><small>' + escapeHtml(r.detail) + '</small></span>' +
        '</a>';
    }).join('');

    container.innerHTML = html;
  }

  function close() {
    var dropdown = document.getElementById('gs-dropdown');
    var input = document.getElementById('gs-input');
    if (dropdown) dropdown.style.display = 'none';
    if (input) input.value = '';
  }

  function init() {
    var input = document.getElementById('gs-input');
    var dropdown = document.getElementById('gs-dropdown');
    if (!input || !dropdown) return;

    var timer = null;
    input.addEventListener('input', function() {
      clearTimeout(timer);
      var val = this.value.trim();
      if (val.length < 2) {
        dropdown.style.display = 'none';
        return;
      }
      timer = setTimeout(function() {
        var results = rechercher(val);
        renderResultats(dropdown, results);
        dropdown.style.display = 'block';
      }, 200);
    });

    input.addEventListener('focus', function() {
      if (this.value.trim().length >= 2) {
        dropdown.style.display = 'block';
      }
    });

    document.addEventListener('click', function(e) {
      if (!e.target.closest('#gs-container')) {
        dropdown.style.display = 'none';
      }
    });

    // Raccourci clavier : Ctrl+K ou Cmd+K
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        input.focus();
      }
      if (e.key === 'Escape') {
        close();
      }
    });
  }

  return { init: init, close: close, rechercher: rechercher };
})();
