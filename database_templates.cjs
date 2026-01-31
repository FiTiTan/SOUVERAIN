/**
 * SOUVERAIN - Templates Database Schema
 * Phase 2: Portfolio Template System
 */

module.exports = function initTemplatesSchema(db) {
  console.log('[DB] Initializing templates schema...');

  // ============================================================
  // MIGRATION: Fix old paths by deleting and re-seeding
  // ============================================================
  try {
    // Check if table exists first
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='templates'").get();
    
    if (tableExists) {
      // Check if we have old paths or old template count
      const currentCount = db.prepare("SELECT COUNT(*) as count FROM templates").get();
      
      if (currentCount.count !== 10) {
        console.log('[DB] Detected wrong template count, re-seeding with 10 new templates...');
        // Delete all templates (we'll re-insert with correct paths below)
        db.exec('DELETE FROM templates');
        console.log('[DB] ✅ Deleted old template entries');
      }
    }
  } catch (e) {
    console.warn('[DB] Template migration warning:', e.message);
  }

  // ============================================================
  // TEMPLATES TABLE
  // ============================================================

  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'free',
      price REAL DEFAULT 0,
      thumbnail_path TEXT,
      html_path TEXT,
      is_owned INTEGER DEFAULT 0,
      purchased_at TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT,
      tags TEXT,
      ideal_for TEXT,
      version TEXT DEFAULT '1.0.0',
      author TEXT DEFAULT 'SOUVERAIN'
    );
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_templates_category
    ON templates(category);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_templates_owned
    ON templates(is_owned);
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_templates_price
    ON templates(price);
  `);

  // ============================================================
  // TEMPLATE LICENSES TABLE (for premium templates)
  // ============================================================

  db.exec(`
    CREATE TABLE IF NOT EXISTS template_licenses (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      purchased_at TEXT DEFAULT CURRENT_TIMESTAMP,
      amount_paid REAL NOT NULL,
      is_premium_discount INTEGER DEFAULT 0,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    );
  `);

  // ============================================================
  // SEED FREE TEMPLATES (10 nouveaux templates 2026)
  // ============================================================

  const freeTemplates = [
    {
      id: 'bento-grid',
      name: 'Bento Grid Layout',
      description: 'Organisation modulaire façon Apple, cards asymétriques avec bords arrondis',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/bento-grid.svg',
      html_path: 'templates/bento-grid.html',
      is_owned: 1,
      tags: 'moderne,minimaliste,tech,freelance',
      ideal_for: 'Freelances, Créatifs, Tech',
      version: '2.0.0'
    },
    {
      id: 'kinetic-typography',
      name: 'Kinetic Typography',
      description: 'Typographie animée avec micro-interactions, mise en avant du texte',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/kinetic-typography.svg',
      html_path: 'templates/kinetic-typography.html',
      is_owned: 1,
      tags: 'typographie,animation,créatif',
      ideal_for: 'Créatifs, Artistes, Rédacteurs',
      version: '2.0.0'
    },
    {
      id: 'organic-anti-grid',
      name: 'Organic Anti-Grid',
      description: 'Formes organiques et transitions fluides, ambiance naturelle',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/organic-anti-grid.svg',
      html_path: 'templates/organic-anti-grid.html',
      is_owned: 1,
      tags: 'organique,fluide,naturel',
      ideal_for: 'Créatifs, Bien-être, Lifestyle',
      version: '2.0.0'
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism Affiné',
      description: 'Effet verre dépoli, transparence et profondeur moderne',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/glassmorphism.svg',
      html_path: 'templates/glassmorphism.html',
      is_owned: 1,
      tags: 'glass,moderne,premium,tech',
      ideal_for: 'Tech, Freelances, Startups',
      version: '2.0.0'
    },
    {
      id: 'tactile-maximalism',
      name: 'Tactile Maximalism',
      description: 'Design maximaliste avec textures tactiles et richesse visuelle',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/tactile-maximalism.svg',
      html_path: 'templates/tactile-maximalism.html',
      is_owned: 1,
      tags: 'maximaliste,textures,bold,créatif',
      ideal_for: 'Artistes, Créatifs, Mode',
      version: '2.0.0'
    },
    {
      id: 'scroll-storytelling',
      name: 'Scroll Storytelling',
      description: 'Narration immersive avec animations au scroll progressives',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/scroll-storytelling.svg',
      html_path: 'templates/scroll-storytelling.html',
      is_owned: 1,
      tags: 'storytelling,animation,immersif',
      ideal_for: 'Créatifs, Journalistes, Narrateurs',
      version: '2.0.0'
    },
    {
      id: 'hand-drawn-scribble',
      name: 'Hand-Drawn Scribble',
      description: 'Esthétique dessinée à la main avec traits organiques',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/hand-drawn-scribble.svg',
      html_path: 'templates/hand-drawn-scribble.html',
      is_owned: 1,
      tags: 'dessin,organique,créatif,unique',
      ideal_for: 'Illustrateurs, Artistes, Créatifs',
      version: '2.0.0'
    },
    {
      id: 'exaggerated-hierarchy',
      name: 'Exaggerated Hierarchy',
      description: 'Hiérarchie typographique exagérée pour un impact visuel fort',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/exaggerated-hierarchy.svg',
      html_path: 'templates/exaggerated-hierarchy.html',
      is_owned: 1,
      tags: 'typo,hiérarchie,bold,moderne',
      ideal_for: 'Designers, Créatifs, Branding',
      version: '2.0.0'
    },
    {
      id: '3d-immersif-webgl',
      name: '3D Immersif WebGL',
      description: 'Expérience 3D interactive avec WebGL pour un effet wow',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/3d-immersif-webgl.svg',
      html_path: 'templates/3d-immersif-webgl.html',
      is_owned: 1,
      tags: '3d,webgl,immersif,tech',
      ideal_for: 'Développeurs 3D, Tech, Gaming',
      version: '2.0.0'
    },
    {
      id: 'dopamine-colors',
      name: 'Dopamine Colors',
      description: 'Palette de couleurs vibrantes et énergisantes pour un impact immédiat',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/dopamine-colors.svg',
      html_path: 'templates/dopamine-colors.html',
      is_owned: 1,
      tags: 'couleurs,vibrant,énergique,moderne',
      ideal_for: 'Créatifs, Marketing, Startups',
      version: '2.0.0'
    }
  ];

  // Insert free templates if they don't exist
  const insertTemplate = db.prepare(`
    INSERT OR IGNORE INTO templates (
      id, name, description, category, price, thumbnail_path,
      html_path, is_owned, tags, ideal_for, version, author
    ) VALUES (
      @id, @name, @description, @category, @price, @thumbnail_path,
      @html_path, @is_owned, @tags, @ideal_for, @version, 'SOUVERAIN'
    )
  `);

  for (const template of freeTemplates) {
    insertTemplate.run(template);
  }

  console.log(`[DB] ✅ Templates schema initialized (${freeTemplates.length} free templates seeded)`);

  return {
    templates: db.prepare('SELECT * FROM templates').all(),
    freeCount: db.prepare('SELECT COUNT(*) as count FROM templates WHERE category = ?').get('free').count,
    premiumCount: db.prepare('SELECT COUNT(*) as count FROM templates WHERE category = ?').get('premium').count
  };
};
