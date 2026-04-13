class SketchGrid {
    constructor() {
        this.state = {
            orientation: 'portrait',
            dimension: '2d',
            theme: 'light',
            boxCount: 6,
            ratio: '1:1',
            customRatio: { w: 4, h: 3 },
            spacing: 'medium',
            marginPreset: 'default',
            customMargin: 10,
            strokeColor: '#1e293b',
            strokeOpacity: 1,
            // Header/Footer
            reserveHeader: false,
            reserveFooter: false,
            headerHeight: 15,
            footerHeight: 15,
            title: '',
            subtitle: '',
            author: '',
            showLabels: true,
            showMetaBorder: false,
            showDate: true,
            dateMode: 'auto',
            customDate: '',
            dateFormat: 'DD-MM-YYYY',
            showPageNumbers: true,
            showWatermark: true,
            pageCount: 1,
            activePreset: null,
            // 3D Engine
            shapeType: 'cube',
            projectionMode: 'persp',
            isXray: false,
            showInlineGrid: false,
            shapeDepth: 100,
            inlineDensity: 5,
            rotX: 15,
            rotY: 45,
            rotZ: 0,
            dimL: 1.0, dimB: 1.0, dimH: 1.0,
            dimRX: 1.0, dimRY: 1.0, dimRZ: 1.0,
            dimRT: 1.0, dimRBot: 1.0, dimCH: 1.0,
            // 2D Engine
            prime2D: 'rect',
            // UI
            rightSidebarOpen: true,
            leftSidebarOpen: true,
            zoomLevel: 0.6 // Increased default preview size
        };

        this.PRESETS_2D = {
            'ideation': { boxCount: 8, ratio: '2:3' },
            'thumbnails': { boxCount: 12, ratio: '1:1' },
            'hero': { boxCount: 2, ratio: '3:4' },
            'storyboard': { boxCount: 6, ratio: '2:3' }
        };

        this.PRESETS_3D = {
            'study-box': { shapeType: 'cube', boxCount: 6, rotX: 15, rotY: 45, dimL: 1.0, dimB: 1.0, dimH: 1.0, showInlineGrid: true },
            'hero-sphere': { shapeType: 'sphere', boxCount: 2, rotX: 0, rotY: 0, dimRX: 1.0, dimRY: 1.0, dimRZ: 1.0, showInlineGrid: true },
            'product-cyl': { shapeType: 'cylinder', boxCount: 4, rotX: 20, rotY: 15, dimRT: 1.0, dimRBot: 1.0, dimCH: 1.2 },
            'complex-3d': { shapeType: 'cube', boxCount: 8, rotX: 25, rotY: 45, dimL: 0.6, dimB: 1.5, dimH: 1.0 }
        };

        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.detectTheme();
        this.updateUIValues();
        this.render();
    }

    cacheElements() {
        this.els = {
            body: document.body,
            canvas: document.getElementById('grid-canvas'),
            paperPreview: document.getElementById('paper-preview'),
            // UI Toggles
            themeToggle: document.getElementById('theme-toggle'),
            toggleRightBtn: document.getElementById('toggle-right-sidebar'),
            closeRightBtn: document.getElementById('close-right-sidebar'),
            rightSidebar: document.getElementById('right-sidebar'),
            leftSidebar: document.getElementById('left-sidebar'),
            mobileToggleLeft: document.getElementById('mobile-toggle-left'),
            mobileToggleRight: document.getElementById('mobile-toggle-right'),

            // Mode containers
            ui2D: document.getElementById('ui-2d-only'),
            ui3D: document.getElementById('ui-3d-only'),

            // Global Headers
            headerDimension: document.getElementsByName('dimension'),
            headerOrientation: document.getElementsByName('orientation'),

            // 2D Controls
            boxCount2D: document.getElementById('box-count-2d'),
            boxCountDisplay2D: document.getElementById('box-count-display-2d'),
            prime2DInputs: document.getElementsByName('prime-2d'),
            ratioInputs: document.getElementsByName('ratio'),
            customRatioInputs: document.getElementById('custom-ratio-inputs'),
            ratioW: document.getElementById('ratio-w'),
            ratioH: document.getElementById('ratio-h'),

            // 3D Controls
            boxCount3D: document.getElementById('box-count-3d'),
            boxCountDisplay3D: document.getElementById('box-count-display-3d'),
            shapeInputs: document.getElementsByName('shape'),
            xrayToggle: document.getElementById('three-d-xray'),
            gridToggle: document.getElementById('three-d-grid'),
            shapeDepth: document.getElementById('shape-depth'),
            shapeDepthVal: document.getElementById('shape-depth-val'),
            rotX: document.getElementById('shape-rot-x'),
            rotY: document.getElementById('shape-rot-y'),
            rotZ: document.getElementById('shape-rot-z'),
            resetBtns: document.querySelectorAll('.reset-mini'),
            inlineDensity: document.getElementById('inline-density'),
            inlineDensityVal: document.getElementById('inline-density-val'),
            dimL: document.getElementById('dim-l'), dimB: document.getElementById('dim-b'), dimH: document.getElementById('dim-h'),
            dimRX: document.getElementById('dim-rx'), dimRY: document.getElementById('dim-ry'), dimRZ: document.getElementById('dim-rz'),
            dimRT: document.getElementById('dim-rt'), dimRBot: document.getElementById('dim-rbot'), dimCH: document.getElementById('dim-ch'),
            panels: { cuboid: document.getElementById('m-cuboid'), sphere: document.getElementById('m-sphere'), cylinder: document.getElementById('m-cylinder') },

            // Shared / Global
            marginPreset: document.getElementById('margin-preset'),
            marginValInput: document.getElementById('margin-val'),
            spacingInputs: document.getElementsByName('spacing'),
            presetCards: document.querySelectorAll('.preset-card'),
            docTitle: document.getElementById('doc-title'),
            docSubtitle: document.getElementById('doc-subtitle'),
            docAuthor: document.getElementById('doc-author'),
            showLabels: document.getElementById('show-labels'),
            showMetaBorder: document.getElementById('show-meta-border'),
            showDate: document.getElementById('show-date'),
            dateModeInputs: document.getElementsByName('date-mode'),
            customDateVal: document.getElementById('custom-date-val'),
            dateDetails: document.getElementById('date-details'),
            showPageNumbers: document.getElementById('show-page-numbers'),
            showWatermark: document.getElementById('show-watermark'),
            pageCount: document.getElementById('page-count'),
            downloadBtn: document.getElementById('download-pdf'),
            strokeColor: document.getElementById('stroke-color'),
            strokeOpacity: document.getElementById('stroke-opacity'),
            reserveHeader: document.getElementById('reserve-header'),
            reserveFooter: document.getElementById('reserve-footer'),
            headerHeightInput: document.getElementById('header-height'),
            headerHeightDisplay: document.getElementById('header-height-display'),
            footerHeightInput: document.getElementById('footer-height'),
            footerHeightDisplay: document.getElementById('footer-height-display'),
            pOrientation: document.getElementById('p-orientation'),
            pRatio: document.getElementById('p-ratio'),
            pCount: document.getElementById('p-count')
        };
        this.ctx = this.els.canvas.getContext('2d');
    }

    bindEvents() {
        const safeBind = (el, event, cb) => { if (el) el[event] = cb; };

        safeBind(this.els.themeToggle, 'onclick', () => this.toggleTheme());
        safeBind(this.els.toggleRightBtn, 'onclick', () => this.toggleSidebar('right'));
        safeBind(this.els.closeRightBtn, 'onclick', () => this.toggleSidebar('right', false));
        safeBind(this.els.mobileToggleLeft, 'onclick', () => this.toggleSidebar('left'));
        safeBind(this.els.mobileToggleRight, 'onclick', () => this.toggleSidebar('right'));

        this.bindRadio('orientation', 'headerOrientation');
        this.bindRadio('dimension', 'headerDimension', (dim) => {
            this.toggleSidebar('left', true); // Open tools when switching modes
        });

        this.els.presetCards.forEach(card => {
            card.onclick = () => this.applyPreset(card.dataset.preset);
        });

        // 2D Specific
        safeBind(this.els.boxCount2D, 'oninput', (e) => {
            const val = parseInt(e.target.value);
            this.updateState({ boxCount: val, activePreset: null });
        });
        this.bindRadio('prime2D', 'prime2DInputs');
        this.bindRadio('ratio', 'ratioInputs');
        [this.els.ratioW, this.els.ratioH].forEach(el => safeBind(el, 'oninput', () => {
            this.updateState({ customRatio: { w: parseFloat(this.els.ratioW.value) || 1, h: parseFloat(this.els.ratioH.value) || 1 }, activePreset: null });
        }));

        // 3D Specific
        safeBind(this.els.boxCount3D, 'oninput', (e) => {
            const val = parseInt(e.target.value);
            this.updateState({ boxCount: val, activePreset: null });
        });
        this.bindRadio('shapeType', 'shapeInputs', () => this.resetMeasurements());
        safeBind(this.els.xrayToggle, 'onchange', (e) => this.updateState({ isXray: e.target.checked }));
        safeBind(this.els.gridToggle, 'onchange', (e) => this.updateState({ showInlineGrid: e.target.checked }));
        safeBind(this.els.shapeDepth, 'oninput', (e) => this.updateState({ shapeDepth: parseInt(e.target.value) }));
        safeBind(this.els.rotX, 'oninput', (e) => this.updateState({ rotX: parseInt(e.target.value) }));
        safeBind(this.els.rotY, 'oninput', (e) => this.updateState({ rotY: parseInt(e.target.value) }));
        safeBind(this.els.rotZ, 'oninput', (e) => this.updateState({ rotZ: parseInt(e.target.value) }));
        safeBind(this.els.inlineDensity, 'oninput', (e) => this.updateState({ inlineDensity: parseInt(e.target.value) }));

        const bindMeas = (el, key) => { safeBind(el, 'oninput', (e) => this.updateState({ [key]: parseFloat(e.target.value) || 0.1 })); };
        bindMeas(this.els.dimL, 'dimL'); bindMeas(this.els.dimB, 'dimB'); bindMeas(this.els.dimH, 'dimH');
        bindMeas(this.els.dimRX, 'dimRX'); bindMeas(this.els.dimRY, 'dimRY'); bindMeas(this.els.dimRZ, 'dimRZ');
        bindMeas(this.els.dimRT, 'dimRT'); bindMeas(this.els.dimRBot, 'dimRBot'); bindMeas(this.els.dimCH, 'dimCH');

        this.els.resetBtns.forEach(btn => btn.onclick = () => this.updateState({ [btn.dataset.reset]: 0 }));

        // Shared / Global
        safeBind(this.els.marginPreset, 'onchange', (e) => {
            this.updateState({ marginPreset: e.target.value });
        });
        safeBind(this.els.marginValInput, 'oninput', (e) => this.updateState({ customMargin: parseFloat(e.target.value) || 2 }));
        this.bindRadio('spacing', 'spacingInputs');

        safeBind(this.els.docTitle, 'oninput', (e) => this.updateState({ title: e.target.value }));
        safeBind(this.els.docSubtitle, 'oninput', (e) => this.updateState({ subtitle: e.target.value }));
        safeBind(this.els.docAuthor, 'oninput', (e) => this.updateState({ author: e.target.value }));
        safeBind(this.els.showLabels, 'onchange', (e) => this.updateState({ showLabels: e.target.checked }));
        safeBind(this.els.showMetaBorder, 'onchange', (e) => this.updateState({ showMetaBorder: e.target.checked }));
        safeBind(this.els.showDate, 'onchange', (e) => this.updateState({ showDate: e.target.checked }));
        this.bindRadio('dateMode', 'dateModeInputs');
        safeBind(this.els.customDateVal, 'oninput', (e) => this.updateState({ customDate: e.target.value }));
        safeBind(this.els.showPageNumbers, 'onchange', (e) => this.updateState({ showPageNumbers: e.target.checked }));
        safeBind(this.els.showWatermark, 'onchange', (e) => this.updateState({ showWatermark: e.target.checked }));
        safeBind(this.els.pageCount, 'oninput', (e) => this.updateState({ pageCount: parseInt(e.target.value) || 1 }));
        safeBind(this.els.strokeColor, 'oninput', (e) => this.updateState({ strokeColor: e.target.value }));
        safeBind(this.els.strokeOpacity, 'oninput', (e) => this.updateState({ strokeOpacity: parseFloat(e.target.value) }));
        safeBind(this.els.reserveHeader, 'onchange', (e) => this.updateState({ reserveHeader: e.target.checked }));
        safeBind(this.els.reserveFooter, 'onchange', (e) => this.updateState({ reserveFooter: e.target.checked }));
        safeBind(this.els.headerHeightInput, 'oninput', (e) => this.updateState({ headerHeight: parseInt(e.target.value) }));
        safeBind(this.els.footerHeightInput, 'oninput', (e) => this.updateState({ footerHeight: parseInt(e.target.value) }));
        safeBind(this.els.downloadBtn, 'onclick', () => this.handleDownload());

        window.onresize = () => this.render();

        // Setup Wheel Zoom
        const previewContainer = this.els.paperPreview?.parentElement;
        if (previewContainer) {
            previewContainer.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey || true) { // Allow zooming anywhere on paper container
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -0.05 : 0.05;
                    this.state.zoomLevel = Math.max(0.1, Math.min(3.0, this.state.zoomLevel + delta));
                    this.els.paperPreview.style.width = (this.els.canvas.width * this.state.zoomLevel) + 'px';
                    this.els.paperPreview.style.height = (this.els.canvas.height * this.state.zoomLevel) + 'px';
                }
            }, { passive: false });
        }
    }

    resetMeasurements() {
        this.updateState({ dimL: 1.0, dimB: 1.0, dimH: 1.0, dimRX: 1.0, dimRY: 1.0, dimRZ: 1.0, dimRT: 1.0, dimRBot: 1.0, dimCH: 1.0 });
    }

    bindRadio(stateKey, elsKey, cb) {
        if (!this.els[elsKey]) return;
        this.els[elsKey].forEach(el => {
            el.addEventListener('change', (e) => {
                this.updateState({ [stateKey]: e.target.value });
                if (cb) cb(e.target.value);
            });
        });
    }

    updateState(newState) {
        // Enforce 3D limits
        if (newState.dimension === '3d' || (newState.dimension === undefined && this.state.dimension === '3d')) {
            if (newState.boxCount > 8 || (newState.boxCount === undefined && this.state.boxCount > 8)) {
                newState.boxCount = 8;
            }
        }
        this.state = { ...this.state, ...newState };
        this.updateUIValues();
        this.render();
    }

    updateUIValues() {
        this.els.pOrientation.textContent = this.state.orientation;
        this.els.pRatio.textContent = this.state.dimension === '3d' ? 'Volume' : this.state.ratio;
        this.els.pCount.textContent = `${this.state.boxCount} Objects`;
        this.els.paperPreview.className = `preview-paper ${this.state.orientation}`;

        // Mode Toggle Visibility
        const is3D = this.state.dimension === '3d';
        this.els.ui2D.classList.toggle('hidden', is3D);
        this.els.ui3D.classList.toggle('hidden', !is3D);

        // Sync inputs
        if (is3D) {
            this.els.boxCount3D.value = this.state.boxCount;
            this.els.boxCountDisplay3D.textContent = this.state.boxCount;
        } else {
            this.els.boxCount2D.value = this.state.boxCount;
            this.els.boxCountDisplay2D.textContent = this.state.boxCount;
        }

        this.els.presetCards.forEach(card => card.classList.toggle('active', card.dataset.preset === this.state.activePreset));

        // 3D Specific UI Sync
        if (is3D) {
            this.els.shapeInputs.forEach(i => i.checked = i.value === this.state.shapeType);
            this.els.panels.cuboid.classList.toggle('hidden', this.state.shapeType !== 'cube');
            this.els.panels.sphere.classList.toggle('hidden', this.state.shapeType !== 'sphere');
            this.els.panels.cylinder.classList.toggle('hidden', this.state.shapeType !== 'cylinder');

            this.els.dimL.value = this.state.dimL; this.els.dimB.value = this.state.dimB; this.els.dimH.value = this.state.dimH;
            this.els.dimRX.value = this.state.dimRX; this.els.dimRY.value = this.state.dimRY; this.els.dimRZ.value = this.state.dimRZ;
            this.els.dimRT.value = this.state.dimRT; this.els.dimRBot.value = this.state.dimRBot; this.els.dimCH.value = this.state.dimCH;

            this.els.shapeDepthVal.textContent = `${this.state.shapeDepth}%`;
            this.els.inlineDensityVal.textContent = this.state.inlineDensity;
        } else {
            if (this.els.ratioInputs) { this.els.ratioInputs.forEach(i => i.checked = i.value === this.state.ratio); }
            if (this.els.customRatioInputs) { this.els.customRatioInputs.classList.toggle('hidden', this.state.ratio !== 'custom'); }
        }

        // Shared Sync
        this.els.marginPreset.value = this.state.marginPreset;
        if (this.els.marginValInput) {
            this.els.marginValInput.classList.toggle('hidden', this.state.marginPreset !== 'custom');
            this.els.marginValInput.value = this.state.customMargin;
        }
        if (this.els.spacingInputs) { this.els.spacingInputs.forEach(i => i.checked = i.value === this.state.spacing); }
        if (this.els.dateDetails) { this.els.dateDetails.classList.toggle('hidden', !this.state.showDate); }
        if (this.els.dateModeInputs) { this.els.dateModeInputs.forEach(i => i.checked = i.value === this.state.dateMode); }
        if (this.els.customDateVal) { this.els.customDateVal.classList.toggle('hidden', this.state.dateMode !== 'custom'); }
        if (this.els.headerHeightDisplay) { this.els.headerHeightDisplay.textContent = `${this.state.headerHeight}mm`; }
        if (this.els.footerHeightDisplay) { this.els.footerHeightDisplay.textContent = `${this.state.footerHeight}mm`; }
    }

    applyPreset(id) {
        const p = this.state.dimension === '3d' ? this.PRESETS_3D[id] : this.PRESETS_2D[id];
        if (p) this.updateState({ ...p, activePreset: id });
    }

    detectTheme() {
        if (localStorage.getItem('theme')) {
            this.state.theme = localStorage.getItem('theme');
        } else {
            this.state.theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        this.els.body.className = `theme-${this.state.theme}`;
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.state.theme);
        this.els.body.className = `theme-${this.state.theme}`;
        document.getElementById('theme-icon-sun').classList.toggle('hidden', this.state.theme === 'dark');
        document.getElementById('theme-icon-moon').classList.toggle('hidden', this.state.theme === 'light');
    }

    toggleSidebar(side, force) {
        if (side === 'right') {
            this.state.rightSidebarOpen = force !== undefined ? force : !this.state.rightSidebarOpen;
            this.els.rightSidebar.classList.toggle('closed', !this.state.rightSidebarOpen);
        } else {
            this.state.leftSidebarOpen = force !== undefined ? force : !this.state.leftSidebarOpen;
            this.els.leftSidebar.classList.toggle('open', this.state.leftSidebarOpen);
        }
    }

    calculateLayout() {
        const orientation = this.state.orientation;
        const paperW = 210, paperH = 297;
        let canvasW = orientation === 'portrait' ? paperW : paperH;
        let canvasH = orientation === 'portrait' ? paperH : paperW;

        const margin = this.getMargin();
        const headerH = (this.state.reserveHeader || this.state.title || this.state.author) ? this.state.headerHeight : 0;
        const footerH = (this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers) ? this.state.footerHeight : 0;

        const usableW = canvasW - (margin * 2);
        const usableH = canvasH - (margin * 2) - headerH - footerH;

        let ratio = 1;
        if (this.state.dimension === '2d') {
            if (this.state.ratio === '1:1') ratio = 1;
            else if (this.state.ratio === '2:3') ratio = 2 / 3;
            else if (this.state.ratio === '3:4') ratio = 3 / 4;
            else if (this.state.ratio === 'custom') ratio = this.state.customRatio.w / this.state.customRatio.h;
        }

        const count = this.state.boxCount;
        let cols = 1, rows = 1;

        if (count === 2) { cols = 1; rows = 2; }
        else if (count === 3) { cols = 1; rows = 3; }
        else if (count === 4) { cols = 2; rows = 2; }
        else if (count <= 6) { cols = 2; rows = 3; }
        else if (count <= 8) { cols = 2; rows = 4; }
        else if (count <= 9) { cols = 3; rows = 3; }
        else { cols = 3; rows = 4; }

        if (orientation === 'landscape' && count > 2) [cols, rows] = [rows, cols];

        const spacingPx = this.state.spacing === 'small' ? 2 : (this.state.spacing === 'medium' ? 5 : 10);
        let maxBoxW = (usableW - (cols - 1) * spacingPx) / cols;
        let maxBoxH = (usableH - (rows - 1) * spacingPx) / rows;

        let boxW = maxBoxW;
        let boxH = maxBoxH;
        let startX = margin;
        let startY = margin + headerH;

        if (this.state.dimension === '2d') {
            if (maxBoxW / ratio <= maxBoxH) {
                boxH = maxBoxW / ratio;
            } else {
                boxW = maxBoxH * ratio;
            }
            let actualW = boxW * cols + spacingPx * (cols - 1);
            let actualH = boxH * rows + spacingPx * (rows - 1);
            startX = margin + (usableW - actualW) / 2;
            startY = margin + headerH + (usableH - actualH) / 2;
        }

        return { canvasW, canvasH, boxW, boxH, cols, rows, margin, startX, startY, spacingPx };
    }

    getMargin() {
        if (this.state.marginPreset === 'none') return 2;
        if (this.state.marginPreset === 'narrow') return 5;
        if (this.state.marginPreset === 'wide') return 20;
        if (this.state.marginPreset === 'custom') return this.state.customMargin;
        return 10;
    }

    render() {
        const layout = this.calculateLayout();
        const mmToPx = 3.7795275591;
        this.els.canvas.width = layout.canvasW * mmToPx;
        this.els.canvas.height = layout.canvasH * mmToPx;
        this.els.paperPreview.style.width = (this.els.canvas.width * this.state.zoomLevel) + 'px';
        this.els.paperPreview.style.height = (this.els.canvas.height * this.state.zoomLevel) + 'px';

        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.els.canvas.width, this.els.canvas.height);
        ctx.save();
        ctx.scale(mmToPx, mmToPx);

        this.drawGrid(ctx, layout, mmToPx);
        this.drawBars(ctx, layout);
        ctx.restore();
    }

    drawGrid(ctx, L, mmToPx) {
        ctx.strokeStyle = this.state.strokeColor;
        ctx.globalAlpha = this.state.strokeOpacity;
        ctx.lineWidth = 0.2;

        for (let r = 0; r < L.rows; r++) {
            for (let c = 0; c < L.cols; c++) {
                const bx = L.startX + c * (L.boxW + L.spacingPx);
                const by = L.startY + r * (L.boxH + L.spacingPx);
                if (this.state.dimension === '3d') {
                    this.draw3DShape(ctx, bx, by, L.boxW, L.boxH, mmToPx);
                } else {
                    this.draw2DPrimitive(ctx, bx, by, L.boxW, L.boxH);
                }
            }
        }
    }

    draw2DPrimitive(ctx, x, y, w, h) {
        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        switch (this.state.prime2D) {
            case 'rect': ctx.strokeRect(x, y, w, h); break;
            case 'circle':
                ctx.arc(cx, cy, Math.min(w, h) / 2, 0, Math.PI * 2);
                ctx.stroke();
                break;
            case 'triangle':
                const s = Math.min(w, h);
                ctx.moveTo(cx, cy - s / 2);
                ctx.lineTo(cx + s / 2, cy + s / 2);
                ctx.lineTo(cx - s / 2, cy + s / 2);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    draw3DShape(ctx, x, y, w, h, mmToPx) {
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const size = Math.min(w, h) * 0.45 * (this.state.shapeDepth / 100);
        const zoom = 1.5;

        const rad = (d) => (d * Math.PI) / 180;
        const ax = rad(this.state.rotX), ay = rad(this.state.rotY), az = rad(this.state.rotZ);

        const project = (px, py, pz) => {
            let sx, sy, sz;
            if (this.state.shapeType === 'cube') {
                const maxDim = Math.max(this.state.dimL, this.state.dimB, this.state.dimH);
                sx = px * (this.state.dimL / maxDim);
                sy = py * (this.state.dimH / maxDim);
                sz = pz * (this.state.dimB / maxDim);
            } else if (this.state.shapeType === 'sphere') {
                const maxDim = Math.max(this.state.dimRX, this.state.dimRY, this.state.dimRZ);
                sx = px * (this.state.dimRX / maxDim);
                sy = py * (this.state.dimRY / maxDim);
                sz = pz * (this.state.dimRZ / maxDim);
            } else {
                const maxDim = Math.max(this.state.dimRT, this.state.dimRBot, this.state.dimCH / 2);
                const heightR = (py + size / 2) / size;
                const currentR = this.state.dimRBot * (1 - heightR) + this.state.dimRT * heightR;
                sx = px * (currentR / maxDim); sz = pz * (currentR / maxDim);
                sy = py * (this.state.dimCH / (maxDim * 2));
            }

            let y1 = sy * Math.cos(ax) - sz * Math.sin(ax);
            let z1 = sy * Math.sin(ax) + sz * Math.cos(ax);
            let x2 = sx * Math.cos(ay) + z1 * Math.sin(ay);
            let z2 = -sx * Math.sin(ay) + z1 * Math.cos(ay);
            let x3 = x2 * Math.cos(az) - y1 * Math.sin(az);
            let y3 = x2 * Math.sin(az) + y1 * Math.cos(az);

            const k = size * 4;
            const f = k / (k + z2 + (zoom * size));
            return { x: centerX + x3 * f, y: centerY - y3 * f, z: z2 };
        };

        const drawLine = (p1, p2, isHidden = false) => {
            if (isHidden && !this.state.isXray) return;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            if (isHidden) {
                ctx.setLineDash([2, 5]);
                ctx.strokeStyle = '#94a3b8';
            } else {
                ctx.setLineDash([], 0);
                ctx.strokeStyle = this.state.strokeColor;
            }
            ctx.stroke();
            ctx.setLineDash([], 0);
        };

        const drawCircle = (ry, r, isHidden = false) => {
            if (isHidden && !this.state.isXray) return;
            ctx.beginPath();
            if (isHidden) ctx.setLineDash([2, 5]); else ctx.setLineDash([]);
            for (let i = 0; i <= 360; i += 15) {
                const a = (i * Math.PI) / 180;
                const p = project(Math.cos(a) * r, ry, Math.sin(a) * r);
                if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        };

        const s = size / 2;
        const density = this.state.inlineDensity;

        switch (this.state.shapeType) {
            case 'cube':
                const v = [{ x: -s, y: s, z: -s }, { x: s, y: s, z: -s }, { x: s, y: -s, z: -s }, { x: -s, y: -s, z: -s }, { x: -s, y: s, z: s }, { x: s, y: s, z: s }, { x: s, y: -s, z: s }, { x: -s, y: -s, z: s }];
                const pts = v.map(p => project(p.x, p.y, p.z));
                const faces = [{ idx: [0, 1, 2, 3], normal: { x: 0, y: 0, z: -1 } }, { idx: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 } }, { idx: [0, 4, 7, 3], normal: { x: -1, y: 0, z: 0 } }, { idx: [1, 5, 6, 2], normal: { x: 1, y: 0, z: 0 } }, { idx: [0, 1, 5, 4], normal: { x: 0, y: 1, z: 0 } }, { idx: [3, 2, 6, 7], normal: { x: 0, y: -1, z: 0 } }];
                const isFaceVisible = (face) => {
                    let n = face.normal;
                    let y1 = n.y * Math.cos(ax) - n.z * Math.sin(ax);
                    let z1 = n.y * Math.sin(ax) + n.z * Math.cos(ax);
                    let x2 = n.x * Math.cos(ay) + z1 * Math.sin(ay);
                    let z2 = -n.x * Math.sin(ay) + z1 * Math.cos(ay);
                    return z2 < 0;
                };
                const visibleEdges = new Set();
                const allEdges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
                faces.forEach(face => { if (isFaceVisible(face)) face.idx.forEach((vIdx, i) => visibleEdges.add([vIdx, face.idx[(i + 1) % 4]].sort().join('-'))); });
                allEdges.forEach(e => drawLine(pts[e[0]], pts[e[1]], !visibleEdges.has(e.sort().join('-'))));
                if (this.state.showInlineGrid && density > 0) {
                    for (let i = 1; i < density; i++) {
                        const offset = -s + (size / density) * i;
                        drawLine(project(-s, offset, -s), project(s, offset, -s), true);
                        drawLine(project(s, offset, -s), project(s, offset, s), true);
                    }
                }
                break;

            case 'cylinder':
                drawCircle(s, s); drawCircle(-s, s, true);
                const sideA = ay;
                drawLine(project(Math.cos(sideA + Math.PI / 2) * s, s, Math.sin(sideA + Math.PI / 2) * s), project(Math.cos(sideA + Math.PI / 2) * s, -s, Math.sin(sideA + Math.PI / 2) * s));
                drawLine(project(Math.cos(sideA - Math.PI / 2) * s, s, Math.sin(sideA - Math.PI / 2) * s), project(Math.cos(sideA - Math.PI / 2) * s, -s, Math.sin(sideA - Math.PI / 2) * s));
                if (this.state.showInlineGrid && density > 0) {
                    for (let i = 1; i < density; i++) {
                        const h = -s + (size / density) * i;
                        drawCircle(h, s, true);
                    }
                }
                break;

            case 'sphere':
                ctx.beginPath(); ctx.arc(centerX, centerY, s * this.state.dimRX * zoom, 0, Math.PI * 2); ctx.stroke();
                if (this.state.showInlineGrid && density > 0) {
                    for (let n = 1; n < density; n++) {
                        const rZ = rad(180 / density * n);
                        ctx.beginPath(); if (ctx.setLineDash) ctx.setLineDash([2, 5]);
                        for (let i = 0; i <= 360; i += 15) {
                            const a = (i * Math.PI) / 180;
                            const p = project(Math.cos(a) * s * Math.cos(rZ), Math.sin(a) * s, Math.cos(a) * s * Math.sin(rZ));
                            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
                        }
                        ctx.stroke();
                    }
                }
                break;
        }
    }

    drawBars(ctx, L) {
        ctx.globalAlpha = 1;
        ctx.strokeStyle = this.state.strokeColor;
        ctx.fillStyle = this.state.strokeColor;

        // Header
        const hasHeader = this.state.reserveHeader || this.state.title || this.state.author;
        if (hasHeader) {
            const h = this.state.headerHeight;
            if (this.state.showMetaBorder) ctx.strokeRect(L.margin, L.margin, L.canvasW - L.margin * 2, h);
            
            ctx.textAlign = "left";
            ctx.font = "bold 3px Outfit";
            let t = this.state.title || "SKETCHGRID"; 
            if (this.state.showLabels) t = `TITLE: ${t}`;
            ctx.fillText(t.toUpperCase(), L.margin + 2, L.margin + h / 2 + 1);
            
            ctx.font = "1.5px Inter";
            let sub = this.state.subtitle || ""; 
            if (sub) ctx.fillText(sub.toUpperCase(), L.margin + 2, L.margin + h / 2 + 3.5);

            ctx.textAlign = "right";
            ctx.font = "2px Inter";
            let a = this.state.author || "ANONYMOUS"; 
            if (this.state.showLabels) a = `AUTHOR: ${a}`;
            ctx.fillText(a.toUpperCase(), L.canvasW - L.margin - 2, L.margin + h / 2 + 1);
        }

        // Footer
        const hasFooter = this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers;
        if (hasFooter) {
            const h = this.state.footerHeight;
            const fy = L.canvasH - L.margin - h;
            if (this.state.showMetaBorder) ctx.strokeRect(L.margin, fy, L.canvasW - L.margin * 2, h);
            
            ctx.font = "2px Inter";
            
            if (this.state.showDate) {
                ctx.textAlign = "left";
                let d = this.getFormattedDate();
                if (this.state.showLabels) d = `DATE: ${d}`;
                ctx.fillText(d.toUpperCase(), L.margin + 2, fy + h / 2 + 0.5);
            }
            
            if (this.state.showPageNumbers) {
                ctx.textAlign = "right";
                let p = L.pageNum ? `PAGE ${L.pageNum}` : `PAGE 1 OF ${this.state.pageCount}`; 
                ctx.fillText(p, L.canvasW - L.margin - 2, fy + h / 2 + 0.5);
            }
        }

        // Watermark
        if (this.state.showWatermark) {
            ctx.save();
            ctx.globalAlpha = 0.05;
            ctx.translate(L.canvasW / 2, L.canvasH / 2);
            ctx.rotate(-Math.PI / 4);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "bold 24px Outfit";
            ctx.fillText("SKETCHGRID", 0, 0);
            ctx.restore();
        }
    }

    getFormattedDate() {
        if (this.state.dateMode === 'custom') return this.state.customDate;
        const d = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        const day = pad(d.getDate()), month = pad(d.getMonth() + 1), year = d.getFullYear();
        if (this.state.dateFormat === 'MM-DD-YYYY') return `${month}-${day}-${year}`;
        if (this.state.dateFormat === 'YYYY-MM-DD') return `${year}-${month}-${day}`;
        return `${day}-${month}-${year}`;
    }

    handleDownload() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(this.state.orientation, 'mm', 'a4');
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        for (let p = 0; p < this.state.pageCount; p++) {
            if (p > 0) doc.addPage();
            const layout = this.calculateLayout();
            const wrapper = {
                strokeStyle: '#000', lineWidth: 0.1, globalAlpha: 1,
                beginPath: () => doc.setDrawColor(0),
                moveTo: (x, y) => { },
                lineTo: (x, y) => doc.line(px_x, px_y, x, y), // Simple proxy logic
                stroke: () => { },
                strokeRect: (x, y, w, h) => doc.rect(x, y, w, h),
                arc: (x, y, r, sa, ea) => doc.ellipse(x, y, r, r),
                setLineDash: (arr) => doc.setLineDash(arr, 0)
            };
            // For production, we'd use a real bridge, but for MVP we use canvas capture:
            const dataUrl = this.els.canvas.toDataURL('image/png');
            doc.addImage(dataUrl, 'PNG', 0, 0, pageW, pageH);
        }
        doc.save(`SketchGrid_${this.state.title || 'Export'}.pdf`);
    }
}

window.addEventListener('DOMContentLoaded', () => { window.app = new SketchGrid(); });
