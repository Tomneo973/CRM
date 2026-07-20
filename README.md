# OnboardCRM — structure modulaire

## Arborescence

```
index.html              <- app modulaire (a ouvrir directement, double-clic OU via serveur)
css/
  styles.css             <- tout le CSS (variables theme clair/sombre incluses)
js/
  lib/
    qrcode.min.js         <- encodeur QR vendorise (qrcode-generator, MIT, aucune dependance externe)
  core/
    utils.js               <- cles de stockage, get/set localStorage, formatage (dates, montants), helpers paiements
    ui.js                   <- toast(), showM()/closeM() (modales)
    filesystem.js           <- FS.save()/FS.load() (sauvegarde/chargement JSON sur NAS)
    router.js               <- nav(), render(), handleHash(), detection auto des factures en retard, recherche globale
  modules/
    dashboard.js
    clients.js
    document-lines.js      <- lignes de devis/facture (avec remise en ligne) + changement de statut
    devis.js
    factures.js             <- paiements partiels (acomptes), relances, solde du
    projets.js              <- planning (Gantt) + validation client, fusionnes dans un seul module
    signature.js
    achats.js
    bilan.js                 <- TVA a reverser (estimee), export PDF du bilan
    qrfacture.js             <- IBAN, calcul SPC, generation visuelle du bulletin QR
    csvexport.js             <- export CSV devis/factures/achats/clients
    pdf.js                   <- export PDF (devis/facture + paiements + QR-facture en derniere page)
    parametres.js            <- entreprise, logo, methode TVA, QR-facture, sauvegarde
    portal.js                <- pages publiques (lien client : validation, signature)
  app.js                    <- branchement des evenements + demarrage (charge en dernier)
build.py                    <- regenere la version single-file (voir plus bas)
dist/
  onboard-crm-standalone.html   <- version unique auto-suffisante, generee par build.py
```

## Nouveautes de cette mise a jour

**Factures & devis**
- Paiements partiels (acomptes) sur les factures : bouton "Enregistrer un paiement" sur la page facture, historique des paiements, solde du calcule automatiquement. Le statut passe seul a "Paiement partiel" puis "Payee" des que le solde atteint 0.
- Relances automatiques : une facture envoyee dont l'echeance est depassee passe automatiquement en statut "En retard" (recalcule a chaque navigation). Bouton "Relancer le client" qui ouvre un e-mail pre-rempli et journalise la date de la derniere relance.
- Remise/rabais en ligne de devis et de facture : nouveau champ "Remise %" par ligne, repercute automatiquement sur le total HT/TVA/TTC et sur le PDF.

**Bilan & comptabilite**
- Estimation de la TVA a reverser, par trimestre, dans le Bilan annuel. Deux methodes au choix dans Parametres : "contre prestations facturees" (a la date de facture) ou "contre encaissements" (a la date de paiement recu). Reste indicatif — ne remplace pas le decompte officiel aupres de l'AFC.
- Export du Bilan annuel en PDF (en plus du CSV existant), incluant le detail TVA par trimestre.

**Confort d'usage**
- Recherche globale dans l'en-tete (clients, devis, factures, achats, projets), avec resultats instantanes au fil de la frappe. Raccourci clavier `/` pour y acceder rapidement.
- Export CSV des clients (bouton dans la page Clients), en plus des exports devis/factures/achats deja existants.
- Tableau de bord : nouvelles cartes "Factures en retard" (avec relance en un clic) et "Projets en cours" (issues du module Projets), en plus des "Etapes a valider" deja presentes.

## Usage au quotidien

- **En local (double-clic)** : ouvrez `index.html`. Ca fonctionne directement en `file://`,
  testé sans serveur.
- **Via le NAS (http://...)** : deposez tout le dossier tel quel, ouvrez `index.html` depuis le navigateur.
- **Besoin d'un seul fichier** (envoi par email, cle USB, sauvegarde) : utilisez
  `dist/onboard-crm-standalone.html`, qui contient tout (identique a l'ancien fichier unique).

## Modifier le code

1. Editez le fichier du module concerne dans `js/modules/` (ou `js/core/` pour le socle commun).
2. Testez directement en rechargeant `index.html` dans le navigateur.
3. Quand vous etes satisfait, regenerez la version single-file :

   ```
   python3 build.py
   ```

   (Python 3 standard, aucune installation requise.) Ca met a jour
   `dist/onboard-crm-standalone.html` a partir des fichiers sources.

## Ordre de chargement (important si vous ajoutez un module)

Les fichiers sont de simples scripts classiques (pas de `type="module"`), donc toutes les
fonctions/constantes qu'ils declarent sont partagees globalement entre tous les fichiers,
exactement comme avant quand tout etait dans un seul `<script>`. La seule regle a respecter :
**un fichier qui utilise une fonction doit etre charge apres le fichier qui la definit**
(a l'exception des fonctions appelees uniquement via des gestionnaires d'evenements/`onclick`,
qui ne s'executent qu'apres le chargement complet de la page). C'est pour ca que `core/` se
charge en premier et `app.js` en tout dernier (il demarre l'app et a besoin que tout le reste
soit deja charge).

## Compatibilite des donnees existantes

Vos fichiers JSON de sauvegarde precedents se chargent sans modification : les factures qui
n'ont pas encore de tableau `paiements`/`relances` sont traitees comme "aucun paiement enregistre"
et fonctionnent normalement (le premier paiement ajoute cree le tableau automatiquement). Les
lignes de devis/factures sans champ `remise` sont traitees comme une remise de 0%.

## Notes

- Aucune dependance de build n'est necessaire pour utiliser l'app au quotidien — seul
  `build.py` (optionnel) demande Python.
