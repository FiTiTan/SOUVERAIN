/**
 * SOUVERAIN V15 - Database Manager (Bunker)
 * SQLite chiffré AES-256
 * Compatible avec schéma V14 existant
 */

const Database = require('better-sqlite3-multiple-ciphers');
const path = require('path');
const { app } = require('electron');

// ============================================================
// CONFIGURATION
// ============================================================

const DB_NAME = 'souverain_vault.db';
const ENCRYPTION_KEY = 'ma_cle_super_secrete_2026';

// ============================================================
// DATABASE INITIALIZATION
// ============================================================

const dbPath = path.join(app.getPath('userData'), DB_NAME);
const db = new Database(dbPath);

// Appliquer la clé de chiffrement
db.pragma(`key='${ENCRYPTION_KEY}'`);

// Optimisations SQLite
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');

// Init Hub V2 Schema
try {
  require('./database_schema_v2.cjs')(db);
} catch (e) {
  console.error('[DB] Schema V2 Warning:', e.message);
}

// Init Templates Schema (Phase 2)
try {
  require('./database_templates.cjs')(db);
} catch (e) {
  console.error('[DB] Templates Schema Warning:', e.message);
}

// ============================================================
// SCHEMA - Compatible V14
// ============================================================

// Créer la table si elle n'existe pas (schéma V14 original)
db.exec(`
  CREATE TABLE IF NOT EXISTS analyses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT,
    content_raw TEXT,
    ia_result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration : ajouter les nouvelles colonnes si elles n'existent pas
function migrateSchema() {
  const tableInfo = db.prepare("PRAGMA table_info(analyses)").all();
  const columns = tableInfo.map(col => col.name);

  // Ajouter score_global si absent
  if (!columns.includes('score_global')) {
    try {
      db.exec('ALTER TABLE analyses ADD COLUMN score_global REAL');
      console.log('[DB] Migration: colonne score_global ajoutée');
    } catch (e) {
      // Ignorer si déjà existe
    }
  }

  // Ajouter updated_at si absent
  if (!columns.includes('updated_at')) {
    try {
      db.exec('ALTER TABLE analyses ADD COLUMN updated_at DATETIME');
      console.log('[DB] Migration: colonne updated_at ajoutée');
    } catch (e) {
      // Ignorer si déjà existe
    }
  }

  // Créer les index si absents
  try {
    db.exec('CREATE INDEX IF NOT EXISTS idx_analyses_created ON analyses(created_at DESC)');
    db.exec('CREATE INDEX IF NOT EXISTS idx_analyses_filename ON analyses(filename)');
  } catch (e) {
    // Ignorer
  }
}

migrateSchema();

// ============================================================
// VAULT DOCUMENTS TABLE
// ============================================================

// Créer la table vault_documents pour le Coffre-Fort
db.exec(`
  CREATE TABLE IF NOT EXISTS vault_documents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    encrypted_content BLOB NOT NULL,
    thumbnail BLOB,
    tags TEXT,
    notes TEXT,
    document_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_favorite INTEGER DEFAULT 0
  );
`);

// Index pour optimiser les recherches
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_vault_category ON vault_documents(category)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_vault_created ON vault_documents(created_at DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_vault_favorite ON vault_documents(is_favorite, created_at DESC)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_vault_document_date ON vault_documents(document_date DESC)');
} catch (e) {
  // Ignorer si déjà existe
}

// Migration: ajouter document_date si elle n'existe pas
function migrateVaultSchema() {
  const tableInfo = db.prepare("PRAGMA table_info(vault_documents)").all();
  const columns = tableInfo.map(col => col.name);

  if (!columns.includes('document_date')) {
    try {
      db.exec('ALTER TABLE vault_documents ADD COLUMN document_date DATE');
      console.log('[DB] Migration: colonne document_date ajoutée');
    } catch (e) {
      // Ignorer si déjà existe
    }
  }
}

migrateVaultSchema();

// ============================================================
// PORTFOLIO MIGRATION V2 (Data Scraping)
// ============================================================

// Migration: Portfolio Projects V2 (Data Scraping)
  // Migration: Portfolio Projects V2 (Legacy Table Update - optional)
  function migratePortfolioProjectsV2() {
    const tableInfo = db.prepare("PRAGMA table_info(portfolio_projects)").all();
    const columns = tableInfo.map(col => col.name);
  
    const newColumns = [
      { name: 'source_type', type: 'TEXT DEFAULT NULL' },
      { name: 'source_url', type: 'TEXT DEFAULT NULL' },
      { name: 'source_data', type: 'TEXT DEFAULT NULL' },
      { name: 'pitch', type: 'TEXT DEFAULT NULL' },
      { name: 'stack', type: 'TEXT DEFAULT NULL' },
      { name: 'brief_text', type: 'TEXT DEFAULT NULL' },
      { name: 'context_text', type: 'TEXT DEFAULT NULL' },
      { name: 'challenge_text', type: 'TEXT DEFAULT NULL' },
      { name: 'solution_text', type: 'TEXT DEFAULT NULL' },
      { name: 'result_text', type: 'TEXT DEFAULT NULL' }
    ];
  
    newColumns.forEach(col => {
      if (!columns.includes(col.name)) {
        try {
          db.exec(`ALTER TABLE portfolio_projects ADD COLUMN ${col.name} ${col.type}`);
        } catch (e) { }
      }
    });
  }
  migratePortfolioProjectsV2();

  // Migration: Hub V2 Projects Table (Critical Fix)
  function migrateHubProjectsV2() {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
        const columns = tableInfo.map(col => col.name);

        const v2Columns = [
            { name: 'brief_text', type: 'TEXT DEFAULT NULL' },
            { name: 'context_text', type: 'TEXT DEFAULT NULL' },
            { name: 'challenge_text', type: 'TEXT DEFAULT NULL' },
            { name: 'solution_text', type: 'TEXT DEFAULT NULL' },
            { name: 'result_text', type: 'TEXT DEFAULT NULL' },
            { name: 'cover_image_id', type: 'TEXT DEFAULT NULL' },
            { name: 'is_highlight', type: 'INTEGER DEFAULT 0' },
            { name: 'display_order', type: 'INTEGER DEFAULT 0' }
        ];

        v2Columns.forEach(col => {
            if (!columns.includes(col.name)) {
                try {
                    db.exec(`ALTER TABLE projects ADD COLUMN ${col.name} ${col.type}`);
                    console.log(`[DB] Hub Migration: colonne ${col.name} ajoutée à projects`);
                } catch (e) {
                    console.error(`[DB] Erreur ajout colonne ${col.name}:`, e.message);
                }
            }
        });
    } catch(err) {
        // Table might not exist yet, which is fine (will be created by CREATE TABLE IF NOT EXISTS)
    }
  }
  migrateHubProjectsV2();

// Migration: Marquer portfolios existants comme legacy
function markLegacyPortfolios() {
  const tableInfo = db.prepare("PRAGMA table_info(portfolios)").all();
  const columns = tableInfo.map(col => col.name);

  if (!columns.includes('is_legacy')) {
    try {
      db.exec('ALTER TABLE portfolios ADD COLUMN is_legacy INTEGER DEFAULT 0');
      // Marquer tous portfolios existants
      db.exec('UPDATE portfolios SET is_legacy = 1 WHERE created_at < datetime("now")');
      console.log('[DB] Migration: portfolios marqués legacy');
    } catch (e) {
      // Ignorer
    }
  }
}

markLegacyPortfolios();

// ============================================================
// VAULT CATEGORIES TABLE (Catégories personnalisées)
// ============================================================

db.exec(`
  CREATE TABLE IF NOT EXISTS vault_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '🏷️',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Index pour les catégories
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_vault_categories_name ON vault_categories(name)');
} catch (e) {
  // Ignorer si déjà existe
}

// ============================================================
// PORTFOLIO SOURCES TABLE (Connexions GitHub, Dribbble, etc.)
// ============================================================

// Table portfolio_sources (connexions aux sources externes)
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_sources (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    username TEXT,
    access_token TEXT,
    connected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_synced DATETIME DEFAULT NULL
  );
`);

try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_sources_type ON portfolio_sources(type)');
} catch (e) {
  // Ignorer si déjà existe
}

// ============================================================
// PORTFOLIO TABLES
// ============================================================

// Table portfolios (collections de projets professionnels)
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    template TEXT NOT NULL DEFAULT 'modern',
    is_public INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Index pour portfolios
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolios_created ON portfolios(created_at DESC)');
} catch (e) {
  // Ignorer si déjà existe
}

// Table portfolio_sections (sections du portfolio: hero, about, experience, etc.)
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_sections (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    section_type TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// Index pour portfolio_sections
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_sections_portfolio ON portfolio_sections(portfolio_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_sections_order ON portfolio_sections(portfolio_id, order_index)');
} catch (e) {
  // Ignorer si déjà existe
}

// Table portfolio_projects (projets/réalisations)
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_projects (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    long_description TEXT,
    thumbnail BLOB,
    images TEXT,
    tags TEXT,
    tech_stack TEXT,
    url TEXT,
    github_url TEXT,
    start_date DATE,
    end_date DATE,
    is_featured INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// Index pour portfolio_projects
try {
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_projects_portfolio ON portfolio_projects(portfolio_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_projects_order ON portfolio_projects(portfolio_id, order_index)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_portfolio_projects_featured ON portfolio_projects(portfolio_id, is_featured)');
} catch (e) {
  // Ignorer si déjà existe
}

// ============================================================
// PORTFOLIO HUB V2 - UNIVERSAL ARCHITECTURE
// ============================================================

// 1. PORTFOLIOS (Hub Central)
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tagline TEXT,
    intention_form_json TEXT, -- Réponses au formulaire d'intention
    selected_style TEXT, -- 'bento', 'classique', 'galerie', 'minimaliste'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Migration: Add V2 wizard columns if they don't exist
try {
  const columns = db.prepare("PRAGMA table_info(portfolios)").all();
  const columnNames = columns.map(col => col.name);

  if (!columnNames.includes('name')) {
    db.exec('ALTER TABLE portfolios ADD COLUMN name TEXT');
  }
  if (!columnNames.includes('generated_content')) {
    db.exec('ALTER TABLE portfolios ADD COLUMN generated_content TEXT');
  }
  if (!columnNames.includes('template_id')) {
    db.exec('ALTER TABLE portfolios ADD COLUMN template_id TEXT');
  }
  if (!columnNames.includes('is_primary')) {
    db.exec('ALTER TABLE portfolios ADD COLUMN is_primary INTEGER DEFAULT 0');
  }
  if (!columnNames.includes('metadata')) {
    db.exec('ALTER TABLE portfolios ADD COLUMN metadata TEXT');
  }
} catch (migrationError) {
  console.log('[DB Migration] Portfolio V2 columns migration:', migrationError.message);
}

// 2. MEDIATHEQUE (Stockage Global Autonome)
db.exec(`
  CREATE TABLE IF NOT EXISTS mediatheque_items (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'image', 'video', 'pdf', 'document'
    original_filename TEXT,
    file_size INTEGER,
    thumbnail_path TEXT,
    tags_json TEXT,
    metadata_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// 3. PROJECTS (Récits structurés)
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    title TEXT NOT NULL,
    brief_text TEXT,
    challenge_text TEXT,
    solution_text TEXT,
    is_highlight INTEGER DEFAULT 0, -- 0 or 1
    display_order INTEGER DEFAULT 0,
    cover_image_id TEXT, -- Reference to mediatheque_items
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// 4. PROJECT MEDIA (Liaison Projet <-> Médiathèque)
db.exec(`
  CREATE TABLE IF NOT EXISTS project_media (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    mediatheque_item_id TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    caption TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(mediatheque_item_id) REFERENCES mediatheque_items(id) ON DELETE CASCADE
  );
`);

// 5. EXTERNAL ACCOUNTS (Agrégateur)
db.exec(`
  CREATE TABLE IF NOT EXISTS external_accounts (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    platform_type TEXT NOT NULL, -- 'instagram', 'github', 'linkedin', etc.
    account_url TEXT NOT NULL,
    account_username TEXT,
    is_primary INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// 6. PUBLICATIONS (Web & Export) - V2 Hub
db.exec(`
  CREATE TABLE IF NOT EXISTS portfolio_publications (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    publication_type TEXT NOT NULL, -- 'full' or 'project_single'
    project_id TEXT, -- NULL if full portfolio
    slug TEXT,
    published_url TEXT,
    qr_code_path TEXT,
    published_at DATETIME,
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// 7. STYLES GENERÉS (IA)
db.exec(`
  CREATE TABLE IF NOT EXISTS generated_styles (
    id TEXT PRIMARY KEY,
    portfolio_id TEXT NOT NULL,
    style_type TEXT NOT NULL,
    color_palette_json TEXT,
    typography_json TEXT,
    layout_config_json TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
  );
`);

// ============================================================
// MIGRATIONS: IDENDITY & AUTHOR
// ============================================================

function migratePortfoliosIdentity() {
  const tableInfo = db.prepare("PRAGMA table_info(portfolios)").all();
  const columns = tableInfo.map(col => col.name);

  const newColumns = [
    { name: 'author_name', type: 'TEXT' },
    { name: 'author_bio', type: 'TEXT' },
    { name: 'author_email', type: 'TEXT' } // Optional contact info
  ];

  newColumns.forEach(col => {
    if (!columns.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE portfolios ADD COLUMN ${col.name} ${col.type}`);
        console.log(`[DB] Identity Migration: Added ${col.name} to portfolios`);
      } catch (e) {
        console.error(`[DB] Error adding ${col.name}:`, e.message);
      }
    }
  });
}

migratePortfoliosIdentity();

// ============================================================
// HELPER: Vérifier si une colonne existe
// ============================================================

function hasColumn(columnName) {
  const tableInfo = db.prepare("PRAGMA table_info(analyses)").all();
  return tableInfo.some(col => col.name === columnName);
}

const hasScoreGlobal = hasColumn('score_global');

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  db, // Export db instance for direct access in IPC handlers
  /**
   * Sauvegarde une analyse complète
   */
  saveFullAnalysis: (filename, rawContent, iaResult) => {
    // Extraire le score si présent dans le résultat
    let scoreGlobal = null;
    if (hasScoreGlobal && iaResult) {
      const scoreMatch = iaResult.match(/SCORE\s*(?:GLOBAL|SOUVERAIN)?\s*:?\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/i);
      if (scoreMatch) {
        scoreGlobal = parseFloat(scoreMatch[1].replace(',', '.'));
      }
    }

    try {
      let stmt;
      if (hasScoreGlobal) {
        stmt = db.prepare('INSERT INTO analyses (filename, content_raw, ia_result, score_global) VALUES (?, ?, ?, ?)');
        return stmt.run(filename, rawContent, typeof iaResult === 'string' ? iaResult : JSON.stringify(iaResult), scoreGlobal);
      } else {
        // Fallback schéma V14
        stmt = db.prepare('INSERT INTO analyses (filename, content_raw, ia_result) VALUES (?, ?, ?)');
        return stmt.run(filename, rawContent, typeof iaResult === 'string' ? iaResult : JSON.stringify(iaResult));
      }
    } catch (err) {
      console.error('[DB] Erreur insertion:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupère l'historique des analyses
   */
  getHistory: () => {
    try {
      // Requête compatible V14 et V15
      const query = hasScoreGlobal 
        ? 'SELECT id, filename, score_global, created_at FROM analyses ORDER BY created_at DESC LIMIT 100'
        : 'SELECT id, filename, created_at FROM analyses ORDER BY created_at DESC LIMIT 100';
      return db.prepare(query).all();
    } catch (err) {
      console.error('[DB] Erreur lecture historique:', err.message);
      return [];
    }
  },

  /**
   * Récupère une analyse par ID
   */
  getAnalysisById: (id) => {
    try {
      return db.prepare('SELECT * FROM analyses WHERE id = ?').get(id);
    } catch (err) {
      console.error('[DB] Erreur lecture analyse:', err.message);
      return null;
    }
  },

  /**
   * Supprime une analyse
   */
  deleteAnalysis: (id) => {
    try {
      const result = db.prepare('DELETE FROM analyses WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Statistiques du vault
   */
  getStats: () => {
    try {
      const count = db.prepare('SELECT COUNT(*) as total FROM analyses').get();
      let avgScore = null;
      if (hasScoreGlobal) {
        const avg = db.prepare('SELECT AVG(score_global) as avg FROM analyses WHERE score_global IS NOT NULL').get();
        avgScore = avg.avg ? Math.round(avg.avg * 10) / 10 : null;
      }
      return { totalAnalyses: count.total, averageScore: avgScore };
    } catch (err) {
      return { totalAnalyses: 0, averageScore: null };
    }
  },

  /**
   * Ferme proprement la connexion
   */
  close: () => {
    try {
      db.close();
    } catch (err) {
      console.error('[DB] Erreur fermeture:', err.message);
    }
  },

  // ============================================================
  // VAULT DOCUMENTS CRUD
  // ============================================================

  /**
   * Ajouter un document au coffre-fort
   */
  vault_addDocument: (doc) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO vault_documents
        (id, name, category, file_type, file_size, encrypted_content, thumbnail, tags, notes, document_date, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        doc.id,
        doc.name,
        doc.category,
        doc.file_type,
        doc.file_size,
        doc.encrypted_content,
        doc.thumbnail || null,
        doc.tags ? JSON.stringify(doc.tags) : null,
        doc.notes || null,
        doc.document_date || null,
        doc.is_favorite || 0
      );

      return { success: true, id: doc.id };
    } catch (err) {
      console.error('[DB] Erreur ajout document vault:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupérer tous les documents (avec filtres optionnels)
   */
  vault_getDocuments: (filters = {}) => {
    try {
      let query = 'SELECT id, name, category, file_type, file_size, tags, notes, document_date, created_at, updated_at, is_favorite FROM vault_documents WHERE 1=1';
      const params = [];

      // Filtres de catégories multiples
      if (filters.categories && filters.categories.length > 0) {
        const placeholders = filters.categories.map(() => '?').join(',');
        query += ` AND category IN (${placeholders})`;
        params.push(...filters.categories);
      }

      // Favoris uniquement
      if (filters.favoritesOnly) {
        query += ' AND is_favorite = 1';
      }

      // Recherche textuelle
      if (filters.search) {
        query += ' AND (name LIKE ? OR tags LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      // Filtres temporels - années multiples (utilise document_date ou created_at)
      if (filters.years && filters.years.length > 0) {
        const placeholders = filters.years.map(() => '?').join(',');
        query += ` AND strftime("%Y", COALESCE(document_date, created_at)) IN (${placeholders})`;
        params.push(...filters.years.map(y => y.toString()));
      }

      // Filtres temporels - mois multiples (utilise document_date ou created_at)
      if (filters.months && filters.months.length > 0) {
        const placeholders = filters.months.map(() => '?').join(',');
        query += ` AND strftime("%m", COALESCE(document_date, created_at)) IN (${placeholders})`;
        params.push(...filters.months.map(m => m.toString().padStart(2, '0')));
      }

      // Filtres de tags multiples (au moins un tag doit matcher)
      if (filters.tags && filters.tags.length > 0) {
        const tagConditions = filters.tags.map(() => 'tags LIKE ?').join(' OR ');
        query += ` AND (${tagConditions})`;
        params.push(...filters.tags.map(tag => `%"${tag}"%`));
      }

      // Tri
      const sortBy = filters.sortBy || 'created_at';
      const sortOrder = filters.sortOrder || 'DESC';
      query += ` ORDER BY ${sortBy} ${sortOrder}`;

      const documents = db.prepare(query).all(...params);

      // Parser les tags JSON
      return documents.map(doc => ({
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        is_favorite: Boolean(doc.is_favorite)
      }));
    } catch (err) {
      console.error('[DB] Erreur récupération documents vault:', err.message);
      return [];
    }
  },

  /**
   * Récupérer un document par ID (avec contenu chiffré)
   */
  vault_getDocumentById: (id) => {
    try {
      const doc = db.prepare('SELECT * FROM vault_documents WHERE id = ?').get(id);
      if (!doc) return null;

      return {
        ...doc,
        tags: doc.tags ? JSON.parse(doc.tags) : [],
        is_favorite: Boolean(doc.is_favorite)
      };
    } catch (err) {
      console.error('[DB] Erreur récupération document vault:', err.message);
      return null;
    }
  },

  /**
   * Mettre à jour un document
   */
  vault_updateDocument: (id, updates) => {
    try {
      const fields = [];
      const params = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        params.push(updates.name);
      }
      if (updates.category !== undefined) {
        fields.push('category = ?');
        params.push(updates.category);
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        params.push(JSON.stringify(updates.tags));
      }
      if (updates.notes !== undefined) {
        fields.push('notes = ?');
        params.push(updates.notes);
      }
      if (updates.is_favorite !== undefined) {
        fields.push('is_favorite = ?');
        params.push(updates.is_favorite ? 1 : 0);
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE vault_documents SET ${fields.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);

      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour document vault:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Supprimer un document
   */
  vault_deleteDocument: (id) => {
    try {
      const result = db.prepare('DELETE FROM vault_documents WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression document vault:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Compter les documents
   */
  vault_countDocuments: () => {
    try {
      const result = db.prepare('SELECT COUNT(*) as total FROM vault_documents').get();
      return result.total;
    } catch (err) {
      console.error('[DB] Erreur comptage documents vault:', err.message);
      return 0;
    }
  },

  /**
   * Calculer le stockage total utilisé (en octets)
   */
  vault_getTotalStorage: () => {
    try {
      const result = db.prepare('SELECT SUM(file_size) as total FROM vault_documents').get();
      return result.total || 0;
    } catch (err) {
      console.error('[DB] Erreur calcul stockage:', err.message);
      return 0;
    }
  },

  /**
   * Obtenir les années présentes dans les documents
   * Utilise document_date si défini, sinon created_at
   */
  vault_getAvailableYears: () => {
    try {
      const years = db.prepare(`
        SELECT DISTINCT strftime('%Y', COALESCE(document_date, created_at)) as year
        FROM vault_documents
        ORDER BY year DESC
      `).all();
      return years.map(y => y.year);
    } catch (err) {
      console.error('[DB] Erreur récupération années:', err.message);
      return [];
    }
  },

  /**
   * Obtenir les mois présents dans les documents (pour une année donnée ou tous)
   * Utilise document_date si défini, sinon created_at
   */
  vault_getAvailableMonths: (year = null) => {
    try {
      let query = `
        SELECT DISTINCT strftime('%m', COALESCE(document_date, created_at)) as month
        FROM vault_documents
      `;

      if (year) {
        query += ` WHERE strftime('%Y', COALESCE(document_date, created_at)) = ?`;
      }

      query += ` ORDER BY month ASC`;

      const stmt = db.prepare(query);
      const months = year ? stmt.all(year) : stmt.all();
      const result = months.map(m => m.month);

      console.log('[DB] vault_getAvailableMonths() query:', query);
      console.log('[DB] vault_getAvailableMonths() raw result:', months);
      console.log('[DB] vault_getAvailableMonths() returning:', result);

      return result;
    } catch (err) {
      console.error('[DB] Erreur récupération mois:', err.message);
      return [];
    }
  },

  /**
   * Obtenir les catégories utilisées dans les documents
   */
  vault_getUsedCategories: () => {
    try {
      const categories = db.prepare(`
        SELECT DISTINCT category
        FROM vault_documents
        WHERE category IS NOT NULL
        ORDER BY category ASC
      `).all();
      return categories.map(c => c.category);
    } catch (err) {
      console.error('[DB] Erreur récupération catégories utilisées:', err.message);
      return [];
    }
  },

  // ============================================================
  // VAULT CATEGORIES CRUD
  // ============================================================

  /**
   * Ajouter une catégorie personnalisée
   */
  vault_addCategory: (category) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO vault_categories (id, name, icon)
        VALUES (?, ?, ?)
      `);

      const result = stmt.run(category.id, category.name, category.icon || '🏷️');
      return { success: true, id: category.id };
    } catch (err) {
      console.error('[DB] Erreur ajout catégorie:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupérer toutes les catégories personnalisées
   */
  vault_getCategories: () => {
    try {
      return db.prepare('SELECT * FROM vault_categories ORDER BY created_at DESC').all();
    } catch (err) {
      console.error('[DB] Erreur récupération catégories:', err.message);
      return [];
    }
  },

  /**
   * Compter les catégories personnalisées
   */
  vault_countCategories: () => {
    try {
      const result = db.prepare('SELECT COUNT(*) as total FROM vault_categories').get();
      return result.total;
    } catch (err) {
      console.error('[DB] Erreur comptage catégories:', err.message);
      return 0;
    }
  },

  /**
   * Supprimer une catégorie personnalisée
   */
  vault_deleteCategory: (id) => {
    try {
      const result = db.prepare('DELETE FROM vault_categories WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression catégorie:', err.message);
      return { success: false, error: err.message };
    }
  },


  // ============================================================
  // PORTFOLIO HUB V2 - MANAGER
  // ============================================================

  // --- 1. PORTFOLIOS ---

  portfolio_create: (data) => {
    try {
      const slug = data.slug || ((data.title || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-6));
      
      const stmt = db.prepare(`
        INSERT INTO portfolios (
          id, title, tagline, intention_form_json, selected_style, user_id, mode, is_primary, slug, name
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
          data.id,
          data.title || 'Nouveau Portfolio',
          data.tagline || null,
          JSON.stringify(data.intentionForm || {}),
          data.selectedStyle || 'classique',
          data.userId || 'default',
          data.mode || 'independant', 
          data.isPrimary ? 1 : 0,
          slug,
          data.title || 'Nouveau Portfolio' // Backfill name for V1 compatibility
      );
      return { success: true, id: data.id };
    } catch (err) {
      console.error('[DB] Error create portfolio:', err.message);
      return { success: false, error: err.message };
    }
  },

  portfolio_getAll: () => {
    try {
      // Return all portfolios, V1 or V2
      return db.prepare('SELECT * FROM portfolios ORDER BY updated_at DESC').all();
    } catch (err) {
      return [];
    }
  },

  portfolio_update: (id, updates) => {
      try {
          const fields = [];
          const values = [];
          
          // Safe explicit mapping
          const allowed = ['title', 'tagline', 'selected_style', 'intention_form_json', 'user_id', 'mode', 'is_primary', 'slug'];
          
          Object.keys(updates).forEach(key => {
             // Camel to snake if needed, or direct mapping
             let dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
             if (key === 'intentionForm') dbKey = 'intention_form_json';
             if (key === 'selectedStyle') dbKey = 'selected_style';
             if (key === 'isPrimary') dbKey = 'is_primary';
             
             if (allowed.includes(dbKey)) {
                 fields.push(`${dbKey} = ?`);
                 let val = updates[key];
                 if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                 if (typeof val === 'boolean') val = val ? 1 : 0;
                 values.push(val);
             }
          });

          if (fields.length === 0) return { success: true };
          
          fields.push('updated_at = CURRENT_TIMESTAMP');
          values.push(id);
          
          const sql = `UPDATE portfolios SET ${fields.join(', ')} WHERE id = ?`;
          db.prepare(sql).run(...values);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  portfolio_delete: (id) => {
      try {
          db.prepare('DELETE FROM portfolios WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  // --- 2. MEDIATHEQUE (ITEMS) ---

  mediatheque_add: (data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO mediatheque_items (
          id, portfolio_id, file_path, file_type, original_filename,
          file_size, thumbnail_path, tags_json, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        data.id, data.portfolioId, data.filePath, data.fileType, data.originalFilename,
        data.fileSize, data.thumbnailPath, JSON.stringify(data.tags || []), JSON.stringify(data.metadata || {})
      );
      return { success: true, id: data.id };
    } catch (err) {
      console.error('[DB] Error add mediatheque item:', err.message);
      return { success: false, error: err.message };
    }
  },

  mediatheque_getAll: (portfolioId) => {
    try {
      const items = db.prepare('SELECT * FROM mediatheque_items WHERE portfolio_id = ? ORDER BY created_at DESC').all(portfolioId);
      return items.map(item => ({
          ...item,
          tags: JSON.parse(item.tags_json || '[]'),
          metadata: JSON.parse(item.metadata_json || '{}')
      }));
    } catch (err) {
        return [];
    }
  },

  mediatheque_delete: (id) => {
      try {
          db.prepare('DELETE FROM mediatheque_items WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  // --- 3. PROJECTS ---

  project_create: (data) => {
      try {
          const stmt = db.prepare(`
            INSERT INTO projects (
              id, portfolio_id, title, brief_text, challenge_text, solution_text,
              is_highlight, display_order, cover_image_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(
              data.id, data.portfolioId, data.title, data.briefText, data.challengeText, data.solutionText,
              data.isHighlight ? 1 : 0, data.displayOrder || 0, data.coverImageId || null
          );
          return { success: true, id: data.id };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  project_getAll: (portfolioId) => {
      try {
          return db.prepare('SELECT * FROM projects WHERE portfolio_id = ? ORDER BY display_order ASC, created_at DESC').all(portfolioId);
      } catch (err) {
          return [];
      }
  },

  project_getById: (id) => {
      try {
          return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
      } catch (err) {
          return null;
      }
  },

  project_update: (id, updates) => {
      try {
          // Dynamic update helper
          const validationIds = ['id']; 
          const keys = Object.keys(updates).filter(k => !validationIds.includes(k));
          if (keys.length === 0) return { success: true };

          const sets = keys.map(k => {
              // Convert camelCase to snake_case simple heuristic
              const dbKey = k.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`); 
              return `${dbKey} = ?`;
          });
          const values = keys.map(k => {
             const val = updates[k];
             if (typeof val === 'boolean') return val ? 1 : 0;
             return val;
          });
          values.push(id);

          const sql = `UPDATE projects SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
          db.prepare(sql).run(...values);
          return { success: true };
      } catch (err) {
          console.error('[DB] Project update error:', err);
          return { success: false, error: err.message };
      }
  },

  project_delete: (id) => {
      try {
          db.prepare('DELETE FROM projects WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  // --- 4. PROJECT MEDIA ---

  projectMedia_add: (data) => {
      try {
          const stmt = db.prepare(`
            INSERT INTO project_media (
              id, project_id, mediatheque_item_id, display_order, caption
            ) VALUES (?, ?, ?, ?, ?)
          `);
          stmt.run(data.id, data.projectId, data.mediathequeItemId, data.displayOrder || 0, data.caption || null);
          return { success: true, id: data.id };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  projectMedia_getByProject: (projectId) => {
      try {
          return db.prepare(`
            SELECT pm.*, mi.file_path, mi.thumbnail_path, mi.file_type 
            FROM project_media pm
            JOIN mediatheque_items mi ON pm.mediatheque_item_id = mi.id
            WHERE pm.project_id = ?
            ORDER BY pm.display_order ASC
          `).all(projectId);
      } catch (err) {
          return [];
      }
  },

  projectMedia_delete: (id) => {
      try {
          db.prepare('DELETE FROM project_media WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  // --- 5. EXTERNAL ACCOUNTS ---

  externalAccount_add: (data) => {
      try {
          const stmt = db.prepare(`
             INSERT INTO external_accounts (
               id, portfolio_id, platform_type, account_url, account_username, is_primary, display_order
             ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(data.id, data.portfolioId, data.platformType, data.accountUrl, data.accountUsername, data.isPrimary ? 1 : 0, data.displayOrder);
          return { success: true, id: data.id };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  externalAccount_getAll: (portfolioId) => {
      try {
          return db.prepare('SELECT * FROM external_accounts WHERE portfolio_id = ? ORDER BY is_primary DESC, display_order ASC').all(portfolioId);
      } catch(err) { return []; }
  },

  externalAccount_delete: (id) => {
      try {
          db.prepare('DELETE FROM external_accounts WHERE id = ?').run(id);
          return { success: true };
      } catch(err) { return { success: false, error: err.message }; }
  },

  // ============================================================
  // HELPER: Contenu par défaut des sections
  // ============================================================

  getDefaultSectionContent: (type) => {
    const defaults = {
      hero: { photo: null, name: '', title: '', tagline: '', location: '', availability: '' },
      about: { headline: '', bio: '', highlights: [] },
      experience: { entries: [] },
      skills: { categories: [] },
      projects: { entries: [] },
      education: { entries: [] },
      contact: { email: '', phone: '', linkedin: '', github: '', website: '', twitter: '', customLinks: [] }
    };
    return defaults[type] || {};
  },

  // ============================================================
  // HUB V2 PROJECT CRUD
  // ============================================================

  project_create: (data) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO projects (
          id, portfolio_id, title, 
          brief_text, context_text, challenge_text, solution_text, result_text,
          is_highlight, display_order, cover_image_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.id,
        data.portfolioId || data.portfolio_id,
        data.title,
        data.briefText || data.brief_text || '',
        data.contextText || data.context_text || '',
        data.challengeText || data.challenge_text || '',
        data.solutionText || data.solution_text || '',
        data.resultText || data.result_text || '',
        data.isHighlight || data.is_highlight ? 1 : 0,
        data.displayOrder || data.display_order || 0,
        data.coverImageId || data.cover_image_id || null
      );

      return { success: true, id: data.id };
    } catch (err) {
      console.error('[DB] Erreur création projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  project_getAll: (portfolioId) => {
    try {
      const tableInfo = db.prepare("PRAGMA table_info(projects)").all();
      const cols = tableInfo.map(c => c.name);
      
      const selects = [
        'id', 'portfolio_id', 'title', 'brief_text', 'challenge_text', 'solution_text',
        cols.includes('result_text') ? 'result_text' : "'' as result_text",
        cols.includes('context_text') ? 'context_text' : "'' as context_text",
        'is_highlight', 'display_order', 'cover_image_id', 'created_at', 'updated_at'
      ];
      
      const projects = db.prepare(`
        SELECT ${selects.join(', ')} 
        FROM projects 
        WHERE portfolio_id = ? 
        ORDER BY display_order ASC, created_at DESC
      `).all(portfolioId);

      return projects;
    } catch (err) {
      console.error('[DB] Erreur lecture projets:', err.message);
      return [];
    }
  },

  project_update: (id, updates) => {
    try {
      const validFields = [
        'title', 'brief_text', 'context_text', 'challenge_text', 'solution_text', 'result_text',
        'is_highlight', 'display_order', 'cover_image_id'
      ];
      const fields = [];
      const params = [];

      Object.keys(updates).forEach(key => {
        let dbKey = key;
        if (key === 'briefText') dbKey = 'brief_text';
        if (key === 'contextText') dbKey = 'context_text';
        if (key === 'challengeText') dbKey = 'challenge_text';
        if (key === 'solutionText') dbKey = 'solution_text';
        if (key === 'resultText') dbKey = 'result_text';
        if (key === 'isHighlight') dbKey = 'is_highlight';
        if (key === 'displayOrder') dbKey = 'display_order';
        if (key === 'coverImageId') dbKey = 'cover_image_id';
        
        if (validFields.includes(dbKey)) {
          fields.push(`${dbKey} = ?`);
          let val = updates[key];
          if (dbKey === 'is_highlight') val = val ? 1 : 0;
          params.push(val);
        }
      });

      if (fields.length === 0) return { success: true };

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);
      
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  project_delete: (id) => {
    try {
      const result = db.prepare('DELETE FROM projects WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  projectMedia_add: (data) => {
      try {
          const stmt = db.prepare(`
            INSERT INTO project_media (id, project_id, mediatheque_item_id, display_order, caption)
            VALUES (?, ?, ?, ?, ?)
          `);
          stmt.run(data.id, data.project_id, data.mediatheque_item_id, data.display_order || 0, data.caption || null);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  projectMedia_getByProject: (projectId) => {
      try {
          return db.prepare(`
            SELECT pm.*, mi.file_path, mi.file_type, mi.thumbnail_path 
            FROM project_media pm
            JOIN mediatheque_items mi ON pm.mediatheque_item_id = mi.id
            WHERE pm.project_id = ?
            ORDER BY pm.display_order ASC
          `).all(projectId);
      } catch (err) {
          return [];
      }
  },

  projectMedia_delete: (id) => {
      try {
          db.prepare('DELETE FROM project_media WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  externalAccount_add: (data) => {
      try {
          const stmt = db.prepare(`
            INSERT INTO external_accounts (id, portfolio_id, platform_type, account_url, account_username, is_primary, display_order)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(data.id, data.portfolio_id, data.platform_type, data.account_url, data.account_username, data.is_primary ? 1 : 0, data.display_order || 0);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  externalAccount_getAll: (portfolioId) => {
      try {
          return db.prepare('SELECT * FROM external_accounts WHERE portfolio_id = ? ORDER BY display_order ASC').all(portfolioId);
      } catch (err) {
          return [];
      }
  },

  externalAccount_delete: (id) => {
      try {
          db.prepare('DELETE FROM external_accounts WHERE id = ?').run(id);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  // ============================================================
  // ANONYMIZATION MAPS (Correction 1.2)
  // ============================================================

  anonymizationMap_insert: (data) => {
      try {
          const stmt = db.prepare(`
              INSERT INTO anonymization_maps (id, portfolio_id, project_id, original_value, anonymized_token, value_type, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
          `);
          stmt.run(data.id, data.portfolio_id, data.project_id, data.original_value, data.anonymized_token, data.value_type, data.created_at);
          return { success: true };
      } catch (err) {
          return { success: false, error: err.message };
      }
  },

  anonymizationMap_getByValue: (portfolioId, originalValue) => {
      try {
          return db.prepare(`
              SELECT * FROM anonymization_maps
              WHERE portfolio_id = ? AND original_value = ?
              LIMIT 1
          `).get(portfolioId, originalValue);
      } catch (err) {
          return null;
      }
  },

  anonymizationMap_getTokenCount: (portfolioId, valueType) => {
      try {
          const result = db.prepare(`
              SELECT COUNT(*) as count FROM anonymization_maps
              WHERE portfolio_id = ? AND value_type = ?
          `).get(portfolioId, valueType);
          return result.count || 0;
      } catch (err) {
          return 0;
      }
  },

  anonymizationMap_getAll: (portfolioId) => {
      try {
          return db.prepare('SELECT * FROM anonymization_maps WHERE portfolio_id = ?').all(portfolioId);
      } catch (err) {
          return [];
      }
  },

  // ============================================================
  // MPF-1: Portfolio Selection Functions
  // ============================================================

  portfolios_getAll: () => {
    try {
      return db.prepare('SELECT * FROM portfolios ORDER BY updated_at DESC').all();
    } catch (error) {
      console.error('[DB] portfolios_getAll error:', error);
      return [];
    }
  },

  portfolios_insert: (data) => {
    try {
      // Generate slug if not provided (same logic as portfolio_create)
      const slug = data.slug || ((data.name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-6));
      
      const stmt = db.prepare(`
        INSERT INTO portfolios (id, name, slug, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(data.id, data.name, slug, data.created_at, data.created_at);
      return { success: true, id: data.id };
    } catch (error) {
      console.error('[DB] portfolios_insert error:', error);
      return { success: false, error: error.message };
    }
  },

  portfolios_updateIntentions: (portfolioId, intentionsJson) => {
    try {
      const stmt = db.prepare(`
        UPDATE portfolios SET intention_form_json = ?, updated_at = ? WHERE id = ?
      `);
      stmt.run(intentionsJson, new Date().toISOString(), portfolioId);
      return { success: true };
    } catch (error) {
      console.error('[DB] portfolios_updateIntentions error:', error);
      return { success: false, error: error.message };
    }
  },

  portfolios_updateContent: (portfolioId, contentJson) => {
    try {
      const stmt = db.prepare(`
        UPDATE portfolios SET content_json = ?, updated_at = ? WHERE id = ?
      `);
      stmt.run(contentJson, new Date().toISOString(), portfolioId);
      return { success: true };
    } catch (error) {
      console.error('[DB] portfolios_updateContent error:', error);
      return { success: false, error: error.message };
    }
  },

  portfolios_delete: (portfolioId) => {
    try {
      const stmt = db.prepare('DELETE FROM portfolios WHERE id = ?');
      stmt.run(portfolioId);
      return { success: true };
    } catch (error) {
      console.error('[DB] portfolios_delete error:', error);
      return { success: false, error: error.message };
    }
  },

  // ============================================================
  // TEMPLATES (Phase 2)
  // ============================================================

  templates_getAll: () => {
    try {
      const stmt = db.prepare('SELECT * FROM templates ORDER BY category, name');
      return stmt.all();
    } catch (error) {
      console.error('[DB] templates_getAll error:', error);
      return [];
    }
  },

  templates_getFree: () => {
    try {
      const stmt = db.prepare('SELECT * FROM templates WHERE category = ? ORDER BY name');
      return stmt.all('free');
    } catch (error) {
      console.error('[DB] templates_getFree error:', error);
      return [];
    }
  },

  templates_getOwned: () => {
    try {
      const stmt = db.prepare('SELECT * FROM templates WHERE is_owned = 1 ORDER BY category, name');
      return stmt.all();
    } catch (error) {
      console.error('[DB] templates_getOwned error:', error);
      return [];
    }
  },

  templates_getBoutique: () => {
    try {
      const stmt = db.prepare('SELECT * FROM templates WHERE category = ? AND is_owned = 0 ORDER BY name');
      return stmt.all('premium');
    } catch (error) {
      console.error('[DB] templates_getBoutique error:', error);
      return [];
    }
  },

  templates_getById: (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM templates WHERE id = ?');
      return stmt.get(id);
    } catch (error) {
      console.error('[DB] templates_getById error:', error);
      return null;
    }
  },

  templates_purchase: (templateId, amountPaid, isPremiumDiscount) => {
    try {
      const { v4: uuidv4 } = require('uuid');
      const licenseId = uuidv4();
      const now = new Date().toISOString();

      // Create license
      const licenseStmt = db.prepare(`
        INSERT INTO template_licenses (id, template_id, purchased_at, amount_paid, is_premium_discount)
        VALUES (?, ?, ?, ?, ?)
      `);
      licenseStmt.run(licenseId, templateId, now, amountPaid, isPremiumDiscount ? 1 : 0);

      // Mark template as owned
      const updateStmt = db.prepare(`
        UPDATE templates SET is_owned = 1, purchased_at = ? WHERE id = ?
      `);
      updateStmt.run(now, templateId);

      return { success: true, licenseId };
    } catch (error) {
      console.error('[DB] templates_purchase error:', error);
      return { success: false, error: error.message };
    }
  },

}; // End of module.exports

// ============================================================
// HELPER: Contenu par défaut des sections
// ============================================================

function getDefaultSectionContent(type) {
  const defaults = {
    hero: { photo: null, name: '', title: '', tagline: '', location: '', availability: '' },
    about: { headline: '', bio: '', highlights: [] },
    experience: { entries: [] },
    skills: { categories: [] },
    projects: { entries: [] },
    education: { entries: [] },
    contact: { email: '', phone: '', linkedin: '', github: '', website: '', twitter: '', customLinks: [] }
  };
  return defaults[type] || {};
}

