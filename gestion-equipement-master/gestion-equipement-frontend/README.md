# Gestion Equipement - Frontend (prototype)

Prototype Angular pour l'application de gestion de location et vente
d'equipement (quincaillerie et machinerie). Fonctionne entierement sur des
donnees mock (fichiers JSON locaux) en attendant la connexion au backend
Spring Boot.

## Mise en route

**Option A - projet deja existant (`ng new` fait ailleurs)**
Copiez le contenu de `src/app/`, `src/assets/data/`, `src/styles.css` et
`src/index.html` dans votre projet Angular existant, en ecrasant les
fichiers par defaut.

**Option B - reconstituer ce projet tel quel**
```bash
npm install
ng serve
```
Puis ouvrez http://localhost:4200. Testez avec l'un des comptes listes sur
l'ecran de connexion (mot de passe commun : `Password123!`).

## Architecture

```
src/app/
  core/
    models/      interfaces TypeScript + enums, alignes sur les DTOs Java
    services/    logique metier + acces aux donnees (mock pour l'instant)
    guards/       authGuard (connexion requise) et roleGuard (par role)
  shared/
    components/  navbar, barre de recherche, badge de statut, shell de mise en page
  features/
    login/ dashboard/ categories/ machines/ articles/
    clients/ employes/ locations/ ventes/
```

Chaque page "liste" suit le meme schema : `app-search-bar` +
`computed()` pour le filtrage + tableau + modale de creation/edition.

## Donnees mock -> backend reel

Chaque service etend `MockCrudService<T>` (voir
`core/services/mock-crud.service.ts`), qui charge un fichier JSON une
seule fois puis garde tout en memoire (les modifications ne survivent
pas a un rafraichissement de page - c'est normal pour un prototype).

Pour connecter un service au vrai backend :

1. Remplacer l'URL du constructeur (`assets/data/xxx.json`) par l'URL
   reelle de l'API (`http://localhost:8080/api/xxx`).
2. Remplacer les methodes `create`/`update`/`delete` de
   `MockCrudService` par de vrais appels `this.http.post/put/delete(...)`
   vers l'API (les signatures publiques utilisees par les composants
   n'ont pas besoin de changer).
3. Ajouter un intercepteur HTTP qui attache le token JWT
   (`Authorization: Bearer ...`) a chaque requete - `AuthService` devra
   alors stocker le vrai token recu de `/api/auth/login` au lieu de
   l'utilisateur simule.
4. Les regles metier dupliquees ici (verification de disponibilite
   d'une machine, validation matricule fiscal/CIN selon le type de
   client, calcul des totaux de vente) existent deja cote backend - une
   fois connecte, elles deviennent redondantes cote frontend mais
   peuvent rester comme validation "optimiste" cote client pour un
   retour immediat a l'utilisateur, tant que le backend reste la
   source de verite finale.

## Limitations connues du prototype

- Pas de persistance reelle (donnees reinitialisees au rechargement).
- Le mot de passe est stocke et compare en clair dans
  `EmployeService`/`AuthService` - le vrai backend utilise BCrypt et ne
  renvoie jamais le mot de passe (voir le commentaire dans
  `employe.model.ts`). Ne jamais reproduire ce pattern cote backend.
- Pas de gestion des entites secondaires du diagramme de classes complet
  (Entrepot, Adresse, Fournisseur, Maintenance, Paiement, Affectation) -
  hors scope du prototype, a ajouter si le temps du stage le permet.
