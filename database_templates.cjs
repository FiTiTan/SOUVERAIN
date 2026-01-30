/**
 * SOUVERAIN - Templates Database Schema
 * Phase 2: Portfolio Template System
 */

module.exports = function initTemplatesSchema(db) {
  console.log('[DB] Initializing templates schema...');

  // ============================================================
  // MIGRATION: Fix old paths to new paths
  // ============================================================
  try {
    // Check if table exists first
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='templates'").get();
    
    if (tableExists) {
      // Update old paths (resources/templates/portfolio/free/*/thumbnail.png) to new (templates/thumbnails/*.svg)
      db.exec(`
        UPDATE templates SET 
          thumbnail_path = REPLACE(thumbnail_path, 'resources/templates/portfolio/free/', 'templates/thumbnails/'),
          thumbnail_path = REPLACE(thumbnail_path, '/thumbnail.png', '.svg'),
          html_path = REPLACE(html_path, 'resources/templates/portfolio/free/', 'templates/'),
          html_path = REPLACE(html_path, '/template.html', '.html')
        WHERE thumbnail_path LIKE 'resources/templates/%'
      `);
      console.log('[DB] ✅ Migrated old template paths to new structure');
    }
  } catch (e) {
    console.warn('[DB] Template path migration warning:', e.message);
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
  // SEED FREE TEMPLATES
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
      version: '1.0.0'
    },
    {
      id: 'kinetic-typo',
      name: 'Kinetic Typography',
      description: 'Typographie animée avec micro-interactions, mise en avant du texte',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/kinetic-typo.svg',
      html_path: 'templates/kinetic-typo.html',
      is_owned: 1,
      tags: 'typographie,animation,créatif',
      ideal_for: 'Créatifs, Artistes, Rédacteurs',
      version: '1.0.0'
    },
    {
      id: 'organic-flow',
      name: 'Organic Flow',
      description: 'Formes organiques et transitions fluides, ambiance naturelle',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/organic-flow.svg',
      html_path: 'templates/organic-flow.html',
      is_owned: 1,
      tags: 'organique,fluide,naturel',
      ideal_for: 'Créatifs, Bien-être, Lifestyle',
      version: '1.0.0'
    },
    {
      id: 'glassmorphism',
      name: 'Glassmorphism',
      description: 'Effet verre dépoli, transparence et profondeur moderne',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/glassmorphism.svg',
      html_path: 'templates/glassmorphism.html',
      is_owned: 1,
      tags: 'glass,moderne,premium,tech',
      ideal_for: 'Tech, Freelances, Startups',
      version: '1.0.0'
    },
    {
      id: 'minimal-apple',
      name: 'Minimal Apple',
      description: 'Minimalisme extrême inspiré Apple, blanc, espace, élégance',
      category: 'free',
      price: 0,
      thumbnail_path: 'templates/thumbnails/minimal-apple.svg',
      html_path: 'templates/minimal-apple.html',
      is_owned: 1,
      tags: 'minimal,apple,élégant,blanc',
      ideal_for: 'Design, Produit, Corporate',
      version: '1.0.0'
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
