
module.exports = function(db) {
  // ============================================================
  // MIGRATION PORTFOLIOS (V1 -> V2 compatibility)
  // ============================================================
  try {
     const tableInfo = db.prepare('PRAGMA table_info(portfolios)').all();
     const hasColumn = (name) => tableInfo.some(c => c.name === name);

     if (!hasColumn('title')) db.prepare('ALTER TABLE portfolios ADD COLUMN title TEXT').run();
     if (!hasColumn('tagline')) db.prepare('ALTER TABLE portfolios ADD COLUMN tagline TEXT').run();
     if (!hasColumn('intention_form_json')) db.prepare('ALTER TABLE portfolios ADD COLUMN intention_form_json TEXT').run();
     if (!hasColumn('selected_style')) db.prepare('ALTER TABLE portfolios ADD COLUMN selected_style TEXT').run();
     if (!hasColumn('user_id')) db.prepare('ALTER TABLE portfolios ADD COLUMN user_id TEXT').run();
     if (!hasColumn('mode')) db.prepare('ALTER TABLE portfolios ADD COLUMN mode TEXT').run();
     if (!hasColumn('is_primary')) db.prepare('ALTER TABLE portfolios ADD COLUMN is_primary INTEGER DEFAULT 0').run();
     if (!hasColumn('content_json')) db.prepare('ALTER TABLE portfolios ADD COLUMN content_json TEXT').run();
     
     // Backfill title from name if empty
     if (hasColumn('name') && hasColumn('title')) {
         db.prepare('UPDATE portfolios SET title = name WHERE title IS NULL').run();
     }
  } catch (err) {
      console.warn('[DB] Migration Portfolios Warning:', err.message);
  }

  // ============================================================
  // PHASE 0: CLEANUP LEGACY
  // ============================================================
  const legacyTables = [
      'independant_profiles',
      'commerce_profiles',
      'portfolio_assets', // Verify if we want to keep this, Plan says drop "ancienne version". Use caution if it disrupts current. 
      // Current V2 uses 'mediatheque_items'. V1 used 'portfolio_assets'. 
      // If we are sure V2 is active, we can drop.
      'portfolio_elements',
      'portfolio_project_elements'
  ];

  legacyTables.forEach(table => {
      try {
          db.exec(`DROP TABLE IF EXISTS ${table}`);
      } catch (e) {
          console.warn(`[DB] Cleanup ${table} failed:`, e.message);
      }
  });

  // ============================================================
  // HUB V2 TABLES
  // ============================================================

  // 1. MEDIATHEQUE ITEMS
  db.exec(`
    CREATE TABLE IF NOT EXISTS mediatheque_items (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL, -- 'image', 'video', 'pdf', 'document'
      original_filename TEXT,
      file_size INTEGER,
      thumbnail_path TEXT,
      tags_json TEXT, -- JSON array of strings
      metadata_json TEXT, -- JSON object (dimensions, duration, etc)
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );
  `);
  
  try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_mediatheque_portfolio ON mediatheque_items(portfolio_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_mediatheque_type ON mediatheque_items(file_type)');
  } catch (e) {}

  // 2. PROJECTS (Hub V2)
  try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      title TEXT NOT NULL,
      brief_text TEXT,
      challenge_text TEXT,
      solution_text TEXT,
      result_text TEXT, -- [NEW] Field for "Le Résultat"
      context_text TEXT, -- [NEW] Field for "Contexte" separate from brief
      is_highlight INTEGER DEFAULT 0, -- 0 or 1
      display_order INTEGER DEFAULT 0,
      cover_image_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
      FOREIGN KEY (cover_image_id) REFERENCES mediatheque_items(id) ON DELETE SET NULL
    );
  `);

      db.exec('CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(portfolio_id, display_order)');
      
      // MIGRATION PROJECTS: Add missing columns if they don't exist
      const projectCols = db.prepare('PRAGMA table_info(projects)').all();
      const hasProjCol = (name) => projectCols.some(c => c.name === name);

      if (!hasProjCol('project_type')) db.prepare("ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'client'").run();
      if (!hasProjCol('summary')) db.prepare("ALTER TABLE projects ADD COLUMN summary TEXT").run();
      if (!hasProjCol('date_type')) db.prepare("ALTER TABLE projects ADD COLUMN date_type TEXT DEFAULT 'period'").run();
      if (!hasProjCol('date_start')) db.prepare("ALTER TABLE projects ADD COLUMN date_start TEXT").run();
      if (!hasProjCol('date_end')) db.prepare("ALTER TABLE projects ADD COLUMN date_end TEXT").run();
      if (!hasProjCol('status')) db.prepare("ALTER TABLE projects ADD COLUMN status TEXT DEFAULT 'completed'").run();
      if (!hasProjCol('detail_level')) db.prepare("ALTER TABLE projects ADD COLUMN detail_level TEXT DEFAULT 'casestudy'").run();
      if (!hasProjCol('content_json')) db.prepare("ALTER TABLE projects ADD COLUMN content_json TEXT").run();

  } catch (e) {
      console.warn('[DB] Project Index/Migration Error:', e.message);
  }

  // 6. PORTFOLIO PUBLICATIONS (New in Phase 1)
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio_publications (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      publication_type TEXT NOT NULL, -- 'full' or 'project_single'
      project_id TEXT, -- nullable if full
      slug TEXT UNIQUE,
      published_url TEXT,
      qr_code_path TEXT,
      published_at DATETIME,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
  
  try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_publications_portfolio ON portfolio_publications(portfolio_id)');
      db.exec('CREATE INDEX IF NOT EXISTS idx_publications_slug ON portfolio_publications(slug)');
  } catch (e) {}

  // 3. PROJECT MEDIA (Link Project <-> Mediatheque)
  db.exec(`
    CREATE TABLE IF NOT EXISTS project_media (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      mediatheque_item_id TEXT NOT NULL,
      display_order INTEGER DEFAULT 0,
      caption TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (mediatheque_item_id) REFERENCES mediatheque_items(id) ON DELETE CASCADE
    );
  `);

  try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_project_media_project ON project_media(project_id)');
  } catch (e) {}

  // 4. EXTERNAL ACCOUNTS
  db.exec(`
    CREATE TABLE IF NOT EXISTS external_accounts (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      platform_type TEXT NOT NULL, -- 'instagram', 'github', 'linkedin'...
      account_url TEXT,
      account_username TEXT,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );
  `);

  try {
      db.exec('CREATE INDEX IF NOT EXISTS idx_external_accounts_portfolio ON external_accounts(portfolio_id)');
  } catch (e) {}

  // 5. ANONYMIZATION MAPS (Legacy V2 feature preserved)
  db.exec(`
    CREATE TABLE IF NOT EXISTS anonymization_maps (
      id TEXT PRIMARY KEY,
      portfolio_id TEXT NOT NULL,
      original_value TEXT NOT NULL,
      anonymized_token TEXT NOT NULL,
      value_type TEXT NOT NULL,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );
  `);

  console.log('[DB] Hub V2 Schema Initialization Complete.');
};
