import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

// Le fichier sera stocké dans les données utilisateur de l'ordinateur, pas dans le cloud.
const dbPath = path.join(app.getPath('userData'), 'career_coach.db');

const db = new Database(dbPath);

// Configuration initiale : Création de la table pour les "Cas Écoles"
export function initDatabase() {
  const query = `
    CREATE TABLE IF NOT EXISTS cas_ecoles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titre TEXT,
      contenu TEXT,
      date_creation DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS portfolios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      tagline TEXT,
      intention_form_json TEXT,
      selected_style TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS mediatheque_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      file_size INTEGER,
      thumbnail_path TEXT,
      tags_json TEXT,
      metadata_json TEXT,
      source_type TEXT,
      source_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      brief_text TEXT,
      challenge_text TEXT,
      solution_text TEXT,
      is_highlight BOOLEAN DEFAULT 0,
      display_order INTEGER,
      cover_image_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
      FOREIGN KEY (cover_image_id) REFERENCES mediatheque_items(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS project_media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      mediatheque_item_id INTEGER NOT NULL,
      display_order INTEGER,
      caption TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (mediatheque_item_id) REFERENCES mediatheque_items(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS external_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      platform_type TEXT NOT NULL,
      account_url TEXT NOT NULL,
      account_username TEXT,
      is_primary BOOLEAN DEFAULT 0,
      display_order INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS portfolio_publications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      publication_type TEXT NOT NULL,
      project_id INTEGER,
      slug TEXT UNIQUE NOT NULL,
      published_url TEXT,
      qr_code_path TEXT,
      published_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT 1,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS generated_styles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      portfolio_id INTEGER NOT NULL,
      style_type TEXT NOT NULL,
      color_palette_json TEXT,
      typography_json TEXT,
      layout_config_json TEXT,
      generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
    );
  `;
  db.exec(query);
  console.log("Base de données initialisée à l'emplacement :", dbPath);
}

export default db;