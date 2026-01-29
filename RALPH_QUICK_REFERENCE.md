# Ralph Loop - Référence Rapide

## 📍 Emplacements Clés

| Fichier | Emplacement | Description |
|---------|-------------|-------------|
| **Logs d'exécution** | `logs/ralph.log` | Historique détaillé de la loop |
| **Session courante** | `.ralph_session` | État de la session active |
| **Historique sessions** | `.ralph_session_history` | 50 dernières transitions |
| **Installation Ralph** | `C:\Users\jltsm\ralph-claude-code\` | Scripts et templates |

## 🚀 Commandes Essentielles

### Lancer Ralph Loop
```bash
# Nouveau démarrage
ralph-loop "Votre prompt ici"

# Continuer session existante
ralph-loop --continue "Suite du travail"

# Import PRD
ralph-import mon_brief.md
```

### Monitoring
```bash
# Dashboard temps réel
ralph-monitor

# Logs en direct
tail -f logs/ralph.log

# Dernières 50 lignes
tail -n 50 logs/ralph.log
```

### Inspection
```bash
# Session courante
cat .ralph_session

# Historique
cat .ralph_session_history

# Chercher erreurs
grep "ERROR" logs/ralph.log

# Compter itérations
grep "ITERATION.*START" logs/ralph.log | wc -l
```

### Nettoyage
```bash
# Réinitialiser session
rm -f .ralph_session .ralph_session_history

# Nettoyer logs
rm -f logs/ralph.log

# Tout nettoyer
rm -rf logs .ralph*
```

## 📊 Format des Logs

### Structure ralph.log
```
[TIMESTAMP] EVENT_TYPE | details
```

**Events Types**:
- `ITERATION_X_START` - Début d'itération
- `ITERATION_X_COMPLETE` - Fin d'itération (succès)
- `ITERATION_X_ERROR` - Erreur détectée
- `SESSION_START` - Nouvelle session
- `SESSION_RESET` - Reset session
- `CIRCUIT_BREAKER` - Boucle infinie détectée
- `EXIT_SIGNAL` - Signal de sortie reçu

### Exemple de Séquence Réussie
```
[18:40:00] SESSION_START | session_id=abc123
[18:40:00] ITERATION_1_START
[18:40:45] ITERATION_1_COMPLETE | exit_signal=true
[18:40:45] SESSION_RESET | reason=completion
```

## 🎯 Indicateurs de Sortie

Ralph sort de la loop quand **TOUS** ces critères sont remplis:

1. ✅ **Completion Indicators** détectés:
   - Todos tous complétés
   - Messages de succès
   - Phrases de conclusion

2. ✅ **EXIT_SIGNAL: true** explicite de Claude

**IMPORTANT**: La présence d'indicateurs seuls ne suffit PAS. Claude doit explicitement retourner `EXIT_SIGNAL: true`.

## ⚡ États du Circuit Breaker

| État | Signification | Action |
|------|---------------|--------|
| **CLOSED** | Normal, loop active | Continue |
| **OPEN** | Erreur répétée ou blocage | Stop + alerte |
| **HALF_OPEN** | Test après erreur | Observe |

## 🔢 Limites et Quotas

| Limite | Valeur | Réinitialisation |
|--------|--------|------------------|
| **Rate limit** | 100 calls/heure | Toutes les heures |
| **API daily** | 5 heures | Minuit UTC |
| **Session timeout** | 24 heures | Expiration auto |
| **Max iterations** | Illimité | Manual stop |

## 🛠️ Dépannage Rapide

### "Session expired"
```bash
rm -f .ralph_session
# Relancer ralph-loop
```

### "Circuit breaker open"
```bash
# Vérifier la dernière erreur
tail logs/ralph.log
# Corriger le problème
# Réinitialiser
rm -f .ralph_session
```

### "Pas de logs"
```bash
mkdir -p logs
touch logs/ralph.log
```

### "Rate limit exceeded"
```bash
# Attendre 1 heure ou
# Vérifier le compteur
grep "RATE_LIMIT" logs/ralph.log
```

## 📁 Structure de Projet Ralph

```
SOUVERAIN/
├── logs/
│   └── ralph.log              ← Logs d'exécution
├── .ralph_session             ← Session active
├── .ralph_session_history     ← Historique
├── src/
├── database.cjs
└── ...
```

## 🔍 Patterns de Log Utiles

### Chercher une itération spécifique
```bash
grep "ITERATION_3" logs/ralph.log
```

### Voir toutes les erreurs
```bash
grep -i "error\|failed\|exception" logs/ralph.log
```

### Compter les succès
```bash
grep "COMPLETE" logs/ralph.log | wc -l
```

### Dernière erreur
```bash
grep -i "error" logs/ralph.log | tail -n 1
```

### Durée de la loop
```bash
# Première ligne
head -n 1 logs/ralph.log

# Dernière ligne
tail -n 1 logs/ralph.log
```

## 📝 Variables d'Environnement

```bash
# Niveau de log
export RALPH_LOG_LEVEL=DEBUG    # DEBUG, INFO, WARNING, ERROR

# Timeout session (secondes)
export RALPH_SESSION_TIMEOUT=86400  # 24h par défaut

# Rate limit (calls/heure)
export RALPH_RATE_LIMIT=100

# Format de sortie Claude
export RALPH_OUTPUT_FORMAT=json  # json ou text
```

## 🎨 Codes de Couleur (si terminal supporte)

Dans `ralph-monitor`:
- 🟢 **Vert** - Succès, loop en cours
- 🟡 **Jaune** - Warning, attention requise
- 🔴 **Rouge** - Erreur, stop
- 🔵 **Bleu** - Info, status

## 📞 Support

### Documentation Complète
```bash
cat /c/Users/jltsm/ralph-claude-code/README.md
```

### Tests
```bash
cd /c/Users/jltsm/ralph-claude-code
./tests/run_all_tests.sh
```

### Issues GitHub
https://github.com/frankbria/ralph-claude-code/issues

## 🔗 Liens Rapides

- **Installation**: `/c/Users/jltsm/ralph-claude-code/install.sh`
- **Désinstallation**: `/c/Users/jltsm/ralph-claude-code/uninstall.sh`
- **Templates PRD**: `/c/Users/jltsm/ralph-claude-code/templates/`
- **Lib**: `/c/Users/jltsm/ralph-claude-code/lib/`

---

**Version Ralph**: v0.9.9
**Dernière mise à jour**: Janvier 2026
