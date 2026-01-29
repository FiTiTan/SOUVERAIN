# Ralph Loop - Localisation des Rapports et Comptes Rendus

## 📍 Emplacement des Rapports

### 1. Logs d'Exécution
Les logs d'exécution Ralph sont stockés dans le dossier du projet où la loop est lancée:

```
{PROJET}/logs/ralph.log
```

**Exemple pour SOUVERAIN**:
```
C:\Users\jltsm\Desktop\SOUVERAIN\logs\ralph.log
```

### 2. Fichiers de Session
Les sessions Ralph sont persistées localement dans le projet:

```
{PROJET}/.ralph_session          # Session courante
{PROJET}/.ralph_session_history  # Historique (50 dernières transitions)
```

**Exemple pour SOUVERAIN**:
```
C:\Users\jltsm\Desktop\SOUVERAIN\.ralph_session
C:\Users\jltsm\Desktop\SOUVERAIN\.ralph_session_history
```

### 3. Installation Ralph
Ralph est installé globalement dans:

```
C:\Users\jltsm\ralph-claude-code\
```

**Structure**:
```
ralph-claude-code/
├── logs/                    # Logs d'installation (vide si non utilisé)
├── ralph_loop.sh            # Script principal
├── ralph_import.sh          # Import PRD
├── ralph_monitor.sh         # Monitoring
├── lib/                     # Bibliothèques
├── templates/               # Templates PRD
└── README.md                # Documentation
```

---

## 📊 Que Contiennent les Rapports?

### ralph.log (Logs d'Exécution)
Contient pour chaque itération de la loop:
- Timestamp de l'itération
- Status de l'itération (success, error, in_progress)
- Réponse de Claude Code
- Détection d'erreurs ou de blocages
- Signaux de sortie (EXIT_SIGNAL)
- État du circuit breaker
- Compteurs de rate limiting

**Format**:
```
[2026-01-20 18:40:23] ITERATION 1 - START
[2026-01-20 18:40:45] Claude response: {...}
[2026-01-20 18:40:45] Exit detection: completion_indicator=true, exit_signal=false
[2026-01-20 18:40:45] ITERATION 1 - CONTINUE (work in progress)
```

### .ralph_session (Session Courante)
Contient:
- ID de session Claude Code
- Timestamp de début
- Timestamp de dernière activité
- État de la session (active, expired, completed)

**Format JSON**:
```json
{
  "session_id": "abc123...",
  "started_at": 1737389423,
  "last_active": 1737390123,
  "status": "active"
}
```

### .ralph_session_history (Historique)
Contient les 50 dernières transitions de session:
- Changements d'état
- Raisons de reset
- Timestamps

**Format**:
```
2026-01-20 18:40:23 | SESSION_START | session_id=abc123
2026-01-20 18:45:30 | ITERATION_1 | status=success
2026-01-20 18:50:12 | ITERATION_2 | status=success
2026-01-20 18:55:00 | SESSION_RESET | reason=completion
```

---

## 🔍 Comment Consulter les Rapports?

### Option 1: Via le Dashboard Ralph (Recommandé)
```bash
# Lancer le monitoring en temps réel
ralph-monitor
```

**Affiche**:
- Status de la loop (running, stopped, error)
- Nombre d'itérations
- Derniers logs
- État du circuit breaker
- Compteurs API

### Option 2: Inspection Manuelle des Logs

#### Windows (PowerShell)
```powershell
# Voir les dernières lignes
Get-Content logs\ralph.log -Tail 50

# Suivre en temps réel
Get-Content logs\ralph.log -Wait -Tail 10
```

#### Git Bash / WSL
```bash
# Voir les dernières lignes
tail -n 50 logs/ralph.log

# Suivre en temps réel
tail -f logs/ralph.log
```

### Option 3: Vérification de Session
```bash
# Voir la session courante
cat .ralph_session

# Voir l'historique
cat .ralph_session_history
```

---

## 📁 Créer les Dossiers de Logs (si absents)

Si le dossier `logs/` n'existe pas encore dans votre projet SOUVERAIN:

```bash
# Créer le dossier
mkdir -p logs

# Créer un fichier log vide
touch logs/ralph.log
```

Ralph créera automatiquement ces fichiers au premier lancement, mais vous pouvez les préparer manuellement.

---

## 🗂️ Structure Complète des Rapports Ralph

```
SOUVERAIN/                              # Votre projet
├── logs/
│   └── ralph.log                       # ← Logs d'exécution Ralph
├── .ralph_session                      # ← Session courante
├── .ralph_session_history              # ← Historique sessions
├── .git/                               # Git repo
├── src/                                # Code source
└── ...

C:\Users\jltsm\ralph-claude-code\       # Installation globale Ralph
├── ralph_loop.sh                       # Script principal
├── ralph_monitor.sh                    # Dashboard monitoring
├── logs/                               # Logs d'installation (vide)
└── ...
```

---

## 📋 Exemples de Rapports

### Exemple: ralph.log (Succès)
```
[2026-01-20 18:40:00] Ralph Loop v0.9.9 - Starting
[2026-01-20 18:40:00] Project: SOUVERAIN
[2026-01-20 18:40:00] Prompt: Reprend le travail commencé via le brief...
[2026-01-20 18:40:00] Session: continuing (session_id=abc123)
[2026-01-20 18:40:00] ---
[2026-01-20 18:40:00] ITERATION 1 - START
[2026-01-20 18:40:45] Claude response received (12,543 tokens)
[2026-01-20 18:40:45] Todo analysis: 9 tasks, 9 completed
[2026-01-20 18:40:45] Completion indicators: ✅
[2026-01-20 18:40:45] EXIT_SIGNAL: ✅ true
[2026-01-20 18:40:45] ITERATION 1 - COMPLETE
[2026-01-20 18:40:45] ---
[2026-01-20 18:40:45] Loop completed successfully
[2026-01-20 18:40:45] Total iterations: 1
[2026-01-20 18:40:45] Duration: 45 seconds
[2026-01-20 18:40:45] EXIT_SIGNAL: Loop exited cleanly
```

### Exemple: ralph.log (Blocage Détecté)
```
[2026-01-20 19:00:00] ITERATION 1 - START
[2026-01-20 19:00:30] Claude response received (8,234 tokens)
[2026-01-20 19:00:30] Error detected: "npm ERR! code ENOENT"
[2026-01-20 19:00:30] ITERATION 1 - ERROR
[2026-01-20 19:00:30] ---
[2026-01-20 19:00:30] ITERATION 2 - START
[2026-01-20 19:01:00] Claude response received (8,234 tokens)
[2026-01-20 19:01:00] Error detected: "npm ERR! code ENOENT" (DUPLICATE)
[2026-01-20 19:01:00] Circuit breaker: stuck loop detected (same error twice)
[2026-01-20 19:01:00] ITERATION 2 - ABORT
[2026-01-20 19:01:00] ---
[2026-01-20 19:01:00] Loop stopped: circuit breaker open
[2026-01-20 19:01:00] Reason: Stuck in error loop
[2026-01-20 19:01:00] Action required: Manual intervention needed
```

### Exemple: .ralph_session
```json
{
  "session_id": "abc123def456",
  "started_at": 1737389423,
  "last_active": 1737390123,
  "status": "active",
  "iterations": 1,
  "project": "SOUVERAIN"
}
```

### Exemple: .ralph_session_history
```
2026-01-20 18:40:00 | SESSION_START | session_id=abc123, project=SOUVERAIN
2026-01-20 18:40:45 | ITERATION_1 | status=complete, exit_signal=true
2026-01-20 18:40:45 | SESSION_COMPLETE | reason=exit_signal, duration=45s
2026-01-20 18:40:45 | SESSION_RESET | trigger=completion
```

---

## 🛠️ Commandes Utiles

### Monitoring
```bash
# Dashboard temps réel
ralph-monitor

# Logs en temps réel (alternative)
tail -f logs/ralph.log
```

### Inspection
```bash
# Dernières 50 lignes de log
tail -n 50 logs/ralph.log

# Chercher une erreur spécifique
grep "ERROR" logs/ralph.log

# Compter les itérations
grep "ITERATION.*START" logs/ralph.log | wc -l

# Voir la session courante
cat .ralph_session | jq .

# Historique complet
cat .ralph_session_history
```

### Nettoyage
```bash
# Nettoyer les logs
rm -f logs/ralph.log

# Réinitialiser la session
rm -f .ralph_session .ralph_session_history
```

---

## 🔔 Notifications et Alertes

Ralph peut émettre des notifications selon l'état de la loop:

### États Possibles
- **SUCCESS** - Loop terminée avec succès (EXIT_SIGNAL reçu)
- **ERROR** - Erreur détectée, loop stoppée
- **TIMEOUT** - Session expirée (défaut: 24h)
- **CIRCUIT_BREAKER** - Boucle infinie détectée
- **RATE_LIMIT** - Limite API atteinte (100 calls/h)

### Où Voir les Alertes?
1. **Dashboard ralph-monitor** - Affichage en temps réel
2. **Logs ralph.log** - Ligne avec "ALERT" ou "WARNING"
3. **Terminal** - Si loop lancée en foreground

---

## 📝 Configuration des Logs

### Variables d'Environnement
```bash
# Niveau de verbosité (DEBUG, INFO, WARNING, ERROR)
export RALPH_LOG_LEVEL=INFO

# Rotation des logs (taille max)
export RALPH_LOG_MAX_SIZE=10M

# Durée de rétention
export RALPH_LOG_RETENTION_DAYS=30
```

### Fichier de Configuration
```bash
# .ralph_config (dans le projet)
LOG_LEVEL=DEBUG
LOG_FILE=logs/ralph.log
SESSION_TIMEOUT=86400  # 24 heures
RATE_LIMIT=100         # 100 calls/heure
```

---

## ✅ Checklist Post-Loop

Après une exécution Ralph, vérifier:

- [ ] `logs/ralph.log` - Pas d'erreurs
- [ ] `.ralph_session` - Status = completed
- [ ] `.ralph_session_history` - Dernière entrée = SUCCESS
- [ ] Git status - Changements committés
- [ ] Tests - Tous passent
- [ ] Build - Réussi

---

## 🆘 Dépannage

### Problème: Pas de fichier ralph.log
**Solution**:
```bash
mkdir -p logs
touch logs/ralph.log
```

### Problème: Session expirée
**Solution**:
```bash
rm -f .ralph_session
# Ralph créera une nouvelle session au prochain lancement
```

### Problème: Logs trop volumineux
**Solution**:
```bash
# Archiver les anciens logs
mv logs/ralph.log logs/ralph.log.$(date +%Y%m%d)

# Compresser
gzip logs/ralph.log.*
```

---

## 📚 Ressources

- **Documentation Ralph**: `/c/Users/jltsm/ralph-claude-code/README.md`
- **Tests Ralph**: `/c/Users/jltsm/ralph-claude-code/tests/`
- **Templates PRD**: `/c/Users/jltsm/ralph-claude-code/templates/`

---

**Dernière mise à jour**: Janvier 2026
**Version Ralph**: v0.9.9
**Projet**: SOUVERAIN
