# Quick Start: Job Matching & LinkedIn Coach

## 🚀 How to Access the Modules

### Via Navigation
1. **Job Matching**: Click "Job Match" in the sidebar (or press `Ctrl+3`)
2. **LinkedIn Coach**: Click "LinkedIn" in the sidebar (or press `Ctrl+4`)

### Via Keyboard Shortcuts
- `Ctrl+3` → Job Matching
- `Ctrl+4` → LinkedIn Coach
- `Ctrl+K` → Command Palette
- `Ctrl+D` → Toggle Dark/Light Mode

---

## 📄 Job Matching - User Flow

### Step 1: Import Job Offer
- **Option A**: Paste job offer text directly
- **Option B**: Enter URL (not implemented yet - use paste mode)
- Fill in: Title, Company, Content

### Step 2: Select Your CV
- Choose from your saved CVs
- (Note: CV module needs to be implemented first)

### Step 3: Analysis
- Watch the animated progress (4 steps)
- Data is anonymized locally before cloud analysis
- Wait ~10-15 seconds for Groq API response

### Step 4: View Results
- **Score**: 0-100 with category (Excellent/Good/Average/Poor)
- **Strengths**: What matches well
- **Weaknesses**: What's missing
- **Recommendations**: Specific actions to improve your candidacy
- **Optimizations**: General CV improvements

---

## 💼 LinkedIn Coach - User Flow

### Step 1: Import Profile
- **Option A**: Paste your entire LinkedIn profile text
- **Option B**: Enter profile URL (not implemented yet - use paste mode)
- Copy your profile: Go to LinkedIn → Select All (Ctrl+A) → Paste

### Step 2: Analysis
- Watch 7-step analysis animation
- Sections analyzed:
  1. Photo de profil
  2. Headline
  3. About (Résumé)
  4. Expériences
  5. Compétences
  6. Recommandations
  7. Activité/Posts

### Step 3: View Scorecard
- **Global Score**: 0-100 with percentile ranking
- **Section Scores**: Individual scores for each section
- Click any section to see details

### Step 4: Section Details
- **Issues**: Problems identified
- **Tips**: Best practices
- **Suggestions**: AI-generated improvements
- Click "Copier" to copy suggestions

### Step 5: Generate Content (Optional)
- Return to hub → Click "Générer du contenu"
- Choose type: Headline, About, Post, Connection Message
- Add context (optional)
- Select tone: Professional, Inspiring, Casual, Expert
- Click "Générer"
- Copy result to clipboard

---

## 🎨 UI Features

### Both Modules
- ✅ Dark/Light mode support
- ✅ Smooth animations
- ✅ Progress indicators
- ✅ Privacy badges (🔒 Data anonymized)
- ✅ Responsive layout
- ✅ Glassmorphism design

### Color Coding (Scores)
- 🟢 85-100: Excellent (Green)
- 🟠 70-84: Good (Orange)
- 🟡 50-69: Average (Yellow)
- 🔴 0-49: Poor (Red)

---

## ⚠️ Current Limitations

### Database
- IPC handlers are stubbed (return empty arrays)
- No persistent storage yet
- History features won't work until DB is implemented

### URL Import
- Not implemented yet
- Use copy-paste mode for now

### CV Module
- Job Matching requires CVs to be created first
- CV module needs to be completed

---

## 🔧 For Developers

### Testing Without Real Data

**Job Matching:**
```typescript
// Mock CV data for testing
const mockCV = {
  id: 'cv_test_123',
  name: 'CV Principal',
  skills: ['React', 'TypeScript', 'Node.js'],
  experiences: [],
  education: []
};
```

**LinkedIn Coach:**
```typescript
// Mock profile data
const mockProfile = {
  id: 'profile_test_123',
  rawContent: 'Senior Developer | React Expert...',
  headline: 'Senior Developer',
  about: 'Passionate about...',
  createdAt: new Date().toISOString()
};
```

### Testing Groq API
Make sure you have:
1. `GROQ_API_KEY` in your `.env` file
2. Groq client initialized in `main.cjs`
3. `groq-chat` IPC handler working

### File Structure
```
src/
├── components/
│   ├── job-matching/          # 7 components + index
│   └── linkedin-coach/         # 7 components + index
├── services/
│   ├── jobMatchingService.ts
│   └── linkedinCoachService.ts
└── ...
```

---

## 🐛 Troubleshooting

### "No CVs found"
→ CV module not implemented yet. Create mock CVs in database.

### "Groq API call failed"
→ Check:
1. `.env` file has `GROQ_API_KEY`
2. Groq client is initialized
3. Internet connection
4. API key is valid

### Modules not appearing
→ Check:
1. Shell.tsx imports both modules
2. Navigation sidebar shows "Job Match" and "LinkedIn"
3. No TypeScript compilation errors

### Dark mode not working
→ All components use `useTheme()` hook properly

---

## 📚 Next Steps

1. **Implement Database**
   - Add tables in `database.cjs`
   - Update IPC handlers with real DB operations
   - Test data persistence

2. **Complete CV Module**
   - Allow CV creation/editing
   - Store CVs in database
   - Link to Job Matching

3. **Add URL Scraping** (Optional)
   - Implement LinkedIn scraper
   - Implement job board scrapers
   - Handle rate limiting

4. **Polish & Test**
   - End-to-end testing
   - Error handling improvements
   - Add export features
   - Add success notifications

---

**Ready to test!** 🎉

Start the development server and navigate to the modules via the sidebar.
