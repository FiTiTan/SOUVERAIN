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
function migratePortfolioProjectsV2() {
  const tableInfo = db.prepare("PRAGMA table_info(portfolio_projects)").all();
  const columns = tableInfo.map(col => col.name);

  const newColumns = [
    { name: 'source_type', type: 'TEXT DEFAULT NULL' },
    { name: 'source_url', type: 'TEXT DEFAULT NULL' },
    { name: 'source_data', type: 'TEXT DEFAULT NULL' },
    { name: 'pitch', type: 'TEXT DEFAULT NULL' },
    { name: 'stack', type: 'TEXT DEFAULT NULL' },
    { name: 'challenge', type: 'TEXT DEFAULT NULL' },
    { name: 'solution', type: 'TEXT DEFAULT NULL' },
    { name: 'outputs', type: 'TEXT DEFAULT NULL' },
    { name: 'is_ghost_mode', type: 'INTEGER DEFAULT 0' },
    { name: 'ghost_replacements', type: 'TEXT DEFAULT NULL' },
    { name: 'visibility', type: 'TEXT DEFAULT "all"' },
    { name: 'last_synced', type: 'DATETIME DEFAULT NULL' }
  ];

  newColumns.forEach(col => {
    if (!columns.includes(col.name)) {
      try {
        db.exec(`ALTER TABLE portfolio_projects ADD COLUMN ${col.name} ${col.type}`);
        console.log(`[DB] Migration: colonne ${col.name} ajoutée`);
      } catch (e) {
        // Ignorer si déjà existe
      }
    }
  });
}

migratePortfolioProjectsV2();

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

      // Filtres temporels - années multiples
      if (filters.years && filters.years.length > 0) {
        const placeholders = filters.years.map(() => '?').join(',');
        query += ` AND strftime("%Y", document_date) IN (${placeholders})`;
        params.push(...filters.years.map(y => y.toString()));
      }

      // Filtres temporels - mois multiples
      if (filters.months && filters.months.length > 0) {
        const placeholders = filters.months.map(() => '?').join(',');
        query += ` AND strftime("%m", document_date) IN (${placeholders})`;
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
   */
  vault_getAvailableYears: () => {
    try {
      const years = db.prepare(`
        SELECT DISTINCT strftime('%Y', document_date) as year
        FROM vault_documents
        WHERE document_date IS NOT NULL
        ORDER BY year DESC
      `).all();
      return years.map(y => y.year);
    } catch (err) {
      console.error('[DB] Erreur récupération années:', err.message);
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
  // PORTFOLIO CRUD
  // ============================================================

  /**
   * Créer un portfolio avec ses 7 sections par défaut
   */
  portfolio_create: (data) => {
    try {
      const { id, name, slug, template = 'modern', metadata = null } = data;

      // 1. Insérer le portfolio
      const portfolioStmt = db.prepare(`
        INSERT INTO portfolios (id, name, slug, template, metadata)
        VALUES (?, ?, ?, ?, ?)
      `);
      portfolioStmt.run(id, name, slug, template, metadata);

      // 2. Créer les 7 sections par défaut
      const sectionTypes = ['hero', 'about', 'experience', 'skills', 'projects', 'education', 'contact'];
      const sectionStmt = db.prepare(`
        INSERT INTO portfolio_sections (id, portfolio_id, section_type, content, order_index)
        VALUES (?, ?, ?, ?, ?)
      `);

      sectionTypes.forEach((type, index) => {
        const sectionId = `${id}_section_${type}`;
        const defaultContent = JSON.stringify(getDefaultSectionContent(type));
        sectionStmt.run(sectionId, id, type, defaultContent, index);
      });

      return { success: true, id };
    } catch (err) {
      console.error('[DB] Erreur création portfolio:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupérer tous les portfolios
   */
  portfolio_getAll: () => {
    try {
      return db.prepare('SELECT * FROM portfolios ORDER BY created_at DESC').all();
    } catch (err) {
      console.error('[DB] Erreur récupération portfolios:', err.message);
      return [];
    }
  },

  /**
   * Récupérer un portfolio par ID avec ses sections
   */
  portfolio_getById: (id) => {
    try {
      const portfolio = db.prepare('SELECT * FROM portfolios WHERE id = ?').get(id);
      if (!portfolio) return null;

      const sections = db.prepare(`
        SELECT * FROM portfolio_sections
        WHERE portfolio_id = ?
        ORDER BY order_index ASC
      `).all(id);

      portfolio.sections = sections;
      return portfolio;
    } catch (err) {
      console.error('[DB] Erreur récupération portfolio:', err.message);
      return null;
    }
  },

  /**
   * Compter le nombre de portfolios
   */
  portfolio_count: () => {
    try {
      const result = db.prepare('SELECT COUNT(*) as total FROM portfolios').get();
      return result.total;
    } catch (err) {
      console.error('[DB] Erreur comptage portfolios:', err.message);
      return 0;
    }
  },

  /**
   * Mettre à jour un portfolio
   */
  portfolio_update: (id, updates) => {
    try {
      const fields = [];
      const params = [];

      if (updates.name !== undefined) {
        fields.push('name = ?');
        params.push(updates.name);
      }
      if (updates.slug !== undefined) {
        fields.push('slug = ?');
        params.push(updates.slug);
      }
      if (updates.template !== undefined) {
        fields.push('template = ?');
        params.push(updates.template);
      }
      if (updates.is_public !== undefined) {
        fields.push('is_public = ?');
        params.push(updates.is_public);
      }
      if (updates.is_published !== undefined) {
        fields.push('is_published = ?');
        params.push(updates.is_published);
      }
      if (updates.metadata !== undefined) {
        fields.push('metadata = ?');
        params.push(updates.metadata);
      }

      if (fields.length === 0) {
        return { success: true };
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE portfolios SET ${fields.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);

      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour portfolio:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Supprimer un portfolio (cascade sections et projets)
   */
  portfolio_delete: (id) => {
    try {
      const result = db.prepare('DELETE FROM portfolios WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression portfolio:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Mettre à jour une section
   */
  portfolio_section_update: (id, content) => {
    try {
      const stmt = db.prepare(`
        UPDATE portfolio_sections
        SET content = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(content, id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour section:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Toggle visibilité d'une section
   */
  portfolio_section_toggleVisibility: (id, isVisible) => {
    try {
      const stmt = db.prepare(`
        UPDATE portfolio_sections
        SET is_visible = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      const result = stmt.run(isVisible ? 1 : 0, id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur toggle visibilité section:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Réorganiser les sections (batch update)
   */
  portfolio_section_reorder: (portfolioId, sectionOrders) => {
    try {
      const updateStmt = db.prepare(`
        UPDATE portfolio_sections
        SET order_index = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const transaction = db.transaction((orders) => {
        orders.forEach(({ id, order }) => {
          updateStmt.run(order, id);
        });
      });

      transaction(sectionOrders);
      return { success: true };
    } catch (err) {
      console.error('[DB] Erreur réorganisation sections:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Créer un projet
   */
  portfolio_project_create: (project) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO portfolio_projects
        (id, portfolio_id, title, slug, description, long_description, thumbnail,
         images, tags, tech_stack, url, github_url, start_date, end_date,
         is_featured, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        project.id,
        project.portfolio_id,
        project.title,
        project.slug,
        project.description || null,
        project.long_description || null,
        project.thumbnail || null,
        project.images ? JSON.stringify(project.images) : null,
        project.tags ? JSON.stringify(project.tags) : null,
        project.tech_stack ? JSON.stringify(project.tech_stack) : null,
        project.url || null,
        project.github_url || null,
        project.start_date || null,
        project.end_date || null,
        project.is_featured || 0,
        project.order_index
      );

      return { success: true, id: project.id };
    } catch (err) {
      console.error('[DB] Erreur création projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupérer tous les projets d'un portfolio
   */
  portfolio_project_getAll: (portfolioId) => {
    try {
      const projects = db.prepare(`
        SELECT * FROM portfolio_projects
        WHERE portfolio_id = ?
        ORDER BY order_index ASC
      `).all(portfolioId);

      // Parser les JSON
      return projects.map(p => ({
        ...p,
        images: p.images ? JSON.parse(p.images) : [],
        tags: p.tags ? JSON.parse(p.tags) : [],
        tech_stack: p.tech_stack ? JSON.parse(p.tech_stack) : []
      }));
    } catch (err) {
      console.error('[DB] Erreur récupération projets:', err.message);
      return [];
    }
  },

  /**
   * Récupérer un projet par ID
   */
  portfolio_project_getById: (id) => {
    try {
      const project = db.prepare('SELECT * FROM portfolio_projects WHERE id = ?').get(id);
      if (!project) return null;

      // Parser les JSON
      return {
        ...project,
        images: project.images ? JSON.parse(project.images) : [],
        tags: project.tags ? JSON.parse(project.tags) : [],
        tech_stack: project.tech_stack ? JSON.parse(project.tech_stack) : []
      };
    } catch (err) {
      console.error('[DB] Erreur récupération projet:', err.message);
      return null;
    }
  },

  /**
   * Mettre à jour un projet
   */
  portfolio_project_update: (id, updates) => {
    try {
      const fields = [];
      const params = [];

      if (updates.title !== undefined) {
        fields.push('title = ?');
        params.push(updates.title);
      }
      if (updates.slug !== undefined) {
        fields.push('slug = ?');
        params.push(updates.slug);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        params.push(updates.description);
      }
      if (updates.long_description !== undefined) {
        fields.push('long_description = ?');
        params.push(updates.long_description);
      }
      if (updates.thumbnail !== undefined) {
        fields.push('thumbnail = ?');
        params.push(updates.thumbnail);
      }
      if (updates.images !== undefined) {
        fields.push('images = ?');
        params.push(JSON.stringify(updates.images));
      }
      if (updates.tags !== undefined) {
        fields.push('tags = ?');
        params.push(JSON.stringify(updates.tags));
      }
      if (updates.tech_stack !== undefined) {
        fields.push('tech_stack = ?');
        params.push(JSON.stringify(updates.tech_stack));
      }
      if (updates.url !== undefined) {
        fields.push('url = ?');
        params.push(updates.url);
      }
      if (updates.github_url !== undefined) {
        fields.push('github_url = ?');
        params.push(updates.github_url);
      }
      if (updates.start_date !== undefined) {
        fields.push('start_date = ?');
        params.push(updates.start_date);
      }
      if (updates.end_date !== undefined) {
        fields.push('end_date = ?');
        params.push(updates.end_date);
      }
      if (updates.is_featured !== undefined) {
        fields.push('is_featured = ?');
        params.push(updates.is_featured ? 1 : 0);
      }
      if (updates.order_index !== undefined) {
        fields.push('order_index = ?');
        params.push(updates.order_index);
      }

      if (fields.length === 0) {
        return { success: true };
      }

      fields.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      const query = `UPDATE portfolio_projects SET ${fields.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);

      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Supprimer un projet
   */
  portfolio_project_delete: (id) => {
    try {
      const result = db.prepare('DELETE FROM portfolio_projects WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression projet:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Réorganiser les projets (batch update)
   */
  portfolio_project_reorder: (portfolioId, projectOrders) => {
    try {
      const updateStmt = db.prepare(`
        UPDATE portfolio_projects
        SET order_index = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const transaction = db.transaction((orders) => {
        orders.forEach(({ id, order }) => {
          updateStmt.run(order, id);
        });
      });

      transaction(projectOrders);
      return { success: true };
    } catch (err) {
      console.error('[DB] Erreur réorganisation projets:', err.message);
      return { success: false, error: err.message };
    }
  },

  // ============================================================
  // PORTFOLIO SOURCES CRUD
  // ============================================================

  /**
   * Créer une source (GitHub, Dribbble, etc.)
   */
  portfolio_source_create: (source) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO portfolio_sources (id, type, username, access_token)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run(source.id, source.type, source.username || null, source.access_token || null);
      return { success: true, id: source.id };
    } catch (err) {
      console.error('[DB] Erreur création source:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Récupérer toutes les sources
   */
  portfolio_source_getAll: () => {
    try {
      return db.prepare('SELECT * FROM portfolio_sources ORDER BY connected_at DESC').all();
    } catch (err) {
      console.error('[DB] Erreur récupération sources:', err.message);
      return [];
    }
  },

  /**
   * Récupérer une source par ID
   */
  portfolio_source_getById: (id) => {
    try {
      return db.prepare('SELECT * FROM portfolio_sources WHERE id = ?').get(id);
    } catch (err) {
      return null;
    }
  },

  /**
   * Mettre à jour une source
   */
  portfolio_source_update: (id, updates) => {
    try {
      const fields = [];
      const params = [];

      if (updates.access_token !== undefined) {
        fields.push('access_token = ?');
        params.push(updates.access_token);
      }
      if (updates.username !== undefined) {
        fields.push('username = ?');
        params.push(updates.username);
      }
      if (updates.last_synced !== undefined) {
        fields.push('last_synced = ?');
        params.push(updates.last_synced);
      }

      if (fields.length === 0) return { success: true };

      params.push(id);
      const query = `UPDATE portfolio_sources SET ${fields.join(', ')} WHERE id = ?`;
      const result = db.prepare(query).run(...params);

      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur mise à jour source:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Supprimer une source
   */
  portfolio_source_delete: (id) => {
    try {
      const result = db.prepare('DELETE FROM portfolio_sources WHERE id = ?').run(id);
      return { success: result.changes > 0 };
    } catch (err) {
      console.error('[DB] Erreur suppression source:', err.message);
      return { success: false, error: err.message };
    }
  }
};

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
