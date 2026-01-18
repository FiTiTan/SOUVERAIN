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
  `;
  db.exec(query);
  console.log("Base de données initialisée à l'emplacement :", dbPath);
}

export default db;