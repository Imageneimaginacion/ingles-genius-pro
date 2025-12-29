
interface CertLayout {
    x: number;
    y: number;
    w: number;
    h: number;
    maxLines: number;
    align?: 'center' | 'left' | 'right';
    fontFamily?: string;
    fontWeight?: string | number;
    letterSpacing?: number;
    color?: string;
    shadow?: boolean;
}

interface CertificateData {
    studentName: string;
    courseName: string;
    level: string;
    date: string;
    certificateId: string;
    variant: {
        bg: string;
        color: string;
        shadow: string; // color string
    };
}

// Layout Configuration (Percentages)
const LAYOUT = {
    NAME_BOX: { x: 0.12, y: 0.44, w: 0.76, h: 0.20, maxLines: 2, align: 'center', fontWeight: 900, fontFamily: 'Cinzel', shadow: true },
    INTRO_TEXT: { x: 0.12, y: 0.62, w: 0.76, h: 0.05, maxLines: 1, align: 'center', fontWeight: 500, fontFamily: 'Cinzel', letterSpacing: 3, color: '#9CA3AF' },
    COURSE_BOX: { x: 0.12, y: 0.66, w: 0.76, h: 0.10, maxLines: 2, align: 'center', fontWeight: 700, fontFamily: 'Playfair Display', shadow: true, color: '#FFFFFF' },
    LEVEL_BOX: { x: 0.12, y: 0.77, w: 0.76, h: 0.06, maxLines: 1, align: 'center', fontWeight: 700, fontFamily: 'Cinzel', shadow: false },
    DATE_BOX: { x: 0.14, y: 0.825, w: 0.30, h: 0.06, maxLines: 1, align: 'left', fontWeight: 500, fontFamily: 'Cinzel', color: '#CBD5E1' },
    ID_BOX: { x: 0.56, y: 0.825, w: 0.30, h: 0.06, maxLines: 1, align: 'right', fontWeight: 500, fontFamily: 'Cinzel', color: '#94A3B8' }
};

export class CertificateRenderer {
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    private width: number = 0;
    private height: number = 0;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) throw new Error("Could not get canvas context");
        this.ctx = context;
    }

    // Helper: Normalize Text
    private normalizeText(text: string): string {
        return text ? text.trim().replace(/\s+/g, ' ') : '';
    }

    // Helper: Font String Generator
    private getFontString(size: number, weight: string | number, family: string) {
        return `${weight} ${size}px '${family}', serif`;
    }

    // Core: Fit Text Logic
    private fitText(
        text: string,
        region: CertLayout,
        minSize: number = 20,
        maxSize: number = 150
    ) {
        const boxW = this.width * region.w;
        const boxH = this.height * region.h;
        const startX = this.width * region.x;
        const startY = this.height * region.y; // Top of the box

        let bestLines: string[] = [];
        let bestSize = minSize;

        // Binary search-ish approach or Iterative decrement? 
        // Iterative decrement from max is safer for "best fit" quality.
        for (let size = maxSize; size >= minSize; size -= 2) {
            this.ctx.font = this.getFontString(size, region.fontWeight || 'normal', region.fontFamily || 'serif');

            // Wrap Text
            const words = text.split(' ');
            const lines: string[] = [];
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = this.ctx.measureText(currentLine + " " + word).width;
                if (width < boxW) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);

            const lineHeight = size * 1.2; // 1.2em line height
            const totalHeight = lines.length * lineHeight;

            // Check constraints
            if (lines.length <= region.maxLines && totalHeight <= boxH) {
                // Also check width of the longest line just in case (though word wrap handles it, single super long words might fail)
                const maxLineWidth = Math.max(...lines.map(l => this.ctx.measureText(l).width));
                if (maxLineWidth <= boxW) {
                    bestLines = lines;
                    bestSize = size;
                    break; // Found largest size that fits
                }
            }
        }

        // Draw
        this.ctx.font = this.getFontString(bestSize, region.fontWeight || 'normal', region.fontFamily || 'serif');
        this.ctx.fillStyle = region.color || '#ffffff';
        this.ctx.textBaseline = 'middle';

        // Shadow?
        if (region.shadow) {
            this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
            this.ctx.shadowBlur = 10;
            this.ctx.shadowOffsetY = 4;
        } else {
            this.ctx.shadowColor = 'transparent';
        }

        const lineHeight = bestSize * 1.2;
        const totalBlockHeight = bestLines.length * lineHeight;
        const startBlockY = startY + (boxH - totalBlockHeight) / 2 + (lineHeight / 2); // Center vertically

        bestLines.forEach((line, i) => {
            const y = startBlockY + (i * lineHeight);
            let x = startX;
            if (region.align === 'center') x += boxW / 2;
            else if (region.align === 'right') x += boxW;

            this.ctx.textAlign = region.align as CanvasTextAlign || 'left';

            // Letter Spacing simulation (Canvas doesn't support letter-spacing natively well)
            if (region.letterSpacing && region.letterSpacing > 0) {
                // Manual spacing (simplified, or ignore for robustness if difficult)
                // For now just draw plain to avoid breaking align
            }

            this.ctx.fillText(line, x, y);
        });

        // Reset Shadow
        this.ctx.shadowColor = 'transparent';
    }

    public async render(data: CertificateData): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.src = data.variant.bg;

            img.onload = () => {
                // 1. Setup Canvas
                this.width = img.naturalWidth;
                this.height = img.naturalHeight;
                this.canvas.width = this.width;
                this.canvas.height = this.height;

                // 2. Clear & Draw Background
                this.ctx.clearRect(0, 0, this.width, this.height);
                this.ctx.drawImage(img, 0, 0);

                // 3. Draw Elements using Config
                // Note: The order matters if overlaps were allowed (but we avoid them)

                // Name
                this.fitText(
                    this.normalizeText(data.studentName).toUpperCase(),
                    { ...LAYOUT.NAME_BOX, color: data.variant.color, align: 'center' } as CertLayout,
                    60, 160 // Min/Max Font Size
                );

                // Intro
                this.fitText(
                    "POR COMPLETAR CON ÉXITO EL CURSO DE",
                    { ...LAYOUT.INTRO_TEXT, align: 'center' } as CertLayout,
                    15, 30
                );

                // Course
                this.fitText(
                    this.normalizeText(data.courseName).toUpperCase(),
                    { ...LAYOUT.COURSE_BOX, align: 'center' } as CertLayout,
                    40, 100
                );

                // Level
                this.fitText(
                    this.normalizeText(data.level),
                    { ...LAYOUT.LEVEL_BOX, color: data.variant.color, align: 'center' } as CertLayout,
                    30, 60
                );

                // Date
                this.fitText(
                    data.date,
                    { ...LAYOUT.DATE_BOX, align: 'left' } as CertLayout,
                    20, 40
                );

                // ID
                this.fitText(
                    `ID: ${data.certificateId}`,
                    { ...LAYOUT.ID_BOX, align: 'right' } as CertLayout,
                    20, 30
                );

                // Signature (Director) - Hardcoded Position based on image template usually
                // But let's add it if needed. The request didn't explicitly ask for dynamic signature logic 
                // other than the director name existing in the previous HTML. 
                // Let's add it manually to match prev look.
                this.ctx.font = "italic bold 30px 'Playfair Display', serif";
                this.ctx.fillStyle = "#ffffff";
                this.ctx.textAlign = "center";
                this.ctx.save();
                this.ctx.translate(this.width * 0.76, this.height * 0.85); // Approx
                this.ctx.rotate(-2 * Math.PI / 180);
                this.ctx.fillText("Inglés Genius Pro", 0, 0);
                this.ctx.restore();

                resolve(this.canvas.toDataURL('image/png', 1.0));
            };

            img.onerror = (err) => reject(err);
        });
    }
}
