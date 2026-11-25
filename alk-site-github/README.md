# ALK Hospitality & Development: alk-hospitality.com

Site en deux pages (accueil et carte), en anglais, français et arabe.

## Ce que l'on modifie depuis l'admin (Pages CMS)

Connecte-toi sur https://app.pagescms.org avec ton compte GitHub, puis ouvre le dépôt du site.

| Menu de l'admin | Fichier | Contenu |
|---|---|---|
| Réglages (paiement, formulaire, calendrier) | `content/settings.json` | lien de paiement Revolut, adresse Formspree, lien Calendly |
| Lieux sur la carte | `content/places.json` | nom, statut, type, photo, description (FR / EN / AR), position, liens |
| Photos de « Notre histoire » | `content/gallery.json` | photos et leur courte description |

Chaque enregistrement dans l'admin met le site à jour en une à deux minutes.

- **Paiement** : le parcours « Ouvrir votre dossier » reste en mode démo tant que le lien Revolut ET l'adresse Formspree ne sont pas remplis tous les deux. Le montant (1000 $) se règle dans Revolut ; il n'est jamais écrit sur le site.
- **Photos** : formats jpg, png ou webp, idéalement au moins 1200 px de large. Elles sont enregistrées dans `img/`.
- **Position d'un lieu** : dans Google Maps, fais un clic droit sur le lieu. Le premier nombre est la latitude, le second la longitude.
- **Statut à confirmer** : tant que la case est cochée, le point reste gris. Décoche-la une fois le statut confirmé.

Les textes du site (titres, histoire, services) sont dans `site.js` (objet `T`, une partie par langue).

## Couleurs de la carte

| Statut | Couleur | Sens |
|---|---|---|
| Réalisé | champagne, point plein | projet terminé |
| Projet en cours | bronze, anneau | visite faite, projet en cours |
| Dossier ouvert | sable, pointillés | dossier payé, visite à venir |
| Nos maisons | ivoire | Jouri, Les Secrets, 80% |

## Fichiers

- `index.html` : accueil. `map.html` : carte et formulaire.
- `site.js` : textes en 3 langues et chargement du contenu. `site.css` : style commun.
- `content/` : contenu modifiable depuis l'admin. `img/` : photos.
- `.pages.yml` : configuration de l'admin. `CNAME` : nom de domaine (alk-hospitality.com).
- `.nojekyll` : indique à GitHub Pages de publier les fichiers tels quels.
