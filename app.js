/**
 * SketchGrid - Professional Drawing Workspace
 */

const { jsPDF } = window.jspdf;

const CONFIG = {
    A4: { width: 210, height: 297 },
    margins: { none: 2, narrow: 5, default: 10, wide: 20 },
    spacings: { small: 2, medium: 8, large: 15 } // Increased for better visibility
};

const PRESETS = {
    ideation: { boxCount: 8, ratio: '2:3', spacing: 'medium' },
    thumbnails: { boxCount: 12, ratio: '1:1', spacing: 'small' },
    hero: { boxCount: 4, ratio: 'custom', customRatio: { w: 3, h: 4 }, spacing: 'large' },
    storyboard: { boxCount: 6, ratio: 'custom', customRatio: { w: 16, h: 9 }, spacing: 'medium' }
};

class SketchGrid {
    constructor() {
        this.state = {
            orientation: 'portrait',
            dimension: '2d',
            boxCount: 6,
            ratio: '1:1',
            customRatio: { w: 16, h: 9 },
            spacing: 'medium',
            marginPreset: 'default',
            customMargin: 10,
            theme: 'light',
            // Metadata
            title: '',
            subtitle: '',
            author: '',
            showLabels: true,
            showMetaBorder: false,
            // Smart Engine V2
            reserveHeader: false,
            reserveFooter: false,
            headerHeight: 15, // mm
            footerHeight: 15, // mm
            showDate: true,
            dateMode: 'auto',
            customDate: '',
            dateFormat: 'DD-MM-YYYY',
            // Branding/Output
            showWatermark: true,
            showPageNumbers: true,
            pageCount: 1,
            // Aesthetics
            strokeColor: '#1e293b',
            strokeOpacity: 1,
            // Intelligence
            activePreset: null,
            // UI
            rightSidebarOpen: true,
            leftSidebarOpen: false 
        };

        this.init();
    }

    init() {
        this.cacheElements();
        this.detectTheme();
        this.bindEvents();
        this.updateUIValues();
        this.render();
    }

    detectTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.state.theme = 'dark';
            this.els.body.className = 'theme-dark';
            document.getElementById('theme-icon-sun').classList.add('hidden');
            document.getElementById('theme-icon-moon').classList.remove('hidden');
        }
    }

    cacheElements() {
        this.els = {
            body: document.body,
            themeToggle: document.getElementById('theme-toggle'),
            headerOrientation: document.getElementsByName('orientation'),
            headerDimension: document.getElementsByName('dimension'),
            toggleRightBtn: document.getElementById('toggle-right-sidebar'),
            rightSidebar: document.getElementById('right-sidebar'),
            leftSidebar: document.getElementById('left-sidebar'),
            closeRightBtn: document.getElementById('close-right-sidebar'),
            // Left Controls
            boxCountInput: document.getElementById('box-count'),
            boxCountDisplay: document.getElementById('box-count-display'),
            ratioInputs: document.getElementsByName('ratio'),
            customRatioInputs: document.getElementById('custom-ratio-inputs'),
            ratioW: document.getElementById('ratio-w'),
            ratioH: document.getElementById('ratio-h'),
            spacingInputs: document.getElementsByName('spacing'),
            marginSelect: document.getElementById('margin-preset'),
            marginValInput: document.getElementById('margin-val'),
            showPageNumbers: document.getElementById('show-page-numbers'),
            pageNumSettings: document.getElementById('page-num-settings'),
            showWatermark: document.getElementById('show-watermark'),
            pageCount: document.getElementById('page-count'),
            // Right Controls (Smart Engine)
            reserveHeader: document.getElementById('reserve-header'),
            reserveFooter: document.getElementById('reserve-footer'),
            headerHeightInput: document.getElementById('header-height'),
            headerHeightDisplay: document.getElementById('header-height-display'),
            footerHeightInput: document.getElementById('footer-height'),
            footerHeightDisplay: document.getElementById('footer-height-display'),
            docTitle: document.getElementById('doc-title'),
            docSubtitle: document.getElementById('doc-subtitle'),
            docAuthor: document.getElementById('doc-author'),
            showLabels: document.getElementById('show-labels'),
            showMetaBorder: document.getElementById('show-meta-border'),
            showDate: document.getElementById('show-date'),
            dateDetails: document.getElementById('date-details'),
            dateModeInputs: document.getElementsByName('date-mode'),
            customDateVal: document.getElementById('custom-date-val'),
            dateFormat: document.getElementById('date-format'),
            strokeColor: document.getElementById('stroke-color'),
            strokeOpacity: document.getElementById('stroke-opacity'),
            // Preview
            canvas: document.getElementById('grid-canvas'),
            paperPreview: document.getElementById('paper-preview'),
            pOrientation: document.getElementById('p-orientation'),
            pRatio: document.getElementById('p-ratio'),
            pCount: document.getElementById('p-count'),
            downloadBtn: document.getElementById('download-pdf'),
            mobileToggleLeft: document.getElementById('mobile-toggle-left'),
            mobileToggleRight: document.getElementById('mobile-toggle-right'),
            presetCards: document.querySelectorAll('.preset-card')
        };
        this.ctx = this.els.canvas.getContext('2d');
    }

    bindEvents() {
        this.els.themeToggle.onclick = () => this.toggleTheme();
        this.els.toggleRightBtn.onclick = () => this.toggleSidebar('right');
        this.els.closeRightBtn.onclick = () => this.toggleSidebar('right', false);
        this.els.mobileToggleLeft.onclick = () => this.toggleSidebar('left');
        this.els.mobileToggleRight.onclick = () => this.toggleSidebar('right');

        this.bindRadio('orientation', 'headerOrientation');
        this.bindRadio('dimension', 'headerDimension');

        // Presets
        this.els.presetCards.forEach(card => {
            card.onclick = () => this.applyPreset(card.dataset.preset);
        });

        // Left Sidebar
        this.els.boxCountInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.els.boxCountDisplay.textContent = val;
            this.updateState({ boxCount: val, activePreset: null });
        };
        this.bindRadio('ratio', 'ratioInputs', (val) => {
            this.els.customRatioInputs.classList.toggle('hidden', val !== 'custom');
            this.updateState({ activePreset: null });
        });
        [this.els.ratioW, this.els.ratioH].forEach(el => el.oninput = () => {
            this.updateState({ 
                customRatio: { w: parseFloat(this.els.ratioW.value)||1, h: parseFloat(this.els.ratioH.value)||1 },
                activePreset: null
            });
        });
        this.bindRadio('spacing', 'spacingInputs', () => {
            this.updateState({ activePreset: null });
        });
        this.els.marginSelect.onchange = (e) => {
            const isCustom = e.target.value === 'custom';
            this.els.marginValInput.classList.toggle('hidden', !isCustom);
            this.updateState({ marginPreset: e.target.value });
        };
        this.els.marginValInput.oninput = (e) => this.updateState({ customMargin: parseFloat(e.target.value)||2 });
        this.els.showPageNumbers.onchange = (e) => this.updateState({ showPageNumbers: e.target.checked });
        this.els.showWatermark.onchange = (e) => this.updateState({ showWatermark: e.target.checked });
        this.els.pageCount.oninput = (e) => this.updateState({ pageCount: parseInt(e.target.value)||1 });
        this.els.downloadBtn.onclick = () => this.handleDownload();

        // Smart Engine
        this.els.reserveHeader.onchange = (e) => this.updateState({ reserveHeader: e.target.checked });
        this.els.reserveFooter.onchange = (e) => this.updateState({ reserveFooter: e.target.checked });
        this.els.headerHeightInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.els.headerHeightDisplay.textContent = `${val}mm`;
            this.updateState({ headerHeight: val });
        };
        this.els.footerHeightInput.oninput = (e) => {
            const val = parseInt(e.target.value);
            this.els.footerHeightDisplay.textContent = `${val}mm`;
            this.updateState({ footerHeight: val });
        };

        this.els.docTitle.oninput = (e) => this.updateState({ title: e.target.value });
        this.els.docSubtitle.oninput = (e) => this.updateState({ subtitle: e.target.value });
        this.els.docAuthor.oninput = (e) => this.updateState({ author: e.target.value });
        this.els.showLabels.onchange = (e) => this.updateState({ showLabels: e.target.checked });
        this.els.showMetaBorder.onchange = (e) => this.updateState({ showMetaBorder: e.target.checked });
        this.els.showDate.onchange = (e) => {
            this.els.dateDetails.classList.toggle('hidden', !e.target.checked);
            this.updateState({ showDate: e.target.checked });
        };
        this.bindRadio('dateMode', 'dateModeInputs', (val) => {
            this.els.customDateVal.classList.toggle('hidden', val !== 'custom');
        });
        this.els.customDateVal.oninput = (e) => this.updateState({ customDate: e.target.value });
        this.els.dateFormat.onchange = (e) => this.updateState({ dateFormat: e.target.value });
        this.els.strokeColor.oninput = (e) => this.updateState({ strokeColor: e.target.value });
        this.els.strokeOpacity.oninput = (e) => this.updateState({ strokeOpacity: parseFloat(e.target.value) });

        window.onresize = () => this.render();
    }

    bindRadio(stateKey, elsKey, cb) {
        this.els[elsKey].forEach(el => {
            el.addEventListener('change', (e) => {
                this.updateState({ [stateKey]: e.target.value });
                if (cb) cb(e.target.value);
            });
        });
    }

    toggleSidebar(side, force) {
        if (side === 'right') {
            this.state.rightSidebarOpen = force !== undefined ? force : !this.state.rightSidebarOpen;
            this.els.rightSidebar.classList.toggle('closed', !this.state.rightSidebarOpen);
            this.els.rightSidebar.classList.toggle('open', this.state.rightSidebarOpen);
        } else {
            this.state.leftSidebarOpen = force !== undefined ? force : !this.state.leftSidebarOpen;
            this.els.leftSidebar.classList.toggle('open', this.state.leftSidebarOpen);
        }
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.els.body.className = `theme-${this.state.theme}`;
        document.getElementById('theme-icon-sun').classList.toggle('hidden', this.state.theme === 'dark');
        document.getElementById('theme-icon-moon').classList.toggle('hidden', this.state.theme === 'light');
    }

    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.updateUIValues();
        this.render();
    }

    updateUIValues() {
        this.els.pOrientation.textContent = this.state.orientation.charAt(0).toUpperCase() + this.state.orientation.slice(1);
        this.els.pRatio.textContent = this.state.dimension === '3d' ? 'Isometric' : 
            (this.state.ratio === 'custom' ? `${this.state.customRatio.w}:${this.state.customRatio.h}` : this.state.ratio);
        this.els.pCount.textContent = this.state.dimension === '3d' ? '3D Grid' : `${this.state.boxCount} Boxes`;
        this.els.paperPreview.className = `preview-paper ${this.state.orientation}`;
        if (this.state.dimension === '3d') document.getElementById('2d-only').style.display = 'none';
        else document.getElementById('2d-only').style.display = 'block';

        // Update Preset Active State
        this.els.presetCards.forEach(card => {
            card.classList.toggle('active', card.dataset.preset === this.state.activePreset);
        });

        // Sync inputs if changed via preset
        this.els.boxCountInput.value = this.state.boxCount;
        this.els.boxCountDisplay.textContent = this.state.boxCount;
        this.els.ratioInputs.forEach(input => input.checked = input.value === this.state.ratio);
        this.els.customRatioInputs.classList.toggle('hidden', this.state.ratio !== 'custom');
        this.els.ratioW.value = this.state.customRatio.w;
        this.els.ratioH.value = this.state.customRatio.h;
        this.els.spacingInputs.forEach(input => input.checked = input.value === this.state.spacing);
    }

    applyPreset(id) {
        const preset = PRESETS[id];
        if (!preset) return;
        this.updateState({ ...preset, activePreset: id, dimension: '2d' });
        lucide.createIcons();
    }

    getBoxRatio() {
        if (this.state.ratio === 'custom') return this.state.customRatio.w / this.state.customRatio.h;
        const [w, h] = this.state.ratio.split(':').map(Number);
        return w / h;
    }

    getMargin() {
        if (this.state.marginPreset === 'custom') return Math.max(2, this.state.customMargin);
        return CONFIG.margins[this.state.marginPreset] || 2;
    }

    getBoxingSpacing() {
        return CONFIG.spacings[this.state.spacing] || 0;
    }

    getFormattedDate() {
        if (this.state.dateMode === 'auto') {
            const d = new Date();
            const pad = (n) => n.toString().padStart(2, '0');
            const day = pad(d.getDate()), month = pad(d.getMonth() + 1), year = d.getFullYear();
            const shortYear = year.toString().slice(-2);
            
            switch (this.state.dateFormat) {
                case 'DD-MM-YYYY': return `${day}-${month}-${year}`;
                case 'MM-DD-YYYY': return `${month}-${day}-${year}`;
                case 'YYYY-MM-DD': return `${year}-${month}-${day}`;
                case 'DD/MM/YY': return `${day}/${month}/${shortYear}`;
                default: return `${day}-${month}-${year}`;
            }
        } else {
            // Return custom text directly, or placeholder if empty
            return this.state.customDate || '[Enter Date]';
        }
    }

    calculateLayout() {
        const isPortrait = this.state.orientation === 'portrait';
        const pageW = isPortrait ? CONFIG.A4.width : CONFIG.A4.height;
        const pageH = isPortrait ? CONFIG.A4.height : CONFIG.A4.width;
        
        const baseMargin = this.getMargin();
        const hasHeader = this.state.reserveHeader || this.state.title || this.state.author;
        const hasFooter = this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers;

        let marginTop = baseMargin + (hasHeader ? this.state.headerHeight : 0);
        let marginBottom = baseMargin + (hasFooter ? this.state.footerHeight : 0);

        const availableW = pageW - baseMargin * 2;
        const availableH = pageH - marginTop - marginBottom;
        const spacing = this.getBoxingSpacing();

        if (this.state.dimension === '3d') {
            return { type: '3d', w: availableW, h: availableH, offsets: { top: marginTop, left: baseMargin } };
        }

        const N = this.state.boxCount;
        const boxRatio = this.getBoxRatio();

        let best = { area: 0, rows: 1, cols: 1, w: 0, h: 0, offsets: { top: marginTop, left: baseMargin } };
        for (let cols = 1; cols <= N; cols++) {
            const rows = Math.ceil(N / cols);
            const maxW = (availableW - (cols-1)*spacing) / cols;
            const maxH = (availableH - (rows-1)*spacing) / rows;
            let w, h;
            if (boxRatio > maxW / maxH) { w = maxW; h = maxW / boxRatio; }
            else { h = maxH; w = maxH * boxRatio; }
            if (w > 0 && h > 0) {
                const totalArea = N * w * h;
                if (totalArea > best.area) best = { area: totalArea, rows, cols, w, h, offsets: { top: marginTop, left: baseMargin } };
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

        const canvasW = rect.width, canvasH = rect.height;
        const mmToPx = canvasW / (isPortrait ? CONFIG.A4.width : CONFIG.A4.height);
        this.ctx.clearRect(0, 0, canvasW, canvasH);

        if (this.state.showWatermark) this.drawWatermark(canvasW, canvasH, mmToPx);
        this.drawBars(this.ctx, mmToPx, canvasW, canvasH, 1);
        
        this.ctx.strokeStyle = this.state.strokeColor;
        this.ctx.globalAlpha = this.state.strokeOpacity;
        this.ctx.lineWidth = 1;

        if (layout.type === '3d') this.drawIsometricGrid(layout, mmToPx);
        else this.draw2DGrid(layout, mmToPx, canvasW, canvasH);
        this.ctx.globalAlpha = 1;
    }

    drawBars(ctx, mmToPx, canvasW, canvasH, pageNum) {
        const margin = this.getMargin() * mmToPx;
        const isPortrait = this.state.orientation === 'portrait';
        const pageH_px = (isPortrait ? CONFIG.A4.height : CONFIG.A4.width) * mmToPx;
        
        // Header
        const hasHeader = this.state.reserveHeader || this.state.title || this.state.author;
        if (hasHeader) {
            const h_height = this.state.headerHeight * mmToPx;
            const y = margin;
            if (this.state.showMetaBorder) {
                ctx.setLineDash([2,2]); ctx.strokeStyle = '#cbd5e1'; ctx.strokeRect(margin, y, canvasW - margin*2, h_height); ctx.setLineDash([]);
            }
            // Title (Left)
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${5 * mmToPx}px Roboto`;
            ctx.textAlign = 'left';
            let titleText = this.state.title || '';
            if (this.state.showLabels) titleText = `Title: ${titleText}`;
            ctx.fillText(titleText.toUpperCase(), margin + 4*mmToPx, y + h_height/2 + 1*mmToPx);
            
            // Author (Right)
            ctx.font = `italic ${4 * mmToPx}px Roboto`;
            ctx.textAlign = 'right';
            let authStr = this.state.author || '';
            if (this.state.showLabels) {
                ctx.font = `bold ${3.5 * mmToPx}px Roboto`;
                ctx.fillText('Author:', canvasW - margin - ctx.measureText(authStr).width - 6*mmToPx, y + h_height/2 + 1*mmToPx);
                ctx.font = `normal ${4 * mmToPx}px Roboto`;
            }
            ctx.fillText(authStr, canvasW - margin - 4*mmToPx, y + h_height/2 + 1*mmToPx);
        }

        // Footer
        const hasFooter = this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers;
        if (hasFooter) {
            const f_height = this.state.footerHeight * mmToPx;
            const y = pageH_px - margin - f_height;
            if (this.state.showMetaBorder) {
                ctx.setLineDash([2,2]); ctx.strokeStyle = '#cbd5e1'; ctx.strokeRect(margin, y, canvasW - margin*2, f_height); ctx.setLineDash([]);
            }
            // Date (Left)
            if (this.state.showDate) {
                ctx.fillStyle = '#475569';
                ctx.textAlign = 'left';
                let dateStr = this.getFormattedDate();
                if (this.state.showLabels) {
                    ctx.font = `bold ${3.5 * mmToPx}px Roboto`;
                    ctx.fillText('Date:', margin + 4*mmToPx, y + f_height/2 + 1*mmToPx);
                    ctx.font = `normal ${3.5 * mmToPx}px Roboto`;
                    ctx.fillText(dateStr, margin + 4*mmToPx + ctx.measureText('Date: ').width + 2*mmToPx, y + f_height/2 + 1*mmToPx);
                } else {
                    ctx.font = `normal ${3.5 * mmToPx}px Roboto`;
                    ctx.fillText(dateStr, margin + 4*mmToPx, y + f_height/2 + 1*mmToPx);
                }
            }

            // Page Number (Right)
            if (this.state.showPageNumbers) {
                ctx.textAlign = 'right';
                ctx.font = `bold 700 ${3.5 * mmToPx}px Roboto`;
                ctx.fillText(`Page ${pageNum} of ${this.state.pageCount}`, canvasW - margin - 4*mmToPx, y + f_height/2 + 1*mmToPx);
            }
        }
    }

    draw2DGrid(layout, mmToPx, canvasW, canvasH) {
        const boxW = layout.w * mmToPx, boxH = layout.h * mmToPx, spacing = this.getBoxingSpacing() * mmToPx;
        const totalW = layout.cols * boxW + (layout.cols - 1) * spacing;
        const totalH = layout.rows * boxH + (layout.rows - 1) * spacing;
        const startX = (canvasW - totalW) / 2;
        const startY = layout.offsets.top * mmToPx + ( (layout.h * layout.rows + (layout.rows-1)*this.getBoxingSpacing())*mmToPx > (layout.h * layout.rows)*mmToPx ? 0 : 0); // Simplified
        const actualStartY = layout.offsets.top * mmToPx + ( (layout.h * layout.rows + (layout.rows-1)*this.getBoxingSpacing())*mmToPx < (layout.h * layout.rows)*mmToPx ? 0 : 0);
        
        // Centering grid in the CUTOUT area
        const availableZoneH = (layout.type === '3d' ? layout.h : layout.rows * layout.h + (layout.rows-1)*layout.spacing) ? 0 : 0; 
        // Real logic: center between marginTop and (pageH - marginBottom)
        const isPortrait = this.state.orientation === 'portrait';
        const pageH_px = (isPortrait ? CONFIG.A4.height : CONFIG.A4.width) * mmToPx;
        const gridAreaH = pageH_px - (layout.offsets.top * mmToPx) - ( (this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers) ? (this.getMargin() + this.state.footerHeight)*mmToPx : this.getMargin()*mmToPx );
        const finalY = layout.offsets.top * mmToPx + (gridAreaH - totalH) / 2;

        let count = 0;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (count++ >= this.state.boxCount) break;
                this.ctx.strokeRect(startX+c*(boxW+spacing), finalY+r*(boxH+spacing), boxW, boxH);
            }
        }
    }

    drawIsometricGrid(layout, mmToPx) {
        const startX = layout.offsets.left * mmToPx, startY = layout.offsets.top * mmToPx;
        const gridW = layout.w * mmToPx, gridH = layout.h * mmToPx;
        const cell = 10 * mmToPx;
        this.ctx.beginPath();
        for (let x = 0; x <= gridW; x += cell) { this.ctx.moveTo(startX + x, startY); this.ctx.lineTo(startX + x, startY + gridH); }
        for (let y = 0; y <= gridH; y += cell) { this.ctx.moveTo(startX, startY + y); this.ctx.lineTo(startX + gridW, startY + y); }
        for (let i = -gridW; i <= gridW + gridH; i += cell * 1.5) {
            this.ctx.moveTo(startX, startY + i); this.ctx.lineTo(startX + gridW, startY + i + gridW * 0.5);
            this.ctx.moveTo(startX, startY + i); this.ctx.lineTo(startX + gridW, startY + i - gridW * 0.5);
        }
        this.ctx.stroke();
    }

    drawWatermark(canvasW, canvasH, mmToPx) {
        this.ctx.save();
        this.ctx.font = `800 ${10 * mmToPx}px Outfit`;
        this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
        this.ctx.textAlign = 'center';
        this.ctx.translate(canvasW/2, canvasH/2);
        this.ctx.rotate(-Math.PI / 4);
        this.ctx.fillText('MADE WITH SKETCHGRID', 0, 0);
        this.ctx.restore();
    }

    async handleDownload() {
        const btn = this.els.downloadBtn;
        const original = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Exporting...';
        lucide.createIcons();
        await new Promise(r => setTimeout(r, 600));
        this.generatePDF();
        btn.disabled = false;
        btn.innerHTML = original;
        lucide.createIcons();
    }

    generatePDF() {
        const layout = this.calculateLayout();
        const doc = new jsPDF({ orientation: this.state.orientation==='portrait'?'p':'l', unit: 'mm', format: 'a4' });
        const pageW = doc.internal.pageSize.getWidth(), pageH = doc.internal.pageSize.getHeight();
        
        for (let p = 0; p < this.state.pageCount; p++) {
            if (p > 0) doc.addPage();
            if (this.state.showWatermark) {
                doc.saveGraphicsState(); doc.setGState(new doc.GState({ opacity: 0.05 }));
                doc.setFont('helvetica', 'bold'); doc.setFontSize(30);
                doc.text('MADE WITH SKETCHGRID', pageW/2, pageH/2, { align:'center', angle:45 });
                doc.restoreGraphicsState();
            }
            this.renderPDFBars(doc, pageW, pageH, p+1);
            doc.setDrawColor(this.state.strokeColor); doc.setGState(new doc.GState({ opacity: this.state.strokeOpacity })); doc.setLineWidth(0.1);
            if (this.state.dimension === '3d') this.drawPDFIsometric(doc, layout);
            else this.drawPDF2D(doc, layout, pageW, pageH);
        }
        doc.save(`SketchGrid_${this.state.title||'Export'}.pdf`);
    }

    renderPDFBars(doc, pageW, pageH, pageNum) {
        const margin = this.getMargin();
        const hasHeader = this.state.reserveHeader || this.state.title || this.state.author;
        if (hasHeader) {
            const h_h = this.state.headerHeight;
            if (this.state.showMetaBorder) doc.setLineDash([1,1], 0); doc.rect(margin, margin, pageW - margin*2, h_h); doc.setLineDash([], 0);
            doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
            let t = this.state.title || ''; if (this.state.showLabels) t = `Title: ${t}`;
            doc.text(t.toUpperCase(), margin + 2, margin + h_h/2 + 2);
            doc.setFontSize(10);
            let a = this.state.author || ''; if (this.state.showLabels) a = `Author: ${a}`;
            doc.text(a, pageW - margin - 2, margin + h_h/2 + 2, { align: 'right' });
        }
        const hasFooter = this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers;
        if (hasFooter) {
            const f_h = this.state.footerHeight;
            const y = pageH - margin - f_h;
            if (this.state.showMetaBorder) doc.setLineDash([1,1], 0); doc.rect(margin, y, pageW - margin*2, f_h); doc.setLineDash([], 0);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
            doc.text(this.getFormattedDate(), margin + 2, y + f_h/2 + 2);
            if (this.state.showPageNumbers) doc.text(`Page ${pageNum} of ${this.state.pageCount}`, pageW - margin - 2, y + f_h/2 + 2, { align: 'right' });
        }
    }

    drawPDF2D(doc, layout, pageW, pageH) {
        const spacing = this.getBoxingSpacing();
        const totalW = layout.cols * layout.w + (layout.cols - 1) * spacing;
        const totalH = layout.rows * layout.h + (layout.rows - 1) * spacing;
        const startX = (pageW - totalW) / 2;
        const footerSpace = (this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers) ? (this.getMargin() + this.state.footerHeight) : this.getMargin();
        const gridAreaH = pageH - layout.offsets.top - footerSpace;
        const startY = layout.offsets.top + (gridAreaH - totalH) / 2;
        let count = 0;
        for (let r = 0; r < layout.rows; r++) {
            for (let c = 0; c < layout.cols; c++) {
                if (count++ >= this.state.boxCount) break;
                doc.rect(startX+c*(layout.w+spacing), startY+r*(layout.h+spacing), layout.w, layout.h);
            }
        }
    }

    drawPDFIsometric(doc, layout) {
        const startX = layout.offsets.left, startY = layout.offsets.top, gridW = layout.w, gridH = layout.h, cell = 10;
        for (let x = 0; x <= gridW; x += cell) doc.line(startX + x, startY, startX + x, startY + gridH);
        for (let y = 0; y <= gridH; y += cell) doc.line(startX, startY + y, startX + gridW, startY + y);
        for (let i = -gridW; i <= gridW + gridH; i += cell * 1.5) {
            doc.line(startX, startY + i, startX + gridW, startY + i + gridW * 0.5);
            doc.line(startX, startY + i, startX + gridW, startY + i - gridW * 0.5);
        }
    }
}

window.addEventListener('DOMContentLoaded', () => { window.app = new SketchGrid(); });
