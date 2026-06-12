// Text to QR App Logic

// Variables de estado
let texts = [];
let pageFormat = 'a4';
let customWidth = 200;
let customHeight = 200;
let orientation = 'portrait';
let pageMargin = 15;
let gridCols = 3;
let gridRows = 4;
let qrSize = 40;
let gridGap = 10;
let cardPadding = 4;
let centerGrid = true;
let showLabel = true;
let labelPattern = 'Código #{N}';
let labelPosition = 'bottom';
let labelFontSize = 10;
let showBorders = true;
let qrColorDark = '#000000';
let qrColorLight = '#ffffff';
let includeLegend = true;
let zoom = 0.5;

// Dimensiones de hoja en mm según preset
const PAGE_PRESETS = {
    a4: { width: 210, height: 297 },
    letter: { width: 215.9, height: 279.4 },
    legal: { width: 215.9, height: 355.6 }
};

// Textos de Demostración (Pasajes de la Biblia como enlaces de búsqueda)
const DEMO_TEXTS = [
    'https://www.google.com/search?q=Juan+3:16',
    'https://www.google.com/search?q=Salmo+23',
    'https://www.google.com/search?q=Romanos+8:28',
    'https://www.google.com/search?q=Filipenses+4:13',
    'https://www.google.com/search?q=Mateo+6:33',
    'https://www.google.com/search?q=Isaias+40:31',
    'https://www.google.com/search?q=Proverbios+3:5-6',
    'https://www.google.com/search?q=1+Corintios+13:4-7',
    'https://www.google.com/search?q=Josue+1:9',
    'https://www.google.com/search?q=Salmo+91',
    'https://www.google.com/search?q=Mateo+28:19',
    'https://www.google.com/search?q=Galatas+5:22-23'
];

// Esperar a que el DOM cargue
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    bindEvents();
    loadTextsFromInput();
    renderPreview();
});

// Inicializar elementos de UI
function initElements() {
    // Sincronizar selectores
    document.getElementById('page-format').value = pageFormat;
    document.getElementById('page-width').value = customWidth;
    document.getElementById('page-height').value = customHeight;
    document.getElementById('orient-portrait').checked = orientation === 'portrait';
    document.getElementById('orient-landscape').checked = orientation === 'landscape';
    document.getElementById('page-margin').value = pageMargin;
    document.getElementById('grid-cols').value = gridCols;
    document.getElementById('grid-rows').value = gridRows;
    document.getElementById('qr-size').value = qrSize;
    document.getElementById('grid-gap').value = gridGap;
    document.getElementById('card-padding').value = cardPadding;
    document.getElementById('center-grid').checked = centerGrid;
    document.getElementById('show-label').checked = showLabel;
    document.getElementById('label-pattern').value = labelPattern;
    document.getElementById('label-position').value = labelPosition;
    document.getElementById('label-font-size').value = labelFontSize;
    document.getElementById('show-borders').checked = showBorders;
    document.getElementById('qr-color-dark').value = qrColorDark;
    document.getElementById('qr-color-light').value = qrColorLight;
    document.getElementById('include-legend').checked = includeLegend;
    
    updateSliderLabels();
}

// Vincular Eventos
function bindEvents() {
    // Input de textos
    const textsInput = document.getElementById('texts-input');
    textsInput.addEventListener('input', () => {
        loadTextsFromInput();
        renderPreview();
    });

    document.getElementById('btn-shuffle').addEventListener('click', () => {
        if (texts.length === 0) return;
        shuffleTexts();
        textsInput.value = texts.join('\n');
        renderPreview();
    });

    document.getElementById('btn-load-demo').addEventListener('click', () => {
        textsInput.value = DEMO_TEXTS.join('\n');
        loadTextsFromInput();
        renderPreview();
    });

    // Formato de página
    const pageFormatSelect = document.getElementById('page-format');
    pageFormatSelect.addEventListener('change', (e) => {
        pageFormat = e.target.value;
        const customFields = document.getElementById('custom-size-fields');
        if (pageFormat === 'custom') {
            customFields.classList.remove('hidden');
        } else {
            customFields.classList.add('hidden');
        }
        renderPreview();
    });

    document.getElementById('page-width').addEventListener('input', (e) => {
        customWidth = parseFloat(e.target.value) || 200;
        renderPreview();
    });

    document.getElementById('page-height').addEventListener('input', (e) => {
        customHeight = parseFloat(e.target.value) || 200;
        renderPreview();
    });

    // Orientación
    document.getElementById('orient-portrait').addEventListener('change', () => {
        orientation = 'portrait';
        renderPreview();
    });
    document.getElementById('orient-landscape').addEventListener('change', () => {
        orientation = 'landscape';
        renderPreview();
    });

    // Margen
    document.getElementById('page-margin').addEventListener('input', (e) => {
        pageMargin = parseInt(e.target.value);
        document.getElementById('val-page-margin').innerText = `${pageMargin} mm`;
        renderPreview();
    });

    // Columnas y Filas
    document.getElementById('grid-cols').addEventListener('input', (e) => {
        gridCols = parseInt(e.target.value) || 1;
        renderPreview();
    });
    document.getElementById('grid-rows').addEventListener('input', (e) => {
        gridRows = parseInt(e.target.value) || 1;
        renderPreview();
    });

    // Sliders de Grilla
    document.getElementById('qr-size').addEventListener('input', (e) => {
        qrSize = parseInt(e.target.value);
        document.getElementById('val-qr-size').innerText = `${qrSize} mm`;
        renderPreview();
    });

    document.getElementById('grid-gap').addEventListener('input', (e) => {
        gridGap = parseInt(e.target.value);
        document.getElementById('val-grid-gap').innerText = `${gridGap} mm`;
        renderPreview();
    });

    document.getElementById('card-padding').addEventListener('input', (e) => {
        cardPadding = parseInt(e.target.value);
        document.getElementById('val-card-padding').innerText = `${cardPadding} mm`;
        renderPreview();
    });

    document.getElementById('center-grid').addEventListener('change', (e) => {
        centerGrid = e.target.checked;
        renderPreview();
    });

    // Etiquetas y estilos
    const showLabelCheckbox = document.getElementById('show-label');
    showLabelCheckbox.addEventListener('change', (e) => {
        showLabel = e.target.checked;
        const group = document.getElementById('label-settings-group');
        if (showLabel) {
            group.classList.remove('hidden');
        } else {
            group.classList.add('hidden');
        }
        renderPreview();
    });

    document.getElementById('label-pattern').addEventListener('input', (e) => {
        labelPattern = e.target.value;
        renderPreview();
    });

    document.getElementById('label-position').addEventListener('change', (e) => {
        labelPosition = e.target.value;
        renderPreview();
    });

    document.getElementById('label-font-size').addEventListener('input', (e) => {
        labelFontSize = parseInt(e.target.value);
        document.getElementById('val-label-font-size').innerText = `${labelFontSize} pt`;
        renderPreview();
    });

    document.getElementById('show-borders').addEventListener('change', (e) => {
        showBorders = e.target.checked;
        renderPreview();
    });

    document.getElementById('qr-color-dark').addEventListener('input', (e) => {
        qrColorDark = e.target.value;
        renderPreview();
    });

    document.getElementById('qr-color-light').addEventListener('input', (e) => {
        qrColorLight = e.target.value;
        renderPreview();
    });

    // Leyenda / Referencia
    document.getElementById('include-legend').addEventListener('change', (e) => {
        includeLegend = e.target.checked;
        renderPreview();
    });

    // Zoom
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        if (zoom > 0.2) {
            zoom = Math.max(0.2, zoom - 0.1);
            updateZoom();
        }
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        if (zoom < 1.5) {
            zoom = Math.min(1.5, zoom + 0.1);
            updateZoom();
        }
    });

    // Descargar PDF
    document.getElementById('btn-generate-pdf').addEventListener('click', downloadPDF);
}

// Actualizar textos de sliders en la carga inicial
function updateSliderLabels() {
    document.getElementById('val-page-margin').innerText = `${pageMargin} mm`;
    document.getElementById('val-qr-size').innerText = `${qrSize} mm`;
    document.getElementById('val-grid-gap').innerText = `${gridGap} mm`;
    document.getElementById('val-card-padding').innerText = `${cardPadding} mm`;
    document.getElementById('val-label-font-size').innerText = `${labelFontSize} pt`;
}

// Cargar textos desde el Textarea
function loadTextsFromInput() {
    const text = document.getElementById('texts-input').value;
    texts = text.split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
    
    document.getElementById('texts-count').innerText = `${texts.length} Texto${texts.length !== 1 ? 's' : ''}`;
}

// Mezclar textos usando Fisher-Yates
function shuffleTexts() {
    for (let i = texts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [texts[i], texts[j]] = [texts[j], texts[i]];
    }
}

// Cambiar Zoom visual
function updateZoom() {
    document.getElementById('zoom-factor').innerText = `${Math.round(zoom * 100)}%`;
    document.documentElement.style.setProperty('--preview-scale', zoom);
    renderPreview();
}

// Obtener dimensiones reales de hoja en mm según configuración
function getPageDimensions() {
    let w, h;
    if (pageFormat === 'custom') {
        w = customWidth;
        h = customHeight;
    } else {
        const preset = PAGE_PRESETS[pageFormat] || PAGE_PRESETS.a4;
        w = preset.width;
        h = preset.height;
    }
    
    if (orientation === 'landscape') {
        return { width: h, height: w };
    }
    return { width: w, height: h };
}

// Renderizar Vista Previa Interactiva
function renderPreview() {
    const container = document.getElementById('pages-container');
    container.innerHTML = '';

    if (texts.length === 0) {
        // Estado vacío
        container.innerHTML = `
            <div class="empty-preview" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem; opacity: 0.5;">
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                </svg>
                <p style="font-size: 1rem; font-weight: 500;">No hay datos para mostrar</p>
                <p style="font-size: 0.8rem; margin-top: 0.25rem;">Ingresa textos o presiona "Demo" para ver una simulación.</p>
            </div>
        `;
        document.getElementById('grid-warning').classList.add('hidden');
        return;
    }

    // Obtener dimensiones físicas
    const { width: PageWidth, height: PageHeight } = getPageDimensions();
    
    // Aplicar a CSS del documento
    document.documentElement.style.setProperty('--page-width-mm', PageWidth);
    document.documentElement.style.setProperty('--page-height-mm', PageHeight);

    // Altura de etiqueta en mm: pt a mm + espaciado
    const L_height = showLabel ? ((labelFontSize * 0.352778) + 3) : 0;
    
    // Dimensiones totales de tarjeta recortable
    const Cw = qrSize + 2 * cardPadding;
    const Ch = qrSize + L_height + 2 * cardPadding;

    // Dimensiones totales de la grilla
    const GridWidth = gridCols * Cw + (gridCols - 1) * gridGap;
    const GridHeight = gridRows * Ch + (gridRows - 1) * gridGap;

    // Verificar desbordamiento
    const PrintableWidth = PageWidth - 2 * pageMargin;
    const PrintableHeight = PageHeight - 2 * pageMargin;
    const isOverflowing = GridWidth > PrintableWidth || GridHeight > PrintableHeight;

    if (isOverflowing) {
        document.getElementById('grid-warning').classList.remove('hidden');
    } else {
        document.getElementById('grid-warning').classList.add('hidden');
    }

    // Paginación de QR
    const itemsPerPage = gridCols * gridRows;
    const numPages = Math.ceil(texts.length / itemsPerPage);

    // Calcular posición de inicio (centrado o alineado a márgenes)
    let Start_X = pageMargin;
    let Start_Y = pageMargin;
    if (centerGrid && !isOverflowing) {
        Start_X = pageMargin + (PrintableWidth - GridWidth) / 2;
        Start_Y = pageMargin + (PrintableHeight - GridHeight) / 2;
    }

    // Dibujar páginas de códigos QR
    for (let p = 0; p < numPages; p++) {
        // Crear Wrapper (para reservar espacio escalado en CSS Grid)
        const wrapper = document.createElement('div');
        wrapper.className = 'page-wrapper';
        
        // Crear Hoja Física
        const sheet = document.createElement('div');
        sheet.className = 'page-sheet';
        sheet.style.setProperty('--qr-bg-color', qrColorLight);
        sheet.style.setProperty('--qr-fg-color', qrColorDark);

        // Generar QRs para esta página
        const pageStartIdx = p * itemsPerPage;
        const pageEndIdx = Math.min(pageStartIdx + itemsPerPage, texts.length);

        for (let idx = pageStartIdx; idx < pageEndIdx; idx++) {
            const idxInPage = idx - pageStartIdx;
            const col = idxInPage % gridCols;
            const row = Math.floor(idxInPage / gridCols);

            const cell_x = Start_X + col * (Cw + gridGap);
            const cell_y = Start_Y + row * (Ch + gridGap);

            // Crear Tarjeta
            const card = document.createElement('div');
            card.className = `preview-card ${showBorders ? 'with-borders' : ''}`;
            card.style.left = `${cell_x}mm`;
            card.style.top = `${cell_y}mm`;
            card.style.width = `${Cw}mm`;
            card.style.height = `${Ch}mm`;
            card.setAttribute('data-text-tooltip', texts[idx]);

            // Canvas de QR
            const qrCanvas = document.createElement('canvas');
            qrCanvas.className = 'preview-card-qr-img';
            qrCanvas.style.position = 'absolute';
            qrCanvas.style.width = `${qrSize}mm`;
            qrCanvas.style.height = `${qrSize}mm`;
            qrCanvas.style.left = `${cardPadding}mm`;
            qrCanvas.style.top = `${cardPadding + (labelPosition === 'top' ? L_height : 0)}mm`;

            // Renderizar QR en Canvas de preview
            QRCode.toCanvas(qrCanvas, texts[idx], {
                margin: 1,
                width: 150,
                color: {
                    dark: qrColorDark,
                    light: qrColorLight
                },
                errorCorrectionLevel: 'M'
            }, (error) => {
                if (error) console.error(error);
            });

            card.appendChild(qrCanvas);

            // Etiqueta
            if (showLabel) {
                const label = document.createElement('div');
                label.className = 'preview-card-label';
                label.innerText = labelPattern.replace('{N}', idx + 1);
                
                label.style.position = 'absolute';
                label.style.width = `calc(100% - ${2 * cardPadding}mm)`;
                label.style.left = `${cardPadding}mm`;
                label.style.top = `${cardPadding + (labelPosition === 'top' ? 0 : qrSize + 1)}mm`;
                label.style.height = `${L_height - 1}mm`;
                label.style.fontSize = `${labelFontSize}pt`;
                label.style.color = qrColorDark;
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.justifyContent = 'center';

                card.appendChild(label);
            }

            sheet.appendChild(card);
        }

        // Tag de número de página
        const tag = document.createElement('div');
        tag.className = 'page-number-tag';
        tag.innerText = `Hoja ${p + 1} de ${numPages}`;
        
        wrapper.appendChild(sheet);
        wrapper.appendChild(tag);
        container.appendChild(wrapper);
    }

    // Dibujar Hoja de Referencia (Leyenda) si está activa
    if (includeLegend) {
        // Alto útil de la hoja para la tabla
        const AvailableHeight = PageHeight - 2 * pageMargin - 30; // 30mm de cabecera
        const rowHeight = 10;
        const legendItemsPerPage = Math.max(5, Math.floor(AvailableHeight / rowHeight));
        const legendPages = Math.ceil(texts.length / legendItemsPerPage);

        for (let lp = 0; lp < legendPages; lp++) {
            const wrapper = document.createElement('div');
            wrapper.className = 'page-wrapper';

            const sheet = document.createElement('div');
            sheet.className = 'page-sheet';
            
            const content = document.createElement('div');
            content.className = 'legend-sheet-content';

            const title = document.createElement('h2');
            title.innerText = 'Hoja de Referencia - Text to QR';
            
            const subtitle = document.createElement('p');
            subtitle.innerText = 'Guarda esta página. Contiene la lista de contenidos de cada código QR para tu referencia.';

            const table = document.createElement('table');
            table.className = 'legend-table';

            const thead = document.createElement('thead');
            thead.innerHTML = `
                <tr>
                    <th>Etiqueta</th>
                    <th>Contenido del Código</th>
                </tr>
            `;
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            const startIdx = lp * legendItemsPerPage;
            const endIdx = Math.min(startIdx + legendItemsPerPage, texts.length);

            for (let idx = startIdx; idx < endIdx; idx++) {
                const tr = document.createElement('tr');
                const labelText = labelPattern.replace('{N}', idx + 1);
                
                tr.innerHTML = `
                    <td>${labelText}</td>
                    <td>${texts[idx]}</td>
                `;
                tbody.appendChild(tr);
            }
            table.appendChild(tbody);

            content.appendChild(title);
            content.appendChild(subtitle);
            content.appendChild(table);
            sheet.appendChild(content);

            const tag = document.createElement('div');
            tag.className = 'page-number-tag';
            tag.innerText = `Referencia / Leyenda (Pág. ${lp + 1}/${legendPages})`;

            wrapper.appendChild(sheet);
            wrapper.appendChild(tag);
            container.appendChild(wrapper);
        }
    }
}

// Convertir Hex a RGB para jsPDF
function hexToRgb(hex) {
    let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

// Generación y Descarga de PDF
async function downloadPDF() {
    if (texts.length === 0) {
        alert('Por favor, ingresa al menos un texto.');
        return;
    }

    const downloadBtn = document.getElementById('btn-generate-pdf');
    const originalContent = downloadBtn.innerHTML;
    
    // Cambiar estado a cargando
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `
        <svg class="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s linear infinite;">
            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" stroke-width="2.5"></circle>
            <path d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor"></path>
        </svg>
        Generando PDF de Alta Resolución...
    `;

    // Añadir estilo CSS de animación de spin si no existe
    if (!document.getElementById('spin-style')) {
        const style = document.createElement('style');
        style.id = 'spin-style';
        style.innerText = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    try {
        const { jsPDF } = window.jspdf;
        const { width: PageWidth, height: PageHeight } = getPageDimensions();

        // Crear instancia de jsPDF en milímetros
        const pdfFormat = pageFormat === 'custom' ? [customWidth, customHeight] : pageFormat;
        const doc = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pdfFormat
        });

        // Configurar metadatos del PDF
        doc.setProperties({
            title: 'Text to QR - Planilla de Impresión',
            subject: 'Códigos QR recortables',
            creator: 'Text to QR App',
            author: 'Text to QR'
        });

        // Cálculos de grilla
        const L_height = showLabel ? ((labelFontSize * 0.352778) + 3) : 0;
        const Cw = qrSize + 2 * cardPadding;
        const Ch = qrSize + L_height + 2 * cardPadding;

        const GridWidth = gridCols * Cw + (gridCols - 1) * gridGap;
        const GridHeight = gridRows * Ch + (gridRows - 1) * gridGap;

        const PrintableWidth = PageWidth - 2 * pageMargin;
        const PrintableHeight = PageHeight - 2 * pageMargin;
        const isOverflowing = GridWidth > PrintableWidth || GridHeight > PrintableHeight;

        let Start_X = pageMargin;
        let Start_Y = pageMargin;
        if (centerGrid && !isOverflowing) {
            Start_X = pageMargin + (PrintableWidth - GridWidth) / 2;
            Start_Y = pageMargin + (PrintableHeight - GridHeight) / 2;
        }

        const itemsPerPage = gridCols * gridRows;
        const numPages = Math.ceil(texts.length / itemsPerPage);

        // Paleta de colores
        const rgbDark = hexToRgb(qrColorDark);
        const rgbLight = hexToRgb(qrColorLight);

        // Generar páginas
        for (let p = 0; p < numPages; p++) {
            if (p > 0) {
                doc.addPage(pdfFormat, orientation);
            }

            const pageStartIdx = p * itemsPerPage;
            const pageEndIdx = Math.min(pageStartIdx + itemsPerPage, texts.length);

            for (let idx = pageStartIdx; idx < pageEndIdx; idx++) {
                const idxInPage = idx - pageStartIdx;
                const col = idxInPage % gridCols;
                const row = Math.floor(idxInPage / gridCols);

                const cell_x = Start_X + col * (Cw + gridGap);
                const cell_y = Start_Y + row * (Ch + gridGap);

                // 1. Dibujar fondo de tarjeta si no es blanco
                if (qrColorLight !== '#ffffff' && qrColorLight !== '#fff') {
                    doc.setFillColor(rgbLight.r, rgbLight.g, rgbLight.b);
                    doc.rect(cell_x, cell_y, Cw, Ch, 'F');
                }

                // 2. Dibujar líneas de corte punteadas
                if (showBorders) {
                    doc.setLineDashPattern([1, 1], 0);
                    doc.setDrawColor(180, 180, 180);
                    doc.setLineWidth(0.15);
                    doc.rect(cell_x, cell_y, Cw, Ch, 'S');
                }

                // 3. Generar código QR en Canvas de alta resolución en memoria
                const inMemoryCanvas = document.createElement('canvas');
                await QRCode.toCanvas(inMemoryCanvas, texts[idx], {
                    margin: 1,
                    width: 512,
                    color: {
                        dark: qrColorDark,
                        light: qrColorLight
                    },
                    errorCorrectionLevel: 'M'
                });

                const qrDataURL = inMemoryCanvas.toDataURL('image/png');
                const qr_x = cell_x + cardPadding;
                const qr_y = cell_y + cardPadding + (labelPosition === 'top' ? L_height : 0);

                // 4. Agregar QR a PDF
                doc.addImage(qrDataURL, 'PNG', qr_x, qr_y, qrSize, qrSize);

                // 5. Agregar etiqueta si corresponde
                if (showLabel) {
                    const labelText = labelPattern.replace('{N}', idx + 1);
                    
                    doc.setFont('Helvetica', 'bold');
                    doc.setFontSize(labelFontSize);
                    doc.setTextColor(rgbDark.r, rgbDark.g, rgbDark.b);

                    const text_x = cell_x + Cw / 2;
                    let text_y;
                    
                    if (labelPosition === 'bottom') {
                        text_y = cell_y + cardPadding + qrSize + L_height / 2;
                    } else {
                        text_y = cell_y + cardPadding + L_height / 2;
                    }

                    doc.text(labelText, text_x, text_y, { align: 'center', baseline: 'middle' });
                }
            }
        }

        // Hoja de Referencia (Leyenda)
        if (includeLegend) {
            const AvailableHeight = PageHeight - 2 * pageMargin - 30;
            const rowHeight = 10;
            const legendItemsPerPage = Math.max(5, Math.floor(AvailableHeight / rowHeight));
            const legendPages = Math.ceil(texts.length / legendItemsPerPage);

            for (let lp = 0; lp < legendPages; lp++) {
                doc.addPage(pdfFormat, orientation);

                // Resetear estilos
                doc.setLineDashPattern([], 0);
                doc.setLineWidth(0.2);

                // Encabezados
                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(18);
                doc.setTextColor(17, 24, 39);
                doc.text('Hoja de Referencia - Text to QR', pageMargin, 20);

                doc.setFont('Helvetica', 'normal');
                doc.setFontSize(10);
                doc.setTextColor(75, 85, 99);
                doc.text('Guarda esta página. Contiene la lista de contenidos de cada código QR para tu referencia.', pageMargin, 26);

                // Tabla
                let currentY = 32;
                const col1Width = 40;
                const col2Width = PageWidth - 2 * pageMargin - col1Width;

                // Dibujar cabecera
                doc.setFillColor(243, 244, 246);
                doc.rect(pageMargin, currentY, PageWidth - 2 * pageMargin, rowHeight, 'F');
                doc.setDrawColor(229, 231, 235);
                doc.rect(pageMargin, currentY, PageWidth - 2 * pageMargin, rowHeight, 'S');

                doc.setFont('Helvetica', 'bold');
                doc.setFontSize(9);
                doc.setTextColor(55, 65, 81);
                doc.text('Etiqueta', pageMargin + 4, currentY + rowHeight / 2, { baseline: 'middle' });
                doc.text('Contenido del Código', pageMargin + col1Width + 4, currentY + rowHeight / 2, { baseline: 'middle' });

                currentY += rowHeight;

                const startIdx = lp * legendItemsPerPage;
                const endIdx = Math.min(startIdx + legendItemsPerPage, texts.length);

                for (let idx = startIdx; idx < endIdx; idx++) {
                    const labelText = labelPattern.replace('{N}', idx + 1);
                    const itemText = texts[idx];

                    // Borde de la fila
                    doc.setDrawColor(229, 231, 235);
                    doc.rect(pageMargin, currentY, PageWidth - 2 * pageMargin, rowHeight, 'S');

                    // Separador vertical
                    doc.line(pageMargin + col1Width, currentY, pageMargin + col1Width, currentY + rowHeight);

                    // Escribir celda etiqueta
                    doc.setFont('Helvetica', 'bold');
                    doc.setFontSize(9);
                    doc.setTextColor(37, 99, 235);
                    doc.text(labelText, pageMargin + 4, currentY + rowHeight / 2, { baseline: 'middle' });

                    // Escribir celda Contenido
                    doc.setFont('Helvetica', 'normal');
                    doc.setFontSize(8);
                    doc.setTextColor(17, 24, 39);
                    
                    // Truncar si es muy largo
                    const maxChars = Math.floor(col2Width * 1.8);
                    const truncatedText = itemText.length > maxChars ? itemText.substring(0, maxChars - 3) + '...' : itemText;
                    doc.text(truncatedText, pageMargin + col1Width + 4, currentY + rowHeight / 2, { baseline: 'middle' });

                    currentY += rowHeight;
                }
            }
        }

        // Guardar archivo
        doc.save('text_to_qr_imprimir.pdf');

    } catch (e) {
        console.error(e);
        alert('Ocurrió un error al generar el PDF: ' + e.message);
    } finally {
        // Restaurar botón
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = originalContent;
    }
}
