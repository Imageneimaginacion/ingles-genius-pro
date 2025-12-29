import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Award, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { CertificateRenderer } from '../utils/CertificateRenderer';

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    courseName: string;
    date: string;
    level?: string;
    certificateId?: string;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
    isOpen,
    onClose,
    userName,
    courseName,
    date,
    level = "Nivel Completado",
    certificateId
}) => {
    // 1. Stable ID Generation (prevents infinite loop/flickering)
    const stableId = React.useMemo(() => {
        if (certificateId) return certificateId;
        // Generate a random ID only once per open session or if props change meaningfully
        return `IGP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    }, [certificateId, isOpen]);

    // 2. Determine variant based on level (Refined Logic)
    // 2. Determine variant based on level (Refined Logic)
    const getCertificateVariant = (lvl: string, course: string) => {
        const l = (lvl || "").toUpperCase();
        const c = (course || "").toUpperCase();

        // GOLD Tier (C1, C2, Avanzado/Advanced in Level OR Course Name)
        if (
            l.includes('C1') || l.includes('C2') ||
            l.includes('AVANZADO') || l.includes('ADVANCED') || l.includes('EXPERT') ||
            c.includes('AVANZADO') || c.includes('ADVANCED')
        ) {
            return {
                bg: '/cert_gold.png',
                color: '#ffd700', // Gold text
                shadow: '#ffd700',
            };
        }

        // SILVER Tier (B1, B2, Intermedio)
        if (
            l.includes('B1') || l.includes('B2') ||
            l.includes('INTERMEDIO') || l.includes('INTERMEDIATE') ||
            c.includes('INTERMEDIO') || c.includes('INTERMEDIATE')
        ) {
            return {
                bg: '/cert_silver.png',
                color: '#e2e8f0', // Silver/Platinum text
                shadow: '#e2e8f0',
            };
        }

        // BRONZE Tier (Default, A1, A2, Basics)
        return {
            bg: '/cert_bronze.png',
            color: '#dfae88', // Bronze text
            shadow: '#d78e66',
        };
    };

    const variant = React.useMemo(() => getCertificateVariant(level, courseName), [level, courseName]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [imgSrc, setImgSrc] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            setIsGenerating(true);
            const renderer = new CertificateRenderer(canvasRef.current);

            // Wait for fonts to ensure proper rendering
            document.fonts.ready.then(async () => {
                try {
                    const url = await renderer.render({
                        studentName: userName || "Estudiante",
                        courseName: courseName || "Curso Completo",
                        level: level,
                        date: date,
                        certificateId: stableId,
                        variant: variant
                    });
                    setImgSrc(url);
                } catch (error) {
                    console.error("Certificate Generation Failed", error);
                } finally {
                    setIsGenerating(false);
                }
            });
        } else {
            setImgSrc(null); // Reset on close
        }
    }, [isOpen, userName, courseName, level, date, stableId, variant]);

    const handleDownloadPNG = () => {
        if (!imgSrc) return;
        const link = document.createElement('a');
        link.href = imgSrc;
        // Clean filename
        const safeName = (userName + '-' + courseName).replace(/[^a-z0-9]/gi, '_').toLowerCase();
        link.download = `certificado_${safeName}.png`;
        link.click();
    };

    const handlePrint = () => {
        if (!imgSrc) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Certificado - ${userName}</title>
                        <style>
                            body { margin: 0; display: flex; justify-content: center; align-items: center; background: #333; height: 100vh; }
                            img { max-width: 100%; height: auto; box-shadow: 0 0 20px rgba(0,0,0,0.5); }
                            @media print {
                                body { background: none; height: auto; display: block; }
                                img { width: 100%; height: 100%; object-fit: contain; box-shadow: none; break-inside: avoid; }
                                @page { size: landscape; margin: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imgSrc}" onload="window.print();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative bg-space-dark border border-gray-800 rounded-2xl shadow-2xl overflow-hidden max-w-6xl w-full flex flex-col lg:flex-row h-[90vh] lg:h-auto"
                    >
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors z-20">
                            <X size={24} />
                        </button>

                        {/* Hidden Canvas for Generation */}
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        {/* Preview Area */}
                        <div className="flex-1 bg-black/50 relative flex items-center justify-center p-4 lg:p-8 overflow-auto">
                            {isGenerating ? (
                                <div className="text-white flex flex-col items-center">
                                    <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="animate-pulse">Diseñando Certificado Premium...</p>
                                </div>
                            ) : imgSrc ? (
                                <motion.img
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    src={imgSrc}
                                    alt="Certificado Generado"
                                    className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
                                    style={{ maxHeight: '80vh' }}
                                />
                            ) : (
                                <p className="text-gray-400">Error al cargar la visualización.</p>
                            )}
                        </div>

                        {/* Sidebar Actions */}
                        <div className="bg-space-card p-6 lg:p-10 lg:w-80 flex flex-col justify-center gap-6 border-l border-gray-800 z-10 shrink-0">
                            <div className="text-center lg:text-left">
                                <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                    ¡Felicidades!
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Has completado el nivel <span className="text-white font-bold">{level}</span>.
                                    <br />Tu certificado oficial está listo.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button variant="neon" onClick={handleDownloadPNG} disabled={isGenerating || !imgSrc} className="w-full flex items-center justify-center gap-2 py-6 text-lg">
                                    <ImageIcon size={22} /> Guardar Imagen
                                </Button>
                                {/* PDF is just printing the high-res image now, which is safer and consistent */}
                                <Button variant="secondary" onClick={handlePrint} disabled={isGenerating || !imgSrc} className="w-full flex items-center justify-center gap-2 py-4">
                                    <Download size={20} /> Guardar PDF
                                </Button>
                                <Button variant="ghost" onClick={onClose} className="w-full mt-2 hover:bg-white/5">
                                    Cerrar
                                </Button>
                            </div>

                            <div className="mt-auto pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                                    <span className="flex items-center gap-1"><Award size={10} /> VERIFICADO</span>
                                    <span>{stableId}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CertificateModal;
