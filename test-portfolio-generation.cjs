#!/usr/bin/env node
/**
 * Test script - Génération Portfolio V2 sans UI
 * Simule l'appel complet wizard → génération → sauvegarde
 */

const Database = require('better-sqlite3-multiple-ciphers');
const path = require('path');
const fs = require('fs');

// Config
const DB_PATH = '/tmp/test-souverain.db';
const ENCRYPTION_KEY = 'test-key-2026';

console.log('🧪 Test Portfolio Génération V2\n');

// 1. Initialiser la DB
console.log('1️⃣ Initialisation DB...');
if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

const db = new Database(DB_PATH);
db.pragma(`key='${ENCRYPTION_KEY}'`);
db.pragma('journal_mode = WAL');

// Créer le schéma templates
require('./database_templates.cjs')(db);
console.log('   ✅ DB initialisée\n');

// 2. Vérifier les templates
console.log('2️⃣ Vérification templates...');
const templates = db.prepare('SELECT id, name, html_path, thumbnail_path FROM templates WHERE category = ?').all('free');
console.log(`   ✅ ${templates.length} templates gratuits trouvés`);
templates.forEach(t => console.log(`      - ${t.id}: ${t.name}`));
console.log('');

// 3. Charger le HTML d'un template
console.log('3️⃣ Chargement template HTML...');
const templateId = 'bento-grid';
const template = templates.find(t => t.id === templateId);

if (!template) {
  console.error('   ❌ Template non trouvé');
  process.exit(1);
}

const templatePath = path.join(__dirname, template.html_path);
console.log(`   📁 Chemin: ${templatePath}`);
console.log(`   📂 Existe: ${fs.existsSync(templatePath)}`);

if (!fs.existsSync(templatePath)) {
  console.error('   ❌ Fichier template introuvable');
  process.exit(1);
}

const templateHTML = fs.readFileSync(templatePath, 'utf-8');
console.log(`   ✅ Template chargé (${templateHTML.length} caractères)\n`);

// 4. Simuler les données du formulaire
console.log('4️⃣ Données formulaire...');
const formData = {
  name: 'Jean Dupont',
  profileType: 'freelance',
  tagline: 'Développeur Full-Stack passionné',
  services: ['Développement Web', 'Consulting Tech', 'Formation'],
  email: 'jean.dupont@example.com',
  phone: '06 12 34 56 78',
  valueProp: 'Des solutions sur mesure pour vos projets digitaux',
  address: '123 Rue de la Tech, 75001 Paris',
  openingHours: 'Lun-Ven 9h-18h',
  socialLinks: [
    { platform: 'github', url: 'https://github.com/jeandupont' },
    { platform: 'linkedin', url: 'https://linkedin.com/in/jeandupont' }
  ],
  projects: [
    { title: 'App Mobile E-commerce', description: 'React Native + Node.js', category: 'Mobile' },
    { title: 'Site Vitrine Corporate', description: 'Next.js + TailwindCSS', category: 'Web' }
  ],
  selectedTemplateId: templateId
};

console.log(`   👤 Nom: ${formData.name}`);
console.log(`   💼 Type: ${formData.profileType}`);
console.log(`   🏷️ Tagline: ${formData.tagline}`);
console.log(`   📧 Email: ${formData.email}\n`);

// 5. Remplacer les placeholders
console.log('5️⃣ Génération HTML...');

const escapeHtml = (text) => {
  return text.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderServices = (services) => {
  return services.map(s => `<div class="service-item">${escapeHtml(s)}</div>`).join('\n          ');
};

const renderSocialLinks = (links) => {
  return links.map(link => {
    const label = link.platform.charAt(0).toUpperCase() + link.platform.slice(1);
    return `<a href="${escapeHtml(link.url)}" class="social-link" target="_blank">${label}</a>`;
  }).join('\n          ');
};

const renderPhone = (phone) => phone ? `<div class="contact-item">📞 ${escapeHtml(phone)}</div>` : '';
const renderAddress = (address, hours) => {
  let html = address ? `<div class="contact-item">📍 ${escapeHtml(address)}</div>` : '';
  if (hours) html += `\n          <div class="contact-item">🕒 ${escapeHtml(hours)}</div>`;
  return html;
};

const renderProjects = (projects) => {
  return projects.slice(0, 6).map(p => `
      <div class="bento-card project-card">
        <h3>${escapeHtml(p.title)}</h3>
        ${p.description ? `<p>${escapeHtml(p.description)}</p>` : ''}
        ${p.category ? `<span class="category">${escapeHtml(p.category)}</span>` : ''}
      </div>
    `).join('\n      ');
};

let html = templateHTML;
html = html.replace(/\{\{NAME\}\}/g, escapeHtml(formData.name));
html = html.replace(/\{\{TAGLINE\}\}/g, escapeHtml(formData.tagline));
html = html.replace(/\{\{EMAIL\}\}/g, escapeHtml(formData.email));
html = html.replace(/\{\{VALUE_PROP\}\}/g, escapeHtml(formData.valueProp));
html = html.replace(/\{\{SERVICES\}\}/g, renderServices(formData.services));
html = html.replace(/\{\{SOCIAL_LINKS\}\}/g, renderSocialLinks(formData.socialLinks));
html = html.replace(/\{\{PHONE\}\}/g, renderPhone(formData.phone));
html = html.replace(/\{\{ADDRESS\}\}/g, renderAddress(formData.address, formData.openingHours));
html = html.replace(/\{\{PROJECTS\}\}/g, renderProjects(formData.projects));

console.log(`   ✅ HTML généré (${html.length} caractères)\n`);

// 6. Sauvegarder dans la DB
console.log('6️⃣ Sauvegarde en DB...');

// Créer table portfolios si nécessaire
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    name TEXT,
    generated_content TEXT,
    template_id TEXT,
    metadata TEXT,
    created_at TEXT,
    updated_at TEXT,
    is_primary INTEGER DEFAULT 0
  )
`);

const portfolioId = require('crypto').randomUUID();
const now = new Date().toISOString();

const insertStmt = db.prepare(`
  INSERT INTO portfolios (
    id, name, generated_content, template_id, metadata, created_at, updated_at, is_primary
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const metadata = {
  profileType: formData.profileType,
  tagline: formData.tagline,
  email: formData.email,
  createdAt: now
};

insertStmt.run(
  portfolioId,
  formData.name,
  html,
  templateId,
  JSON.stringify(metadata),
  now,
  now,
  1
);

console.log(`   ✅ Portfolio sauvegardé (ID: ${portfolioId})\n`);

// 7. Vérifier en relisant
console.log('7️⃣ Vérification...');
const saved = db.prepare('SELECT id, name, template_id, length(generated_content) as html_length FROM portfolios WHERE id = ?').get(portfolioId);
console.log(`   ✅ Portfolio relu:`);
console.log(`      ID: ${saved.id}`);
console.log(`      Nom: ${saved.name}`);
console.log(`      Template: ${saved.template_id}`);
console.log(`      HTML length: ${saved.html_length} caractères\n`);

// 8. Export HTML (test)
console.log('8️⃣ Export HTML...');
const outputPath = '/tmp/test-portfolio.html';
fs.writeFileSync(outputPath, html, 'utf-8');
console.log(`   ✅ Exporté vers: ${outputPath}`);
console.log(`   💡 Ouvre ce fichier dans un navigateur pour voir le rendu\n`);

console.log('✅ TOUS LES TESTS PASSÉS ! Le système Portfolio V2 fonctionne.\n');

db.close();
process.exit(0);
