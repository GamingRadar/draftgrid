const SITE_URL = "https://gamingradar.github.io/draftgrid/"; // Swappable branding link

class DraftGrid {
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
            includeQRCode: true,
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
            scale2D: 80,
            dim2DA: 40, dim2DB: 40, dim2DC: 40,
            // UI
            rightSidebarOpen: true,
            leftSidebarOpen: true,
            preserveCase: false,
            customSpacing: 5,
            zoomLevel: 0.6, // Increased default preview size
            isTemplateLocked: false,
            templateMode: 'full' // 'full', 'partial', 'strict'
        };

        this.TEMPLATE_KEYS = [
            'orientation', 'dimension', 'boxCount', 'ratio', 'customRatio',
            'spacing', 'customSpacing', 'marginPreset', 'customMargin',
            'strokeColor', 'strokeOpacity', 'reserveHeader', 'reserveFooter',
            'headerHeight', 'footerHeight', 'showLabels', 'showMetaBorder',
            'showWatermark', 'includeQRCode', 'prime2D', 'scale2D', 'shapeType',
            'projectionMode', 'isXray', 'showInlineGrid', 'shapeDepth',
            'inlineDensity', 'rotX', 'rotY', 'rotZ', 'dimL', 'dimB', 'dimH',
            'dimRX', 'dimRY', 'dimRZ', 'dimRT', 'dimRBot', 'dimCH',
            'title', 'author', 'subtitle'
        ];

        this.PRESETS_2D = {
            'ideation': {
                orientation: 'landscape', boxCount: 6, ratio: '3:4',
                customRatio: { w: 1.85, h: 1 }, spacing: 'medium',
                marginPreset: 'none', customMargin: 10, strokeColor: '#101f37',
                showLabels: false, showMetaBorder: false, showWatermark: true,
                includeQRCode: false, prime2D: 'rect', scale2D: 90
            },
            'storyboard': {
                orientation: 'portrait', boxCount: 8, ratio: 'custom',
                customRatio: { w: 1.85, h: 1 }, spacing: 'medium',
                marginPreset: 'none', customMargin: 10, strokeColor: '#101f37',
                reserveHeader: true, headerHeight: 17, showLabels: true,
                showMetaBorder: true, subtitle: 'Scene '
            },
            'ui-ux': {
                orientation: 'landscape', boxCount: 3, ratio: 'custom',
                customRatio: { w: 375, h: 812 }, spacing: 'large',
                marginPreset: 'narrow', strokeColor: '#101f37',
                reserveHeader: true, headerHeight: 17, showLabels: true,
                showMetaBorder: true
            }
        };

        this.PRESETS_3D = {
            'hero-3d': {
                orientation: 'landscape', dimension: '3d', boxCount: 1,
                ratio: '3:4', spacing: 'small', marginPreset: 'narrow',
                reserveHeader: true, showLabels: true, showMetaBorder: true,
                shapeType: 'cube', projectionMode: 'persp', isXray: true,
                showInlineGrid: true, shapeDepth: 273, inlineDensity: 4,
                rotX: 0, rotY: 47, rotZ: 0, dimL: 0.5, dimB: 1, dimH: 1.5
            },
            'sphere': {
                orientation: 'landscape', dimension: '3d', boxCount: 3,
                shapeType: 'sphere', rotX: 9, rotY: 0, showInlineGrid: true,
                shapeDepth: 273
            },
            'cylinder': {
                orientation: 'landscape', dimension: '3d', boxCount: 3,
                shapeType: 'cylinder', isXray: true, showInlineGrid: true,
                shapeDepth: 287, dimRT: 0.8, dimRBot: 1.2, dimCH: 2.5
            }
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
            btnMakeCone: document.getElementById('btn-make-cone'),
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
            includeQRCode: document.getElementById('include-qr'),
            pageCount: document.getElementById('page-count'),
            downloadBtn: document.getElementById('download-pdf'),
            strokeColor: document.getElementById('stroke-color'),
            strokeColorHex: document.getElementById('stroke-color-hex'),
            strokeOpacity: document.getElementById('stroke-opacity'),
            reserveHeader: document.getElementById('reserve-header'),
            reserveFooter: document.getElementById('reserve-footer'),
            headerHeightInput: document.getElementById('header-height'),
            headerHeightDisplay: document.getElementById('header-height-display'),
            footerHeightInput: document.getElementById('footer-height'),
            footerHeightDisplay: document.getElementById('footer-height-display'),
            pOrientation: document.getElementById('p-orientation'),
            pRatio: document.getElementById('p-ratio'),
            pCount: document.getElementById('p-count'),

            scale2D: document.getElementById('scale-2d'),
            scale2DVal: document.getElementById('scale-2d-val'),
            customSpacingInputs: document.getElementById('custom-spacing-inputs'),
            customSpacingVal: document.getElementById('custom-spacing-val'),
            preserveCase: document.getElementById('preserve-case'),

            // Template System
            btnImportTemplate: document.getElementById('btn-import-template'),
            btnImportTemplate3D: document.getElementById('btn-import-template-3d'),
            templateFileInput: document.getElementById('template-file-input'),
            btnExportTemplate: document.getElementById('btn-export-template'),
            btnEditTemplateLeft: document.getElementById('btn-edit-template-left'),
            btnEditTemplateRight: document.getElementById('btn-edit-template-right'),
            leftLockOverlay: document.getElementById('left-lock-overlay'),
            rightLockOverlay: document.getElementById('right-lock-overlay'),
            headerLockOverlay: document.getElementById('header-lock-overlay'),

            // Export Modal
            exportModal: document.getElementById('export-modal'),
            btnCloseExportModal: document.getElementById('btn-close-export-modal'),
            exportOptions: document.querySelectorAll('.export-option-btn')
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

        safeBind(this.els.scale2D, 'oninput', (e) => this.updateState({ scale2D: parseInt(e.target.value) }));

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

        const bindMeas = (el, key) => { safeBind(el, 'oninput', (e) => this.updateState({ [key]: parseFloat(e.target.value) !== undefined ? parseFloat(e.target.value) : 1.0 })); };
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
        safeBind(this.els.includeQRCode, 'onchange', (e) => this.updateState({ includeQRCode: e.target.checked }));
        safeBind(this.els.pageCount, 'oninput', (e) => this.updateState({ pageCount: parseInt(e.target.value) || 1 }));
        safeBind(this.els.strokeColor, 'oninput', (e) => {
            const color = e.target.value;
            if (this.els.strokeColorHex) this.els.strokeColorHex.value = color.toUpperCase();
            this.updateState({ strokeColor: color });
        });
        safeBind(this.els.strokeColorHex, 'oninput', (e) => {
            let color = e.target.value;
            if (color.length > 0 && !color.startsWith('#')) color = '#' + color;
            if (/^#[0-9A-F]{6}$/i.test(color)) {
                if (this.els.strokeColor) this.els.strokeColor.value = color;
                this.updateState({ strokeColor: color });
            }
        });
        safeBind(this.els.strokeOpacity, 'oninput', (e) => this.updateState({ strokeOpacity: parseFloat(e.target.value) }));
        safeBind(this.els.reserveHeader, 'onchange', (e) => this.updateState({ reserveHeader: e.target.checked }));
        safeBind(this.els.reserveFooter, 'onchange', (e) => this.updateState({ reserveFooter: e.target.checked }));
        safeBind(this.els.headerHeightInput, 'oninput', (e) => this.updateState({ headerHeight: parseInt(e.target.value) }));
        safeBind(this.els.footerHeightInput, 'oninput', (e) => this.updateState({ footerHeight: parseInt(e.target.value) }));
        safeBind(this.els.customSpacingVal, 'oninput', (e) => this.updateState({ customSpacing: parseFloat(e.target.value) || 0 }));
        safeBind(this.els.preserveCase, 'onchange', (e) => this.updateState({ preserveCase: e.target.checked }));
        safeBind(this.els.downloadBtn, 'onclick', () => this.handleDownload());

        // Template System Bindings
        safeBind(this.els.btnExportTemplate, 'onclick', () => this.handleExportTemplate());
        [this.els.btnImportTemplate, this.els.btnImportTemplate3D].forEach(btn => {
            safeBind(btn, 'onclick', () => this.els.templateFileInput.click());
        });
        safeBind(this.els.templateFileInput, 'onchange', (e) => this.handleImportTemplate(e));
        [this.els.btnEditTemplateLeft, this.els.btnEditTemplateRight].forEach(btn => {
            safeBind(btn, 'onclick', () => this.updateState({ isTemplateLocked: false }));
        });

        // Export Modal Bindings
        safeBind(this.els.btnCloseExportModal, 'onclick', () => this.setModalVisible(false));
        this.els.exportOptions.forEach(btn => {
            btn.onclick = () => {
                const mode = btn.getAttribute('data-mode');
                this.submitExport(mode);
                this.setModalVisible(false);
            };
        });

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
            this.els.rotX.value = this.state.rotX;
            this.els.rotY.value = this.state.rotY;
            this.els.rotZ.value = this.state.rotZ;
        } else {
            this.els.boxCount2D.value = this.state.boxCount;
            this.els.boxCountDisplay2D.textContent = this.state.boxCount;
        }

        if (this.els.strokeColor) {
            this.els.strokeColor.value = this.state.strokeColor;
            if (this.els.strokeColorHex) this.els.strokeColorHex.value = this.state.strokeColor.toUpperCase();
        }
        if (this.els.scale2D) this.els.scale2D.value = this.state.scale2D;
        if (this.els.scale2DVal) this.els.scale2DVal.textContent = `${this.state.scale2D}%`;

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
        if (this.els.customSpacingInputs) this.els.customSpacingInputs.classList.toggle('hidden', this.state.spacing !== 'custom');
        if (this.els.customSpacingVal) this.els.customSpacingVal.value = this.state.customSpacing;
        if (this.els.preserveCase) this.els.preserveCase.checked = this.state.preserveCase;

        if (this.els.dateDetails) { this.els.dateDetails.classList.toggle('hidden', !this.state.showDate); }
        if (this.els.dateModeInputs) { this.els.dateModeInputs.forEach(i => i.checked = i.value === this.state.dateMode); }
        if (this.els.customDateVal) { this.els.customDateVal.classList.toggle('hidden', this.state.dateMode !== 'custom'); }
        if (this.els.headerHeightDisplay) { this.els.headerHeightDisplay.textContent = `${this.state.headerHeight}mm`; }
        if (this.els.footerHeightDisplay) { this.els.footerHeightDisplay.textContent = `${this.state.footerHeight}mm`; }
        if (this.els.showWatermark) { this.els.showWatermark.checked = this.state.showWatermark; }
        if (this.els.includeQRCode) { this.els.includeQRCode.checked = this.state.includeQRCode; }

        // Template Lock Overlays
        const isLocked = this.state.isTemplateLocked;
        const isStrict = this.state.templateMode === 'strict';

        this.els.leftLockOverlay.classList.toggle('visible', isLocked);
        this.els.rightLockOverlay.classList.toggle('visible', isLocked);
        this.els.headerLockOverlay.classList.toggle('visible', isLocked);

        // Manage Unlock Buttons
        [this.els.btnEditTemplateLeft, this.els.btnEditTemplateRight].forEach(btn => {
            if (btn) btn.style.display = isStrict ? 'none' : 'flex';
        });

        // Hide Export button if locked (prevention)
        if (this.els.btnExportTemplate) {
            this.els.btnExportTemplate.style.display = isLocked ? 'none' : 'flex';
        }
    }

    setModalVisible(visible) {
        if (this.els.exportModal) {
            this.els.exportModal.classList.toggle('visible', visible);
        }
    }

    handleExportTemplate() {
        this.setModalVisible(true);
    }

    submitExport(mode) {
        const templateData = {
            dgSignature: "DG-SECURED-V1",
            exportTimestamp: new Date().toISOString(),
            lockMode: mode
        };

        this.TEMPLATE_KEYS.forEach(key => {
            if (this.state[key] !== undefined) {
                templateData[key] = this.state[key];
            }
        });

        // Secure slightly via Base64 obfuscation
        const jsonStr = JSON.stringify(templateData);
        const securedData = btoa(unescape(encodeURIComponent(jsonStr)));

        const blob = new Blob([securedData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = new Date().toISOString().slice(0, 10);
        a.download = `DraftGrid-${mode}-${this.state.title || 'Template'}-${timestamp}.dg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    handleImportTemplate(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let rawContent = e.target.result;
                let data;

                // Detect if it's our secured format or legacy JSON
                if (rawContent.trim().startsWith('{')) {
                    data = JSON.parse(rawContent);
                } else {
                    // Try decoding secured format
                    const decoded = decodeURIComponent(escape(atob(rawContent)));
                    data = JSON.parse(decoded);
                }

                const mode = data.lockMode || 'full';
                const isLocked = (mode !== 'full');

                // Merge imported data into state
                this.updateState({
                    ...data,
                    templateMode: mode,
                    isTemplateLocked: isLocked,
                    activePreset: null
                });
            } catch (err) {
                console.error("Failed to parse template:", err);
                alert("Invalid or corrupted template file.");
            }
        };
        reader.readAsText(file);
        event.target.value = '';
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
        const pagePadding = 5; // Fixed padding for structural elements independent of grid margin
        const headerH = (this.state.reserveHeader || this.state.title || this.state.author) ? this.state.headerHeight : 0;
        const footerH = (this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers) ? this.state.footerHeight : 0;

        const usableW = canvasW - (margin * 2) - (pagePadding * 2);
        const usableH = canvasH - (margin * 2) - (pagePadding * 2) - headerH - footerH;

        let ratio = 1;
        if (this.state.dimension === '2d') {
            if (this.state.ratio === '1:1') ratio = 1;
            else if (this.state.ratio === '2:3') ratio = 2 / 3;
            else if (this.state.ratio === '3:4') ratio = 3 / 4;
            else if (this.state.ratio === 'custom') ratio = this.state.customRatio.w / this.state.customRatio.h;
        }

        const count = this.state.boxCount;
        let cols = 1, rows = 1;

        if (count <= 1) { cols = 1; rows = 1; }
        else if (count === 2) { cols = 1; rows = 2; }
        else if (count === 3) { cols = 1; rows = 3; }
        else if (count === 4) { cols = 2; rows = 2; }
        else if (count <= 6) { cols = 2; rows = 3; }
        else if (count <= 8) { cols = 2; rows = 4; }
        else if (count <= 9) { cols = 3; rows = 3; }
        else { cols = 3; rows = 4; }

        if (orientation === 'landscape' && count > 2) [cols, rows] = [rows, cols];

        let spacingPx = 5;
        if (this.state.spacing === 'small') spacingPx = 2;
        else if (this.state.spacing === 'medium') spacingPx = 5;
        else if (this.state.spacing === 'large') spacingPx = 10;
        else if (this.state.spacing === 'custom') spacingPx = this.state.customSpacing;

        let maxBoxW = (usableW - (cols - 1) * spacingPx) / cols;
        let maxBoxH = (usableH - (rows - 1) * spacingPx) / rows;

        let boxW = maxBoxW;
        let boxH = maxBoxH;
        let startX = pagePadding + margin;
        let startY = pagePadding + margin + headerH;

        if (this.state.dimension === '2d') {
            if (maxBoxW / ratio <= maxBoxH) {
                boxH = maxBoxW / ratio;
            } else {
                boxW = maxBoxH * ratio;
            }
            let actualW = boxW * cols + spacingPx * (cols - 1);
            let actualH = boxH * rows + spacingPx * (rows - 1);
            startX = pagePadding + margin + (usableW - actualW) / 2;
            startY = pagePadding + margin + headerH + (usableH - actualH) / 2;
        }

        return { canvasW, canvasH, boxW, boxH, cols, rows, margin, startX, startY, spacingPx, pagePadding, headerH, footerH };
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
        const s2D = (Number(this.state.scale2D) || 80);

        if (this.state.prime2D === 'triangle') {
            // Triangle uses immediate stroke strategy to prevent interference
            TriangleEngine.draw(ctx, x, y, w, h, this.state, s2D);
            return;
        }

        ctx.beginPath();
        const cx = x + w / 2, cy = y + h / 2;
        const sF = s2D / 100;

        switch (this.state.prime2D) {
            case 'rect':
                const rw = w * sF, rh = h * sF;
                ctx.strokeRect(cx - rw / 2, cy - rh / 2, rw, rh);
                break;
            case 'circle':
                ctx.arc(cx, cy, (Math.min(w, h) / 2) * sF, 0, Math.PI * 2);
                break;
        }
        ctx.stroke();
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
            if (isHidden) {
                ctx.setLineDash([2, 5]);
                ctx.strokeStyle = '#94a3b8';
            } else {
                ctx.setLineDash([]);
                ctx.strokeStyle = this.state.strokeColor;
            }
            for (let i = 0; i <= 360; i += 15) {
                const a = (i * Math.PI) / 180;
                const p = project(Math.cos(a) * r, ry, Math.sin(a) * r);
                if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            }
            if (isHidden) ctx.stroke(); else { ctx.closePath(); ctx.stroke(); }
            ctx.setLineDash([]); // Reset dash for next call
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
                // Draw top and bottom circles
                drawCircle(s, s);
                drawCircle(-s, s);

                // Vertical silhouette lines
                // We find the 'widest' points in projection space
                const getExtremes = (ry) => {
                    let bestX1 = -Infinity, bestX2 = Infinity;
                    let p1, p2;
                    for (let a = 0; a < 360; a += 10) {
                        const pt = project(Math.cos(rad(a)) * s, ry, Math.sin(rad(a)) * s);
                        if (pt.x > bestX1) { bestX1 = pt.x; p1 = pt; }
                        if (pt.x < bestX2) { bestX2 = pt.x; p2 = pt; }
                    }
                    return [p1, p2];
                };

                const [t1, t2] = getExtremes(s);
                const [b1, b2] = getExtremes(-s);
                drawLine(t1, b1);
                drawLine(t2, b2);

                if (this.state.showInlineGrid && density > 0) {
                    for (let i = 1; i <= density; i++) {
                        const h = -s + (size / (density + 1)) * i;
                        drawCircle(h, s, true);
                    }
                }
                break;

            case 'sphere':
                // Unified scaling: all rings and silhouette use the same radius logic
                const drawSphereRing = (type, isHidden = false) => {
                    ctx.beginPath();
                    if (isHidden) { ctx.setLineDash([2, 5]); ctx.strokeStyle = '#94a3b8'; }
                    else { ctx.setLineDash([]); ctx.strokeStyle = this.state.strokeColor; }

                    for (let i = 0; i <= 360; i += 10) {
                        const a = rad(i);
                        let p;
                        if (type === 'equator') p = project(Math.cos(a) * s, 0, Math.sin(a) * s);
                        else if (type === 'meridian1') p = project(0, Math.cos(a) * s, Math.sin(a) * s);
                        else if (type === 'meridian2') p = project(Math.cos(a) * s, Math.sin(a) * s, 0);
                        else if (type === 'silhouette') {
                            // Pseudo-silhouette: a circle that scales with the max projected dimension
                            const maxScale = Math.max(this.state.dimRX, this.state.dimRY, this.state.dimRZ);
                            // We use a simple 2D arc for the silhouette but scaled correctly
                            ctx.arc(centerX, centerY, s * maxScale * 0.72, 0, Math.PI * 2);
                            ctx.stroke(); return;
                        }

                        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
                    }
                    ctx.stroke();
                };

                // 1. Perimeter / Outline (Always visible, solid)
                drawSphereRing('silhouette');

                // 2. X-Ray Features: Equator & Meridian (Solid color when X-Ray is on)
                if (this.state.isXray) {
                    drawSphereRing('equator');
                    drawSphereRing('meridian1');
                }

                // 3. Inline Grid: High density mesh (Dotted)
                if (this.state.showInlineGrid && density > 0) {
                    for (let n = 1; n <= density; n++) {
                        const offset = (n / (density + 1)) * 180;
                        const rLat = rad(offset - 90);
                        const radiusAtLat = s * Math.cos(rLat);
                        const yAtLat = s * Math.sin(rLat);
                        ctx.beginPath(); ctx.setLineDash([2, 5]); ctx.strokeStyle = '#94a3b8';
                        for (let i = 0; i <= 360; i += 15) {
                            const a = rad(i);
                            const p = project(Math.cos(a) * radiusAtLat, yAtLat, Math.sin(a) * radiusAtLat);
                            if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
                        }
                        ctx.stroke();
                    }
                }
                ctx.setLineDash([]);
                break;
        }
    }

    drawBars(ctx, L) {
        ctx.globalAlpha = 1;
        ctx.setLineDash([]); // Ensure solid borders
        ctx.strokeStyle = this.state.strokeColor;
        ctx.fillStyle = this.state.strokeColor;

        const pad = L.pagePadding;
        const width = L.canvasW - pad * 2;

        // Header
        const hasHeader = this.state.reserveHeader || this.state.title || this.state.author;
        if (hasHeader) {
            const h = L.headerH || this.state.headerHeight;
            if (this.state.showMetaBorder) ctx.strokeRect(pad, pad, width, h);

            ctx.textAlign = "left";
            const titleSize = Math.max(2, h * 0.25);
            ctx.font = `bold ${titleSize}px Outfit`;
            let t = this.state.title || " ";
            if (this.state.showLabels) t = `TITLE: ${t}`;
            t = this.state.preserveCase ? t : t.toUpperCase();
            ctx.fillText(t, pad + 2, pad + h / 2 + (titleSize / 3));

            const subSize = Math.max(1.5, h * 0.15);
            ctx.font = `${subSize}px Inter`;
            let sub = this.state.subtitle || "";
            if (sub) {
                sub = this.state.preserveCase ? sub : sub.toUpperCase();
                ctx.fillText(sub, pad + 2, pad + h - (subSize / 2));
            }

            ctx.textAlign = "right";
            const authSize = Math.max(1.5, h * 0.15);
            ctx.font = `${authSize}px Inter`;
            let a = this.state.author || "";
            if (this.state.showLabels && a) a = `AUTHOR: ${a}`;
            if (a) {
                a = this.state.preserveCase ? a : a.toUpperCase();
                ctx.fillText(a, L.canvasW - pad - 2, pad + h / 2 + (authSize / 3));
            }
        }

        // Footer
        const hasFooter = this.state.reserveFooter || this.state.showDate || this.state.showPageNumbers;
        if (hasFooter) {
            const h = L.footerH || this.state.footerHeight;
            const fy = L.canvasH - pad - h;
            if (this.state.showMetaBorder) ctx.strokeRect(pad, fy, width, h);

            const footSize = Math.max(1.5, h * 0.2);
            ctx.font = `${footSize}px Inter`;

            if (this.state.showDate) {
                ctx.textAlign = "left";
                let d = this.getFormattedDate();
                if (this.state.showLabels) d = `DATE: ${d}`;
                d = this.state.preserveCase ? d : d.toUpperCase();
                ctx.fillText(d, pad + 2, fy + h / 2 + (footSize / 3));
            }

            if (this.state.showPageNumbers) {
                ctx.textAlign = "right";
                let p = L.pageNum ? `PAGE ${L.pageNum}` : `PAGE 1 OF ${this.state.pageCount}`;
                ctx.fillText(p, L.canvasW - pad - 2, fy + h / 2 + (footSize / 3));
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
            ctx.fillText("Made with DraftGrid", 0, 0);
            ctx.restore();
        }

        // Dynamic QR Code Rendering (Centered)
        if (this.state.includeQRCode && typeof qrcode !== 'undefined') {
            const qrSize = Math.max(10, L.footerH * 0.7); // Dynamically sized with footer
            const qrx = (L.canvasW / 2) - (qrSize / 2); // Perfectly centered
            const qry = L.canvasH - L.pagePadding - L.footerH + (L.footerH - qrSize) / 2;

            this.renderQRCode(ctx, qrx, qry, qrSize, SITE_URL);
        }
    }

    renderQRCode(ctx, x, y, size, data) {
        try {
            const qr = qrcode(0, 'M');
            qr.addData(data);
            qr.make();

            const moduleCount = qr.getModuleCount();
            const cellSize = size / moduleCount;

            ctx.save();
            ctx.fillStyle = this.state.strokeColor;
            ctx.globalAlpha = 1.0; // Keep QR code fully opaque, ignoring stroke opacity

            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        // Use a tiny bit of overlap to avoid seams
                        ctx.fillRect(x + col * cellSize, y + row * cellSize, cellSize + 0.02, cellSize + 0.02);
                    }
                }
            }
            ctx.restore();
        } catch (e) {
            console.error("QR Generation failed:", e);
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

    async handleDownload() {
        // Track Events
        if (typeof gtag === 'function') {
            gtag('event', 'download_pdf', {
                event_category: 'usage',
                event_label: this.state.title || 'DraftGrid Export'
            });

            gtag('event', this.state.showWatermark ? 'watermark_enabled' : 'watermark_disabled', {
                event_category: 'usage'
            });

            gtag('event', this.state.includeQRCode ? 'qr_enabled' : 'qr_disabled', {
                event_category: 'usage'
            });
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF(this.state.orientation, 'mm', 'a4');
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();

        const oldActive = this.state.activePreset;
        this.updateState({ activePreset: null });

        let pagesCount = this.state.pageCount;
        if (this.state.dimension === '2d' &&
            ['thumb-grid', 'storyboard'].includes(this.state.activePreset)) {
            pagesCount = 1;
        }

        // Generate a 4x High-Resolution Canvas for exactly-crisp scaled PDFs
        const exportScale = 4;
        const layout = this.calculateLayout();
        const mmToPx = 3.7795275591 * exportScale;

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = layout.canvasW * mmToPx;
        exportCanvas.height = layout.canvasH * mmToPx;
        const ctx = exportCanvas.getContext('2d');

        for (let i = 1; i <= pagesCount; i++) {
            if (i > 1) doc.addPage();

            ctx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

            ctx.save();
            ctx.scale(mmToPx, mmToPx);

            layout.pageNum = i;
            this.drawGrid(ctx, layout, mmToPx);
            this.drawBars(ctx, layout);

            ctx.restore();

            const dataUrl = exportCanvas.toDataURL('image/png', 1.0);
            const imgW = layout.canvasW === 210 ? 210 : 297;
            const imgH = layout.canvasH === 297 ? 297 : 210;
            doc.addImage(dataUrl, 'PNG', 0, 0, imgW, imgH, undefined, 'FAST');
        }
        doc.save(`DraftGrid_${this.state.title || 'Export'}.pdf`);
    }
}

window.addEventListener('DOMContentLoaded', () => { window.app = new DraftGrid(); });
