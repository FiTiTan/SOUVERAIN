import React, { useState } from 'react';
import { useTheme } from '../../../../../ThemeContext';

interface Step2Props {
    onNext: (files: File[]) => void;
    existingFiles: File[];
}

export const Step2_FileImporter: React.FC<Step2Props> = ({ onNext, existingFiles }) => {
    const { mode } = useTheme();
    // Use File type natively
    const [files, setFiles] = useState<File[]>(existingFiles);

    // Mock file input handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-center">Importez vos fichiers</h3>
            <div className={`border-2 border-dashed rounded-xl p-12 text-center
                ${mode === 'dark' ? 'border-gray-700 bg-gray-800/30' : 'border-gray-300 bg-gray-50'}
            `}>
                <input type="file" multiple onChange={handleFileChange} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer block">
                    <span className="text-4xl block mb-4">📂</span>
                    <span className="font-bold text-lg block">Cliquez ou glissez vos fichiers ici</span>
                    <span className="text-sm opacity-60">PDF, Images, Vidéos acceptés</span>
                </label>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-bold text-sm opacity-80">Fichiers sélectionnés ({files.length}) :</h4>
                    <ul className="text-sm opacity-70">
                        {files.map((f, i) => <li key={i}>{f.name}</li>)}
                    </ul>
                </div>
            )}

            <div className="flex justify-end">
                <button 
                    onClick={() => onNext(files)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold"
                >
                    Continuer (Même vide)
                </button>
            </div>
        </div>
    );
};
