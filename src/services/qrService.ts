// SOUVERAIN - QR Service
// Generates QR Codes for publication or sharing

import QRCode from 'qrcode';

export const generateQRCodeDataURL = async (text: string): Promise<string> => {
    try {
        return await QRCode.toDataURL(text, {
            errorCorrectionLevel: 'H',
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
    } catch (err) {
        console.error('QR Generation Error:', err);
        return '';
    }
};
