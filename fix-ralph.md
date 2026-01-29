MISSION AUDIT COMPLET MODULE PORTFOLIO

Tu dois faire un etat des lieux exhaustif de la partie Portfolio de l application SOUVERAIN.
Ne modifie rien. Analyse et documente seulement.

ANALYSE DEMANDEE

1 STRUCTURE DES FICHIERS
Liste tous les fichiers dans src components portfolio et sous-dossiers
Liste tous les fichiers dans src services lies au portfolio
Liste tous les fichiers dans src types lies au portfolio
Indique pour chaque fichier son role en une ligne

2 SCHEMA BASE DE DONNEES
Trouve le fichier de schema ou migration SQL
Liste toutes les tables liees au portfolio
Pour chaque table liste les colonnes et leurs types
Indique les relations entre tables

3 COMPOSANTS UI
Pour chaque composant React du module portfolio indique
- Son nom
- Son role
- Les props qu il recoit
- Les autres composants qu il utilise
- Les services qu il appelle

4 SERVICES
Pour chaque service lie au portfolio indique
- Son nom
- Les fonctions qu il expose
- Ce que chaque fonction fait en une ligne
- Les appels a la base de donnees
- Les appels a Ollama si existants

5 FLOW UTILISATEUR ACTUEL
Decris etape par etape ce qui se passe quand
- L utilisateur ouvre le module portfolio
- L utilisateur cree un nouveau projet
- L utilisateur edite un projet existant
- L utilisateur accede a la mediatheque
- L utilisateur gere ses comptes externes
- L utilisateur exporte ou publie

6 ETAT DE L IA CONVERSATIONNELLE
Existe-t-il un composant de chat ou conversation avec l IA
Si oui ou est-il et comment fonctionne-t-il
Est-il integre au flow de creation de projet
Y a-t-il des prompts Ollama definis pour le portfolio

7 ETAT DE L ANONYMISATION
Existe-t-il un service d anonymisation
Si oui comment fonctionne-t-il
Est-il integre au flow de creation de projet
Y a-t-il une table anonymization_maps

8 BUGS ET ERREURS VISIBLES
Cherche dans le code les TODO FIXME ou commentaires d erreur
Identifie les fonctions non implementees placeholder
Note les imports manquants ou erreurs evidentes

9 ECARTS AVEC LE MASTER PLAN
Compare l etat actuel avec le fichier SOUVERAIN-MASTER-PLAN.md si present
Liste ce qui est implemente
Liste ce qui manque
Liste ce qui est implemente differemment

FORMAT DE SORTIE

Genere un fichier AUDIT-PORTFOLIO.md a la racine du projet avec toutes ces informations structurees clairement.

Ne propose aucune correction dans cet audit.
L objectif est uniquement de documenter l etat actuel.