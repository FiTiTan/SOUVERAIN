// SOUVERAIN - Publish Service (MOCK)
// Handles Premium checks, Slug validation, and Cloudflare R2 simulation

export interface Publication {
    id: string;
    slug: string;
    url: string;
    status: 'published' | 'offline';
    lastPublishedAt: string;
}

// Mock Database of publications
let MOCK_DB: Publication | null = null;

export const checkPremiumStatus = async (): Promise<boolean> => {
    // Simulate API check
    await new Promise(r => setTimeout(r, 500));
    // For Dev: always return true or toggle here
    return true; 
};

export const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    // Simulate collision if slug is "test"
    return slug !== 'test' && slug !== 'admin';
};

export const publishPortfolio = async (portfolioId: string, slug: string, _htmlContent: string): Promise<Publication> => {
    console.log(`[Publish] Starting upload for ${slug}... (Portfolio: ${portfolioId})`);
    await new Promise(r => setTimeout(r, 2000)); // Simulate upload delay

    const pub: Publication = {
        id: crypto.randomUUID(),
        slug,
        url: `https://${slug}.souverain.io`,
        status: 'published',
        lastPublishedAt: new Date().toISOString()
    };
    
    MOCK_DB = pub;
    return pub;
};

export const getPublication = async (_portfolioId: string): Promise<Publication | null> => {
    await new Promise(r => setTimeout(r, 300));
    return MOCK_DB;
};

export const unpublishPortfolio = async (_portfolioId: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 1000));
    if (MOCK_DB) MOCK_DB.status = 'offline';
};
