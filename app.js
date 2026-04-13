/**
 * SketchGrid - App Logic
 */

const { jsPDF } = window.jspdf;

const CONFIG = {
    A4: {
        width: 210,
        height: 297
    },
    margins: {
        none: 0,
        narrow: 5,
        default: 10,
        wide: 20
    },
    spacings: {
        small: 2,
        medium: 5,
        large: 10
    }
};

class SketchGrid {
    constructor() {
        this.state = {
            orientation: 'portrait',
            boxCount: 6,
            ratio: '1:1',
            customRatio: { w: 16, h: 9 },
            spacing: 'medium',
            marginPreset: 'default',
            customMargin: 10,
            theme: 'light'
        };

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.updateUIValues();
        this.render();
    }

    cacheElements() {
        this.els = {
            body: document.body,
            themeToggle: document.getElementById('theme-toggle'),
            themeIconSun: document.getElementById('theme-icon-sun'),
            themeIconMoon: document.getElementById('theme-icon-moon'),
            orientationInputs: document.getElementsByName('orientation'),
            boxCountInput: document.getElementById('box-count'),
            boxCountDisplay: document.getElementById('box-count-display'),
            ratioInputs: document.getElementsByName('ratio'),
            customRatioInputs: document.getElementById('custom-ratio-inputs'),
            ratioW: document.getElementById('ratio-w'),
            ratioH: document.getElementById('ratio-h'),
            spacingInputs: document.getElementsByName('spacing'),
            marginSelect: document.getElementById('margin-preset'),
            customMarginDiv: document.getElementById('custom-margin-input'),
            customMarginInput: document.getElementById('margin-val'),
            downloadBtn: document.getElementById('download-pdf'),
            canvas: document.getElementById('grid-canvas'),
            paperPreview: document.getElementById('paper-preview'),
            pOrientation: document.getElementById('p-orientation'),
            pRatio: document.getElementById('p-ratio'),
            pCount: document.getElementById('p-count')
        };
        this.ctx = this.els.canvas.getContext('2d');
    }

    bindEvents() {
        this.els.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.els.orientationInputs.forEach(input => {
            input.addEventListener('change', (e) => this.updateState({ orientation: e.target.value }));
        });

        this.els.boxCountInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            this.els.boxCountDisplay.textContent = val;
            this.updateState({ boxCount: val });
        });

        this.els.ratioInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const isCustom = e.target.value === 'custom';
                this.els.customRatioInputs.classList.toggle('hidden', !isCustom);
                this.updateState({ ratio: e.target.value });
            });
        });

        [this.els.ratioW, this.els.ratioH].forEach(input => {
            input.addEventListener('input', () => {
                this.updateState({ 
                    customRatio: { 
                        w: parseFloat(this.els.ratioW.value) || 1, 
                        h: parseFloat(this.els.ratioH.value) || 1 
                    } 
                });
            });
        });

        this.els.spacingInputs.forEach(input => {
            input.addEventListener('change', (e) => this.updateState({ spacing: e.target.value }));
        });

        this.els.marginSelect.addEventListener('change', (e) => {
            const isCustom = e.target.value === 'custom';
            this.els.customMarginDiv.classList.toggle('hidden', !isCustom);
            this.updateState({ marginPreset: e.target.value });
        });

        this.els.customMarginInput.addEventListener('input', (e) => {
            this.updateState({ customMargin: parseFloat(e.target.value) || 0 });
        });

        this.els.downloadBtn.addEventListener('click', async () => {
            const originalText = this.els.downloadBtn.innerHTML;
            this.els.downloadBtn.disabled = true;
            this.els.downloadBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Generating...';
            lucide.createIcons();

            await new Promise(r => setTimeout(r, 800)); // Aesthetic delay

            this.generatePDF();

            this.els.downloadBtn.disabled = false;
            this.els.downloadBtn.innerHTML = originalText;
            lucide.createIcons();
        });

        window.addEventListener('resize', () => this.render());
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.els.body.className = `theme-${this.state.theme}`;
        this.els.themeIconSun.classList.toggle('hidden', this.state.theme === 'dark');
        this.els.themeIconMoon.classList.toggle('hidden', this.state.theme === 'light');
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUIValues();
        this.render();
    }

    updateUIValues() {
        this.els.pOrientation.textContent = this.state.orientation.charAt(0).toUpperCase() + this.state.orientation.slice(1);
        this.els.pRatio.textContent = this.state.ratio === 'custom' 
            ? `${this.state.customRatio.w}:${this.state.customRatio.h}` 
            : this.state.ratio;
        this.els.pCount.textContent = `${this.state.boxCount} Boxes`;

        this.els.paperPreview.className = `preview-paper ${this.state.orientation}`;
    }

    getBoxRatio() {
        if (this.state.ratio === 'custom') {
            return this.state.customRatio.w / this.state.customRatio.h;
        }
        const [w, h] = this.state.ratio.split(':').map(Number);
        return w / h;
    }

    getMargin() {
        if (this.state.marginPreset === 'custom') return this.state.customMargin;
        return CONFIG.margins[this.state.marginPreset];
    }

    getSpacing() {
        return CONFIG.spacings[this.state.spacing];
    }

    calculateLayout() {
        const isPortrait = this.state.orientation === 'portrait';
        const pageW = isPortrait ? CONFIG.A4.width : CONFIG.A4.height;
        const pageH = isPortrait ? CONFIG.A4.height : CONFIG.A4.width;
        
        const margin = this.getMargin();
        const spacing = this.getSpacing();
        const N = this.state.boxCount;
        const boxRatio = this.getBoxRatio(); // W / H

        const availableW = pageW - (margin * 2);
        const availableH = pageH - (margin * 2);

        let best = { area: 0, rows: 1, cols: 1, w: 0, h: 0 };

        // Try all row/column combinations
        for (let cols = 1; cols <= N; cols++) {
            const rows = Math.ceil(N / cols);
            
            // Calculate max width/height per box
            // availableW = cols * w + (cols - 1) * spacing
            // availableH = rows * h + (rows - 1) * spacing
            const maxW = (availableW - (cols - 1) * spacing) / cols;
            const maxH = (availableH - (rows - 1) * spacing) / rows;

            let w, h;
            if (boxRatio > maxW / maxH) {
                w = maxW;
                h = maxW / boxRatio;
            } else {
                h = maxH;
                w = maxH * boxRatio;
            }

            if (w > 0 && h > 0) {
                const totalArea = N * w * h;
                if (totalArea > best.area) {
                    best = { area: totalArea, rows, cols, w, h };
                }
            }
        }

        return best;
    }

    render() {
        const layout = this.calculateLayout();
        const isPortrait = this.state.orientation === 'portrait';
        
        // Setup canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = this.els.paperPreview.getBoundingClientRect();
        this.els.canvas.width = rect.width * dpr;
        this.els.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        const canvasW = rect.width;
        const canvasH = rect.height;
        
        // Scale factor from mm to canvas pixels
        const mmToPx = canvasW / (isPortrait ? CONFIG.A4.width : CONFIG.A4.height);

        this.ctx.clearRect(0, 0, canvasW, canvasH);
        
        // Draw margin boundary (subtle)
        const margin = this.getMargin() * mmToPx;
        this.ctx.setLineDash([5, 5]);
        this.ctx.strokeStyle = '#e2e8f0';
        this.ctx.strokeRect(margin, margin, canvasW - 2 * margin, canvasH - 2 * margin);
        this.ctx.setLineDash([]);

        // Draw boxes
        const boxW = layout.w * mmToPx;
        const boxH = layout.h * mmToPx;
        const spacing = this.getSpacing() * mmToPx;
        
        const totalGridW = layout.cols * boxW + (layout.cols - 1) * spacing;
        const totalGridH = layout.rows * boxH + (layout.rows - 1) * spacing;
        
        const startX = (canvasW - totalGridW) / 2;
        const startY = (canvasH - totalGridH) / 2;

        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;

        let count = 0;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (count >= this.state.boxCount) break;
                
                const x = startX + c * (boxW + spacing);
                const y = startY + r * (boxH + spacing);
                
                this.ctx.strokeRect(x, y, boxW, boxH);
                count++;
            }
        }
    }

    generatePDF() {
        const layout = this.calculateLayout();
        const isPortrait = this.state.orientation === 'portrait';
        const pageOrientation = isPortrait ? 'p' : 'l';
        
        const doc = new jsPDF({
            orientation: pageOrientation,
            unit: 'mm',
            format: 'a4'
        });

        const pageW = isPortrait ? CONFIG.A4.width : CONFIG.A4.height;
        const pageH = isPortrait ? CONFIG.A4.height : CONFIG.A4.width;
        
        const boxW = layout.w;
        const boxH = layout.h;
        const spacing = this.getSpacing();
        
        const totalGridW = layout.cols * boxW + (layout.cols - 1) * spacing;
        const totalGridH = layout.rows * boxH + (layout.rows - 1) * spacing;
        
        const startX = (pageW - totalGridW) / 2;
        const startY = (pageH - totalGridH) / 2;

        doc.setLineWidth(0.1); // Thin borders
        doc.setDrawColor(0, 0, 0);

        let count = 0;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (count >= this.state.boxCount) break;
                
                const x = startX + c * (boxW + spacing);
                const y = startY + r * (boxH + spacing);
                
                doc.rect(x, y, boxW, boxH);
                count++;
            }
        }

        const filename = `SketchGrid_${this.state.boxCount}x_${this.state.ratio.replace(':','-')}.pdf`;
        doc.save(filename);
    }
}

// Spark up the app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SketchGrid();
});
