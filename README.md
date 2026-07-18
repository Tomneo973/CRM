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
    utils.js               <- cles de stockage, get/set localStorage, formatage (dates, montants), helpers generiques
    ui.js                   <- toast(), showM()/closeM() (modales)
    filesystem.js           <- FS.save()/FS.load() (sauvegarde/chargement JSON sur NAS)
    router.js               <- nav(), render(), handleHash() (aiguillage entre les pages)
  modules/
    dashboard.js
    clients.js
    document-lines.js      <- lignes de devis/facture + changement de statut (partage entre devis.js et factures.js)
    devis.js
    factures.js
    retroplanning.js
    signature.js
    validation.js
    achats.js
    bilan.js
    qrfacture.js            <- IBAN, calcul SPC, generation visuelle du bulletin QR
    csvexport.js
    pdf.js                  <- export PDF (devis/facture + QR-facture en derniere page)
    parametres.js
    portal.js               <- pages publiques (lien client : validation, signature)
  app.js                    <- branchement des evenements + demarrage (charge en dernier)
build.py                    <- regenere la version single-file (voir plus bas)
dist/
  onboard-crm-standalone.html   <- version unique auto-suffisante, generee par build.py
```

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
**un fichier qui utilise une fonction doit etre charge apres le fichier qui la definit.**
C'est pour ca que `core/` se charge en premier et `app.js` en tout dernier (il demarre l'app
et a besoin que tout le reste soit deja charge).

## Notes

- Aucune dependance de build n'est necessaire pour utiliser l'app au quotidien — seul
  `build.py` (optionnel) demande Python.
- Le decoupage a ete verifie automatiquement (navigation complete, creation devis/facture,
  export PDF + QR-facture scanne et valide, bascule de theme) : comportement identique au
  fichier unique precedent.
