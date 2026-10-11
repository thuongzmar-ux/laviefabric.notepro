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

    // Banner 1: Customer & Fabric
    banner: {
      enabled: true,
      x: 80,
      y: 40,
      customer: 'C Dung',
      fabric: 'Thun loang 822-10#',
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

    // Items list: { id, type: 'tick'|'box'|'box_dot'|'badge', x, y, width, height, text, colorTheme, scale }
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
    history: []
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

  // ============================================================
  // MODULE-LEVEL HELPERS (dùng được từ keyboard shortcuts)
  // ============================================================

  const TOOL_NAMES = {
    select: 'Con trỏ Chọn (V)',
    tick: 'Tick đỏ (1)',
    box: 'Khung đỏ (2)',
    box_dot: 'Khung+Chấm (3)',
    badge: 'Thẻ chữ (4)',
    combo: 'Cả cụm (5)'
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
    if (state.spacePressed) {
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
            <div class="shortcut-row"><kbd>1</kbd> Tick đỏ ✓</div>
            <div class="shortcut-row"><kbd>2</kbd> Khung đỏ ▢</div>
            <div class="shortcut-row"><kbd>3</kbd> Khung + Chấm ▢•</div>
            <div class="shortcut-row"><kbd>4</kbd> Thẻ chữ 🏷️</div>
            <div class="shortcut-row"><kbd>5</kbd> Cả cụm ▢+🏷️</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Chỉnh sửa & Thao tác</div>
            <div class="shortcut-row"><kbd>Esc</kbd> <strong>Về Con trỏ Chọn</strong> / Bỏ chọn</div>
            <div class="shortcut-row"><kbd>Double-click</kbd> Sửa chữ ngay trên ảnh</div>
            <div class="shortcut-row"><kbd>Enter</kbd> Lưu chữ (hoặc mở sửa thẻ)</div>
            <div class="shortcut-row"><kbd>Del</kbd> / <kbd>⌫</kbd> Xóa element đang chọn</div>
            <div class="shortcut-row"><kbd>F</kbd> Đổi nhanh số lượng / mét</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Di chuyển & Zoom</div>
            <div class="shortcut-row"><kbd>Space</kbd>+kéo chuột Di chuyển góc nhìn (Pan)</div>
            <div class="shortcut-row"><kbd>↑↓←→</kbd> Nhích element (2px)</div>
            <div class="shortcut-row"><kbd>Shift</kbd>+<kbd>↑↓←→</kbd> Nhích nhanh (10px)</div>
            <div class="shortcut-row"><kbd>+</kbd> / <kbd>-</kbd> Phóng to / Thu nhỏ</div>
            <div class="shortcut-row"><kbd>0</kbd> Vừa màn hình</div>
          </div>
          <div class="shortcut-section">
            <div class="shortcut-section-title">Lịch sử & Xuất ảnh</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>U</kbd> Hoàn tác (Undo)</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>Y</kbd> Phục hồi (Redo)</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>C</kbd> Copy gửi ngay Zalo</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>S</kbd> Tải ảnh gốc về máy</div>
            <div class="shortcut-row"><kbd>Ctrl</kbd>+<kbd>V</kbd> Dán ảnh trực tiếp từ Zalo</div>
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

  // Initialize - Giao diện mở đầu nạp ảnh, không tự nạp mẫu
  function init() {
    setupEventListeners();
    setActiveTool('select');
    updateImageLoadedUI();
  }

  // Toast
  function showToast(message, type = 'success') {
    toastEl.textContent = message;
    toastEl.className = `toast ${type}`;
    setTimeout(() => {
      toastEl.className = 'toast hidden';
    }, 3200);
  }

  // History / Undo
  function saveHistory() {
    const snapshot = {
      items: JSON.parse(JSON.stringify(state.items)),
      banner: { ...state.banner },
      priceBanner: { ...state.priceBanner },
      brandBadge: { ...state.brandBadge }
    };
    state.history.push(snapshot);
    if (state.history.length > 30) state.history.shift();
  }

  function undo() {
    if (state.history.length === 0) {
      showToast('Không có thao tác nào để hoàn tác', 'error');
      return;
    }
    const previous = state.history.pop();
    state.items = previous.items;
    state.banner = previous.banner;
    state.priceBanner = previous.priceBanner;
    if (previous.brandBadge) state.brandBadge = previous.brandBadge;
    deselectItem();
    render();
    showToast('Đã hoàn tác thao tác');
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

    // Paste clipboard (Ctrl+V từ Zalo / clipboard)
    window.addEventListener('paste', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      const items = (e.clipboardData || e.originalEvent.clipboardData).items;
      for (const item of items) {
        if (item.type.indexOf('image') !== -1) {
          loadFile(item.getAsFile());
          showToast('✓ Đã dán ảnh từ clipboard Zalo!', 'success');
          break;
        }
      }
    });

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

    // TEXT SYNCING
    function updateActiveText(newText) {
      state.currentQty = newText;
      primaryTextInput.value = newText;
      canvasTopTextInput.value = newText;
      floatingTextInput.value = newText;

      chipQtyButtons.forEach(b => {
        b.classList.toggle('active', b.dataset.text === newText);
      });

      const selected = getSelectedItem();
      if (selected && selected.type === 'badge') {
        selected.text = newText;
        inspectorBadgeText.value = newText;
        render();
        updateFloatingCardPosition(selected);
      }
    }

    primaryTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));
    canvasTopTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));
    floatingTextInput.addEventListener('input', (e) => updateActiveText(e.target.value));

    btnClearText.addEventListener('click', () => {
      updateActiveText('');
      primaryTextInput.focus();
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

    btnInspectorDelete.addEventListener('click', () => deleteSelectedItem());
    btnClearNotes.addEventListener('click', () => {
      if (state.items.length === 0) return;
      saveHistory();
      state.items = [];
      deselectItem();
      render();
      showToast('Đã xóa tất cả các note');
    });

    // Banner 1 Controls
    toggleBanner.addEventListener('change', (e) => {
      state.banner.enabled = e.target.checked;
      render();
    });
    inputCustomer.addEventListener('input', (e) => {
      state.banner.customer = e.target.value;
      render();
    });
    inputFabric.addEventListener('input', (e) => {
      state.banner.fabric = e.target.value;
      render();
    });
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
        switch (e.key.toLowerCase()) {
          case 'z':
            e.preventDefault();
            undo();
            return;
          case 'y':
            e.preventDefault();
            // Redo placeholder nếu cần
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
        if (e.key === 'Enter' && !floatingEditCard.classList.contains('hidden')) {
          e.preventDefault();
          hideFloatingCard();
          showToast('✓ Đã lưu chữ');
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

        // --- Chuyển tool nhanh: phím số 1-5 ---
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

        // --- Xóa element đang chọn ---
        case 'Delete':
        case 'Backspace':
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
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight': {
          const sel = getSelectedItem();
          if (!sel) break;
          e.preventDefault();
          const step = e.shiftKey ? 10 : 2; // Shift = di chuyển nhanh hơn
          saveHistory();
          if (e.key === 'ArrowUp')    sel.y -= step;
          if (e.key === 'ArrowDown')  sel.y += step;
          if (e.key === 'ArrowLeft')  sel.x -= step;
          if (e.key === 'ArrowRight') sel.x += step;
          render();
          if (sel.type === 'badge') updateFloatingCardPosition(sel);
          break;
        }

        // --- Phím F: Focus vào ô nhập chữ nhanh ---
        case 'f':
        case 'F':
          e.preventDefault();
          canvasTopTextInput.focus();
          canvasTopTextInput.select();
          showToast('✏️ Nhập chữ nhanh [F]');
          break;

        // --- Phím U: Undo (thay thế) ---
        case 'u':
        case 'U':
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

  function deleteSelectedItem() {
    if (!state.selectedId) return;
    saveHistory();
    state.items = state.items.filter(i => i.id !== state.selectedId);
    deselectItem();
    render();
    showToast('Đã xóa đối tượng');
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

      primaryTextInput.value = item.text || '';
      canvasTopTextInput.value = item.text || '';
      inspectorBadgeText.value = item.text || '';
      floatingTextInput.value = item.text || '';

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
    }

    render();
  }

  function deselectItem() {
    state.selectedId = null;
    state.selectedHandle = null;
    inspectorCard.classList.add('hidden');
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

      updateImageLoadedUI();
      render();
      fitToScreen();
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

    // Pan viewport khi giữ Space hoặc bấm chuột giữa
    if (state.spacePressed || e.button === 1) {
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
    if (e.touches.length === 1) {
      const pos = getCanvasCoords(e);
      handleInteractionStart(pos, e);
    }
  }

  function handleInteractionStart(pos, originalEvent) {
    // 1. Check Banner 1
    if (state.banner.enabled && isInsideBox(pos, state.banner)) {
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
      state.isDragging = true;
      state.selectedId = 'brandBadge';
      state.dragStartPos = pos;
      state.dragOriginalItem = { ...state.brandBadge };
      if (originalEvent.cancelable) originalEvent.preventDefault();
      render();
      return;
    }

    // 3. Check Resize Handle of selected Box
    const selected = getSelectedItem();
    if (selected && (selected.type === 'box' || selected.type === 'box_dot')) {
      const handle = hitTestResizeHandle(pos, selected);
      if (handle) {
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
        state.isDragging = true;
        state.selectedHandle = badgeHandle;
        state.dragStartPos = pos;
        state.dragOriginalItem = { ...selected };
        if (originalEvent.cancelable) originalEvent.preventDefault();
        return;
      }
    }

    // 5. Check existing item
    const clickedItem = findItemAt(pos);
    if (clickedItem) {
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
      canvas.style.cursor = state.spacePressed ? 'grab' : (state.currentTool === 'select' ? 'default' : 'crosshair');
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
        const scale = it.scale || 1.0;
        const baseSize = canvas.width * 0.052 * scale;
        const fontSize = baseSize * 0.65;
        ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
        const metrics = ctx.measureText(it.text || '50m');
        const padX = baseSize * 0.32;
        const padY = baseSize * 0.18;
        const w = metrics.width + padX * 2;
        const h = fontSize + padY * 2;

        if (pos.x >= it.x - w/2 && pos.x <= it.x + w/2 &&
            pos.y >= it.y - h/2 && pos.y <= it.y + h/2) {
          return it;
        }
      } else if (it.type === 'tick') {
        const threshold = canvas.width * 0.045 * (it.scale || 1.0);
        if (Math.hypot(pos.x - it.x, pos.y - it.y) <= threshold) {
          return it;
        }
      }
    }
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
    const scale = badgeItem.scale || 1.0;
    const baseSize = canvas.width * 0.052 * scale;
    const fontSize = baseSize * 0.65;
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const metrics = ctx.measureText(badgeItem.text || '50m');
    const padX = baseSize * 0.32;
    const padY = baseSize * 0.18;
    const halfW = (metrics.width + padX * 2) / 2;
    const halfH = (fontSize + padY * 2) / 2;

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

  function updateCursor(pos) {
    if (state.spacePressed) {
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

    if (findItemAt(pos) || 
        (state.banner.enabled && isInsideBox(pos, state.banner)) || 
        (state.priceBanner.enabled && isInsideBox(pos, state.priceBanner)) ||
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
      }
    });
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

    const textWidth = Math.max(titleMetrics.width, subMetrics.width);
    const boxWidth = textWidth + padX * 2;
    const boxHeight = titleSize + subSize + gap + padY * 2;

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

  // Draw Badge with corner handles when selected!
  function drawBadge(item, isSelected) {
    const scale = (item.scale || 1.0) * state.globalScale;
    const baseSize = canvas.width * 0.052 * scale;
    const fontSize = baseSize * 0.65;

    ctx.save();
    ctx.font = `800 ${fontSize}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    const metrics = ctx.measureText(item.text || '50m');

    const padX = baseSize * 0.32;
    const padY = baseSize * 0.18;
    const badgeW = metrics.width + padX * 2;
    const badgeH = fontSize + padY * 2;

    const isYellow = (item.colorTheme || 'yellow') === 'yellow';
    const bgColor = isYellow ? '#ffd000' : '#e01a22';
    const textColor = isYellow ? '#111827' : '#ffffff';

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
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.text, 0, baseSize * 0.03);

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

  // Copy Image
  async function copyCanvasToClipboard() {
    if (!state.img) return;
    deselectItem();

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

    const link = document.createElement('a');
    const safeCust = (state.banner.customer || 'Khach').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    const safeFabric = (state.banner.fabric || 'Vai').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1EA0-\u1EF9]/g, '_');
    link.download = `Don_${safeCust}_${safeFabric}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    showToast('Đang tải ảnh chất lượng cao về máy...');
  }

  window.addEventListener('DOMContentLoaded', init);
})();
