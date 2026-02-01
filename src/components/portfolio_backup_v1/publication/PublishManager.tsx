import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { checkPremiumStatus, checkSlugAvailability, publishPortfolio, getPublication, type Publication } from '../../../services/publishService';
import { generateQRCodeDataURL } from '../../../services/qrService';
import { renderPortfolioHTML } from '../../../services/renderService';
import type { PortfolioV2, PortfolioProjectV2 } from '../../../types/portfolio';

interface PublishManagerProps {
    portfolio: PortfolioV2;
    projects: PortfolioProjectV2[];
}

export const PublishManager: React.FC<PublishManagerProps> = ({ portfolio, projects }) => {
    const { mode } = useTheme();
    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [publication, setPublication] = useState<Publication | null>(null);
    const [slug, setSlug] = useState(portfolio.slug || '');
    const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
    const [isPublishing, setIsPublishing] = useState(false);
    const [qrCode, setQrCode] = useState<string>('');

    // Init
    useEffect(() => {
        const init = async () => {
            const premium = await checkPremiumStatus();
            setIsPremium(premium);
            const pub = await getPublication(portfolio.id);
            if (pub) {
                setPublication(pub);
                setSlug(pub.slug);
                const qr = await generateQRCodeDataURL(pub.url);
                setQrCode(qr);
            }
            setLoading(false);
        };
        init();
    }, [portfolio.id]);

    // Check Slug
    useEffect(() => {
        if (!slug || publication) return;
        const timer = setTimeout(async () => {
            const avail = await checkSlugAvailability(slug);
            setSlugAvailable(avail);
        }, 500);
        return () => clearTimeout(timer);
    }, [slug, publication]);

    const handlePublish = async () => {
        if (!slugAvailable && !publication) return;
        setIsPublishing(true);

        // Generate HTML
        const tempQr = await generateQRCodeDataURL(`https://${slug}.souverain.io`);
        const html = renderPortfolioHTML(portfolio, projects, tempQr);

        const pub = await publishPortfolio(portfolio.id, slug, html);
        
        setPublication(pub);
        setQrCode(tempQr);
        setIsPublishing(false);
    };

    if (loading) return <div className="p-6">Chargement...</div>;

    return (
        <div className={`p-6 rounded-xl border ${mode === 'dark' ? 'bg-[#1A1A1C] border-[#333]' : 'bg-white border-gray-200'} space-y-6`}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className={`text-xl font-bold flex items-center gap-2 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Publication Web
                        {isPremium && <span className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold">PREMIUM</span>}
                    </h3>
                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Rendez votre portfolio accessible au monde entier via souverain.io
                    </p>
                </div>
            </div>

            {/* Content */}
            {!isPremium ? (
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg text-center">
                    <p className="text-amber-500 font-bold mb-2">Fonctionnalité Premium</p>
                    <p className="text-sm opacity-80 mb-4">Passez à la vitesse supérieure pour publier votre site en ligne.</p>
                    <button className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-bold">
                        Débloquer Premium
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Slug Input */}
                    {!publication ? (
                        <div className="space-y-2">
                            <label className={`block text-sm font-medium ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Choisissez votre adresse web
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="opacity-50 font-mono text-sm">https://</span>
                                <input 
                                    type="text" 
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                    placeholder="mon-nom"
                                    className={`flex-1 p-2 rounded-lg border font-mono outline-none
                                        ${mode === 'dark' ? 'bg-[#0A0A0B] border-[#333] text-white' : 'bg-gray-50 border-gray-200'}
                                        ${slugAvailable === false ? 'border-red-500' : slugAvailable === true ? 'border-green-500' : ''}
                                    `}
                                />
                                <span className="opacity-50 font-mono text-sm">.souverain.io</span>
                            </div>
                            {slug && (
                                <p className={`text-xs ${slugAvailable ? 'text-green-500' : 'text-red-500'}`}>
                                    {slugAvailable === null ? 'Vérification...' : slugAvailable ? 'Disponible !' : 'Déjà pris.'}
                                </p>
                            )}
                        </div>
                    ) : (
                        // Published State
                        <div className={`p-4 rounded-lg border flex items-center gap-4
                            ${mode === 'dark' ? 'bg-green-900/10 border-green-900/30' : 'bg-green-50 border-green-100'}
                        `}>
                            <div className="bg-white p-2 rounded-lg shrink-0">
                                {qrCode && <img src={qrCode} alt="QR" className="w-20 h-20" />}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="font-bold text-green-500 text-sm uppercase">En Ligne</span>
                                </div>
                                <a href={publication.url} target="_blank" rel="noopener noreferrer" 
                                   className={`block font-mono text-lg truncate hover:underline mb-1
                                   ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {publication.url}
                                </a>
                                <p className="text-xs opacity-60">
                                    Publié le {new Date(publication.lastPublishedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-end pt-4 border-t border-dashed border-gray-700/20">
                        {publication ? (
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium">
                                    Dépublier
                                </button>
                                <button 
                                    onClick={handlePublish}
                                    disabled={isPublishing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/20 disabled:opacity-50"
                                >
                                    {isPublishing ? 'Mise à jour...' : 'Mettre à jour'}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handlePublish}
                                disabled={!slug || !slugAvailable || isPublishing}
                                className={`px-8 py-3 rounded-xl font-bold transition-all shadow-xl
                                    ${!slug || !slugAvailable || isPublishing
                                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 hover:shadow-blue-500/30'}
                                `}
                            >
                                {isPublishing ? 'Publication en cours...' : 'Publier mon Site 🚀'}
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
