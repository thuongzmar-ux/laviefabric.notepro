// FabricNote Pro - Chốt đơn & Gắn Note Bảng Màu Vải Toàn Diện
(function () {
  'use strict';

  // State
  const state = {
    img: null,
    imgSrc: null,
    imgNaturalWidth: 0,
    imgNaturalHeight: 0,
    zoom: 1.0,

    // Active tool: 'select' | 'tick' | 'box' | 'box_dot' | 'badge' | 'combo'
    currentTool: 'select',
    autoRevertSelect: true,
    spacePressed: false,
    isPanning: false,
    panStart: { x: 0, y: 0 },
    currentQty: '50m',
    globalScale: 1.0,
    fabricFormula: 'auto',

    // Banner 1: Customer & Fabric
    banner: {
      enabled: true,
      x: 80,
      y: 40,
      customer: 'C Dung',
      fabric: 'Thun loang 822-10#',
      showSummary: true,
      colorTheme: 'red',
      fontSize: 32,
      paddingX: 20,
      paddingY: 14,
      borderRadius: 6,
      width: 0,
      height: 0
    },

    // Banner 2: Price / Date / Secondary
    priceBanner: {
      enabled: false,
      x: 80,
      y: 160,
      line1: 'Sỉ 78k/m',
      line2: 'mẫu 93k/m',
      colorTheme: 'yellow',
      fontSize: 28,
      paddingX: 18,
      paddingY: 12,
      borderRadius: 6,
      width: 0,
      height: 0
    },

    // Banner 3: Fabric Specifications (Khổ, Định lượng, Thành phần)
    fabricSpecs: {
      enabled: false,
      x: 80,
      y: 320,
      composition: '95% Cotton 5% Spandex',
      width: 'Khổ 1m65',
      weight: '240gsm (2m8/kg)',
      notes: 'Co giãn 4 chiều, may đầm & áo polo',
      colorTheme: 'dark',
      fontSize: 22,
      paddingX: 18,
      paddingY: 14,
      borderRadius: 8,
      width: 0,
      height: 0,
      positioned: false
    },

    // Brand & Hotline Badge
    brandBadge: {
      enabled: true,
      x: 60,
      y: 500,
      name: 'Hương - Vải Lavie',
      phone: '0977.855.122',
      width: 0,
      height: 0,
      positioned: false
    },

    // Items list: { id, type: 'tick'|'box'|'box_dot'|'badge'|'arrow', x, y, ... }
    items: [],

    // Selection & Manipulation
    selectedId: null,
    selectedHandle: null,
    isDragging: false,
    dragStartPos: { x: 0, y: 0 },
    dragOriginalItem: null,

    // Order items
    parsedItems: [],

    // Undo history
    history: [],

    // Image Session & History (tối đa 10 ảnh)
    currentSessionId: null,
    isRestoringSession: false
  };

  // DOM Elements
  const canvas = document.getElementById('main-canvas');
  const ctx = canvas.getContext('2d');
  const canvasWrapper = document.getElementById('canvas-wrapper');
  const viewport = document.getElementById('viewport-container');

  const fileInput = document.getElementById('file-input');
  const dropZone = document.getElementById('drop-zone');
  const welcomeScreen = document.getElementById('welcome-upload-screen');
  const welcomeDropZone = document.getElementById('welcome-drop-zone');
  const welcomeFileInput = document.getElementById('welcome-file-input');
  const headerFileInput = document.getElementById('header-file-input');
  const btnSampleToggle = document.getElementById('btn-sample-toggle');
  const sampleMenu = document.getElementById('sample-menu');
  const sampleItems = document.querySelectorAll('.sample-item');

  // Tabs
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  // Tools
  const toolButtons = document.querySelectorAll('.tool-btn');
  const miniToolButtons = document.querySelectorAll('.btn-mini-tool');

  // Text Inputs
  const primaryTextInput = document.getElementById('primary-text-input');
  const canvasTopTextInput = document.getElementById('canvas-top-text-input');
  const btnClearText = document.getElementById('btn-clear-text');
  const chipQtyButtons = document.querySelectorAll('.chip-qty-btn');

  // Sidebar badge scale slider
  const sidebarBadgeScaleSlider = document.getElementById('sidebar-badge-scale-slider');
  const sidebarBadgeScaleVal = document.getElementById('sidebar-badge-scale-val');
  const btnSidebarScaleMinus = document.getElementById('btn-sidebar-scale-minus');
  const btnSidebarScalePlus = document.getElementById('btn-sidebar-scale-plus');

  // Inspector card
  const inspectorCard = document.getElementById('inspector-card');
  const inspectorType = document.getElementById('inspector-type');
  const btnInspectorDelete = document.getElementById('btn-inspector-delete');

  const inspectorFrameControls = document.getElementById('inspector-frame-controls');
  const frameWSlider = document.getElementById('frame-w-slider');
  const frameWVal = document.getElementById('frame-w-val');
  const frameHSlider = document.getElementById('frame-h-slider');
  const frameHVal = document.getElementById('frame-h-val');
  const btnWMinus = document.getElementById('btn-w-minus');
  const btnWPlus = document.getElementById('btn-w-plus');
  const btnHMinus = document.getElementById('btn-h-minus');
  const btnHPlus = document.getElementById('btn-h-plus');

  const inspectorBadgeControls = document.getElementById('inspector-badge-controls');
  const inspectorBadgeText = document.getElementById('inspector-badge-text');
  const badgeColorDots = document.querySelectorAll('[data-badge-color]');

  const inspectorTickControls = document.getElementById('inspector-tick-controls');
  const tickSizeSlider = document.getElementById('tick-size-slider');
  const tickSizeVal = document.getElementById('tick-size-val');

  const btnClearNotes = document.getElementById('btn-clear-notes');

  // Floating Edit Card
  const floatingEditCard = document.getElementById('floating-edit-card');
  const floatingTextInput = document.getElementById('floating-text-input');
  const btnFloatingSave = document.getElementById('btn-floating-save');
  const btnFloatingDel = document.getElementById('btn-floating-del');
  const btnSugs = document.querySelectorAll('.btn-sug');

  // Floating Size Slider inside Floating Card
  const floatingSizeSlider = document.getElementById('floating-size-slider');
  const floatingSizeVal = document.getElementById('floating-size-val');
  const btnFloatingSizeDown = document.getElementById('btn-floating-size-down');
  const btnFloatingSizeUp = document.getElementById('btn-floating-size-up');

  // Banner 1 controls
  const toggleBanner = document.getElementById('toggle-banner');
  const inputCustomer = document.getElementById('input-customer');
  const inputFabric = document.getElementById('input-fabric');
  const bannerColorDots = document.querySelectorAll('[data-color]');

  // Banner 2 controls
  const togglePriceBanner = document.getElementById('toggle-price-banner');
  const inputPriceLine1 = document.getElementById('input-price-line1');
  const inputPriceLine2 = document.getElementById('input-price-line2');
  const priceColorDots = document.querySelectorAll('[data-price-color]');

  // Brand & Watermark controls
  const brandLogoImg = new Image();
  brandLogoImg.src = 'assets/logo_lavie.png';
  brandLogoImg.onload = () => {
    if (state.img) render();
  };

  const toggleBrandBadge = document.getElementById('toggle-brand-badge');
  const inputBrandName = document.getElementById('input-brand-name');
  const inputBrandPhone = document.getElementById('input-brand-phone');

  // Order parsing
  const orderPasteInput = document.getElementById('order-paste-input');
  const btnParseOrder = document.getElementById('btn-parse-order');
  const orderChipsList = document.getElementById('order-chips-list');

  // Toolbar & actions
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnZoomFit = document.getElementById('btn-zoom-fit');
  const zoomLevelText = document.getElementById('zoom-level');

  const btnUndo = document.getElementById('btn-undo');
  const btnCopy = document.getElementById('btn-copy-image');
  const btnDownload = document.getElementById('btn-download-image');
  const toastEl = document.getElementById('toast');

  // History DOM Elements (Lưu trữ 10 ảnh)
  const historyBadge = document.getElementById('history-badge');
  const historyStatusTag = document.getElementById('history-status-tag');
  const historyItemsContainer = document.getElementById('history-items-container');
  const btnSaveCurrentManual = document.getElementById('btn-save-current-manual');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const welcomeRecentHistory = document.getElementById('welcome-recent-history');
  const welcomeRecentGrid = document.getElementById('welcome-recent-grid');

  // Crop & Overlay Modal Elements
  const headerOverlayInput = document.getElementById('header-overlay-input');
  const tabOverlayInput = document.getElementById('tab-overlay-input');
  const cropModal = document.getElementById('crop-modal');
  const btnCropClose = document.getElementById('btn-crop-close');
  const btnCropCancel = document.getElementById('btn-crop-cancel');
  const btnCropApply = document.getElementById('btn-crop-apply');
  const btnCropAsBase = document.getElementById('btn-crop-as-base');
  const cropSourceImg = document.getElementById('crop-source-img');
  const cropBox = document.getElementById('crop-box');
  const cropStageContainer = document.getElementById('crop-stage-container');
  const cropRatioButtons = document.querySelectorAll('.btn-crop-ratio');

  // Inspector Overlay Controls
  const inspectorOverlayControls = document.getElementById('inspector-overlay-controls');
  const overlaySizeSlider = document.getElementById('overlay-size-slider');
  const overlaySizeVal = document.getElementById('overlay-size-val');
  const btnOverlayBorderWhite = document.getElementById('btn-overlay-border-white');
  const btnOverlayBorderRed = document.getElementById('btn-overlay-border-red');
  const btnOverlayBorderNone = document.getElementById('btn-overlay-border-none');

  // ============================================================
  // MODULE-LEVEL HELPERS (dùng được từ keyboard shortcuts)
  // ============================================================

  const TOOL_NAMES = {
    select: 'Con trỏ Chọn (V)',
    hand: 'Bàn tay Rê ảnh (H)',
    tick: 'Tick đỏ (1)',
    box: 'Khung đỏ (2)',
    box_dot: 'Khung+Chấm (3)',
    badge: 'Thẻ chữ (4)',
    combo: 'Cả cụm (5)',
    arrow: 'Mũi tên (6)'
  };

  // Chuyển công cụ + cập nhật UI buttons + cursor
  function setActiveTool(tool) {
    state.currentTool = tool;
    const toolButtons = document.querySelectorAll('.tool-btn');
    const miniToolButtons = document.querySelectorAll('.btn-mini-tool');
    toolButtons.forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    miniToolButtons.forEach(b => b.classList.toggle('active', b.dataset.miniTool === tool));
    const statusEl = document.getElementById('active-tool-status');
    if (statusEl) {
      statusEl.textContent = TOOL_NAMES[tool] || tool;
      statusEl.className = tool === 'select' ? 'tag-status-tool' : 'tag-status';
    }
    updateCanvasCursor();
  }

  function updateCanvasCursor() {
    if (state.spacePressed || state.currentTool === 'hand') {
      canvas.style.cursor = state.isPanning ? 'grabbing' : 'grab';
      return;
    }
    canvas.style.cursor = state.currentTool === 'select' ? 'default' : 'crosshair';
  }

  // Bảng phím tắt - hiện/ẩn modal
  function toggleShortcutHelp() {
    let modal = document.getElementById('shortcut-help-modal');
    if (modal) {
      modal.classList.toggle('hidden');
      return;
    }
    // Tạo modal lần đầu
    modal = document.createElement('div');
    modal.id = 'shortcut-help-modal';
    modal.className = 'shortcut-modal-overlay';
    modal.innerHTML = `
      <div class="shortcut-modal-box">
        <div class="shortcut-modal-header">
          <span>⌨️ Bảng Phím Tắt Thao Tác Nhanh</span>
          <button class="shortcut-modal-close" onclick="document.getElementById('shortcut-help-modal').classList.add('hidden')">✕</button>
        </div>
        <div class="shortcut-modal-body">
          <div class="shortcut-section">
            <div class="shortcut-section-title">Chọn công cụ</div>
            <div class="shortcut-row"><kbd>V</kbd> <strong>Con trỏ Chọn</strong> (tránh dán nhầm)</div>
            <div class="shortcut-row"><kbd>H</kbd> <strong>Bàn tay Rê ảnh</strong> (Pan ảnh khổ lớn)</div>
            <div class="shortcut-row"><kbd>1</kbd> Tick đỏ ✓</div>
            <div class="shortcut-row"><kbd>2</kbd> Khung đỏ ▢</div>
            <div class="shortcut-row"><kbd>3</kbd> Khung + Chấm ▢•</div>
            <div class="shortcut-row"><kbd>4</kbd> Thẻ chữ 🏷️</div>
            <div class="shortcut-row"><kbd>5</kbd> Cả cụm ▢+🏷️</div>
            <div class="shortcut-row"><kbd>6</kbd> Mũi tên đỏ ➔</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Chỉnh sửa & Thao tác</div>
            <div class="shortcut-row"><kbd>Esc</kbd> <strong>Về Con trỏ Chọn</strong> / Bỏ chọn</div>
            <div class="shortcut-row"><kbd>Double-click</kbd> Sửa chữ ngay trên ảnh</div>
            <div class="shortcut-row"><kbd>Shift</kbd>+<kbd>Enter</kbd> <strong>Xuống dòng khi note</strong></div>
            <div class="shortcut-row"><kbd>Enter</kbd> Lưu chữ note đã sửa</div>
            <div class="shortcut-row"><kbd>Del</kbd> / <kbd>⌫</kbd> Xóa element đang chọn</div>
            <div class="shortcut-row"><kbd>F</kbd> Đổi nhanh số lượng / mét</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Di chuyển & Zoom</div>
            <div class="shortcut-row"><kbd>H</kbd> hoặc <kbd>Space</kbd>+chuột Rê góc nhìn (Pan)</div>
            <div class="shortcut-row"><kbd>↑↓←→</kbd> Nhích element (2px)</div>
            <div class="shortcut-row"><kbd>Shift</kbd>+<kbd>↑↓←→</kbd> Nhích nhanh (10px)</div>
            <div class="shortcut-row"><kbd>+</kbd> / <kbd>-</kbd> Phóng to / Thu nhỏ</div>
            <div class="shortcut-row"><kbd>0</kbd> Vừa màn hình</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Lịch sử & Xuất ảnh</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>⌘Z</kbd> <strong>Hoàn tác (Undo)</strong></div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>V</kbd> <strong>Dán ảnh nền hoặc Chèn & Cắt ảnh đè</strong></div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>C</kbd> Copy gửi ngay Zalo</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>S</kbd> Tải ảnh gốc về máy</div>
            <div class="shortcut-row"><kbd>?</kbd> Mở / đóng bảng phím tắt</div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
  window.toggleShortcutHelp = toggleShortcutHelp;

  // Ẩn/hiện màn hình mở đầu vs bàn vẽ canvas
  function updateImageLoadedUI() {
    const hasImage = !!state.img;
    if (welcomeScreen) {
      welcomeScreen.classList.toggle('hidden', hasImage);
    }
    if (canvasWrapper) {
      canvasWrapper.classList.toggle('hidden', !hasImage);
    }
    const floatingQuickBar = document.querySelector('.floating-quick-bar');
    if (floatingQuickBar) {
      floatingQuickBar.classList.toggle('hidden', !hasImage);
    }
    if (btnCopy) {
      btnCopy.classList.toggle('btn-disabled', !hasImage);
      btnCopy.disabled = !hasImage;
    }
    if (btnDownload) {
      btnDownload.classList.toggle('btn-disabled', !hasImage);
      btnDownload.disabled = !hasImage;
    }
    if (btnUndo) {
      btnUndo.classList.toggle('btn-disabled', !hasImage);
      btnUndo.disabled = !hasImage;
    }
  }

  // Initialize - Giao diện mở đầu nạp ảnh, tải lịch sử 10 ảnh gần nhất
  function init() {
    setupEventListeners();
    initCropModal();
    setActiveTool('select');
    updateImageLoadedUI();
    refreshHistoryUI();
  }

  // Toast
  function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    setTimeout(() => {
      toastEl.className = 'toast hidden';
    }, 3200);
  }

  // History / Undo (Hỗ trợ phím tắt Ctrl+Z)
  function saveHistory() {
    const snapshot = {
      items: state.items.map(it => {
        if (it.type === 'overlay_image') {
          return {
            id: it.id,
            type: it.type,
            x: it.x,
            y: it.y,
            width: it.width,
            height: it.height,
            naturalWidth: it.naturalWidth,
            naturalHeight: it.naturalHeight,
            scale: it.scale || 1.0,
            borderRadius: it.borderRadius,
            borderWidth: it.borderWidth,
            borderColor: it.borderColor,
            imgSrc: it.imgSrc
          };
        }
        return JSON.parse(JSON.stringify(it));
      }),
      banner: { ...state.banner },
      priceBanner: { ...state.priceBanner },
      fabricSpecs: { ...state.fabricSpecs },
      brandBadge: { ...state.brandBadge }
    };
    state.history.push(snapshot);
    if (state.history.length > 30) state.history.shift();
    scheduleSaveImageHistory();
  }

  function undo() {
    if (state.history.length === 0) {
      showToast('Không có thao tác nào để hoàn tác (Ctrl+Z)', 'error');
      return;
    }
    const previous = state.history.pop();
    state.items = (previous.items || []).map(it => {
      if (it.type === 'overlay_image' && it.imgSrc) {
        const im = new Image();
        im.onload = () => render();
        im.src = it.imgSrc;
        it.img = im;
      }
      return it;
    });
    state.banner = previous.banner;
    state.priceBanner = previous.priceBanner;
    if (previous.fabricSpecs) state.fabricSpecs = previous.fabricSpecs;
    if (previous.brandBadge) state.brandBadge = previous.brandBadge;
    deselectItem();
    render();
    showToast('↶ Đã hoàn tác (Ctrl+Z)');
    scheduleSaveImageHistory();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Tab switching
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.dataset.tab;
        const targetContent = document.getElementById(`tab-content-${targetTab}`);
        if (targetContent) targetContent.classList.add('active');
      });
    });

    // File upload (Sidebar)
    if (fileInput) fileInput.addEventListener('change', handleFileSelect);
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    // File upload (Welcome Screen)
    if (welcomeFileInput) {
      welcomeFileInput.addEventListener('change', handleFileSelect);
    }
    if (welcomeDropZone) {
      welcomeDropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        welcomeDropZone.classList.add('dragover');
      });
      welcomeDropZone.addEventListener('dragleave', () => welcomeDropZone.classList.remove('dragover'));
      welcomeDropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        welcomeDropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          loadFile(e.dataTransfer.files[0]);
        }
      });
    }

    // File upload (Header button)
    if (headerFileInput) {
      headerFileInput.addEventListener('change', handleFileSelect);
    }

    // Image History buttons (Tối đa 10 ảnh)
    if (btnSaveCurrentManual) {
      btnSaveCurrentManual.addEventListener('click', () => {
        saveCurrentImageHistory(false);
      });
    }
    if (btnClearHistory) {
      btnClearHistory.addEventListener('click', async () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử 10 ảnh không?')) {
          await clearAllHistory();
          await refreshHistoryUI();
          showToast('Đã xóa sạch lịch sử ảnh');
        }
      });
    }

    // Paste clipboard (Ctrl+V từ Zalo / clipboard - hỗ trợ ảnh chồng lên ảnh)
    window.addEventListener('paste', (e) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
      const clipboardData = e.clipboardData || (e.originalEvent && e.originalEvent.clipboardData);
      if (!clipboardData) return;

      const items = clipboardData.items;
      let imgFile = null;
      for (const item of items) {
        if (item.type && item.type.indexOf('image') !== -1) {
          imgFile = item.getAsFile();
          break;
        }
      }

      if (imgFile) {
        e.preventDefault();
        if (!state.img) {
          loadFile(imgFile);
          showToast('✓ Đã nạp ảnh bảng màu từ clipboard Zalo!', 'success');
        } else {
          // Khi đã có ảnh: mở Modal cắt & chèn ảnh chồng lên ảnh!
          openCropOverlayModal(imgFile);
        }
      }
    });

    if (headerOverlayInput) {
      headerOverlayInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          openCropOverlayModal(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    if (tabOverlayInput) {
      tabOverlayInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          openCropOverlayModal(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    // Sample dropdown (nếu có trong DOM)
    if (btnSampleToggle) {
      btnSampleToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sampleMenu) sampleMenu.classList.toggle('hidden');
      });
      window.addEventListener('click', () => {
        if (sampleMenu) sampleMenu.classList.add('hidden');
      });
    }

    if (sampleItems && sampleItems.length > 0) {
      sampleItems.forEach(item => {
        item.addEventListener('click', () => {
          loadPresetSample(item.dataset.sample);
          if (sampleMenu) sampleMenu.classList.add('hidden');
        });
      });
    }

    // Tool syncing - dùng module-level setActiveTool
    toolButtons.forEach(btn => {
      btn.addEventListener('click', () => setActiveTool(btn.dataset.tool));
    });
    miniToolButtons.forEach(btn => {
      btn.addEventListener('click', () => setActiveTool(btn.dataset.miniTool));
    });

    // TEXT SYNCING (Hỗ trợ xuống dòng khi note)
    function updateActiveText(newText) {
      state.currentQty = newText;
      if (primaryTextInput && primaryTextInput.value !== newText) primaryTextInput.value = newText;
      if (canvasTopTextInput && canvasTopTextInput.value !== newText) canvasTopTextInput.value = newText;
      if (floatingTextInput && floatingTextInput.value !== newText) floatingTextInput.value = newText;

      chipQtyButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.text === newText);
      });

      const selected = getSelectedItem();
      if (selected && selected.type === 'badge') {
        selected.text = newText;
        if (inspectorBadgeText && inspectorBadgeText.value !== newText) inspectorBadgeText.value = newText;
        render();
        updateFloatingCardPosition(selected);
      }
    }

    if (primaryTextInput) primaryTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));
    if (canvasTopTextInput) canvasTopTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));
    if (floatingTextInput) {
      floatingTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));
      floatingTextInput.addEventListener('keydown', (e) => {
        // Shift+Enter = xuống dòng; Enter đơn lẻ = lưu & đóng
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          hideFloatingCard();
          showToast('✓ Đã lưu chữ note');
        }
      });
    }

    btnClearText.addEventListener('click', () => {
      updateActiveText('');
      if (primaryTextInput) primaryTextInput.focus();
    });

    chipQtyButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        updateActiveText(btn.dataset.text);
      });
    });

    btnSugs.forEach(btn => {
      btn.addEventListener('click', () => {
        updateActiveText(btn.textContent.trim());
      });
    });

    btnFloatingSave.addEventListener('click', () => hideFloatingCard());
    btnFloatingDel.addEventListener('click', () => deleteSelectedItem());

    // BADGE SCALE CONTROLS (Thanh kéo cỡ thẻ note to ra / nhỏ lại)
    function setBadgeScale(percentVal) {
      const scaleNum = Math.max(0.4, Math.min(4.0, percentVal / 100));
      const roundedPercent = Math.round(scaleNum * 100);

      floatingSizeSlider.value = roundedPercent;
      floatingSizeVal.textContent = `${roundedPercent}%`;
      sidebarBadgeScaleSlider.value = roundedPercent;
      sidebarBadgeScaleVal.textContent = `${roundedPercent}%`;

      const selected = getSelectedItem();
      if (selected && selected.type === 'badge') {
        selected.scale = scaleNum;
        render();
        updateFloatingCardPosition(selected);
      } else {
        // Sets default scale for upcoming stamped badges
        state.globalScale = scaleNum;
      }
    }

    floatingSizeSlider.addEventListener('input', (e) => {
      setBadgeScale(parseInt(e.target.value, 10));
    });
    sidebarBadgeScaleSlider.addEventListener('input', (e) => {
      setBadgeScale(parseInt(e.target.value, 10));
    });

    btnFloatingSizeDown.addEventListener('click', () => {
      const cur = parseInt(floatingSizeSlider.value, 10);
      setBadgeScale(cur - 20);
    });
    btnFloatingSizeUp.addEventListener('click', () => {
      const cur = parseInt(floatingSizeSlider.value, 10);
      setBadgeScale(cur + 20);
    });
    btnSidebarScaleMinus.addEventListener('click', () => {
      const cur = parseInt(sidebarBadgeScaleSlider.value, 10);
      setBadgeScale(cur - 20);
    });
    btnSidebarScalePlus.addEventListener('click', () => {
      const cur = parseInt(sidebarBadgeScaleSlider.value, 10);
      setBadgeScale(cur + 20);
    });

    // Frame Stepper & Sliders
    function setFrameWidth(w) {
      const selected = getSelectedItem();
      if (selected && (selected.type === 'box' || selected.type === 'box_dot')) {
        selected.width = Math.max(30, w);
        frameWSlider.value = Math.round(selected.width);
        frameWVal.textContent = `${Math.round(selected.width)}px`;
        render();
      }
    }

    function setFrameHeight(h) {
      const selected = getSelectedItem();
      if (selected && (selected.type === 'box' || selected.type === 'box_dot')) {
        selected.height = Math.max(30, h);
        frameHSlider.value = Math.round(selected.height);
        frameHVal.textContent = `${Math.round(selected.height)}px`;
        render();
      }
    }

    frameWSlider.addEventListener('input', (e) => setFrameWidth(parseInt(e.target.value, 10)));
    frameHSlider.addEventListener('input', (e) => setFrameHeight(parseInt(e.target.value, 10)));

    btnWMinus.addEventListener('click', () => {
      const s = getSelectedItem();
      if (s) setFrameWidth(s.width - 15);
    });
    btnWPlus.addEventListener('click', () => {
      const s = getSelectedItem();
      if (s) setFrameWidth(s.width + 15);
    });
    btnHMinus.addEventListener('click', () => {
      const s = getSelectedItem();
      if (s) setFrameHeight(s.height - 15);
    });
    btnHPlus.addEventListener('click', () => {
      const s = getSelectedItem();
      if (s) setFrameHeight(s.height + 15);
    });

    // Inspector Badge Controls
    inspectorBadgeText.addEventListener('input', (e) => updateActiveText(e.target.value));

    badgeColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        badgeColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        const selected = getSelectedItem();
        if (selected && selected.type === 'badge') {
          saveHistory();
          selected.colorTheme = dot.dataset.badgeColor;
          render();
        }
      });
    });

    // Inspector Tick Controls
    tickSizeSlider.addEventListener('input', (e) => {
      const selected = getSelectedItem();
      if (selected && selected.type === 'tick') {
        selected.scale = parseInt(e.target.value, 10) / 100;
        tickSizeVal.textContent = `${e.target.value}%`;
        render();
      }
    });

    // Inspector Overlay Image Controls
    if (overlaySizeSlider) {
      overlaySizeSlider.addEventListener('input', (e) => {
        const selected = getSelectedItem();
        if (selected && selected.type === 'overlay_image') {
          selected.scale = parseInt(e.target.value, 10) / 100;
          if (overlaySizeVal) overlaySizeVal.textContent = `${e.target.value}%`;
          render();
        }
      });
    }

    if (btnOverlayBorderWhite) {
      btnOverlayBorderWhite.addEventListener('click', () => {
        const selected = getSelectedItem();
        if (selected && selected.type === 'overlay_image') {
          saveHistory();
          selected.borderColor = '#ffffff';
          selected.borderWidth = 3;
          render();
        }
      });
    }
    if (btnOverlayBorderRed) {
      btnOverlayBorderRed.addEventListener('click', () => {
        const selected = getSelectedItem();
        if (selected && selected.type === 'overlay_image') {
          saveHistory();
          selected.borderColor = '#e01a22';
          selected.borderWidth = 3;
          render();
        }
      });
    }
    if (btnOverlayBorderNone) {
      btnOverlayBorderNone.addEventListener('click', () => {
        const selected = getSelectedItem();
        if (selected && selected.type === 'overlay_image') {
          saveHistory();
          selected.borderColor = 'none';
          selected.borderWidth = 0;
          render();
        }
      });
    }

    btnInspectorDelete.addEventListener('click', () => deleteSelectedItem());
    btnClearNotes.addEventListener('click', () => {
      if (state.items.length === 0) return;
      saveHistory();
      state.items = [];
      deselectItem();
      render();
      showToast('Đã xóa tất cả các note');
    });

    // Banner 1 Controls (Đồng bộ 2 chiều giữa Tab 1 và Tab 3)
    const tab1ToggleBanner = document.getElementById('tab1-toggle-banner');
    const tab1InputCustomer = document.getElementById('tab1-input-customer');
    const tab1InputFabric = document.getElementById('tab1-input-fabric');

    toggleBanner.addEventListener('change', (e) => {
      state.banner.enabled = e.target.checked;
      if (tab1ToggleBanner) tab1ToggleBanner.checked = e.target.checked;
      render();
    });
    inputCustomer.addEventListener('input', (e) => {
      state.banner.customer = e.target.value;
      if (tab1InputCustomer) tab1InputCustomer.value = e.target.value;
      render();
    });
    inputFabric.addEventListener('input', (e) => {
      state.banner.fabric = e.target.value;
      if (tab1InputFabric) tab1InputFabric.value = e.target.value;
      updateSidebarOrderSummary();
      render();
    });

    if (tab1ToggleBanner) {
      tab1ToggleBanner.addEventListener('change', (e) => {
        state.banner.enabled = e.target.checked;
        if (toggleBanner) toggleBanner.checked = e.target.checked;
        render();
      });
    }
    if (tab1InputCustomer) {
      tab1InputCustomer.addEventListener('input', (e) => {
        state.banner.customer = e.target.value;
        if (inputCustomer) inputCustomer.value = e.target.value;
        render();
      });
    }
    if (tab1InputFabric) {
      tab1InputFabric.addEventListener('input', (e) => {
        state.banner.fabric = e.target.value;
        if (inputFabric) inputFabric.value = e.target.value;
        updateSidebarOrderSummary();
        render();
      });
    }
    bannerColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        bannerColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.banner.colorTheme = dot.dataset.color;
        render();
      });
    });

    // Banner 2 Controls
    togglePriceBanner.addEventListener('change', (e) => {
      state.priceBanner.enabled = e.target.checked;
      render();
    });
    inputPriceLine1.addEventListener('input', (e) => {
      state.priceBanner.line1 = e.target.value;
      render();
    });
    inputPriceLine2.addEventListener('input', (e) => {
      state.priceBanner.line2 = e.target.value;
      render();
    });
    priceColorDots.forEach(dot => {
      dot.addEventListener('click', () => {
        priceColorDots.forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
        state.priceBanner.colorTheme = dot.dataset.priceColor;
        render();
      });
    });

    // Toggle tổng số lượng trên Banner
    const toggleBannerSum = document.getElementById('toggle-banner-sum');
    if (toggleBannerSum) {
      toggleBannerSum.addEventListener('change', (e) => {
        state.banner.showSummary = e.target.checked;
        render();
        scheduleSaveImageHistory();
      });
    }

    // Fabric Specs Controls (Thẻ thông số vải)
    const toggleFabricSpecs = document.getElementById('toggle-fabric-specs');
    const inputSpecComp = document.getElementById('input-spec-comp');
    const inputSpecWidth = document.getElementById('input-spec-width');
    const inputSpecWeight = document.getElementById('input-spec-weight');
    const inputSpecNotes = document.getElementById('input-spec-notes');

    if (toggleFabricSpecs) {
      toggleFabricSpecs.addEventListener('change', (e) => {
        state.fabricSpecs.enabled = e.target.checked;
        if (e.target.checked && !state.fabricSpecs.positioned) {
          state.fabricSpecs.x = state.img ? state.img.naturalWidth * 0.04 : 80;
          state.fabricSpecs.y = state.img ? state.img.naturalHeight * 0.55 : 320;
          state.fabricSpecs.positioned = true;
        }
        render();
        scheduleSaveImageHistory();
      });
    }
    if (inputSpecComp) {
      inputSpecComp.addEventListener('input', (e) => {
        state.fabricSpecs.composition = e.target.value;
        render();
        scheduleSaveImageHistory();
      });
    }
    if (inputSpecWidth) {
      inputSpecWidth.addEventListener('input', (e) => {
        state.fabricSpecs.width = e.target.value;
        render();
        scheduleSaveImageHistory();
      });
    }
    if (inputSpecWeight) {
      inputSpecWeight.addEventListener('input', (e) => {
        state.fabricSpecs.weight = e.target.value;
        render();
        scheduleSaveImageHistory();
      });
    }
    if (inputSpecNotes) {
      inputSpecNotes.addEventListener('input', (e) => {
        state.fabricSpecs.notes = e.target.value;
        render();
        scheduleSaveImageHistory();
      });
    }

    document.querySelectorAll('[data-specs-color]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-specs-color]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.fabricSpecs.colorTheme = btn.dataset.specsColor;
        render();
        scheduleSaveImageHistory();
      });
    });

    // Brand & Watermark Controls
    if (toggleBrandBadge) {
      toggleBrandBadge.addEventListener('change', (e) => {
        state.brandBadge.enabled = e.target.checked;
        render();
      });
    }
    if (inputBrandName) {
      inputBrandName.addEventListener('input', (e) => {
        state.brandBadge.name = e.target.value;
        render();
      });
    }
    if (inputBrandPhone) {
      inputBrandPhone.addEventListener('input', (e) => {
        state.brandBadge.phone = e.target.value;
        render();
      });
    }

    // Order text parser
    btnParseOrder.addEventListener('click', parseOrderText);

    // Zoom controls
    btnZoomIn.addEventListener('click', () => setZoom(state.zoom + 0.15));
    btnZoomOut.addEventListener('click', () => setZoom(state.zoom - 0.15));
    btnZoomFit.addEventListener('click', fitToScreen);

    // Auto-revert to Select checkbox
    const autoRevertCheckbox = document.getElementById('auto-revert-select');
    if (autoRevertCheckbox) {
      autoRevertCheckbox.checked = state.autoRevertSelect;
      autoRevertCheckbox.addEventListener('change', (e) => {
        state.autoRevertSelect = e.target.checked;
        showToast(state.autoRevertSelect ? 'Đã bật: Tự về Con trỏ Chọn sau khi dán' : 'Đã tắt: Chế độ dán liên tục nhiều tem');
      });
    }

    // Export actions
    btnUndo.addEventListener('click', undo);
    btnCopy.addEventListener('click', copyCanvasToClipboard);
    btnDownload.addEventListener('click', downloadCanvasImage);

    // Canvas Events
    canvas.addEventListener('mousedown', handlePointerDown);
    canvas.addEventListener('dblclick', handleDoubleClick);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);

    // Keyup để thả phím Space (Pan)
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        state.spacePressed = false;
        state.isPanning = false;
        canvas.style.cursor = state.currentTool === 'select' ? 'default' : 'crosshair';
      }
    });

    // ============================================================
    // KEYBOARD SHORTCUTS - Toàn diện & Tiện lợi
    // ============================================================
    window.addEventListener('keydown', (e) => {
      const tag = document.activeElement.tagName;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(tag);

      // Giữ Space để Pan xem ảnh (khi không gõ chữ)
      if (e.code === 'Space' && !isTyping) {
        e.preventDefault();
        if (!state.spacePressed) {
          state.spacePressed = true;
          canvas.style.cursor = 'grab';
        }
        return;
      }

      // --- Ctrl/Cmd combos (ưu tiên cao nhất, luôn hoạt động) ---
      if (e.ctrlKey || e.metaKey) {
        const key = e.key ? e.key.toLowerCase() : '';
        const isZ = (key === 'z' || e.code === 'KeyZ');
        if (isZ) {
          if (isTyping) {
            // Đang gõ chữ trong input/textarea thì để trình duyệt undo text nội bộ
            return;
          }
          e.preventDefault();
          undo();
          return;
        }
        switch (key) {
          case 'y':
            e.preventDefault();
            return;
          case 'c':
            if (!isTyping) {
              e.preventDefault();
              copyCanvasToClipboard();
            }
            return;
          case 's':
            e.preventDefault();
            downloadCanvasImage();
            return;
          case '=':
          case '+':
            e.preventDefault();
            setZoom(state.zoom + 0.15);
            return;
          case '-':
            e.preventDefault();
            setZoom(state.zoom - 0.15);
            return;
          case '0':
            e.preventDefault();
            fitToScreen();
            return;
        }
        return;
      }

      // --- Các phím khi ĐANG GÕ CHỮ ---
      if (isTyping) {
        if (document.activeElement === floatingTextInput) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            hideFloatingCard();
            showToast('✓ Đã lưu chữ');
          }
          return;
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          document.activeElement.blur();
          if (!floatingEditCard.classList.contains('hidden')) hideFloatingCard();
        }
        return;
      }

      // --- Các phím khi KHÔNG GÕ CHỮ (Thao tác nhanh 1 chạm) ---
      switch (e.key.toLowerCase()) {
        // --- Phím V: Con trỏ Chọn & Di chuyển ---
        case 'v':
          setActiveTool('select');
          showToast('↖ Con trỏ Chọn & Di chuyển [V]');
          break;

        // --- Phím H: Bàn tay Rê ảnh (Pan) ---
        case 'h':
          setActiveTool('hand');
          showToast('✋ Bàn tay Rê ảnh [H]');
          break;

        // --- Chuyển tool nhanh: phím số 1-6 ---
        case '1':
          setActiveTool('tick');
          showToast('🔧 Tick đỏ  [1]');
          break;
        case '2':
          setActiveTool('box');
          showToast('🔧 Khung đỏ  [2]');
          break;
        case '3':
          setActiveTool('box_dot');
          showToast('🔧 Khung + Chấm  [3]');
          break;
        case '4':
          setActiveTool('badge');
          showToast('🔧 Thẻ chữ  [4]');
          break;
        case '5':
          setActiveTool('combo');
          showToast('🔧 Cả cụm  [5]');
          break;
        case '6':
          setActiveTool('arrow');
          showToast('🔧 Mũi tên đỏ  [6]');
          break;

        // --- Escape: Đóng card -> Bỏ chọn -> Về con trỏ Chọn ---
        case 'escape':
          e.preventDefault();
          if (!floatingEditCard.classList.contains('hidden')) {
            hideFloatingCard();
          } else if (state.selectedId) {
            deselectItem();
            render();
          } else if (state.currentTool !== 'select') {
            setActiveTool('select');
            showToast('↖ Đã về Con trỏ Chọn');
          }
          break;

        // --- Enter: Sửa chữ thẻ đang chọn ---
        case 'enter': {
          const sel = getSelectedItem();
          if (sel && sel.type === 'badge') {
            e.preventDefault();
            floatingEditCard.classList.remove('hidden');
            updateFloatingCardPosition(sel);
            floatingTextInput.focus();
            floatingTextInput.select();
            showToast('✏️ Gõ chữ mới & bấm Enter để lưu');
          }
          break;
        }

        // --- Xóa element đang chọn (Phím Delete hoặc Backspace) ---
        case 'delete':
        case 'backspace':
          e.preventDefault();
          deleteSelectedItem();
          break;

        // --- Zoom ---
        case '=':
        case '+':
          setZoom(state.zoom + 0.15);
          break;
        case '-':
          setZoom(state.zoom - 0.15);
          break;
        case '0':
          fitToScreen();
          break;

        // --- Di chuyển element đang chọn bằng phím mũi tên ---
        case 'arrowup':
        case 'arrowdown':
        case 'arrowleft':
        case 'arrowright': {
          const sel = getSelectedItem();
          if (!sel) break;
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2; // Shift = di chuyển nhanh hơn
          saveHistory();
          const k = e.key.toLowerCase();
          if (k === 'arrowup')    sel.y -= step;
          if (k === 'arrowdown')  sel.y += step;
          if (k === 'arrowleft')  sel.x -= step;
          if (k === 'arrowright') sel.x += step;
          render();
          if (sel.type === 'badge') updateFloatingCardPosition(sel);
          break;
        }

        // --- Phím F: Focus vào ô nhập chữ nhanh ---
        case 'f':
          e.preventDefault();
          canvasTopTextInput.focus();
          canvasTopTextInput.select();
          showToast('✏️ Nhập chữ nhanh [F]');
          break;

        // --- Phím U: Undo (thay thế) ---
        case 'u':
          undo();
          break;

        // --- Phím ?: hiện bảng phím tắt ---
        case '?':
          e.preventDefault();
          toggleShortcutHelp();
          break;
      }
    });
  }

  // Get selected item
  function getSelectedItem() {
    if (!state.selectedId) return null;
    return state.items.find(i => i.id === state.selectedId);
  }

  // Xóa bất kỳ đối tượng nào đang được chọn (Note, Khung, Thẻ, hoặc Banner)
  function deleteSelectedItem() {
    if (!state.selectedId) {
      if (!floatingEditCard.classList.contains('hidden')) {
        hideFloatingCard();
        return;
      }
      return;
    }

    saveHistory();

    // 1. Xóa Bảng Khách & Mã vải
    if (state.selectedId === 'banner') {
      state.banner.enabled = false;
      const togBanner = document.getElementById('toggle-banner');
      if (togBanner) togBanner.checked = false;
      deselectItem();
      render();
      showToast('✓ Đã xóa Bảng Khách & Mã vải');
      scheduleSaveImageHistory();
      return;
    }

    // 2. Xóa Bảng Giá
    if (state.selectedId === 'priceBanner') {
      state.priceBanner.enabled = false;
      const togPrice = document.getElementById('toggle-price-banner');
      if (togPrice) togPrice.checked = false;
      deselectItem();
      render();
      showToast('✓ Đã xóa Bảng Giá');
      scheduleSaveImageHistory();
      return;
    }

    // 3. Xóa Thẻ Logo & Hotline
    if (state.selectedId === 'brandBadge') {
      state.brandBadge.enabled = false;
      if (toggleBrandBadge) toggleBrandBadge.checked = false;
      deselectItem();
      render();
      showToast('✓ Đã xóa Thẻ Logo & Hotline');
      scheduleSaveImageHistory();
      return;
    }

    // 3.5 Xóa Thẻ Thông Số Vải
    if (state.selectedId === 'fabricSpecs') {
      state.fabricSpecs.enabled = false;
      const togSpecs = document.getElementById('toggle-fabric-specs');
      if (togSpecs) togSpecs.checked = false;
      deselectItem();
      render();
      showToast('✓ Đã xóa Thẻ Thông Số Vải');
      scheduleSaveImageHistory();
      return;
    }

    // 4. Xóa Note / Tick / Box / Mũi tên / Ảnh chèn đè trên ảnh
    const item = getSelectedItem();
    const itemDesc = item ? (item.type === 'tick' ? 'Tick đỏ' : item.type === 'arrow' ? 'Mũi tên' : item.type === 'badge' ? `Thẻ "${item.text}"` : item.type === 'overlay_image' ? 'Ảnh chèn đè' : 'Khung viền') : 'đối tượng';
    state.items = state.items.filter(i => i.id !== state.selectedId);
    deselectItem();
    render();
    showToast(`✓ Đã xóa ${itemDesc}`);
    scheduleSaveImageHistory();
  }

  function selectItem(id) {
    state.selectedId = id;
    const item = getSelectedItem();
    if (!item) {
      deselectItem();
      return;
    }

    inspectorCard.classList.remove('hidden');
    inspectorFrameControls.classList.add('hidden');
    inspectorBadgeControls.classList.add('hidden');
    inspectorTickControls.classList.add('hidden');
    if (inspectorOverlayControls) inspectorOverlayControls.classList.add('hidden');

    if (item.type === 'box' || item.type === 'box_dot') {
      inspectorType.textContent = item.type === 'box' ? 'Đang chọn: Khung đỏ' : 'Đang chọn: Khung + Chấm';
      inspectorFrameControls.classList.remove('hidden');

      frameWSlider.max = Math.round(canvas.width * 0.7);
      frameHSlider.max = Math.round(canvas.height * 0.7);
      frameWSlider.value = Math.round(item.width);
      frameHSlider.value = Math.round(item.height);
      frameWVal.textContent = `${Math.round(item.width)}px`;
      frameHVal.textContent = `${Math.round(item.height)}px`;
      hideFloatingCard();
    } else if (item.type === 'badge') {
      inspectorType.textContent = 'Đang chọn: Thẻ chữ vàng';
      inspectorBadgeControls.classList.remove('hidden');

      if (primaryTextInput) primaryTextInput.value = item.text || '';
      if (canvasTopTextInput) canvasTopTextInput.value = item.text || '';
      if (inspectorBadgeText) inspectorBadgeText.value = item.text || '';
      if (floatingTextInput) floatingTextInput.value = item.text || '';

      const curScalePercent = Math.round((item.scale || 1.0) * 100);
      floatingSizeSlider.value = curScalePercent;
      floatingSizeVal.textContent = `${curScalePercent}%`;
      sidebarBadgeScaleSlider.value = curScalePercent;
      sidebarBadgeScaleVal.textContent = `${curScalePercent}%`;

      badgeColorDots.forEach(dot => {
        dot.classList.toggle('active', dot.dataset.badgeColor === (item.colorTheme || 'yellow'));
      });

      showFloatingCardForBadge(item);
    } else if (item.type === 'tick') {
      inspectorType.textContent = 'Đang chọn: Tick đỏ';
      inspectorTickControls.classList.remove('hidden');
      tickSizeSlider.value = Math.round((item.scale || 1.0) * 100);
      tickSizeVal.textContent = `${tickSizeSlider.value}%`;
      hideFloatingCard();
    } else if (item.type === 'arrow') {
      inspectorType.textContent = 'Đang chọn: Mũi tên chỉ điểm';
      hideFloatingCard();
    } else if (item.type === 'overlay_image') {
      inspectorType.textContent = 'Đang chọn: Ảnh chèn đè';
      if (inspectorOverlayControls) inspectorOverlayControls.classList.remove('hidden');
      if (overlaySizeSlider) {
        const curScale = Math.round((item.scale || 1.0) * 100);
        overlaySizeSlider.value = curScale;
        if (overlaySizeVal) overlaySizeVal.textContent = `${curScale}%`;
      }
      hideFloatingCard();
    }

    render();
  }

  function deselectItem() {
    state.selectedId = null;
    state.selectedHandle = null;
    inspectorCard.classList.add('hidden');
    if (inspectorOverlayControls) inspectorOverlayControls.classList.add('hidden');
    hideFloatingCard();
    render();
  }

  function showFloatingCardForBadge(item) {
    updateFloatingCardPosition(item);
    floatingTextInput.value = item.text || '';
    const curPercent = Math.round((item.scale || 1.0) * 100);
    floatingSizeSlider.value = curPercent;
    floatingSizeVal.textContent = `${curPercent}%`;

    floatingEditCard.classList.remove('hidden');
    floatingTextInput.focus();
    floatingTextInput.select();
  }

  function updateFloatingCardPosition(item) {
    if (!item) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width / canvas.width;
    const scaleY = rect.height / canvas.height;

    const cssX = item.x * scaleX;
    const cssY = item.y * scaleY;

    floatingEditCard.style.left = `${cssX}px`;
    floatingEditCard.style.top = `${cssY}px`;
  }

  function hideFloatingCard() {
    floatingEditCard.classList.add('hidden');
  }

  // Load Presets
  function loadPresetSample(sampleKey) {
    if (sampleKey === 'thun_loang') {
      loadImageSource('assets/sample_card.jpg', () => {
        state.currentTool = 'tick';
        syncToolUI('tick');
        state.currentQty = '1c';
        syncTextUI('1c');

        state.banner.enabled = true;
        toggleBanner.checked = true;
        state.banner.customer = 'C Dung';
        state.banner.fabric = 'Thun loang 822-10#';
        state.banner.colorTheme = 'red';
        setColorDotActive(bannerColorDots, 'red');
        inputCustomer.value = state.banner.customer;
        inputFabric.value = state.banner.fabric;

        state.priceBanner.enabled = false;
        togglePriceBanner.checked = false;

        state.banner.x = state.imgNaturalWidth * 0.12;
        state.banner.y = state.imgNaturalHeight * 0.04;

        state.items = [
          { id: 't1', type: 'tick', x: state.imgNaturalWidth * 0.45, y: state.imgNaturalHeight * 0.32, scale: 1.0 },
          { id: 'b1', type: 'badge', x: state.imgNaturalWidth * 0.58, y: state.imgNaturalHeight * 0.31, text: '1c', colorTheme: 'yellow', scale: 1.0 },

          { id: 't2', type: 'tick', x: state.imgNaturalWidth * 0.22, y: state.imgNaturalHeight * 0.63, scale: 1.0 },
          { id: 'b2', type: 'badge', x: state.imgNaturalWidth * 0.31, y: state.imgNaturalHeight * 0.65, text: '1c', colorTheme: 'yellow', scale: 1.0 },

          { id: 't3', type: 'tick', x: state.imgNaturalWidth * 0.50, y: state.imgNaturalHeight * 0.82, scale: 1.0 },
          { id: 'b3', type: 'badge', x: state.imgNaturalWidth * 0.58, y: state.imgNaturalHeight * 0.83, text: '1c', colorTheme: 'yellow', scale: 1.0 }
        ];

        deselectItem();
        render();
        fitToScreen();
        showToast('Đã nạp Mẫu 1: Thun loang');
      });
    } else if (sampleKey === 'bo_nhung') {
      loadImageSource('assets/sample_bo_nhung.jpg', () => {
        state.currentTool = 'box';
        syncToolUI('box');
        state.currentQty = '90m';
        syncTextUI('90m');

        state.banner.enabled = true;
        toggleBanner.checked = true;
        state.banner.customer = 'C Dung';
        state.banner.fabric = 'Bố nhung 88566#';
        state.banner.colorTheme = 'red';
        setColorDotActive(bannerColorDots, 'red');
        inputCustomer.value = state.banner.customer;
        inputFabric.value = state.banner.fabric;

        state.priceBanner.enabled = false;
        togglePriceBanner.checked = false;

        state.banner.x = state.imgNaturalWidth * 0.16;
        state.banner.y = state.imgNaturalHeight * 0.58;

        const baseW = state.imgNaturalWidth * 0.13;
        const baseH = state.imgNaturalHeight * 0.17;

        state.items = [
          { id: 'box1', type: 'box', x: state.imgNaturalWidth * 0.38, y: state.imgNaturalHeight * 0.28, width: baseW, height: baseH },
          { id: 'tag1', type: 'badge', x: state.imgNaturalWidth * 0.51, y: state.imgNaturalHeight * 0.22, text: '90m', colorTheme: 'yellow', scale: 1.25 },

          { id: 'box2', type: 'box', x: state.imgNaturalWidth * 0.68, y: state.imgNaturalHeight * 0.28, width: baseW, height: baseH },
          { id: 'tag2', type: 'badge', x: state.imgNaturalWidth * 0.81, y: state.imgNaturalHeight * 0.22, text: '90m', colorTheme: 'yellow', scale: 1.25 }
        ];

        deselectItem();
        render();
        fitToScreen();
        showToast('Đã nạp Mẫu 2: Bố nhung');
      });
    } else if (sampleKey === 'to_nhan') {
      loadImageSource('assets/sample_to_nhan.jpg', () => {
        state.currentTool = 'box_dot';
        syncToolUI('box_dot');
        state.currentQty = '110m';
        syncTextUI('110m');

        state.banner.enabled = true;
        toggleBanner.checked = true;
        state.banner.customer = 'C Dung';
        state.banner.fabric = 'Tơ nhăn S5040#';
        state.banner.colorTheme = 'red';
        setColorDotActive(bannerColorDots, 'red');
        inputCustomer.value = state.banner.customer;
        inputFabric.value = state.banner.fabric;

        state.priceBanner.enabled = true;
        togglePriceBanner.checked = true;
        state.priceBanner.line1 = 'Sỉ 78k/m';
        state.priceBanner.line2 = 'mẫu 93k/m';
        state.priceBanner.colorTheme = 'yellow';
        setColorDotActive(priceColorDots, 'yellow');
        inputPriceLine1.value = state.priceBanner.line1;
        inputPriceLine2.value = state.priceBanner.line2;

        state.banner.x = state.imgNaturalWidth * 0.68;
        state.banner.y = state.imgNaturalHeight * 0.63;
        state.priceBanner.x = state.imgNaturalWidth * 0.71;
        state.priceBanner.y = state.imgNaturalHeight * 0.82;

        const boxW = state.imgNaturalWidth * 0.085;
        const boxH = state.imgNaturalHeight * 0.105;

        state.items = [
          { id: 'b_dot1', type: 'box_dot', x: state.imgNaturalWidth * 0.27, y: state.imgNaturalHeight * 0.14, width: boxW, height: boxH },
          { id: 'tag_1', type: 'badge', x: state.imgNaturalWidth * 0.36, y: state.imgNaturalHeight * 0.08, text: '110m', colorTheme: 'yellow', scale: 1.15 },

          { id: 'b_dot2', type: 'box_dot', x: state.imgNaturalWidth * 0.13, y: state.imgNaturalHeight * 0.53, width: boxW, height: boxH },
          { id: 'tag_2', type: 'badge', x: state.imgNaturalWidth * 0.23, y: state.imgNaturalHeight * 0.54, text: '110m', colorTheme: 'yellow', scale: 1.15 },

          { id: 'b_dot3', type: 'box_dot', x: state.imgNaturalWidth * 0.81, y: state.imgNaturalHeight * 0.21, width: boxW, height: boxH },
          { id: 'tag_3', type: 'badge', x: state.imgNaturalWidth * 0.90, y: state.imgNaturalHeight * 0.25, text: '110m', colorTheme: 'yellow', scale: 1.15 }
        ];

        deselectItem();
        render();
        fitToScreen();
        showToast('Đã nạp Mẫu 3: Tơ nhăn');
      });
    } else if (sampleKey === 'to_so_mau') {
      loadImageSource('assets/sample_so_mau.png', () => {
        state.currentTool = 'box_dot';
        syncToolUI('box_dot');
        state.currentQty = '110m';
        syncTextUI('110m');

        state.banner.enabled = true;
        toggleBanner.checked = true;
        state.banner.customer = 'C DUNG';
        state.banner.fabric = 'Tơ 11202-15#';
        state.banner.colorTheme = 'yellow';
        setColorDotActive(bannerColorDots, 'yellow');
        inputCustomer.value = state.banner.customer;
        inputFabric.value = state.banner.fabric;

        state.priceBanner.enabled = true;
        togglePriceBanner.checked = true;
        state.priceBanner.line1 = 'ord mẫu: 85k/m';
        state.priceBanner.line2 = 'sỉ 70k/m';
        state.priceBanner.colorTheme = 'yellow';
        setColorDotActive(priceColorDots, 'yellow');
        inputPriceLine1.value = state.priceBanner.line1;
        inputPriceLine2.value = state.priceBanner.line2;

        state.banner.x = state.imgNaturalWidth * 0.72;
        state.banner.y = state.imgNaturalHeight * 0.45;
        state.priceBanner.x = state.imgNaturalWidth * 0.08;
        state.priceBanner.y = state.imgNaturalHeight * 0.05;

        const boxW = state.imgNaturalWidth * 0.18;
        const boxH = state.imgNaturalHeight * 0.075;

        state.items = [
          { id: 'box1', type: 'box', x: state.imgNaturalWidth * 0.35, y: state.imgNaturalHeight * 0.23, width: boxW * 0.7, height: boxH },
          { id: 'tag1', type: 'badge', x: state.imgNaturalWidth * 0.44, y: state.imgNaturalHeight * 0.21, text: '110m', colorTheme: 'yellow', scale: 1.1 },

          { id: 'box2', type: 'box_dot', x: state.imgNaturalWidth * 0.55, y: state.imgNaturalHeight * 0.36, width: boxW, height: boxH },
          { id: 'tag2', type: 'badge', x: state.imgNaturalWidth * 0.64, y: state.imgNaturalHeight * 0.33, text: '110m', colorTheme: 'yellow', scale: 1.1 },

          { id: 'box3', type: 'box_dot', x: state.imgNaturalWidth * 0.57, y: state.imgNaturalHeight * 0.80, width: boxW, height: boxH },
          { id: 'tag3', type: 'badge', x: state.imgNaturalWidth * 0.71, y: state.imgNaturalHeight * 0.76, text: '110m', colorTheme: 'yellow', scale: 1.1 }
        ];

        deselectItem();
        render();
        fitToScreen();
        showToast('Đã nạp Mẫu 4: Tơ sổ mẫu');
      });
    } else if (sampleKey === 'to_loai1') {
      loadImageSource('assets/sample_to_loai1.png', () => {
        state.currentTool = 'box';
        syncToolUI('box');
        state.currentQty = '50m';
        syncTextUI('50m');

        state.banner.enabled = true;
        toggleBanner.checked = true;
        state.banner.customer = 'LA BOU';
        state.banner.fabric = '26.09.26';
        state.banner.colorTheme = 'yellow';
        setColorDotActive(bannerColorDots, 'yellow');
        inputCustomer.value = state.banner.customer;
        inputFabric.value = state.banner.fabric;

        state.priceBanner.enabled = true;
        togglePriceBanner.checked = true;
        state.priceBanner.line1 = 'sỉ 45/m';
        state.priceBanner.line2 = 'mẫu 75k/m';
        state.priceBanner.colorTheme = 'yellow';
        setColorDotActive(priceColorDots, 'yellow');
        inputPriceLine1.value = state.priceBanner.line1;
        inputPriceLine2.value = state.priceBanner.line2;

        state.banner.x = state.imgNaturalWidth * 0.55;
        state.banner.y = state.imgNaturalHeight * 0.73;
        state.priceBanner.x = state.imgNaturalWidth * 0.04;
        state.priceBanner.y = state.imgNaturalHeight * 0.10;

        const boxW = state.imgNaturalWidth * 0.18;
        const boxH = state.imgNaturalHeight * 0.15;

        state.items = [
          { id: 'box1', type: 'box', x: state.imgNaturalWidth * 0.57, y: state.imgNaturalHeight * 0.65, width: boxW, height: boxH },
          { id: 'tag1', type: 'badge', x: state.imgNaturalWidth * 0.68, y: state.imgNaturalHeight * 0.54, text: '6m', colorTheme: 'yellow', scale: 1.5 }
        ];

        deselectItem();
        render();
        fitToScreen();
        showToast('Đã nạp Mẫu 5: Tơ loại 1');
      });
    }
  }

  function syncToolUI(tool) {
    state.currentTool = tool;
    toolButtons.forEach(b => b.classList.toggle('active', b.dataset.tool === tool));
    miniToolButtons.forEach(b => b.classList.toggle('active', b.dataset.miniTool === tool));
  }

  function syncTextUI(text) {
    state.currentQty = text;
    primaryTextInput.value = text;
    canvasTopTextInput.value = text;
    floatingTextInput.value = text;
    chipQtyButtons.forEach(b => b.classList.toggle('active', b.dataset.text === text));
  }

  function setColorDotActive(dots, color) {
    dots.forEach(d => {
      d.classList.toggle('active', (d.dataset.color || d.dataset.priceColor) === color);
    });
  }

  // Load File
  function handleFileSelect(e) {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  }

  function loadFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh hợp lệ', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      loadImageSource(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function loadImageSource(src, callback) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      state.img = img;
      state.imgSrc = src;
      state.imgNaturalWidth = img.naturalWidth;
      state.imgNaturalHeight = img.naturalHeight;

      const baseDim = Math.max(img.naturalWidth, img.naturalHeight);
      state.banner.fontSize = Math.round(baseDim * 0.026);
      state.priceBanner.fontSize = Math.round(baseDim * 0.024);

      if (!state.brandBadge.positioned) {
        state.brandBadge.x = img.naturalWidth * 0.04;
        state.brandBadge.y = img.naturalHeight * 0.88;
        state.brandBadge.positioned = true;
      }

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      if (!state.isRestoringSession) {
        state.currentSessionId = 'hist_' + Date.now();
      }
      state.isRestoringSession = false;

      updateImageLoadedUI();
      render();
      fitToScreen();
      scheduleSaveImageHistory();
      if (callback) callback();
      else showToast('✓ Đã nạp ảnh thành công!');
    };
    img.onerror = () => {
      showToast('Không thể tải ảnh. Vui lòng thử lại.', 'error');
    };
    img.src = src;
  }

  // Zoom
  function setZoom(val) {
    val = Math.max(0.25, Math.min(2.5, val));
    state.zoom = val;
    canvasWrapper.style.transform = `scale(${state.zoom})`;
    zoomLevelText.textContent = `${Math.round(state.zoom * 100)}%`;
    hideFloatingCard();
  }

  function fitToScreen() {
    if (!state.img) return;
    const padding = 60;
    const availableWidth = viewport.clientWidth - padding;
    const availableHeight = viewport.clientHeight - padding;

    const scaleX = availableWidth / state.imgNaturalWidth;
    const scaleY = availableHeight / state.imgNaturalHeight;
    const optimalZoom = Math.min(scaleX, scaleY, 1.0);

    setZoom(optimalZoom);
  }

  // Order text parser
  function parseOrderText() {
    const text = orderPasteInput.value.trim();
    if (!text) return;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    let customerName = '';
    let fabricName = '';
    const items = [];
    const qtyRegex = /(\d+)\s*(c|cây|cay|m|mét|met|kg|kg vải)?/i;

    lines.forEach((line, index) => {
      if (index === 0 && (line.match(/^(c\s|chị|anh|a\s|khách|k\s|em)/i) || !line.includes(':'))) {
        customerName = line;
        return;
      }
      if (index === 1 && (line.match(/(thun|loang|cotton|vải|vai|mã|bố|tơ|#|\d{3,})/i) || !line.match(/\d+\s*(cây|c|m|kg)/i))) {
        fabricName = line;
        return;
      }

      const match = line.match(qtyRegex);
      let qty = '1c';
      let name = line;

      if (match) {
        const unit = match[2] ? (match[2].toLowerCase().startsWith('m') ? 'm' : 'c') : 'c';
        qty = `${match[1]}${unit}`;
        name = line.replace(match[0], '').replace(/[:\-]/g, '').trim();
      }

      items.push({
        id: `parsed-${index}`,
        fullName: line,
        name: name || line,
        qty: qty
      });
    });

    if (customerName) {
      state.banner.customer = customerName;
      inputCustomer.value = customerName;
    }
    if (fabricName) {
      state.banner.fabric = fabricName;
      inputFabric.value = fabricName;
    }

    state.parsedItems = items;
    renderOrderChips();
    render();
    showToast(`Đã phân tích ${items.length} mục từ đơn`);
  }

  function renderOrderChips() {
    orderChipsList.innerHTML = '';
    state.parsedItems.forEach((item) => {
      const chip = document.createElement('button');
      chip.className = 'order-chip';
      chip.innerHTML = `
        <span>${item.name}</span>
        <span class="chip-qty">${item.qty}</span>
      `;
      chip.addEventListener('click', () => {
        syncTextUI(item.qty);
        document.querySelectorAll('.order-chip').forEach(c => c.classList.remove('selected'));
        chip.classList.add('selected');
        showToast(`Đã chọn [${item.name} - ${item.qty}]. Bấm lên ảnh để dán!`);
      });
      orderChipsList.appendChild(chip);
    });
  }

  // Pointer & Touch
  function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function handlePointerDown(e) {
    if (!state.img) return;

    // Pan viewport khi giữ Space hoặc bấm chuột giữa hoặc đang chọn Tool Hand (H)
    if (state.spacePressed || e.button === 1 || state.currentTool === 'hand') {
      state.isPanning = true;
      state.panStart = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }

    const pos = getCanvasCoords(e);
    handleInteractionStart(pos, e);
  }

  function handleDoubleClick(e) {
    if (!state.img) return;
    const pos = getCanvasCoords(e);
    const item = findItemAt(pos);
    if (!item) return;

    selectItem(item.id);
    if (item.type === 'badge') {
      floatingEditCard.classList.remove('hidden');
      updateFloatingCardPosition(item);
      floatingTextInput.focus();
      floatingTextInput.select();
      showToast('✏️ Gõ chữ mới & bấm Enter để lưu');
    } else {
      primaryTextInput.focus();
      primaryTextInput.select();
      showToast('✏️ Đã chọn phần tử để chỉnh sửa');
    }
  }

  function handleTouchStart(e) {
    if (!state.img) return;
    if (state.currentTool === 'hand' && e.touches.length === 1) {
      state.isPanning = true;
      state.panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      e.preventDefault();
      return;
    }
    if (e.touches.length === 1) {
      const pos = getCanvasCoords(e);
      handleInteractionStart(pos, e);
    }
  }

  function handleInteractionStart(pos, originalEvent) {
    // 1. Check Banner 1
    if (state.banner.enabled && isInsideBox(pos, state.banner)) {
      saveHistory();
      state.isDragging = true;
      state.selectedId = 'banner';
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...state.banner };
      if (originalEvent.cancelable) originalEvent.preventDefault();
      render();
      return;
    }

    // 2. Check Banner 2
    if (state.priceBanner.enabled && isInsideBox(pos, state.priceBanner)) {
      saveHistory();
      state.isDragging = true;
      state.selectedId = 'priceBanner';
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...state.priceBanner };
      if (originalEvent.cancelable) originalEvent.preventDefault();
      render();
      return;
    }

    // 2.5 Check Brand Badge
    if (state.brandBadge.enabled && isInsideBox(pos, state.brandBadge)) {
      saveHistory();
      state.isDragging = true;
      state.selectedId = 'brandBadge';
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...state.brandBadge };
      if (originalEvent.cancelable) originalEvent.preventDefault();
      render();
      return;
    }

    // 2.7 Check Fabric Specs Card
    if (state.fabricSpecs && state.fabricSpecs.enabled && isInsideBox(pos, state.fabricSpecs)) {
      saveHistory();
      state.isDragging = true;
      state.selectedId = 'fabricSpecs';
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...state.fabricSpecs };
      if (originalEvent.cancelable) originalEvent.preventDefault();
      render();
      return;
    }

    // 3. Check Resize Handle of selected Box
    const selected = getSelectedItem();
    if (selected && (selected.type === 'box' || selected.type === 'box_dot')) {
      const handle = hitTestResizeHandle(pos, selected);
      if (handle) {
        saveHistory();
        state.isDragging = true;
        state.selectedHandle = handle;
        state.dragStartPos = pos;
        state.dragOriginalItem = { ...selected };
        if (originalEvent.cancelable) originalEvent.preventDefault();
        return;
      }
    }

    // 4. Check Resize Handle of selected Badge (4 corner handles to pull scale!)
    if (selected && selected.type === 'badge') {
      const badgeHandle = hitTestBadgeScaleHandle(pos, selected);
      if (badgeHandle) {
        saveHistory();
        state.isDragging = true;
        state.selectedHandle = badgeHandle;
        state.dragStartPos = pos;
        state.dragOriginalItem = { ...selected };
        if (originalEvent.cancelable) originalEvent.preventDefault();
        return;
      }
    }

    // 4.5 Check Handle of selected Arrow (head or tail)
    if (selected && selected.type === 'arrow') {
      const arrowHandle = hitTestArrowHandle(pos, selected);
      if (arrowHandle) {
        saveHistory();
        state.isDragging = true;
        state.selectedHandle = arrowHandle;
        state.dragStartPos = pos;
        state.dragOriginalItem = { ...selected };
        if (originalEvent.cancelable) originalEvent.preventDefault();
        return;
      }
    }

    // 4.6 Check Resize Handle of selected Overlay Image
    if (selected && selected.type === 'overlay_image') {
      const overlayHandle = hitTestOverlayResizeHandle(pos, selected);
      if (overlayHandle) {
        saveHistory();
        state.isDragging = true;
        state.selectedHandle = overlayHandle;
        state.dragStartPos = pos;
        state.dragOriginalItem = { ...selected };
        if (originalEvent.cancelable) originalEvent.preventDefault();
        return;
      }
    }

    // 5. Check existing item
    const clickedItem = findItemAt(pos);
    if (clickedItem) {
      saveHistory();
      state.isDragging = true;
      state.selectedHandle = null;
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...clickedItem };
      selectItem(clickedItem.id);
      if (originalEvent.cancelable) originalEvent.preventDefault();
      return;
    }

    // 6. Clicked empty spot
    if (!floatingEditCard.classList.contains('hidden')) {
      floatingEditCard.classList.add('hidden');
      state.selectedId = null;
      render();
      return;
    }

    // NẾU ĐANG Ở CÔNG CỤ CON TRỎ CHỌN (select):
    // Chỉ bỏ chọn đối tượng (Deselect), TUYỆT ĐỐI KHÔNG DÁN THÊM ELEMENT!
    if (state.currentTool === 'select') {
      deselectItem();
      render();
      return;
    }

    saveHistory();
    const baseW = canvas.width * 0.13;
    const baseH = canvas.height * 0.10;
    const activeText = state.currentQty || '50m';
    const activeBadgeScale = parseFloat(sidebarBadgeScaleSlider.value) / 100 || 1.0;

    if (state.currentTool === 'tick') {
      const newTick = {
        id: 'tick_' + Date.now(),
        type: 'tick',
        x: pos.x,
        y: pos.y,
        scale: 1.0
      };
      state.items.push(newTick);
      selectItem(newTick.id);
      showToast('Đã dán Tick đỏ');
    } else if (state.currentTool === 'box') {
      const newBox = {
        id: 'box_' + Date.now(),
        type: 'box',
        x: pos.x,
        y: pos.y,
        width: baseW,
        height: baseH
      };
      state.items.push(newBox);
      selectItem(newBox.id);
      showToast('Đã dán Khung đỏ');
    } else if (state.currentTool === 'box_dot') {
      const newBoxDot = {
        id: 'box_dot_' + Date.now(),
        type: 'box_dot',
        x: pos.x,
        y: pos.y,
        width: baseW,
        height: baseH
      };
      state.items.push(newBoxDot);
      selectItem(newBoxDot.id);
      showToast('Đã dán Khung + Chấm đỏ');
    } else if (state.currentTool === 'badge') {
      const newBadge = {
        id: 'badge_' + Date.now(),
        type: 'badge',
        x: pos.x,
        y: pos.y,
        text: activeText,
        colorTheme: 'yellow',
        scale: activeBadgeScale
      };
      state.items.push(newBadge);
      selectItem(newBadge.id);
      showToast(`Đã dán Thẻ chữ [${newBadge.text}]`);
    } else if (state.currentTool === 'combo') {
      const boxId = 'box_' + Date.now();
      const newBox = {
        id: boxId,
        type: 'box',
        x: pos.x,
        y: pos.y,
        width: baseW,
        height: baseH
      };
      const newBadge = {
        id: 'badge_' + Date.now(),
        type: 'badge',
        x: pos.x + baseW * 0.5 + 20,
        y: pos.y - baseH * 0.35,
        text: activeText,
        colorTheme: 'yellow',
        scale: activeBadgeScale
      };
      state.items.push(newBox, newBadge);
      selectItem(newBadge.id);
      showToast('Đã dán Khung & Thẻ');
    } else if (state.currentTool === 'arrow') {
      const arrowLen = Math.max(70, canvas.width * 0.08);
      const newArrow = {
        id: 'arrow_' + Date.now(),
        type: 'arrow',
        x: pos.x,
        y: pos.y,
        dx: -arrowLen * 0.85,
        dy: -arrowLen * 0.55,
        colorTheme: 'red',
        scale: 1.0,
        text: ''
      };
      state.items.push(newArrow);
      selectItem(newArrow.id);
      showToast('Đã dán Mũi tên chỉ điểm');
    }

    state.isDragging = true;
    state.dragStartPos = pos;
    state.dragOriginalItem = { ...getSelectedItem() };

    // TỰ ĐỘNG CHUYỂN VỀ CON TRỎ CHỌN sau khi dán xong tem (nếu bật autoRevertSelect và không giữ Shift)
    if (state.autoRevertSelect && !originalEvent.shiftKey) {
      setActiveTool('select');
      showToast('✓ Đã dán tem! Tự về Con trỏ Chọn để bạn dễ kéo/sửa (Bấm 1-5 để dán tiếp)');
    }

    render();
    if (originalEvent.cancelable) originalEvent.preventDefault();
  }

  function handlePointerMove(e) {
    if (state.isPanning) {
      const dx = e.clientX - state.panStart.x;
      const dy = e.clientY - state.panStart.y;
      viewport.scrollLeft -= dx;
      viewport.scrollTop -= dy;
      state.panStart = { x: e.clientX, y: e.clientY };
      return;
    }

    const pos = getCanvasCoords(e);
    updateCursor(pos);

    if (!state.isDragging || !state.dragOriginalItem) return;
    handleInteractionMove(pos);
  }

  function handleTouchMove(e) {
    if (state.isPanning && e.touches.length === 1) {
      const dx = e.touches[0].clientX - state.panStart.x;
      const dy = e.touches[0].clientY - state.panStart.y;
      viewport.scrollLeft -= dx;
      viewport.scrollTop -= dy;
      state.panStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      if (e.cancelable) e.preventDefault();
      return;
    }
    if (!state.isDragging || !state.dragOriginalItem) return;
    if (e.touches.length === 1) {
      const pos = getCanvasCoords(e);
      handleInteractionMove(pos);
      if (e.cancelable) e.preventDefault();
    }
  }

  function handleInteractionMove(pos) {
    const dx = pos.x - state.dragStartPos.x;
    const dy = pos.y - state.dragStartPos.y;

    if (state.selectedId === 'banner') {
      state.banner.x = state.dragOriginalItem.x + dx;
      state.banner.y = state.dragOriginalItem.y + dy;
      render();
      return;
    }

    if (state.selectedId === 'priceBanner') {
      state.priceBanner.x = state.dragOriginalItem.x + dx;
      state.priceBanner.y = state.dragOriginalItem.y + dy;
      render();
      return;
    }

    if (state.selectedId === 'brandBadge') {
      state.brandBadge.x = state.dragOriginalItem.x + dx;
      state.brandBadge.y = state.dragOriginalItem.y + dy;
      render();
      return;
    }

    if (state.selectedId === 'fabricSpecs') {
      state.fabricSpecs.x = state.dragOriginalItem.x + dx;
      state.fabricSpecs.y = state.dragOriginalItem.y + dy;
      render();
      return;
    }

    const item = getSelectedItem();
    if (!item) return;

    if (state.selectedHandle) {
      if (item.type === 'box' || item.type === 'box_dot') {
        const orig = state.dragOriginalItem;
        const h = state.selectedHandle;

        if (h === 'r' || h === 'tr' || h === 'br') item.width = Math.max(30, orig.width + dx * 2);
        if (h === 'l' || h === 'tl' || h === 'bl') item.width = Math.max(30, orig.width - dx * 2);
        if (h === 'b' || h === 'bl' || h === 'br') item.height = Math.max(30, orig.height + dy * 2);
        if (h === 't' || h === 'tl' || h === 'tr') item.height = Math.max(30, orig.height - dy * 2);

        frameWSlider.value = Math.round(item.width);
        frameHSlider.value = Math.round(item.height);
        frameWVal.textContent = `${Math.round(item.width)}px`;
        frameHVal.textContent = `${Math.round(item.height)}px`;
      } else if (item.type === 'badge') {
        // Dragging corner of badge directly scales it!
        const orig = state.dragOriginalItem;
        const scaleFactor = 1 + (dx / (canvas.width * 0.15));
        const newScale = Math.max(0.4, Math.min(3.5, (orig.scale || 1.0) * scaleFactor));
        item.scale = newScale;

        const roundedPercent = Math.round(newScale * 100);
        floatingSizeSlider.value = roundedPercent;
        floatingSizeVal.textContent = `${roundedPercent}%`;
        sidebarBadgeScaleSlider.value = roundedPercent;
        sidebarBadgeScaleVal.textContent = `${roundedPercent}%`;
        updateFloatingCardPosition(item);
      } else if (item.type === 'arrow') {
        const orig = state.dragOriginalItem;
        if (state.selectedHandle === 'arrow_head') {
          // Dragging head: moves head, tail stays at fixed position (orig.x + orig.dx)
          item.x = orig.x + dx;
          item.y = orig.y + dy;
          item.dx = (orig.x + orig.dx) - item.x;
          item.dy = (orig.y + orig.dy) - item.y;
        } else if (state.selectedHandle === 'arrow_tail') {
          // Dragging tail: head stays fixed, tail moves
          item.dx = orig.dx + dx;
          item.dy = orig.dy + dy;
        }
      } else if (item.type === 'overlay_image') {
        const orig = state.dragOriginalItem;
        const origScale = orig.scale || 1.0;
        const scaleFactor = 1 + (dx / (canvas.width * 0.2));
        const newScale = Math.max(0.2, Math.min(4.0, origScale * scaleFactor));
        item.scale = newScale;
        if (overlaySizeSlider) {
          const pct = Math.round(newScale * 100);
          overlaySizeSlider.value = pct;
          if (overlaySizeVal) overlaySizeVal.textContent = `${pct}%`;
        }
      }
    } else {
      // MOVING Item
      item.x = state.dragOriginalItem.x + dx;
      item.y = state.dragOriginalItem.y + dy;
      if (item.type === 'badge') {
        updateFloatingCardPosition(item);
      }
    }

    render();
  }

  function handlePointerUp() {
    if (state.isPanning) {
      state.isPanning = false;
      canvas.style.cursor = (state.spacePressed || state.currentTool === 'hand') ? 'grab' : (state.currentTool === 'select' ? 'default' : 'crosshair');
    }
    state.isDragging = false;
    state.selectedHandle = null;
    state.dragOriginalItem = null;
  }

  function handleTouchEnd() {
    state.isPanning = false;
    state.isDragging = false;
    state.selectedHandle = null;
    state.dragOriginalItem = null;
  }

  function isInsideBox(pos, box) {
    if (!box) return false;
    return (
      pos.x >= box.x &&
      pos.x <= box.x + box.width &&
      pos.y >= box.y &&
      pos.y <= box.y + box.height
    );
  }

  function findItemAt(pos) {
    for (let i = state.items.length - 1; i >= 0; i--) {
      const it = state.items[i];
      if (it.type === 'box' || it.type === 'box_dot') {
        const halfW = it.width / 2;
        const halfH = it.height / 2;
        if (pos.x >= it.x - halfW && pos.x <= it.x + halfW &&
            pos.y >= it.y - halfH && pos.y <= it.y + halfH) {
          return it;
        }
      } else if (it.type === 'badge') {
        const dims = getBadgeDimensions(it);
        const halfW = dims.badgeW / 2;
        const halfH = dims.badgeH / 2;

        if (pos.x >= it.x - halfW && pos.x <= it.x + halfW &&
            pos.y >= it.y - halfH && pos.y <= it.y + halfH) {
          return it;
        }
      } else if (it.type === 'overlay_image') {
        const scale = it.scale || 1.0;
        const halfW = ((it.width || 200) * scale) / 2;
        const halfH = ((it.height || 150) * scale) / 2;
        if (pos.x >= it.x - halfW && pos.x <= it.x + halfW &&
            pos.y >= it.y - halfH && pos.y <= it.y + halfH) {
          return it;
        }
      } else if (it.type === 'tick') {
        const threshold = canvas.width * 0.045 * (it.scale || 1.0);
        if (Math.hypot(pos.x - it.x, pos.y - it.y) <= threshold) {
          return it;
        }
      } else if (it.type === 'arrow') {
        const head = { x: it.x, y: it.y };
        const tail = { x: it.x + (it.dx !== undefined ? it.dx : -65), y: it.y + (it.dy !== undefined ? it.dy : -55) };
        const d = distToSegment(pos, head, tail);
        const threshold = Math.max(16, canvas.width * 0.024 * (it.scale || 1.0));
        if (d <= threshold) {
          return it;
        }
      }
    }
    return null;
  }

  function distToSegment(p, v, w) {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  }

  function hitTestArrowHandle(pos, arrowItem) {
    const handleRadius = Math.max(14, canvas.width * 0.016);
    const head = { x: arrowItem.x, y: arrowItem.y };
    const tail = { x: arrowItem.x + (arrowItem.dx !== undefined ? arrowItem.dx : -65), y: arrowItem.y + (arrowItem.dy !== undefined ? arrowItem.dy : -55) };
    if (Math.hypot(pos.x - head.x, pos.y - head.y) <= handleRadius * 1.5) return 'arrow_head';
    if (Math.hypot(pos.x - tail.x, pos.y - tail.y) <= handleRadius * 1.5) return 'arrow_tail';
    return null;
  }

  function hitTestResizeHandle(pos, boxItem) {
    const halfW = boxItem.width / 2;
    const halfH = boxItem.height / 2;
    const handleRadius = Math.max(8, canvas.width * 0.012);

    const handles = {
      tl: { x: boxItem.x - halfW, y: boxItem.y - halfH },
      tr: { x: boxItem.x + halfW, y: boxItem.y - halfH },
      bl: { x: boxItem.x - halfW, y: boxItem.y + halfH },
      br: { x: boxItem.x + halfW, y: boxItem.y + halfH },
      t:  { x: boxItem.x, y: boxItem.y - halfH },
      b:  { x: boxItem.x, y: boxItem.y + halfH },
      l:  { x: boxItem.x - halfW, y: boxItem.y },
      r:  { x: boxItem.x + halfW, y: boxItem.y }
    };

    for (const [key, p] of Object.entries(handles)) {
      if (Math.hypot(pos.x - p.x, pos.y - p.y) <= handleRadius * 1.5) {
        return key;
      }
    }
    return null;
  }

  function hitTestBadgeScaleHandle(pos, badgeItem) {
    const dims = getBadgeDimensions(badgeItem);
    const halfW = dims.badgeW / 2;
    const halfH = dims.badgeH / 2;

    const handleRadius = Math.max(8, canvas.width * 0.012);
    const corners = {
      tl: { x: badgeItem.x - halfW, y: badgeItem.y - halfH },
      tr: { x: badgeItem.x + halfW, y: badgeItem.y - halfH },
      bl: { x: badgeItem.x - halfW, y: badgeItem.y + halfH },
      br: { x: badgeItem.x + halfW, y: badgeItem.y + halfH }
    };

    for (const [key, p] of Object.entries(corners)) {
      if (Math.hypot(pos.x - p.x, pos.y - p.y) <= handleRadius * 1.5) {
        return key;
      }
    }
    return null;
  }

  function hitTestOverlayResizeHandle(pos, overlayItem) {
    const scale = overlayItem.scale || 1.0;
    const halfW = ((overlayItem.width || 200) * scale) / 2;
    const halfH = ((overlayItem.height || 150) * scale) / 2;
    const handleRadius = Math.max(8, canvas.width * 0.012);

    const corners = {
      tl: { x: overlayItem.x - halfW, y: overlayItem.y - halfH },
      tr: { x: overlayItem.x + halfW, y: overlayItem.y - halfH },
      bl: { x: overlayItem.x - halfW, y: overlayItem.y + halfH },
      br: { x: overlayItem.x + halfW, y: overlayItem.y + halfH }
    };

    for (const [key, p] of Object.entries(corners)) {
      if (Math.hypot(pos.x - p.x, pos.y - p.y) <= handleRadius * 1.5) {
        return key;
      }
    }
    return null;
  }

  function updateCursor(pos) {
    if (state.spacePressed || state.currentTool === 'hand') {
      canvas.style.cursor = state.isPanning ? 'grabbing' : 'grab';
      return;
    }
    const selected = getSelectedItem();
    if (selected && (selected.type === 'box' || selected.type === 'box_dot')) {
      const handle = hitTestResizeHandle(pos, selected);
      if (handle) {
        const cursors = {
          tl: 'nwse-resize', br: 'nwse-resize',
          tr: 'nesw-resize', bl: 'nesw-resize',
          t: 'ns-resize', b: 'ns-resize',
          l: 'ew-resize', r: 'ew-resize'
        };
        canvas.style.cursor = cursors[handle];
        return;
      }
    }

    if (selected && selected.type === 'badge') {
      const badgeHandle = hitTestBadgeScaleHandle(pos, selected);
      if (badgeHandle) {
        canvas.style.cursor = 'nwse-resize';
        return;
      }
    }

    if (selected && selected.type === 'arrow') {
      const arrowHandle = hitTestArrowHandle(pos, selected);
      if (arrowHandle) {
        canvas.style.cursor = 'crosshair';
        return;
      }
    }

    if (findItemAt(pos) || 
        (state.banner.enabled && isInsideBox(pos, state.banner)) || 
        (state.priceBanner.enabled && isInsideBox(pos, state.priceBanner)) ||
        (state.fabricSpecs && state.fabricSpecs.enabled && isInsideBox(pos, state.fabricSpecs)) ||
        (state.brandBadge.enabled && isInsideBox(pos, state.brandBadge))) {
      canvas.style.cursor = 'move';
    } else {
      canvas.style.cursor = state.currentTool === 'select' ? 'default' : 'crosshair';
    }
  }

  // ==========================================
  // RENDERING ENGINE
  // ==========================================
  function render() {
    if (!state.img) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw base photo
    ctx.drawImage(state.img, 0, 0);

    // 2. Draw Banner 1
    if (state.banner.enabled) {
      drawBanner(state.banner, state.selectedId === 'banner');
    }

    // 3. Draw Banner 2 (Price)
    if (state.priceBanner.enabled) {
      drawPriceBanner(state.priceBanner, state.selectedId === 'priceBanner');
    }

    // 3.4 Draw Fabric Specifications Card
    if (state.fabricSpecs && state.fabricSpecs.enabled) {
      drawFabricSpecs(state.fabricSpecs, state.selectedId === 'fabricSpecs');
    }

    // 3.5 Draw Brand & Hotline Badge (Thẻ thương hiệu góc ảnh)
    if (state.brandBadge.enabled) {
      drawBrandBadge(state.brandBadge, state.selectedId === 'brandBadge');
    }

    // 4. Draw all items
    state.items.forEach(item => {
      const isSelected = (state.selectedId === item.id);
      if (item.type === 'tick') {
        drawTick(item, isSelected);
      } else if (item.type === 'box' || item.type === 'box_dot') {
        drawBox(item, isSelected);
      } else if (item.type === 'badge') {
        drawBadge(item, isSelected);
      } else if (item.type === 'arrow') {
        drawArrow(item, isSelected);
      } else if (item.type === 'overlay_image') {
        drawOverlayImage(item, isSelected);
      }
    });

    // Update real-time summary in sidebar
    updateSidebarOrderSummary();
  }

  function drawBanner(b, isSelected) {
    const isRed = b.colorTheme === 'red';
    const bgColor = isRed ? '#e01a22' : '#ffd000';
    const textColor = isRed ? '#ffffff' : '#111827';

    const fontSize = b.fontSize * state.globalScale;
    const titleSize = fontSize * 1.15;
    const subSize = fontSize * 0.95;

    ctx.save();
    ctx.font = `bold ${titleSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const titleMetrics = ctx.measureText(b.customer || 'C Dung');

    ctx.font = `bold ${subSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const subMetrics = ctx.measureText(b.fabric || 'Tên vải');

    const padX = b.paddingX * state.globalScale;
    const padY = b.paddingY * state.globalScale;
    const gap = 8 * state.globalScale;

    // Tự động tính tổng đơn hàng trên ảnh
    const summary = calculateOrderSummary();
    const showSum = (b.showSummary !== false) && (summary.swatchCount > 0);
    const sumSize = fontSize * 0.82;
    let sumText = '';
    let sumMetricsWidth = 0;
    if (showSum && summary.summaryFormatted) {
      sumText = `⚡ Tổng: ${summary.summaryFormatted}`;
      ctx.font = `bold ${sumSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      sumMetricsWidth = ctx.measureText(sumText).width + 24 * state.globalScale;
    }

    const textWidth = Math.max(titleMetrics.width, subMetrics.width, sumMetricsWidth);
    const boxWidth = textWidth + padX * 2;
    const sumExtraHeight = showSum ? (sumSize + gap + 10 * state.globalScale) : 0;
    const boxHeight = titleSize + subSize + gap + padY * 2 + sumExtraHeight;

    b.width = boxWidth;
    b.height = boxHeight;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    roundRect(ctx, b.x, b.y, boxWidth, boxHeight, b.borderRadius * state.globalScale);
    ctx.fill();

    if (isSelected) {
      ctx.lineWidth = 2.5 * state.globalScale;
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();
    } else {
      ctx.lineWidth = 1.5 * state.globalScale;
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.stroke();
    }

    ctx.fillStyle = textColor;
    ctx.font = `bold ${titleSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(b.customer, b.x + boxWidth / 2, b.y + padY);

    ctx.font = `bold ${subSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText(b.fabric, b.x + boxWidth / 2, b.y + padY + titleSize + gap);

    if (showSum && sumText) {
      const sumPillY = b.y + padY + titleSize + gap + subSize + gap;
      const pillW = sumMetricsWidth;
      const pillH = sumSize + 10 * state.globalScale;
      const pillX = b.x + (boxWidth - pillW) / 2;

      // Dark contrasting pill inside banner
      ctx.fillStyle = isRed ? '#ffffff' : '#111827';
      ctx.beginPath();
      roundRect(ctx, pillX, sumPillY, pillW, pillH, 5 * state.globalScale);
      ctx.fill();

      ctx.fillStyle = isRed ? '#e01a22' : '#ffd000';
      ctx.font = `bold ${sumSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sumText, b.x + boxWidth / 2, sumPillY + pillH / 2);
    }

    ctx.restore();
  }

  function drawPriceBanner(b, isSelected) {
    const isYellow = b.colorTheme === 'yellow';
    const bgColor = isYellow ? '#ffd000' : '#e01a22';
    const textColor = isYellow ? '#111827' : '#ffffff';
    const fontSize = b.fontSize * state.globalScale;

    ctx.save();
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const line1Metrics = ctx.measureText(b.line1 || '');
    const line2Metrics = ctx.measureText(b.line2 || '');

    const padX = b.paddingX * state.globalScale;
    const padY = b.paddingY * state.globalScale;
    const gap = 6 * state.globalScale;

    const textWidth = Math.max(line1Metrics.width, line2Metrics.width);
    const boxWidth = textWidth + padX * 2;
    const hasLine2 = Boolean(b.line2 && b.line2.trim());
    const boxHeight = hasLine2 ? (fontSize * 2 + gap + padY * 2) : (fontSize + padY * 2);

    b.width = boxWidth;
    b.height = boxHeight;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    roundRect(ctx, b.x, b.y, boxWidth, boxHeight, b.borderRadius * state.globalScale);
    ctx.fill();

    if (isSelected) {
      ctx.lineWidth = 2.5 * state.globalScale;
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();
    } else {
      ctx.lineWidth = 1.5 * state.globalScale;
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.stroke();
    }

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(b.line1, b.x + boxWidth / 2, b.y + padY);

    if (hasLine2) {
      ctx.fillText(b.line2, b.x + boxWidth / 2, b.y + padY + fontSize + gap);
    }

    ctx.restore();
  }

  function drawBrandBadge(b, isSelected) {
    const scale = state.globalScale;
    const baseDim = Math.max(canvas.width, canvas.height);
    const fontSize = Math.max(16, Math.round(baseDim * 0.020 * scale));
    const phoneFontSize = Math.max(14, Math.round(baseDim * 0.017 * scale));

    ctx.save();

    // Measure texts
    ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const nameMetrics = ctx.measureText(b.name || 'Hương - Vải Lavie');
    ctx.font = `800 ${phoneFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const phoneText = `☎ ${b.phone || '0977.855.122'}`;
    const phoneMetrics = ctx.measureText(phoneText);

    const textWidth = Math.max(nameMetrics.width, phoneMetrics.width);
    const logoHeight = Math.round(fontSize * 2.3);
    const logoAspect = (brandLogoImg.complete && brandLogoImg.naturalWidth) 
      ? (brandLogoImg.naturalWidth / brandLogoImg.naturalHeight) 
      : 1.25;
    const logoWidth = Math.round(logoHeight * logoAspect);

    const padX = Math.round(20 * scale);
    const padY = Math.round(14 * scale);
    const gapLogo = Math.round(14 * scale);

    const boxWidth = padX * 2 + logoWidth + gapLogo + textWidth;
    const boxHeight = padY * 2 + Math.max(logoHeight, fontSize + phoneFontSize + 8 * scale);

    b.width = boxWidth;
    b.height = boxHeight;

    // Draw shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14 * scale;
    ctx.shadowOffsetY = 5 * scale;

    // Draw dark luxury pill/card background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.beginPath();
    roundRect(ctx, b.x, b.y, boxWidth, boxHeight, 10 * scale);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Gold luxury border
    ctx.lineWidth = (isSelected ? 3.5 : 2.0) * scale;
    ctx.strokeStyle = isSelected ? '#6366f1' : '#c5a059';
    ctx.stroke();

    // Draw Logo
    const logoX = b.x + padX;
    const logoY = b.y + (boxHeight - logoHeight) / 2;
    if (brandLogoImg.complete && brandLogoImg.naturalWidth) {
      ctx.drawImage(brandLogoImg, logoX, logoY, logoWidth, logoHeight);
    }

    // Text positions
    const textX = logoX + logoWidth + gapLogo;
    const line1Y = b.y + padY + fontSize * 0.85;
    const line2Y = line1Y + phoneFontSize + 8 * scale;

    // Line 1: Name (Gold)
    ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#f6d365';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(b.name || 'Hương - Vải Lavie', textX, line1Y);

    // Line 2: Phone (White & yellow)
    ctx.font = `800 ${phoneFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(phoneText, textX, line2Y);

    ctx.restore();
  }

  function drawTick(item, isSelected) {
    const scale = (item.scale || 1.0) * state.globalScale;
    const size = canvas.width * 0.055 * scale;

    ctx.save();
    ctx.translate(item.x, item.y);

    ctx.strokeStyle = '#e61924';
    ctx.lineWidth = size * 0.16;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = size * 0.08;
    ctx.shadowOffsetY = size * 0.04;

    ctx.beginPath();
    ctx.moveTo(-size * 0.55, -size * 0.15);
    ctx.quadraticCurveTo(-size * 0.42, size * 0.45, -size * 0.32, size * 0.52);
    ctx.quadraticCurveTo(-size * 0.1, size * 0.2, size * 0.35, -size * 0.85);
    ctx.stroke();

    if (isSelected) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.75, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawBox(item, isSelected) {
    const halfW = item.width / 2;
    const halfH = item.height / 2;
    const radius = Math.min(item.width, item.height) * 0.15;

    ctx.save();
    ctx.translate(item.x, item.y);

    ctx.strokeStyle = '#e61924';
    ctx.lineWidth = Math.max(3, item.width * 0.05);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.shadowColor = 'rgba(230, 25, 36, 0.4)';
    ctx.shadowBlur = item.width * 0.07;

    ctx.beginPath();
    roundRect(ctx, -halfW, -halfH, item.width, item.height, radius);
    ctx.stroke();

    if (item.type === 'box_dot') {
      ctx.fillStyle = '#e61924';
      ctx.beginPath();
      const dotR = Math.max(4, item.width * 0.06);
      ctx.arc(0, 0, dotR, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isSelected) {
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(-halfW - 4, -halfH - 4, item.width + 8, item.height + 8);
      ctx.setLineDash([]);

      const handleR = Math.max(5, canvas.width * 0.008);
      const points = [
        [-halfW, -halfH], [halfW, -halfH], [-halfW, halfH], [halfW, halfH],
        [0, -halfH], [0, halfH], [-halfW, 0], [halfW, 0]
      ];

      points.forEach(([hx, hy]) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(hx, hy, handleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  // Helper tính toán kích thước thẻ note đa dòng chuẩn xác
  function getBadgeDimensions(item) {
    const scale = (item.scale || 1.0) * state.globalScale;
    const baseSize = canvas.width * 0.052 * scale;
    const fontSize = baseSize * 0.65;
    const rawText = String(item.text !== undefined && item.text !== null ? item.text : '50m');
    const lines = rawText.split('\n');

    ctx.save();
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    let maxLineWidth = 0;
    for (const l of lines) {
      const w = ctx.measureText(l || ' ').width;
      if (w > maxLineWidth) maxLineWidth = w;
    }
    ctx.restore();

    const padX = baseSize * 0.32;
    const padY = baseSize * 0.20;
    const lineHeight = fontSize * 1.25;
    const textHeight = lines.length * lineHeight;
    const badgeW = maxLineWidth + padX * 2;
    const badgeH = textHeight + padY * 2;

    return { scale, baseSize, fontSize, lines, lineHeight, textHeight, padX, padY, badgeW, badgeH };
  }

  // Draw Badge with multiline support & corner handles when selected!
  function drawBadge(item, isSelected) {
    const dims = getBadgeDimensions(item);
    const { baseSize, fontSize, lines, lineHeight, textHeight, badgeW, badgeH } = dims;

    const isYellow = (item.colorTheme || 'yellow') === 'yellow';
    const bgColor = isYellow ? '#ffd000' : '#e01a22';
    const textColor = isYellow ? '#111827' : '#ffffff';

    ctx.save();
    ctx.translate(item.x, item.y);

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = baseSize * 0.1;
    ctx.shadowOffsetY = baseSize * 0.05;

    ctx.fillStyle = bgColor;
    ctx.beginPath();
    roundRect(ctx, -badgeW / 2, -badgeH / 2, badgeW, badgeH, baseSize * 0.08);
    ctx.fill();

    ctx.shadowColor = 'transparent';
    if (isSelected) {
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
    } else {
      ctx.strokeStyle = 'rgba(0,0,0,0.18)';
      ctx.lineWidth = baseSize * 0.03;
    }
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const startY = -textHeight / 2 + lineHeight / 2;
    lines.forEach((line, idx) => {
      ctx.fillText(line, 0, startY + idx * lineHeight + baseSize * 0.02);
    });

    // If selected: draw 4 corner handles so user can drag to resize badge!
    if (isSelected) {
      const handleR = Math.max(5, canvas.width * 0.007);
      const corners = [
        [-badgeW / 2, -badgeH / 2],
        [badgeW / 2, -badgeH / 2],
        [-badgeW / 2, badgeH / 2],
        [badgeW / 2, badgeH / 2]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, handleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    if (radius === undefined) radius = 5;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Draw Arrow Tool (Mũi tên chỉ điểm ô màu / chi tiết vải)
  function drawArrow(item, isSelected) {
    const scale = (item.scale || 1.0) * state.globalScale;
    const headX = item.x;
    const headY = item.y;
    const tailX = item.x + (item.dx !== undefined ? item.dx : -65);
    const tailY = item.y + (item.dy !== undefined ? item.dy : -55);

    const angle = Math.atan2(headY - tailY, headX - tailX);
    const length = Math.hypot(headX - tailX, headY - tailY);
    const arrowHeadLen = Math.max(18, Math.min(52, length * 0.38, canvas.width * 0.028 * scale));
    const lineWidth = Math.max(4.5, canvas.width * 0.0075 * scale);

    ctx.save();

    // Shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 3 * scale;

    const mainColor = item.colorTheme === 'yellow' ? '#ffd000' : '#e61924';
    ctx.strokeStyle = mainColor;
    ctx.fillStyle = mainColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Shaft line
    const shaftEndX = headX - Math.cos(angle) * (arrowHeadLen * 0.45);
    const shaftEndY = headY - Math.sin(angle) * (arrowHeadLen * 0.45);

    ctx.beginPath();
    ctx.moveTo(tailX, tailY);
    ctx.lineTo(shaftEndX, shaftEndY);
    ctx.stroke();

    // Arrowhead polygon
    const arrowAngle = Math.PI / 6.5; // ~28 degrees
    ctx.beginPath();
    ctx.moveTo(headX, headY);
    ctx.lineTo(
      headX - arrowHeadLen * Math.cos(angle - arrowAngle),
      headY - arrowHeadLen * Math.sin(angle - arrowAngle)
    );
    ctx.lineTo(
      headX - (arrowHeadLen * 0.72) * Math.cos(angle),
      headY - (arrowHeadLen * 0.72) * Math.sin(angle)
    );
    ctx.lineTo(
      headX - arrowHeadLen * Math.cos(angle + arrowAngle),
      headY - arrowHeadLen * Math.sin(angle + arrowAngle)
    );
    ctx.closePath();
    ctx.fill();

    // White outline for contrast
    ctx.shadowColor = 'transparent';
    ctx.lineWidth = Math.max(1.5, lineWidth * 0.35);
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Tail dot
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.arc(tailX, tailY, lineWidth * 1.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Selection handles
    if (isSelected) {
      const handleR = Math.max(7, canvas.width * 0.009);

      // Dashed guide line
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(headX, headY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Head handle (aiming target)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(headX, headY, handleR + 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#4f46e5';
      ctx.beginPath();
      ctx.arc(headX, headY, handleR * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Tail handle
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(tailX, tailY, handleR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Fabric Specs (Thẻ Thông Số Vải: Thành phần, Định lượng, Khổ vải)
  function drawFabricSpecs(s, isSelected) {
    if (!s || !s.enabled) return;

    const scale = state.globalScale;
    const baseDim = Math.max(canvas.width, canvas.height);
    const titleFontSize = Math.max(16, Math.round(baseDim * 0.019 * scale));
    const rowFontSize = Math.max(13, Math.round(baseDim * 0.015 * scale));

    const rows = [];
    if (s.composition && s.composition.trim()) rows.push({ icon: '🧪', label: 'Thành phần', val: s.composition.trim() });
    if (s.width && s.width.trim()) rows.push({ icon: '📏', label: 'Khổ vải', val: s.width.trim() });
    if (s.weight && s.weight.trim()) rows.push({ icon: '⚖️', label: 'Định lượng', val: s.weight.trim() });
    if (s.notes && s.notes.trim()) rows.push({ icon: '💡', label: 'Ghi chú', val: s.notes.trim() });

    if (rows.length === 0) return;

    ctx.save();

    ctx.font = `bold ${titleFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    let maxContentWidth = ctx.measureText('🧵 THÔNG TIN VẢI').width + 40 * scale;

    ctx.font = `500 ${rowFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    rows.forEach(r => {
      const w = ctx.measureText(`${r.icon} ${r.label}: ${r.val}`).width;
      if (w > maxContentWidth) maxContentWidth = w;
    });

    const padX = Math.round(18 * scale);
    const padY = Math.round(14 * scale);
    const rowGap = Math.round(8 * scale);
    const headerHeight = Math.round(titleFontSize + 12 * scale);

    const cardWidth = Math.round(maxContentWidth + padX * 2);
    const cardHeight = Math.round(padY * 2 + headerHeight + rows.length * (rowFontSize + rowGap));

    s.width = cardWidth;
    s.height = cardHeight;

    // Card background & shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 14 * scale;
    ctx.shadowOffsetY = 5 * scale;

    const isDark = (s.colorTheme || 'dark') === 'dark';
    ctx.fillStyle = isDark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(30, 58, 138, 0.95)';
    ctx.beginPath();
    roundRect(ctx, s.x, s.y, cardWidth, cardHeight, 10 * scale);
    ctx.fill();

    ctx.shadowColor = 'transparent';

    // Border
    ctx.lineWidth = (isSelected ? 3.0 : 1.5) * scale;
    ctx.strokeStyle = isSelected ? '#6366f1' : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(147, 197, 253, 0.4)');
    ctx.stroke();

    // Header Title
    ctx.font = `bold ${titleFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillStyle = isDark ? '#f6d365' : '#93c5fd';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('🧵 THÔNG TIN VẢI', s.x + padX, s.y + padY);

    // Divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x + padX, s.y + padY + headerHeight - 4 * scale);
    ctx.lineTo(s.x + cardWidth - padX, s.y + padY + headerHeight - 4 * scale);
    ctx.stroke();

    // Spec Rows
    let currentY = s.y + padY + headerHeight + 2 * scale;
    rows.forEach(r => {
      ctx.font = `600 ${rowFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillStyle = '#cbd5e1';
      const labelText = `${r.icon} ${r.label}: `;
      ctx.fillText(labelText, s.x + padX, currentY);

      const labelW = ctx.measureText(labelText).width;

      ctx.font = `bold ${rowFontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(r.val, s.x + padX + labelW, currentY);

      currentY += rowFontSize + rowGap;
    });

    ctx.restore();
  }

  // ============================================================
  // CÔNG THỨC QUY ĐỔI CHẤT LIỆU VẢI CHUẨN XÁC (Lavie Fabric Pro)
  // - Thun: 1 cây = 25kg
  // - Kaki / Cotton / Vải cứng: 1 cây = 130m
  // - Vải Tơ / Voan: 1 cây = 150m - 180m
  // - Tiêu chuẩn / Khác: 1 cây = 130m
  // ============================================================

  function detectFabricType(rawName) {
    if (state.fabricFormula && state.fabricFormula !== 'auto') {
      return state.fabricFormula;
    }
    const original = (rawName || state.banner.fabric || '').toLowerCase();
    const normalized = original.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // 1. Kaki / Cotton / Vải cứng (1 cây = 130m)
    if (/(kaki|khaki|cotton|cung|det thoi|\btho\b|kate|linen|dui|jean|denim|canvas|\bbo\b)/.test(normalized) && !/\bthun\b/.test(normalized)) {
      return 'kaki_cotton';
    }
    // 2. Vải Tơ / Voan (1 cây = 150m - 180m)
    if (/\b(to|voan|chiffon|lua|organza)\b/.test(normalized) || /(tơ|voan|chiffon|lụa|organza)/.test(original)) {
      return 'to_voan';
    }
    // 3. Vải Thun (1 cây = 25kg)
    if (/(thun|spandex|rib|borip|da ca|tici|cotton 4c|poly 4c|ni|len gan|pe|viscose|modal)/.test(normalized)) {
      return 'thun';
    }
    // 4. Mặc định / Tiêu chuẩn (1 cây = 130m)
    return 'standard';
  }

  // Bóc tách số lượng chuẩn từ text trên tem (tránh hiểu nhầm mã màu như "44" thành 44 cây)
  function parseNoteQuantity(text) {
    if (!text || typeof text !== 'string') return { trees: 1, meters: 0, kg: 0, isExplicit: false };
    const clean = text.trim();
    if (!clean) return { trees: 1, meters: 0, kg: 0, isExplicit: false };

    let meters = 0;
    let trees = 0;
    let kg = 0;
    let isExplicit = false;

    // 1. Match mét (ví dụ 50m, 100 mét, 12.5m)
    const meterMatches = clean.matchAll(/(?:^|[^\w])(\d+(?:[.,]\d+)?)\s*(?:m|mét|met)\b/gi);
    for (const m of meterMatches) {
      meters += parseFloat(m[1].replace(',', '.'));
      isExplicit = true;
    }

    // 2. Match kg (ví dụ 25kg, 50 kí, 10kg)
    const kgMatches = clean.matchAll(/(?:^|[^\w])(\d+(?:[.,]\d+)?)\s*(?:kg|kí|ký|kilo)\b/gi);
    for (const m of kgMatches) {
      kg += parseFloat(m[1].replace(',', '.'));
      isExplicit = true;
    }

    // 3. Match cây (ví dụ 1 cây, 2 cây, 1c, 2c, 1 cuộn)
    const treeMatches = clean.matchAll(/(?:^|[^\w])(\d+(?:[.,]\d+)?)\s*(?:cây|cay|cuộn|c)\b/gi);
    for (const m of treeMatches) {
      trees += parseFloat(m[1].replace(',', '.'));
      isExplicit = true;
    }

    // 4. Nếu không có đơn vị rõ ràng:
    if (!isExplicit) {
      // Phân biệt mã màu:
      // Ví dụ: #44, 44#, Màu 44, Mau 12, S5040, M02, hoặc chỉ số nguyên (như 44, 12, 108)
      // Trong ngành vải, số in trên bảng màu là số thứ tự màu.
      // Khi sale tick/gắn số này, số lượng mua là 1 cây!
      const isPureNumber = /^\d+$/.test(clean);
      if (isPureNumber) {
        const val = parseInt(clean, 10);
        // Nếu số <= 4 và người dùng gõ ngắn gọn (1, 2, 3): có thể là 1 cây, 2 cây
        if (val >= 1 && val <= 4) {
          trees = val;
        } else {
          // Số từ 5 trở lên (ví dụ: 44, 20, 108): 100% LÀ MÃ MÀU VẢI! => 1 cây
          trees = 1;
        }
      } else {
        // Có chữ hoặc ký tự khác (ví dụ: "Màu 44", "44#", "Đen", "S5040"): số lượng = 1 cây
        trees = 1;
      }
    }

    return { trees, meters, kg, isExplicit };
  }

  // Auto-Sum Order Calculation chuẩn xác theo từng loại chất liệu
  function calculateOrderSummary() {
    let treeCount = 0;
    let meterCount = 0;
    let kgCount = 0;
    let swatchCount = 0;

    state.items.forEach(item => {
      if (item.type === 'tick') {
        treeCount += 1;
        swatchCount += 1;
      } else if (item.type === 'badge') {
        swatchCount += 1;
        const q = parseNoteQuantity(item.text);
        treeCount += q.trees;
        meterCount += q.meters;
        kgCount += q.kg;
      } else if (item.type === 'box' || item.type === 'box_dot') {
        // Chỉ tính nếu không có thẻ chữ nằm ngay bên trong khung
        const hasNearbyBadge = state.items.some(
          b => b.type === 'badge' && Math.hypot(b.x - item.x, b.y - item.y) < Math.max(item.width, item.height) * 0.7
        );
        if (!hasNearbyBadge) {
          swatchCount += 1;
          treeCount += 1;
        }
      }
    });

    const fabricType = detectFabricType(state.banner.fabric);
    let summaryFormatted = '';
    let formulaHint = '';

    if (swatchCount === 0) {
      return {
        treeCount: 0,
        meterCount: 0,
        kgCount: 0,
        swatchCount: 0,
        fabricType,
        formulaHint: 'Chưa có màu nào được chấm',
        summaryFormatted: 'Chưa chấm màu nào'
      };
    }

    // 1. Vải Thun: 1 cây = 25kg
    if (fabricType === 'thun') {
      formulaHint = 'Quy chuẩn Thun: 1 cây = 25kg';
      if (treeCount > 0 && meterCount === 0 && kgCount === 0) {
        const eqKg = Math.round(treeCount * 25);
        summaryFormatted = `${treeCount} cây ≈ ${eqKg}kg (${swatchCount} màu)`;
      } else if (kgCount > 0 && treeCount === 0 && meterCount === 0) {
        const eqTrees = Math.round((kgCount / 25) * 10) / 10;
        summaryFormatted = `${kgCount}kg ≈ ${eqTrees} cây (${swatchCount} màu)`;
      } else if (treeCount > 0 && kgCount > 0) {
        const totalEqKg = Math.round(treeCount * 25 + kgCount);
        summaryFormatted = `${treeCount}c + ${kgCount}kg ≈ ${totalEqKg}kg (${swatchCount} màu)`;
      } else if (meterCount > 0) {
        summaryFormatted = `${treeCount > 0 ? `${treeCount} cây + ` : ''}${meterCount}m (${swatchCount} màu)`;
      } else {
        summaryFormatted = `${swatchCount} màu`;
      }
    } 
    // 2. Vải Tơ / Voan: 1 cây = 150m - 180m
    else if (fabricType === 'to_voan') {
      formulaHint = 'Quy chuẩn Tơ / Voan: 1 cây = 150m - 180m';
      if (treeCount > 0 && meterCount === 0 && kgCount === 0) {
        const minM = Math.round(treeCount * 150);
        const maxM = Math.round(treeCount * 180);
        summaryFormatted = `${treeCount} cây ≈ ${minM} - ${maxM}m (${swatchCount} màu)`;
      } else if (meterCount > 0 && treeCount === 0) {
        summaryFormatted = `${meterCount}m (${swatchCount} màu)`;
      } else if (treeCount > 0 && meterCount > 0) {
        const minM = Math.round(treeCount * 150 + meterCount);
        const maxM = Math.round(treeCount * 180 + meterCount);
        summaryFormatted = `${treeCount} cây + ${meterCount}m ≈ ${minM} - ${maxM}m (${swatchCount} màu)`;
      } else {
        summaryFormatted = `${swatchCount} màu`;
      }
    }
    // 3. Vải Kaki / Cotton / Cứng: 1 cây = 130m
    else if (fabricType === 'kaki_cotton') {
      formulaHint = 'Quy chuẩn Kaki / Cotton / Cứng: 1 cây = 130m';
      if (treeCount > 0 && meterCount === 0 && kgCount === 0) {
        const eqM = Math.round(treeCount * 130);
        summaryFormatted = `${treeCount} cây ≈ ${eqM}m (${swatchCount} màu)`;
      } else if (meterCount > 0 && treeCount === 0) {
        summaryFormatted = `${meterCount}m (${swatchCount} màu)`;
      } else if (treeCount > 0 && meterCount > 0) {
        const totalM = Math.round(treeCount * 130 + meterCount);
        summaryFormatted = `${treeCount} cây + ${meterCount}m ≈ ${totalM}m (${swatchCount} màu)`;
      } else {
        summaryFormatted = `${swatchCount} màu`;
      }
    }
    // 4. Mặc định / Tiêu chuẩn: 1 cây = 130m
    else {
      formulaHint = 'Quy chuẩn Tiêu chuẩn: 1 cây = 130m';
      if (treeCount > 0 && meterCount === 0 && kgCount === 0) {
        const eqM = Math.round(treeCount * 130);
        summaryFormatted = `${treeCount} cây ≈ ${eqM}m (${swatchCount} màu)`;
      } else if (meterCount > 0 && treeCount === 0) {
        summaryFormatted = `${meterCount}m (${swatchCount} màu)`;
      } else if (treeCount > 0 && meterCount > 0) {
        const totalM = Math.round(treeCount * 130 + meterCount);
        summaryFormatted = `${treeCount} cây + ${meterCount}m ≈ ${totalM}m (${swatchCount} màu)`;
      } else {
        summaryFormatted = `${swatchCount} màu`;
      }
    }

    return {
      treeCount,
      meterCount,
      kgCount,
      swatchCount,
      fabricType,
      formulaHint,
      summaryFormatted
    };
  }

  function updateSidebarOrderSummary() {
    const sumBadge = document.getElementById('live-order-sum-badge');
    const sumTextEl = document.getElementById('live-order-sum-text');
    const formulaHintEl = document.getElementById('live-order-formula-hint');
    const headerCounter = document.getElementById('header-order-counter');
    const headerCounterText = document.getElementById('header-counter-text');
    const fabricFormulaSelect = document.getElementById('fabric-formula-select');

    if (fabricFormulaSelect && state.fabricFormula && fabricFormulaSelect.value !== state.fabricFormula) {
      fabricFormulaSelect.value = state.fabricFormula;
    }

    const summary = calculateOrderSummary();
    if (summary.swatchCount === 0) {
      if (sumBadge) sumBadge.textContent = '0 màu';
      if (sumTextEl) sumTextEl.textContent = 'Chưa chấm màu nào';
      if (formulaHintEl) formulaHintEl.textContent = 'Quy chuẩn: Tự động theo loại vải';
      if (headerCounter) headerCounter.classList.remove('has-orders');
      if (headerCounterText) headerCounterText.textContent = '⚡ 0 màu';
      return;
    }

    if (sumBadge) sumBadge.textContent = `${summary.swatchCount} màu`;
    if (sumTextEl) sumTextEl.textContent = summary.summaryFormatted;
    if (formulaHintEl) formulaHintEl.textContent = summary.formulaHint;

    if (headerCounter && headerCounterText) {
      headerCounter.classList.add('has-orders');
      headerCounterText.textContent = `⚡ ${summary.summaryFormatted}`;
    }
  }

  // Lắng nghe sự kiện đổi công thức quy đổi chất liệu vải
  const fabricFormulaSelectEl = document.getElementById('fabric-formula-select');
  if (fabricFormulaSelectEl) {
    fabricFormulaSelectEl.addEventListener('change', (e) => {
      state.fabricFormula = e.target.value;
      updateSidebarOrderSummary();
      render();
    });
  }

  // Click vào huy hiệu Live Order Counter ở Header sẽ scroll đến mục tổng kết
  const headerOrderCounterEl = document.getElementById('header-order-counter');
  if (headerOrderCounterEl) {
    headerOrderCounterEl.addEventListener('click', () => {
      const stampTabBtn = document.querySelector('.tab-btn[data-tab="stamp"]');
      if (stampTabBtn) stampTabBtn.click();
      const sumCard = document.querySelector('.auto-sum-card');
      if (sumCard) {
        sumCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        sumCard.style.boxShadow = '0 0 0 2px #10b981, 0 0 20px rgba(16, 185, 129, 0.4)';
        setTimeout(() => { sumCard.style.boxShadow = ''; }, 1800);
      }
    });
  }

  // ============================================================
  // QUẢN LÝ LỊCH SỬ 10 ẢNH GẦN NHẤT (INDEXEDDB - TỐI ĐA 10 ẢNH)
  // ============================================================
  const DB_NAME = 'FabricNotePro_DB';
  const DB_VERSION = 1;
  const STORE_NAME = 'image_history';
  const MAX_HISTORY_ITEMS = 10;
  let saveHistoryDebounceTimer = null;

  function openHistoryDB() {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve(null);
        return;
      }
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function getHistoryList() {
    const db = await openHistoryDB();
    if (!db) {
      try {
        const raw = localStorage.getItem('fabricnote_history_fb');
        return raw ? JSON.parse(raw) : [];
      } catch (e) { return []; }
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result || [];
          list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(list);
        };
        req.onerror = () => resolve([]);
      } catch (err) {
        resolve([]);
      }
    });
  }

  async function saveHistoryEntry(entry) {
    const db = await openHistoryDB();
    if (!db) {
      try {
        let list = JSON.parse(localStorage.getItem('fabricnote_history_fb') || '[]');
        list = list.filter(item => item.id !== entry.id);
        list.unshift(entry);
        if (list.length > MAX_HISTORY_ITEMS) list = list.slice(0, MAX_HISTORY_ITEMS);
        localStorage.setItem('fabricnote_history_fb', JSON.stringify(list));
      } catch (e) {}
      return;
    }

    return new Promise(async (resolve) => {
      try {
        const all = await getHistoryList();
        const remaining = all.filter(item => item.id !== entry.id);
        remaining.unshift(entry);

        // Giữ tối đa 10 ảnh, nếu vượt quá 10 thì xóa ảnh cũ nhất
        const toKeep = remaining.slice(0, MAX_HISTORY_ITEMS);
        const toDelete = remaining.slice(MAX_HISTORY_ITEMS);

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(entry);

        for (const item of toDelete) {
          store.delete(item.id);
        }

        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  async function deleteHistoryEntry(id) {
    const db = await openHistoryDB();
    if (!db) {
      try {
        let list = JSON.parse(localStorage.getItem('fabricnote_history_fb') || '[]');
        list = list.filter(item => item.id !== id);
        localStorage.setItem('fabricnote_history_fb', JSON.stringify(list));
      } catch (e) {}
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }

  async function clearAllHistory() {
    const db = await openHistoryDB();
    if (!db) {
      try { localStorage.removeItem('fabricnote_history_fb'); } catch (e) {}
      return;
    }
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (e) { resolve(false); }
    });
  }

  function scheduleSaveImageHistory() {
    if (!state.img || !state.imgSrc) return;
    clearTimeout(saveHistoryDebounceTimer);
    saveHistoryDebounceTimer = setTimeout(() => {
      saveCurrentImageHistory(true);
    }, 700);
  }

  async function saveCurrentImageHistory(silent = true) {
    if (!state.img || !state.imgSrc) return;
    if (!state.currentSessionId) {
      state.currentSessionId = 'hist_' + Date.now();
    }

    let thumbnail = '';
    try {
      const thumbCanvas = document.createElement('canvas');
      const maxDim = 180;
      const ratio = Math.min(maxDim / canvas.width, maxDim / canvas.height, 1);
      thumbCanvas.width = Math.max(1, Math.round(canvas.width * ratio));
      thumbCanvas.height = Math.max(1, Math.round(canvas.height * ratio));
      const tCtx = thumbCanvas.getContext('2d');
      tCtx.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);
      thumbnail = thumbCanvas.toDataURL('image/jpeg', 0.8);
    } catch (e) {}

    const entry = {
      id: state.currentSessionId,
      timestamp: Date.now(),
      customer: state.banner.customer || 'Khách',
      fabric: state.banner.fabric || 'Bảng màu vải',
      itemCount: state.items.length,
      thumbnail: thumbnail,
      imgSrc: state.imgSrc,
      items: JSON.parse(JSON.stringify(state.items)),
      banner: JSON.parse(JSON.stringify(state.banner)),
      priceBanner: JSON.parse(JSON.stringify(state.priceBanner)),
      fabricSpecs: JSON.parse(JSON.stringify(state.fabricSpecs || {})),
      brandBadge: JSON.parse(JSON.stringify(state.brandBadge)),
      parsedItems: JSON.parse(JSON.stringify(state.parsedItems || []))
    };

    await saveHistoryEntry(entry);
    await refreshHistoryUI();
    if (!silent) showToast('✓ Đã lưu ảnh vào lịch sử');
  }

  async function refreshHistoryUI() {
    const list = await getHistoryList();
    const count = list.length;

    // Cập nhật badges
    if (historyBadge) historyBadge.textContent = count;
    if (historyStatusTag) historyStatusTag.textContent = `${count}/${MAX_HISTORY_ITEMS} ảnh`;
    if (btnClearHistory) btnClearHistory.classList.toggle('hidden', count === 0);

    // Render danh sách trong Tab Lịch Sử
    if (historyItemsContainer) {
      if (count === 0) {
        historyItemsContainer.innerHTML = `
          <div class="history-empty-state">
            <span>Chưa có ảnh nào trong lịch sử (Tối đa ${MAX_HISTORY_ITEMS} ảnh)</span>
          </div>`;
      } else {
        historyItemsContainer.innerHTML = list.map(item => {
          const isCurrent = item.id === state.currentSessionId;
          const timeStr = formatHistoryTime(item.timestamp);
          return `
            <div class="history-card ${isCurrent ? 'active-session' : ''}" data-hist-id="${item.id}">
              <img class="history-card-thumb" src="${item.thumbnail || item.imgSrc}" alt="thumb">
              <div class="history-card-info">
                <span class="history-card-title">${escapeHtml(item.customer)} - ${escapeHtml(item.fabric)}</span>
                <span class="history-card-subtitle">${timeStr}</span>
                <div class="history-card-meta">
                  <span class="history-card-notes">${item.itemCount || 0} notes</span>
                  ${isCurrent ? '<span style="color: #4ade80; font-weight:700;">● Đang mở</span>' : '<span style="color:#60a5fa;">Bấm để mở ✏️</span>'}
                </div>
              </div>
              <button class="history-card-del-btn" data-del-id="${item.id}" title="Xóa ảnh này khỏi lịch sử">🗑️</button>
            </div>
          `;
        }).join('');

        historyItemsContainer.querySelectorAll('.history-card').forEach(card => {
          card.addEventListener('click', (e) => {
            if (e.target.closest('.history-card-del-btn')) return;
            const histId = card.dataset.histId;
            const targetItem = list.find(it => it.id === histId);
            if (targetItem) loadHistorySession(targetItem);
          });
        });

        historyItemsContainer.querySelectorAll('.history-card-del-btn').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const delId = btn.dataset.delId;
            await deleteHistoryEntry(delId);
            if (state.currentSessionId === delId) {
              state.currentSessionId = 'hist_' + Date.now();
            }
            await refreshHistoryUI();
            showToast('Đã xóa 1 ảnh khỏi lịch sử');
          });
        });
      }
    }

    // Render danh sách trên Welcome Screen
    if (welcomeRecentHistory && welcomeRecentGrid) {
      if (count === 0) {
        welcomeRecentHistory.classList.add('hidden');
      } else {
        welcomeRecentHistory.classList.remove('hidden');
        welcomeRecentGrid.innerHTML = list.map(item => `
          <div class="welcome-recent-item" data-hist-id="${item.id}">
            <img src="${item.thumbnail || item.imgSrc}" alt="thumb">
            <span class="welcome-recent-item-title">${escapeHtml(item.customer)} - ${escapeHtml(item.fabric)}</span>
            <span class="welcome-recent-item-sub">${item.itemCount || 0} notes • ${formatHistoryTime(item.timestamp)}</span>
          </div>
        `).join('');

        welcomeRecentGrid.querySelectorAll('.welcome-recent-item').forEach(el => {
          el.addEventListener('click', () => {
            const histId = el.dataset.histId;
            const targetItem = list.find(it => it.id === histId);
            if (targetItem) loadHistorySession(targetItem);
          });
        });
      }
    }
  }

  function loadHistorySession(item) {
    if (!item) return;
    state.currentSessionId = item.id;
    state.isRestoringSession = true;
    state.items = JSON.parse(JSON.stringify(item.items || []));
    if (item.banner) state.banner = JSON.parse(JSON.stringify(item.banner));
    if (item.priceBanner) state.priceBanner = JSON.parse(JSON.stringify(item.priceBanner));
    if (item.fabricSpecs) state.fabricSpecs = JSON.parse(JSON.stringify(item.fabricSpecs));
    if (item.brandBadge) state.brandBadge = JSON.parse(JSON.stringify(item.brandBadge));
    if (item.parsedItems) state.parsedItems = JSON.parse(JSON.stringify(item.parsedItems));

    syncFormInputsWithState();

    loadImageSource(item.imgSrc, () => {
      render();
      fitToScreen();
      showToast(`✓ Đã mở lại ảnh "${item.customer} - ${item.fabric}"`);
      const stampTab = document.querySelector('.tab-btn[data-tab="stamp"]');
      if (stampTab) stampTab.click();
    });
  }

  function syncFormInputsWithState() {
    const custInput = document.getElementById('input-customer');
    const fabInput = document.getElementById('input-fabric');
    const togBanner = document.getElementById('toggle-banner');
    const togPrice = document.getElementById('toggle-price-banner');
    const pLine1 = document.getElementById('input-price-line1');
    const pLine2 = document.getElementById('input-price-line2');
    const togBrand = document.getElementById('toggle-brand-badge');
    const bName = document.getElementById('input-brand-name');
    const bPhone = document.getElementById('input-brand-phone');
    const togSpecs = document.getElementById('toggle-fabric-specs');
    const specComp = document.getElementById('input-spec-comp');
    const specWidth = document.getElementById('input-spec-width');
    const specWeight = document.getElementById('input-spec-weight');
    const specNotes = document.getElementById('input-spec-notes');
    const togBannerSum = document.getElementById('toggle-banner-sum');

    if (custInput && state.banner) custInput.value = state.banner.customer || '';
    if (fabInput && state.banner) fabInput.value = state.banner.fabric || '';
    if (togBanner && state.banner) togBanner.checked = !!state.banner.enabled;

    if (pLine1 && state.priceBanner) pLine1.value = state.priceBanner.line1 || '';
    if (pLine2 && state.priceBanner) pLine2.value = state.priceBanner.line2 || '';
    if (togPrice && state.priceBanner) togPrice.checked = !!state.priceBanner.enabled;

    if (bName && state.brandBadge) bName.value = state.brandBadge.name || '';
    if (bPhone && state.brandBadge) bPhone.value = state.brandBadge.phone || '';
    if (togBrand && state.brandBadge) togBrand.checked = !!state.brandBadge.enabled;

    if (togSpecs && state.fabricSpecs) togSpecs.checked = !!state.fabricSpecs.enabled;
    if (specComp && state.fabricSpecs) specComp.value = state.fabricSpecs.composition || '';
    if (specWidth && state.fabricSpecs) specWidth.value = state.fabricSpecs.width || '';
    if (specWeight && state.fabricSpecs) specWeight.value = state.fabricSpecs.weight || '';
    if (specNotes && state.fabricSpecs) specNotes.value = state.fabricSpecs.notes || '';
    if (togBannerSum && state.banner) togBannerSum.checked = state.banner.showSummary !== false;
  }

  function formatHistoryTime(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    if (d.toDateString() === now.toDateString()) {
      return `Hôm nay ${h}:${m}`;
    }
    return `${d.getDate()}/${d.getMonth() + 1} ${h}:${m}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Copy Image
  async function copyCanvasToClipboard() {
    if (!state.img) return;
    deselectItem();
    saveCurrentImageHistory(true);

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Không tạo được ảnh!', 'error');
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          showToast('✅ Đã copy ảnh! Chỉ cần sang Zalo bấm Ctrl+V để gửi ngay.', 'success');
        } catch (err) {
          downloadCanvasImage();
          showToast('Đã tự động tải ảnh về máy.', 'success');
        }
      }, 'image/png');
    } catch (err) {
      showToast('Lỗi: ' + err.message, 'error');
    }
  }

  // Download Image
  function downloadCanvasImage() {
    if (!state.img) return;
    deselectItem();
    saveCurrentImageHistory(true);

    const link = document.createElement('a');
    const safeCust = (state.banner.customer || 'Khach').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    const safeFabric = (state.banner.fabric || 'Vai').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    link.download = `Don_${safeCust}_${safeFabric}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('Đang tải ảnh chất lượng cao về máy...');
  }

  // ============================================================
  // OVERLAY IMAGE RENDERING (Ảnh chồng lên ảnh)
  // ============================================================
  function drawOverlayImage(item, isSelected) {
    if (!item) return;
    if (!item.img || !item.img.complete || item.img.naturalWidth === 0) {
      if (item.imgSrc && !item.img) {
        const im = new Image();
        im.onload = () => render();
        im.src = item.imgSrc;
        item.img = im;
      }
      return;
    }

    const scale = (item.scale || 1.0);
    const halfW = ((item.width || 200) * scale) / 2;
    const halfH = ((item.height || 150) * scale) / 2;
    const w = halfW * 2;
    const h = halfH * 2;
    const r = (item.borderRadius !== undefined ? item.borderRadius : 8) * state.globalScale;
    const bColor = item.borderColor || '#ffffff';
    const bWidth = (item.borderWidth !== undefined ? item.borderWidth : 3) * state.globalScale;

    ctx.save();
    ctx.translate(item.x, item.y);

    // Drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
    ctx.shadowBlur = 12 * state.globalScale;
    ctx.shadowOffsetY = 4 * state.globalScale;

    ctx.beginPath();
    roundRect(ctx, -halfW, -halfH, w, h, r);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    ctx.save();
    ctx.clip();
    ctx.drawImage(item.img, -halfW, -halfH, w, h);
    ctx.restore();

    // Border
    ctx.shadowColor = 'transparent';
    if (bColor !== 'none' && bWidth > 0) {
      ctx.strokeStyle = bColor;
      ctx.lineWidth = bWidth;
      ctx.beginPath();
      roundRect(ctx, -halfW, -halfH, w, h, r);
      ctx.stroke();
    }

    // Selected indicator + 4 corner resize handles
    if (isSelected) {
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 3;
      ctx.beginPath();
      roundRect(ctx, -halfW - 2, -halfH - 2, w + 4, h + 4, r + 2);
      ctx.stroke();

      const handleR = Math.max(6, canvas.width * 0.008);
      const corners = [
        [-halfW, -halfH],
        [halfW, -halfH],
        [-halfW, halfH],
        [halfW, halfH]
      ];
      corners.forEach(([cx, cy]) => {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(cx, cy, handleR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    ctx.restore();
  }

  // ============================================================
  // CROP & OVERLAY MODAL LOGIC (Cắt & Chèn ảnh chồng lên bảng màu)
  // ============================================================
  const cropState = {
    cropX: 0,
    cropY: 0,
    cropW: 0,
    cropH: 0,
    ratio: 'free',
    isDragging: false,
    dragAction: null,
    startX: 0,
    startY: 0,
    origRect: null
  };

  function openCropOverlayModal(fileOrSrc) {
    if (!fileOrSrc) return;
    if (typeof fileOrSrc === 'string') {
      loadCropSource(fileOrSrc);
    } else if (fileOrSrc instanceof Blob || fileOrSrc instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => loadCropSource(e.target.result);
      reader.readAsDataURL(fileOrSrc);
    }
  }

  function loadCropSource(src) {
    if (!cropModal || !cropSourceImg) return;
    cropSourceImg.onload = () => {
      cropModal.classList.remove('hidden');
      setTimeout(initCropBox, 60);
    };
    cropSourceImg.src = src;
  }

  function closeCropModal() {
    if (cropModal) cropModal.classList.add('hidden');
    cropState.isDragging = false;
    cropState.dragAction = null;
  }

  function initCropBox() {
    if (!cropSourceImg || !cropBox) return;
    const dispW = cropSourceImg.clientWidth || 300;
    const dispH = cropSourceImg.clientHeight || 200;

    let initW = Math.round(dispW * 0.8);
    let initH = Math.round(dispH * 0.8);

    if (cropState.ratio === '1:1') {
      const side = Math.min(initW, initH);
      initW = side;
      initH = side;
    } else if (cropState.ratio === '4:3') {
      initH = Math.round((initW * 3) / 4);
      if (initH > dispH * 0.85) {
        initH = Math.round(dispH * 0.8);
        initW = Math.round((initH * 4) / 3);
      }
    } else if (cropState.ratio === '16:9') {
      initH = Math.round((initW * 9) / 16);
      if (initH > dispH * 0.85) {
        initH = Math.round(dispH * 0.8);
        initW = Math.round((initH * 16) / 9);
      }
    } else if (cropState.ratio === 'all') {
      initW = dispW;
      initH = dispH;
    }

    const initX = Math.round((dispW - initW) / 2);
    const initY = Math.round((dispH - initH) / 2);
    setCropBoxRect(initX, initY, initW, initH);
  }

  function setCropBoxRect(x, y, w, h) {
    if (!cropSourceImg || !cropBox) return;
    const dispW = cropSourceImg.clientWidth || 300;
    const dispH = cropSourceImg.clientHeight || 200;

    w = Math.max(30, Math.min(w, dispW));
    h = Math.max(30, Math.min(h, dispH));
    x = Math.max(0, Math.min(x, dispW - w));
    y = Math.max(0, Math.min(y, dispH - h));

    cropState.cropX = x;
    cropState.cropY = y;
    cropState.cropW = w;
    cropState.cropH = h;

    cropBox.style.left = `${x}px`;
    cropBox.style.top = `${y}px`;
    cropBox.style.width = `${w}px`;
    cropBox.style.height = `${h}px`;
  }

  function initCropModal() {
    if (!cropModal) return;

    if (btnCropClose) btnCropClose.addEventListener('click', closeCropModal);
    if (btnCropCancel) btnCropCancel.addEventListener('click', closeCropModal);

    if (btnCropAsBase) {
      btnCropAsBase.addEventListener('click', () => {
        if (!cropSourceImg || !cropSourceImg.src) return;
        loadImageSource(cropSourceImg.src);
        closeCropModal();
        showToast('✓ Đã đặt làm ảnh nền chính của bảng màu!');
      });
    }

    if (btnCropApply) {
      btnCropApply.addEventListener('click', () => {
        if (!cropSourceImg || !cropSourceImg.naturalWidth) return;
        const dispW = cropSourceImg.clientWidth;
        const dispH = cropSourceImg.clientHeight;
        const scaleX = cropSourceImg.naturalWidth / dispW;
        const scaleY = cropSourceImg.naturalHeight / dispH;

        const sx = Math.max(0, Math.round(cropState.cropX * scaleX));
        const sy = Math.max(0, Math.round(cropState.cropY * scaleY));
        const sw = Math.min(cropSourceImg.naturalWidth - sx, Math.max(10, Math.round(cropState.cropW * scaleX)));
        const sh = Math.min(cropSourceImg.naturalHeight - sy, Math.max(10, Math.round(cropState.cropH * scaleY)));

        const offCanvas = document.createElement('canvas');
        offCanvas.width = sw;
        offCanvas.height = sh;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(cropSourceImg, sx, sy, sw, sh, 0, 0, sw, sh);
        const croppedDataUrl = offCanvas.toDataURL('image/png');

        const overlayImg = new Image();
        overlayImg.onload = () => {
          saveHistory();
          const targetW = canvas.width * 0.28;
          const targetH = targetW * (sh / sw);

          const newItem = {
            id: 'overlay_' + Date.now(),
            type: 'overlay_image',
            x: canvas.width / 2,
            y: canvas.height / 2,
            width: targetW,
            height: targetH,
            naturalWidth: sw,
            naturalHeight: sh,
            scale: 1.0,
            borderRadius: 8,
            borderWidth: 3,
            borderColor: '#ffffff',
            img: overlayImg,
            imgSrc: croppedDataUrl
          };

          state.items.push(newItem);
          selectItem(newItem.id);
          render();
          closeCropModal();
          showToast('✓ Đã chèn ảnh đè thành công! Kéo 4 góc để phóng to/thu nhỏ, kéo giữa để di chuyển.');
        };
        overlayImg.src = croppedDataUrl;
      });
    }

    // Ratio buttons
    cropRatioButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        cropRatioButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        cropState.ratio = btn.dataset.ratio;
        initCropBox();
      });
    });

    // Drag & Resize cropBox
    function getCropPoint(e) {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0].clientX);
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0].clientY);
      return { x: clientX, y: clientY };
    }

    if (cropBox) {
      cropBox.addEventListener('mousedown', startCropDrag);
      cropBox.addEventListener('touchstart', startCropDrag, { passive: false });
    }

    function startCropDrag(e) {
      const target = e.target;
      const pt = getCropPoint(e);
      cropState.isDragging = true;
      cropState.startX = pt.x;
      cropState.startY = pt.y;
      cropState.origRect = {
        x: cropState.cropX,
        y: cropState.cropY,
        w: cropState.cropW,
        h: cropState.cropH
      };

      if (target.classList.contains('crop-handle')) {
        cropState.dragAction = target.dataset.handle;
      } else {
        cropState.dragAction = 'move';
      }
      if (e.cancelable) e.preventDefault();
    }

    window.addEventListener('mousemove', moveCropDrag);
    window.addEventListener('touchmove', moveCropDrag, { passive: false });

    function moveCropDrag(e) {
      if (!cropState.isDragging || !cropState.origRect) return;
      const pt = getCropPoint(e);
      const dx = pt.x - cropState.startX;
      const dy = pt.y - cropState.startY;
      const orig = cropState.origRect;

      if (cropState.dragAction === 'move') {
        setCropBoxRect(orig.x + dx, orig.y + dy, orig.w, orig.h);
      } else {
        let newX = orig.x;
        let newY = orig.y;
        let newW = orig.w;
        let newH = orig.h;

        const action = cropState.dragAction;
        if (action.includes('e')) newW = orig.w + dx;
        if (action.includes('s')) newH = orig.h + dy;
        if (action.includes('w')) {
          newW = orig.w - dx;
          newX = orig.x + dx;
        }
        if (action.includes('n')) {
          newH = orig.h - dy;
          newY = orig.y + dy;
        }

        if (cropState.ratio === '1:1') {
          const side = Math.max(30, Math.min(newW, newH));
          newW = side;
          newH = side;
        }

        setCropBoxRect(newX, newY, newW, newH);
      }
      if (e.cancelable) e.preventDefault();
    }

    window.addEventListener('mouseup', () => { cropState.isDragging = false; });
    window.addEventListener('touchend', () => { cropState.isDragging = false; });
  }

  window.addEventListener('DOMContentLoaded', init);
})();
