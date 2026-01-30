# TODO: Remplacement emojis restants

## Statut : 60% complété

### ✅ Terminé
- Wizard (100% clean)
- GenerationRecap (7 emojis)
- SocialsManager (4 emojis)  
- ExportModal, MediathequeCard, AssetPreviewModal

### 🔄 Restant : ~15 fichiers actifs

**Priorité haute (UI visible) :**
- `components/job-matching/JobOfferInput.tsx`
- `components/job-matching/JobMatchingHub.tsx`
- `components/job-matching/RecommendationsPanel.tsx`
- `components/portfolio/master/GenerationScreen.tsx`
- `components/portfolio/master/PortfolioSelector.tsx`
- `components/portfolio/master/MasterPortfolioView.tsx`
- `components/portfolio/editor/PortfolioEditor.tsx`
- `components/portfolio/editor/PracticalInfoEditor.tsx`
- `components/portfolio/editor/StylePickerModal.tsx`
- `components/portfolio/editor/AddSectionModal.tsx`
- `components/portfolio/styles/StyleSelector.tsx`
- `components/portfolio/config/ConfigView.tsx`
- `components/portfolio/PortfolioSettingsModal.tsx`
- `components/ReportComponents.tsx`

**Priorité basse (legacy) :**
- `components/portfolio/master/old-system-backup/*` (~28 fichiers)

## Ressources

**Bibliothèque d'icônes :** `src/components/icons/index.tsx` (45 icônes SVG)

**Mapping emoji → icône :**
- 🔒 → LockIcon
- ✨ → SparklesIcon
- 📄 → FileIcon
- 🎨 → PaletteIcon
- 💼 → BriefcaseIcon
- 🎯 → TargetIcon
- 🚀 → RocketIcon
- 🖼 → ImageIcon
- 🔗 → LinkIcon
- 📝 → EditIcon
- 📍 → MapPinIcon
- 📁 → FolderIcon
- 🎓 → GraduationIcon
- ✅ → CheckIcon
- 🌐 → GlobeIcon
- ❌ → XIcon
- 💬 → MessageIcon
- 👤 → UserIcon
- 🔍 → SearchIcon
- 🎬 → VideoIcon
- ⚡ → SparklesIcon
- 📱 → PhoneIcon
- 📧 → MailIcon
- 💡 → LightbulbIcon
- 🏪 → StoreIcon
- 🗑️ → TrashIcon
- 🔥 → FireIcon
- 👥 → UsersIcon
- ⚠️ → AlertIcon
- 🔓 → UnlockIcon
- 🏠 → HomeIcon
- 🏆 → TrophyIcon
- 🌟 → StarIcon
- ⭐ → StarIcon
- 🛍️ → ShoppingBagIcon
- 🎁 → GiftIcon
- 🔔 → BellIcon
- 📅 → CalendarIcon
- 🕐 → ClockIcon

## Méthode

1. Import : `import { IconName } from '../icons'` ou `'../../icons'`
2. Remplacer emoji string par composant : `🚀` → `<RocketIcon size={18} />`
3. Ajuster taille selon contexte (16-24px UI, 32-48px illustrations, 64px+ placeholders)
4. Tester visuellement

## Commande pour trouver les fichiers restants

```bash
cd SOUVERAIN/src && find . -name "*.tsx" -not -path "*/old-system-backup/*" -not -path "*/node_modules/*" | xargs grep -l "📄\|📝\|📊\|📃\|📎\|🎬\|💡\|⚡\|👤\|💼\|🏪\|🎨\|🎓\|👔\|📧\|📱\|📞\|🔗\|🌐\|🖼\|✨\|🔥\|🚀\|⚠️\|✅\|❌"
```
