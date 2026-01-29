CORRECTION URGENTE MODULE PROJETS

PROBLEME CONSTATE
Tu as garde l ancien formulaire de creation de projet Format Excellence avec les champs Titre Contexte Defi Solution Resultat.
Tu as cree un onglet Identite et Reseaux separe qui n est pas integre.
L IA conversationnelle n existe pas.
Le flow prevu n est pas implemente.

CE QUI DOIT ETRE SUPPRIME
1. Le formulaire modal Nouveau Projet Format Excellence avec ses 5 champs textarea
2. La separation en deux onglets Projets et Identite Reseaux

CE QUI DOIT ETRE IMPLEMENTE A LA PLACE

NOUVEAU FLOW CREATION DE PROJET

Etape 1 CHOIX DU TYPE
Quand user clique Nouveau Projet afficher un choix simple
- Mission client
- Projet personnel
- Collaboration
- Formation
- Concours
- Contribution open source

Etape 2 IMPORT FICHIERS
Zone drag and drop pour importer des fichiers
Bouton Ajouter depuis la mediatheque
Les fichiers importes ici vont aussi dans la mediatheque globale

Etape 3 ANONYMISATION
Avant d envoyer a l IA le systeme anonymise automatiquement
- Detecte noms personnes entreprises adresses montants
- Remplace par tokens PERSON_1 COMPANY_1 etc
- Affiche message de reassurance a l utilisateur

Etape 4 IA CONVERSATIONNELLE
Interface type chat
L IA pose des questions une par une pour comprendre le projet
Elle recoit uniquement les donnees anonymisees
Exemple de conversation :

IA : J ai analyse tes fichiers. C est un projet pour quel type de client
User : Une boulangerie

IA : Quel etait le besoin principal
User : Refaire leur vitrine et ajouter la commande en ligne

IA : Qu est ce que tu as fait concretement
User : Design sur Figma puis dev React

IA : Ca a dure combien de temps
User : 3 semaines

IA : J ai assez d infos. Je genere ta fiche projet.

Etape 5 FICHE PROJET GENEREE
L IA genere une fiche complete avec
- Titre
- Resume
- Sections Contexte Realisation Resultat
- Medias associes
La fiche est editable inline style Notion
Les vraies valeurs sont reinjectees pour l affichage

PAS DE FORMULAIRE CLASSIQUE
L utilisateur ne remplit JAMAIS de formulaire avec des champs vides
C est l IA qui pose les questions et genere le contenu

REORGANISATION DE L INTERFACE

Onglet unique PROJETS contenant
- Liste des projets existants
- Bouton Nouveau Projet qui lance le flow ci dessus

La partie IDENTITE doit etre dans les parametres du portfolio pas un onglet separe
- Nom complet
- Tagline
- Bio courte

La partie RESEAUX COMPTES EXTERNES reste dans l onglet Comptes

La partie PALETTES DE STYLE doit apparaitre
- Soit dans les parametres du portfolio
- Soit au moment de l export et preview
- Pas melangee avec l identite

La partie PUBLICATION reste mais doit etre fonctionnelle
- Corriger l erreur window.electron.invoke is not a function

STRUCTURE DES COMPOSANTS A REFAIRE

ProjectCreationWizard.tsx
Orchestre le flow complet en 5 etapes

ProjectTypeSelector.tsx
Choix du type de projet etape 1

ProjectFileImporter.tsx
Import de fichiers avec drag drop etape 2

AnonymizationProcessor.tsx
Traitement anonymisation avec message user etape 3

ProjectAIChat.tsx
Interface conversationnelle avec l IA etape 4

ProjectGeneratedEditor.tsx
Fiche projet generee et editable etape 5

SERVICES NECESSAIRES

projectAIService.ts
- analyzeFiles analyse les fichiers uploades
- generateQuestion genere la prochaine question
- processAnswer traite la reponse utilisateur
- generateProjectContent genere la fiche finale

anonymizationService.ts
- detectEntities detecte les entites sensibles
- anonymize remplace par tokens
- deanonymize reinjecte les vraies valeurs

PRIORITE
1. Supprimer l ancien formulaire modal
2. Implementer le flow en 5 etapes
3. Creer l interface IA conversationnelle
4. Integrer l anonymisation
5. Reorganiser les onglets et sections

Commence par me montrer la nouvelle structure de composants avant d implementer.