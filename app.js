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
            theme: 'light',
            // Stage 2
            title: '',
            subtitle: '',
            author: '',
            showLabels: false,
            showMetaBorder: false,
            showDate: false,
            dateMode: 'auto',
            customDate: '',
            metaPosition: 'topLeft',
            showWatermark: true,
            pageCount: 1
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
            pCount: document.getElementById('p-count'),
            // Stage 2
            docTitle: document.getElementById('doc-title'),
            docSubtitle: document.getElementById('doc-subtitle'),
            docAuthor: document.getElementById('doc-author'),
            showLabels: document.getElementById('show-labels'),
            showMetaBorder: document.getElementById('show-meta-border'),
            showDate: document.getElementById('show-date'),
            dateDetails: document.getElementById('date-details'),
            dateModeInputs: document.getElementsByName('date-mode'),
            customDateVal: document.getElementById('custom-date-val'),
            metaPosition: document.getElementById('meta-position'),
            showWatermark: document.getElementById('show-watermark'),
            pageCount: document.getElementById('page-count')
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

        // Stage 2 Bindings
        this.els.docTitle.addEventListener('input', (e) => this.updateState({ title: e.target.value }));
        this.els.docSubtitle.addEventListener('input', (e) => this.updateState({ subtitle: e.target.value }));
        this.els.docAuthor.addEventListener('input', (e) => this.updateState({ author: e.target.value }));
        this.els.showLabels.addEventListener('change', (e) => this.updateState({ showLabels: e.target.checked }));
        this.els.showMetaBorder.addEventListener('change', (e) => this.updateState({ showMetaBorder: e.target.checked }));
        this.els.showDate.addEventListener('change', (e) => {
            this.els.dateDetails.classList.toggle('hidden', !e.target.checked);
            this.updateState({ showDate: e.target.checked });
        });
        this.els.dateModeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const isCustom = e.target.value === 'custom';
                this.els.customDateVal.classList.toggle('hidden', !isCustom);
                this.updateState({ dateMode: e.target.value });
            });
        });
        this.els.customDateVal.addEventListener('input', (e) => this.updateState({ customDate: e.target.value }));
        this.els.metaPosition.addEventListener('change', (e) => this.updateState({ metaPosition: e.target.value }));
        this.els.showWatermark.addEventListener('change', (e) => this.updateState({ showWatermark: e.target.checked }));
        this.els.pageCount.addEventListener('input', (e) => this.updateState({ pageCount: parseInt(e.target.value) || 1 }));

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

    getMetadata() {
        const date = this.state.showDate 
            ? (this.state.dateMode === 'auto' ? new Date().toISOString().split('T')[0] : this.state.customDate)
            : '';
        
        return {
            title: this.state.title,
            subtitle: this.state.subtitle,
            author: this.state.author,
            date: date,
            labels: this.state.showLabels,
            border: this.state.showMetaBorder,
            position: this.state.metaPosition,
            watermark: this.state.showWatermark
        };
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
        
        const baseMargin = this.getMargin();
        const spacing = this.getSpacing();
        const N = this.state.boxCount;
        const boxRatio = this.getBoxRatio();

        // Stage 2: Smart Margins
        const meta = this.getMetadata();
        const hasMeta = meta.title || meta.subtitle || meta.author || meta.date;
        
        let marginTop = baseMargin;
        let marginBottom = baseMargin;
        let marginLeft = baseMargin;
        let marginRight = baseMargin;

        const metaZoneHeight = 12; // 12mm extra for metadata

        if (hasMeta) {
            if (['topLeft', 'topCenter'].includes(meta.position)) marginTop += metaZoneHeight;
            if (['bottomRight', 'footer'].includes(meta.position)) marginBottom += metaZoneHeight;
        }

        const availableW = pageW - marginLeft - marginRight;
        const availableH = pageH - marginTop - marginBottom;

        let best = { area: 0, rows: 1, cols: 1, w: 0, h: 0, offsets: { top: marginTop, left: marginLeft } };

        for (let cols = 1; cols <= N; cols++) {
            const rows = Math.ceil(N / cols);
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
                    best = { area: totalArea, rows, cols, w, h, offsets: { top: marginTop, left: marginLeft } };
                }
            }
        }

        return best;
    }

    render() {
        const layout = this.calculateLayout();
        const isPortrait = this.state.orientation === 'portrait';
        const dpr = window.devicePixelRatio || 1;
        const rect = this.els.paperPreview.getBoundingClientRect();
        
        this.els.canvas.width = rect.width * dpr;
        this.els.canvas.height = rect.height * dpr;
        this.ctx.scale(dpr, dpr);

        const canvasW = rect.width;
        const canvasH = rect.height;
        const mmToPx = canvasW / (isPortrait ? CONFIG.A4.width : CONFIG.A4.height);

        this.ctx.clearRect(0, 0, canvasW, canvasH);
        
        // Draw Watermark
        const meta = this.getMetadata();
        if (meta.watermark) {
            this.ctx.save();
            this.ctx.font = `600 ${10 * mmToPx}px Inter`;
            this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
            this.ctx.textAlign = 'center';
            this.ctx.translate(canvasW/2, canvasH/2);
            this.ctx.rotate(-Math.PI / 4);
            this.ctx.fillText('MADE WITH SKETCHGRID', 0, 0);
            this.ctx.restore();
        }

        // Draw Metadata
        this.renderMetadataOnCanvas(this.ctx, meta, mmToPx, canvasW, canvasH);

        // Draw Grid
        const boxW = layout.w * mmToPx;
        const boxH = layout.h * mmToPx;
        const spacing = this.getSpacing() * mmToPx;
        
        const totalGridW = layout.cols * boxW + (layout.cols - 1) * spacing;
        const totalGridH = layout.rows * boxH + (layout.rows - 1) * spacing;
        
        // Horizontal centering remains same, but vertical depends on smart margins
        const startX = (canvasW - totalGridW) / 2;
        // The available area was between offsets.top and pageH - offset.bottom
        const availableAreaH = canvasH - (layout.offsets.top + this.getMargin()) * mmToPx; // approx
        // Actually, just center within the calculated free space
        const marginTopPx = layout.offsets.top * mmToPx;
        const marginBottomPx = (isPortrait ? CONFIG.A4.height : CONFIG.A4.width) * mmToPx - (layout.offsets.top * mmToPx + totalGridH);
        
        const startY = marginTopPx + ( (canvasH - (layout.offsets.top + this.getMargin()) * mmToPx) - totalGridH ) / 2;
        // Simpler: center in the "Available Area" we calculated
        const gridAreaH = canvasH - (layout.offsets.top + (this.state.orientation === 'portrait' ? CONFIG.A4.height : CONFIG.A4.width === 'portrait' ? 0 : 0)) * mmToPx;
        // Just use the math from calculateLayout:
        const finalStartY = layout.offsets.top * mmToPx + ( (canvasH - (layout.offsets.top + ( (isPortrait ? CONFIG.A4.height : CONFIG.A4.width) - (layout.offsets.top + (layout.rows*layout.h + (layout.rows-1)*this.getSpacing()) ) )) * mmToPx ) - totalGridH) / 2;
        
        // Refined vertical center in the adjusted zone:
        const zoneH = ( (isPortrait ? CONFIG.A4.height : CONFIG.A4.width) - layout.offsets.top - (this.getMargin() + ( (['bottomRight', 'footer'].includes(meta.position)) ? 12 : 0)) ) * mmToPx;
        const actualStartY = layout.offsets.top * mmToPx + (zoneH - totalGridH) / 2;

        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 1;

        let count = 0;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (count >= this.state.boxCount) break;
                const x = startX + c * (boxW + spacing);
                const y = actualStartY + r * (boxH + spacing);
                this.ctx.strokeRect(x, y, boxW, boxH);
                count++;
            }
        }
    }

    renderMetadataOnCanvas(ctx, meta, mmToPx, canvasW, canvasH) {
        const hasText = meta.title || meta.subtitle || meta.author || meta.date;
        if (!hasText) return;

        ctx.save();
        ctx.font = `${4 * mmToPx}px Roboto`;
        ctx.fillStyle = '#334155';
        
        const padding = 2 * mmToPx;
        const margin = this.getMargin() * mmToPx;
        const lineHeight = 5 * mmToPx;
        
        let lines = [];
        if (meta.title) lines.push((meta.labels ? 'TITLE: ' : '') + meta.title.toUpperCase());
        if (meta.subtitle) lines.push(meta.subtitle);
        if (meta.author) lines.push((meta.labels ? 'AUTHOR: ' : '') + meta.author);
        if (meta.date) lines.push((meta.labels ? 'DATE: ' : '') + meta.date);

        // Pre-calculate block width/height
        const blockH = lines.length * lineHeight + padding * 2;
        let blockW = 0;
        lines.forEach(l => {
            const metrics = ctx.measureText(l);
            if (metrics.width > blockW) blockW = metrics.width;
        });
        blockW += padding * 2;

        let x = margin, y = margin;

        if (meta.position === 'topCenter') {
            x = (canvasW - blockW) / 2;
        } else if (meta.position === 'bottomRight') {
            x = canvasW - margin - blockW;
            y = canvasH - margin - blockH;
        } else if (meta.position === 'footer') {
            x = margin;
            y = canvasH - margin - blockH;
            blockW = canvasW - margin * 2;
        }

        if (meta.border) {
            ctx.strokeStyle = '#cbd5e1';
            ctx.setLineDash([2, 2]);
            ctx.strokeRect(x, y, blockW, blockH);
            ctx.setLineDash([]);
        }

        ctx.textAlign = (meta.position === 'topCenter') ? 'center' : 'left';
        const textX = (meta.position === 'topCenter') ? x + blockW / 2 : x + padding;

        lines.forEach((line, i) => {
            const isTitle = i === 0 && meta.title;
            if (isTitle) ctx.font = `bold ${4.5 * mmToPx}px Roboto`;
            else ctx.font = `${3.5 * mmToPx}px Roboto`;
            
            ctx.fillText(line, textX, y + padding + lineHeight * (i + 0.8));
        });

        ctx.restore();
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
        const meta = this.getMetadata();

        for (let p = 0; p < this.state.pageCount; p++) {
            if (p > 0) doc.addPage();

            // 1. Watermark
            if (meta.watermark) {
                doc.saveGraphicsState();
                doc.setGState(new doc.GState({ opacity: 0.05 }));
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(24);
                doc.setTextColor(0, 0, 0);
                doc.text('MADE WITH SKETCHGRID', pageW / 2, pageH / 2, {
                    align: 'center',
                    angle: 45
                });
                doc.restoreGraphicsState();
            }

            // 2. Metadata
            this.renderMetadataOnPDF(doc, meta, pageW, pageH);

            // 3. Grid
            const totalGridW = layout.cols * boxW + (layout.cols - 1) * spacing;
            const totalGridH = layout.rows * boxH + (layout.rows - 1) * spacing;
            
            const startX = (pageW - totalGridW) / 2;
            const zoneH = (pageH - layout.offsets.top - (this.getMargin() + ( (['bottomRight', 'footer'].includes(meta.position)) ? 12 : 0)) );
            const startY = layout.offsets.top + (zoneH - totalGridH) / 2;

            doc.setLineWidth(0.1);
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
        }

        const filename = `SketchGrid_${this.state.title || 'Guides'}_${this.state.boxCount}x.pdf`;
        doc.save(filename);
    }

    renderMetadataOnPDF(doc, meta, pageW, pageH) {
        const hasText = meta.title || meta.subtitle || meta.author || meta.date;
        if (!hasText) return;

        const margin = this.getMargin();
        const padding = 2;
        const lineHeight = 4;
        
        let lines = [];
        if (meta.title) lines.push((meta.labels ? 'TITLE: ' : '') + meta.title.toUpperCase());
        if (meta.subtitle) lines.push(meta.subtitle);
        if (meta.author) lines.push((meta.labels ? 'AUTHOR: ' : '') + meta.author);
        if (meta.date) lines.push((meta.labels ? 'DATE: ' : '') + meta.date);

        const blockH = lines.length * lineHeight + padding * 2;
        let maxTextW = 0;
        doc.setFont('Roboto', 'normal');
        doc.setFontSize(8);
        lines.forEach(l => {
            const w = doc.getTextWidth(l);
            if (w > maxTextW) maxTextW = w;
        });
        const blockW = (meta.position === 'footer') ? (pageW - margin * 2) : (maxTextW + padding * 2);

        let x = margin, y = margin;
        if (meta.position === 'topCenter') x = (pageW - blockW) / 2;
        else if (meta.position === 'bottomRight') {
            x = pageW - margin - blockW;
            y = pageH - margin - blockH;
        } else if (meta.position === 'footer') {
            y = pageH - margin - blockH;
        }

        if (meta.border) {
            doc.setLineWidth(0.1);
            doc.setDrawColor(200, 200, 200);
            doc.setLineDash([1, 1]);
            doc.rect(x, y, blockW, blockH);
            doc.setLineDash([]);
        }

        const textX = (meta.position === 'topCenter') ? (pageW / 2) : (x + padding);
        const align = (meta.position === 'topCenter') ? 'center' : 'left';

        doc.setTextColor(60, 60, 60);
        lines.forEach((line, i) => {
            const isTitle = i === 0 && meta.title;
            doc.setFont('Roboto', isTitle ? 'bold' : 'normal');
            doc.setFontSize(isTitle ? 10 : 8);
            doc.text(line, textX, y + padding + lineHeight * (i + 0.8), { align });
        });
    }
}

// Spark up the app
window.addEventListener('DOMContentLoaded', () => {
    window.app = new SketchGrid();
});
