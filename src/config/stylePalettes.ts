/**
 * SOUVERAIN - 6 Palettes de Style Personnalité
 * Remplace les anciens styles techniques (bento, classic, gallery, minimal)
 */

export interface StylePalette {
  id: string;
  name: string;
  tagline: string;
  idealFor: string;

  designTokens: {
    typography: {
      headingFont: string;
      headingWeight: string;
      bodyFont: string;
      bodyWeight: string;
      baseSize: string;
    };
    colors: {
      primary: string;
      primaryLight: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      textSecondary: string;
    };
    spacing: {
      sectionGap: string;
      contentPadding: string;
      cardPadding: string;
    };
    borders: {
      radius: string;
    };
    shadows: {
      card: string;
    };
    animations: {
      enabled: boolean;
    };
  };

  layoutPreference: {
    hero: string;
    projects: string;
    accounts: string;
    infos?: string;
  };
}

export const STYLE_PALETTES: Record<string, StylePalette> = {
  moderne: {
    id: "moderne",
    name: "Moderne",
    tagline: "Dynamique et connecté",
    idealFor: "Freelance tech, startup, créatif digital",

    designTokens: {
      typography: {
        headingFont: "Inter",
        headingWeight: "700",
        bodyFont: "Inter",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#3b82f6",
        primaryLight: "#60a5fa",
        secondary: "#f1f5f9",
        accent: "#8b5cf6",
        background: "#ffffff",
        text: "#0f172a",
        textSecondary: "#64748b"
      },
      spacing: {
        sectionGap: "4rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "1rem"
      },
      shadows: {
        card: "0 4px 20px rgba(0,0,0,0.08)"
      },
      animations: {
        enabled: true
      }
    },

    layoutPreference: {
      hero: "hero_split",
      projects: "bento_grid",
      accounts: "cards_carousel"
    }
  },

  classique: {
    id: "classique",
    name: "Classique",
    tagline: "Sobre et structuré",
    idealFor: "Consultant, expert, profession libérale",

    designTokens: {
      typography: {
        headingFont: "Playfair Display",
        headingWeight: "600",
        bodyFont: "Source Sans Pro",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#1e3a5f",
        primaryLight: "#2d4a6f",
        secondary: "#f8f9fa",
        accent: "#8b7355",
        background: "#ffffff",
        text: "#1a1a1a",
        textSecondary: "#6b7280"
      },
      spacing: {
        sectionGap: "3rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "0.25rem"
      },
      shadows: {
        card: "0 1px 3px rgba(0,0,0,0.1)"
      },
      animations: {
        enabled: false
      }
    },

    layoutPreference: {
      hero: "hero_centered",
      projects: "cards_vertical",
      accounts: "list_simple"
    }
  },

  authentique: {
    id: "authentique",
    name: "Authentique",
    tagline: "Chaleureux et terrain",
    idealFor: "Artisan, métier manuel, service local",

    designTokens: {
      typography: {
        headingFont: "Nunito",
        headingWeight: "700",
        bodyFont: "Open Sans",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#b45309",
        primaryLight: "#d97706",
        secondary: "#fef3c7",
        accent: "#15803d",
        background: "#fffbeb",
        text: "#292524",
        textSecondary: "#57534e"
      },
      spacing: {
        sectionGap: "3.5rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "1rem"
      },
      shadows: {
        card: "0 2px 8px rgba(0,0,0,0.08)"
      },
      animations: {
        enabled: false
      }
    },

    layoutPreference: {
      hero: "hero_fullwidth_photo",
      projects: "cards_comfortable",
      accounts: "list_icons"
    }
  },

  artistique: {
    id: "artistique",
    name: "Artistique",
    tagline: "L'image avant tout",
    idealFor: "Photographe, artiste, architecte",

    designTokens: {
      typography: {
        headingFont: "Cormorant Garamond",
        headingWeight: "300",
        bodyFont: "Lato",
        bodyWeight: "300",
        baseSize: "15px"
      },
      colors: {
        primary: "#171717",
        primaryLight: "#404040",
        secondary: "#fafafa",
        accent: "#a3a3a3",
        background: "#ffffff",
        text: "#171717",
        textSecondary: "#737373"
      },
      spacing: {
        sectionGap: "5rem",
        contentPadding: "1rem",
        cardPadding: "0"
      },
      borders: {
        radius: "0"
      },
      shadows: {
        card: "none"
      },
      animations: {
        enabled: true
      }
    },

    layoutPreference: {
      hero: "hero_image_only",
      projects: "masonry",
      accounts: "minimal_footer"
    }
  },

  vitrine: {
    id: "vitrine",
    name: "Vitrine",
    tagline: "Pratique et accueillant",
    idealFor: "Commerce local, restaurant, boutique",

    designTokens: {
      typography: {
        headingFont: "Poppins",
        headingWeight: "600",
        bodyFont: "Poppins",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#dc2626",
        primaryLight: "#ef4444",
        secondary: "#fef2f2",
        accent: "#16a34a",
        background: "#ffffff",
        text: "#1f2937",
        textSecondary: "#6b7280"
      },
      spacing: {
        sectionGap: "2.5rem",
        contentPadding: "1.5rem",
        cardPadding: "1rem"
      },
      borders: {
        radius: "0.75rem"
      },
      shadows: {
        card: "0 2px 10px rgba(0,0,0,0.1)"
      },
      animations: {
        enabled: false
      }
    },

    layoutPreference: {
      hero: "hero_ambiance",
      projects: "gallery_products",
      accounts: "social_bar",
      infos: "sticky_practical"
    }
  },

  formel: {
    id: "formel",
    name: "Formel",
    tagline: "Institutionnel et rigoureux",
    idealFor: "Notaire, cabinet établi, institution",

    designTokens: {
      typography: {
        headingFont: "Libre Baskerville",
        headingWeight: "700",
        bodyFont: "Source Serif Pro",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#1e3a5f",
        primaryLight: "#2d4a6f",
        secondary: "#f1f5f9",
        accent: "#b8860b",
        background: "#ffffff",
        text: "#111827",
        textSecondary: "#4b5563"
      },
      spacing: {
        sectionGap: "3rem",
        contentPadding: "2.5rem",
        cardPadding: "2rem"
      },
      borders: {
        radius: "0"
      },
      shadows: {
        card: "none"
      },
      animations: {
        enabled: false
      }
    },

    layoutPreference: {
      hero: "hero_minimal_text",
      projects: "sections_numbered",
      accounts: "list_formal"
    }
  }
};

export type StylePaletteId = keyof typeof STYLE_PALETTES;

export const PALETTE_IDS: StylePaletteId[] = ['moderne', 'classique', 'authentique', 'artistique', 'vitrine', 'formel'];

export const getPalette = (id: string): StylePalette | undefined => {
  return STYLE_PALETTES[id];
};

export const getAllPalettes = (): StylePalette[] => {
  return PALETTE_IDS.map(id => STYLE_PALETTES[id]);
};
