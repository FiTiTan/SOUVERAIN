const Database = require('better-sqlite3-multiple-ciphers');
const path = require('path');

const dbPath = path.join(__dirname, '../data/souverain.db');
console.log('Opening DB at:', dbPath);

const db = new Database(dbPath);

const legacyTables = [
    'independant_profiles',
    'commerce_profiles',
    'portfolio_assets', // Verify if this is strictly legacy or renamed. Plan says 'legacy-portfolio-v1'
    'portfolio_elements',
    'portfolio_project_elements'
];

legacyTables.forEach(table => {
    try {
        console.log(`Dropping table: ${table}...`);
        db.prepare(`DROP TABLE IF EXISTS ${table}`).run();
        console.log(`Dropped ${table}.`);
    } catch (e) {
        console.error(`Error dropping ${table}:`, e.message);
    }
});

console.log('Phase 0 Migration Complete.');
db.close();
