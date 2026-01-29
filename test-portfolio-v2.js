/**
 * Script de test pour Portfolio Builder V2
 * Vérifie que tous les composants backend fonctionnent
 *
 * Usage: node test-portfolio-v2.js
 */

const GitHubScraper = require('./scrapers/github-scraper.cjs');
const LocalScraper = require('./scrapers/local-scraper.cjs');
const ProjectAnalyzer = require('./services/project-analyzer.cjs');

// ============================================================
// Configuration
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''; // Mettre votre token ici

// ============================================================
// Tests
// ============================================================

async function testGitHubScraper() {
  console.log('\n🧪 Test 1: GitHub Scraper');
  console.log('─'.repeat(50));

  if (!GITHUB_TOKEN) {
    console.log('⚠️  GITHUB_TOKEN manquant. Passer ce test.');
    return;
  }

  try {
    const scraper = new GitHubScraper(GITHUB_TOKEN);

    // Test connexion
    console.log('⏳ Test connexion GitHub...');
    const connectionTest = await scraper.testConnection();

    if (connectionTest.success) {
      console.log('✅ Connexion réussie:', connectionTest.username);

      // Test fetch repos
      console.log('⏳ Récupération repos...');
      const repos = await scraper.fetchRepos(connectionTest.username);
      console.log(`✅ ${repos.length} repos trouvés`);

      if (repos.length > 0) {
        // Test détails d'un repo
        const [owner, repo] = repos[0].full_name.split('/');
        console.log(`⏳ Test détails repo: ${repos[0].name}...`);
        const details = await scraper.fetchRepoDetails(owner, repo);
        console.log(`✅ README length: ${details.readme.length} chars`);
        console.log(`✅ Langages: ${details.languages.join(', ')}`);
      }
    } else {
      console.log('❌ Erreur connexion:', connectionTest.error);
    }
  } catch (error) {
    console.log('❌ Erreur test GitHub:', error.message);
  }
}

async function testLocalScraper() {
  console.log('\n🧪 Test 2: Local Scraper');
  console.log('─'.repeat(50));

  try {
    const scraper = new LocalScraper();

    // Test scan dossier courant
    console.log('⏳ Scan dossier courant...');
    const result = await scraper.scanFolder(__dirname);

    console.log('✅ Scan réussi:');
    console.log(`   Nom: ${result.name}`);
    console.log(`   Fichiers: ${result.fileCount}`);
    console.log(`   Langages: ${result.languages.join(', ')}`);
    console.log(`   README: ${result.readme ? result.readme.length + ' chars' : 'Non trouvé'}`);
    console.log(`   Images: ${result.images.length}`);
  } catch (error) {
    console.log('❌ Erreur test Local:', error.message);
  }
}

async function testProjectAnalyzer() {
  console.log('\n🧪 Test 3: Project Analyzer (IA)');
  console.log('─'.repeat(50));

  try {
    const analyzer = new ProjectAnalyzer(GROQ_API_KEY);

    // Mock data simple
    const mockProject = {
      name: 'souverain',
      description: 'Application de coaching CV avec IA',
      languages: ['JavaScript', 'TypeScript', 'React'],
      url: 'https://github.com/test/souverain',
      readme: `# Souverain

Application desktop de coaching CV utilisant l'IA pour analyser et améliorer les CV.

## Technologies
- Electron + React
- Groq AI (llama-3.3-70b)
- SQLite chiffré AES-256

## Fonctionnalités
- Analyse CV avec scoring
- Suggestions d'amélioration
- Historique dans coffre-fort chiffré`
    };

    console.log('⏳ Analyse IA en cours (20-40s attendu)...');
    const startTime = Date.now();

    const result = await analyzer.analyzeProject(mockProject, 'github');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.success) {
      console.log(`✅ Analyse réussie en ${duration}s`);
      console.log('\n📝 Résultats:');
      console.log('   Pitch:', result.pitch.substring(0, 100) + '...');
      console.log('   Stack:', result.stack.join(', '));
      console.log('   Challenge:', result.challenge.substring(0, 100) + '...');
      console.log('   Solution:', result.solution.substring(0, 100) + '...');
      console.log('   Outputs:', result.outputs.length, 'liens');
      console.log('\n💰 Tokens utilisés:', result.tokens?.total_tokens || 'N/A');
    } else {
      console.log('❌ Erreur analyse:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur test Analyzer:', error.message);
  }
}

async function testRegenerateSection() {
  console.log('\n🧪 Test 4: Régénération Section');
  console.log('─'.repeat(50));

  try {
    const analyzer = new ProjectAnalyzer(GROQ_API_KEY);

    const mockProject = {
      title: 'Souverain',
      pitch: 'Application de coaching CV avec IA',
      stack: ['React', 'Electron'],
      challenge: 'Les CV traditionnels manquent d\'impact',
      solution: 'IA pour analyse automatique'
    };

    console.log('⏳ Régénération du pitch (5-10s attendu)...');
    const startTime = Date.now();

    const result = await analyzer.regenerateSection(mockProject, 'pitch');

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (result.success) {
      console.log(`✅ Régénération réussie en ${duration}s`);
      console.log('   Nouveau pitch:', result.content);
    } else {
      console.log('❌ Erreur régénération:', result.error);
    }
  } catch (error) {
    console.log('❌ Erreur test Regenerate:', error.message);
  }
}

// ============================================================
// Exécution
// ============================================================

async function runAllTests() {
  console.log('\n═══════════════════════════════════════════════════');
  console.log('🚀 Tests Portfolio Builder V2');
  console.log('═══════════════════════════════════════════════════');

  await testGitHubScraper();
  await testLocalScraper();
  await testProjectAnalyzer();
  await testRegenerateSection();

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✨ Tests terminés');
  console.log('═══════════════════════════════════════════════════\n');
}

// Lancer si exécuté directement
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testGitHubScraper,
  testLocalScraper,
  testProjectAnalyzer,
  testRegenerateSection
};
