/**
 * Local Folder Scraper
 * Parcourt un dossier local et extrait fichiers/README
 * Détecte automatiquement le type de projet (code vs design)
 */

const fs = require('fs');
const path = require('path');

class LocalScraper {
  /**
   * Scan récursif (1 niveau) pour détecter tous les fichiers
   */
  _scanRecursive(folderPath, depth = 0, maxDepth = 1) {
    const allFiles = [];
    try {
      const items = fs.readdirSync(folderPath);

      for (const item of items) {
        // Ignorer node_modules, .git, dist, build
        if (['node_modules', '.git', 'dist', 'build', '.next', 'vendor'].includes(item)) {
          continue;
        }

        const fullPath = path.join(folderPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isFile()) {
          allFiles.push({ name: item, path: fullPath, ext: path.extname(item).toLowerCase() });
        } else if (stat.isDirectory() && depth < maxDepth) {
          allFiles.push(...this._scanRecursive(fullPath, depth + 1, maxDepth));
        }
      }
    } catch (err) {
      // Ignorer erreurs de permission
    }

    return allFiles;
  }

  /**
   * Détecte le type de projet basé sur les fichiers
   */
  _detectProjectType(files) {
    const extensions = files.map(f => f.ext);

    // Extensions créatives
    const creativeExts = [
      '.psd', '.ai', '.sketch', '.fig', '.xd', '.figma',
      '.indd', '.svg', '.eps', '.pdf', '.afdesign',
      '.blend', '.c4d', '.max', '.ma', '.mb', // 3D
      '.aep', '.prproj', // Vidéo
      '.mp3', '.wav', '.aiff', '.flac' // Audio
    ];

    // Extensions images
    const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff', '.raw', '.heic'];

    // Extensions code
    const codeExts = [
      '.js', '.ts', '.py', '.java', '.cpp', '.rs', '.go',
      '.rb', '.php', '.swift', '.kt', '.c', '.cs', '.r',
      '.jsx', '.tsx', '.vue', '.svelte'
    ];

    const creativeCount = extensions.filter(e => creativeExts.includes(e)).length;
    const imageCount = extensions.filter(e => imageExts.includes(e)).length;
    const codeCount = extensions.filter(e => codeExts.includes(e)).length;

    // Logique de décision
    if (creativeCount > 0 || imageCount >= 5) {
      return 'design';
    }
    if (codeCount > creativeCount + imageCount) {
      return 'code';
    }
    // Par défaut : code (fallback)
    return 'code';
  }

  async scanFolder(folderPath) {
    try {
      const rootFiles = fs.readdirSync(folderPath);
      const allFiles = this._scanRecursive(folderPath);

      // Chercher README
      let readme = '';
      const readmeFiles = rootFiles.filter(f =>
        /^readme\.(md|txt)$/i.test(f)
      );
      if (readmeFiles.length > 0) {
        const readmePath = path.join(folderPath, readmeFiles[0]);
        readme = fs.readFileSync(readmePath, 'utf-8');
      }

      // Lister images (fichiers dans root ou 1er niveau)
      const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.tiff'];
      const images = allFiles
        .filter(f => imageExts.includes(f.ext))
        .slice(0, 20) // Max 20 images
        .map(f => f.path);

      // Détecter langages/outils par extensions
      const extensions = allFiles.map(f => f.ext);

      const toolsMap = {
        // Code
        '.js': 'JavaScript',
        '.ts': 'TypeScript',
        '.py': 'Python',
        '.java': 'Java',
        '.cpp': 'C++',
        '.rs': 'Rust',
        '.go': 'Go',
        '.rb': 'Ruby',
        '.php': 'PHP',
        '.swift': 'Swift',
        '.kt': 'Kotlin',
        '.jsx': 'React',
        '.tsx': 'React',
        '.vue': 'Vue.js',
        '.svelte': 'Svelte',
        // Design
        '.psd': 'Photoshop',
        '.ai': 'Illustrator',
        '.sketch': 'Sketch',
        '.fig': 'Figma',
        '.figma': 'Figma',
        '.xd': 'Adobe XD',
        '.indd': 'InDesign',
        '.afdesign': 'Affinity Designer',
        // 3D
        '.blend': 'Blender',
        '.c4d': 'Cinema 4D',
        '.max': '3ds Max',
        '.ma': 'Maya',
        '.mb': 'Maya',
        // Vidéo
        '.aep': 'After Effects',
        '.prproj': 'Premiere Pro',
        // Audio
        '.flp': 'FL Studio',
        '.logic': 'Logic Pro'
      };

      const tools = [...new Set(
        extensions
          .filter(ext => toolsMap[ext])
          .map(ext => toolsMap[ext])
      )];

      // Détecter type de projet
      const projectType = this._detectProjectType(allFiles);

      return {
        name: path.basename(folderPath),
        path: folderPath,
        readme,
        images,
        tools, // Renommé de "languages" pour être plus générique
        languages: tools, // Gardé pour compatibilité
        fileCount: allFiles.length,
        projectType, // 'code' ou 'design'
        allFiles: allFiles.map(f => ({ name: f.name, ext: f.ext })) // Pour debug
      };
    } catch (err) {
      console.error('[LocalScraper] Erreur scan:', err.message);
      throw new Error(`Erreur lecture dossier: ${err.message}`);
    }
  }
}

module.exports = LocalScraper;
