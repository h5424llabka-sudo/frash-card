/**
 * admin.js — フラッシュカード管理画面ロジック
 *
 * 機能:
 *   - カード一覧表示・フィルター・検索
 *   - カード追加・編集・削除
 *   - 画像アップロード（Base64変換）
 *   - 音声ファイルアップロード
 *   - JSONエクスポート・インポート
 *   - 初期化
 *   - TTS設定
 */

'use strict';

// ─── 状態 ─────────────────────────────────────────────────
const AdminState = {
  cards: [],
  filterCat: 'all',
  searchQuery: '',
  editingId: null,      // 編集中のカードID（null = 新規追加）
  imageDataUrl: null,   // アップロードした画像のDataURL
  audioDataUrl: null,   // アップロードした音声のDataURL
};

// ─── DOM ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── トースト通知 ─────────────────────────────────────────
function showToast(msg, type = '') {
  const container = $('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✅', danger: '❌', '': 'ℹ️' };
  el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  container.appendChild(el);

  setTimeout(() => {
    el.classList.add('fade-out');
    setTimeout(() => el.remove(), 350);
  }, 2500);
}

// ─── タブ切替 ─────────────────────────────────────────────
function setupTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.tab === tabId);
        b.setAttribute('aria-selected', b.dataset.tab === tabId ? 'true' : 'false');
      });
      document.querySelectorAll('.tab-panel').forEach(p => {
        p.classList.toggle('active', p.id === `tab-${tabId}`);
      });
    });
  });
}

// ─── カテゴリフィルターボタン ─────────────────────────────
function buildListFilters() {
  const container = $('list-filters');
  container.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${cat.id === AdminState.filterCat ? 'active' : ''}`;
    btn.dataset.catId = cat.id;
    btn.textContent = `${cat.icon} ${cat.label}`;
    btn.setAttribute('aria-pressed', cat.id === AdminState.filterCat ? 'true' : 'false');
    btn.addEventListener('click', () => {
      AdminState.filterCat = cat.id;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.catId === cat.id);
        b.setAttribute('aria-pressed', b.dataset.catId === cat.id ? 'true' : 'false');
      });
      renderCardGrid();
    });
    container.appendChild(btn);
  });
}

// ─── カードグリッド描画 ────────────────────────────────────
function renderCardGrid() {
  const grid = $('card-grid');
  grid.innerHTML = '';

  let cards = AdminState.cards;

  // カテゴリフィルター
  if (AdminState.filterCat !== 'all') {
    cards = cards.filter(c => c.category === AdminState.filterCat);
  }

  // 検索フィルター
  if (AdminState.searchQuery) {
    const q = AdminState.searchQuery.toLowerCase();
    cards = cards.filter(c =>
      c.name.includes(q) ||
      (c.reading && c.reading.includes(q)) ||
      c.category.includes(q)
    );
  }

  // バッジ更新
  $('card-count-badge').textContent = `${cards.length} 枚`;

  if (cards.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <span class="empty-state-icon">🔍</span>
        <h3>カードが見つかりません</h3>
        <p>フィルターや検索条件を変更してみてください</p>
      </div>
    `;
    return;
  }

  cards.forEach(card => {
    const item = document.createElement('div');
    item.className = 'card-item';
    item.style.background = card.bgColor || '#f8fafc';
    item.dataset.cardId = card.id;

    // ビジュアル
    let visualHtml = '';
    if (card.image) {
      visualHtml = `<img class="card-item-img" src="${card.image}" alt="${card.name}" onerror="this.style.display='none'">`;
    } else if (card.colorSwatch) {
      visualHtml = `<div class="card-item-swatch" style="background:${card.colorSwatch};"></div>`;
    } else if (card.numeral != null) {
      const NUM_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f43f5e'];
      const idx = parseInt(card.numeral) - 1;
      const col = (idx >= 0 && idx < NUM_COLORS.length) ? NUM_COLORS[idx] : '#374151';
      visualHtml = `<span class="card-item-numeral" style="color:${col};">${card.numeral}</span>`;
    } else if (card.emoji) {
      visualHtml = `<span class="card-item-emoji">${card.emoji}</span>`;
    }

    const cat = getCategoryById(card.category);

    item.innerHTML = `
      <div class="card-item-actions">
        <button class="card-item-btn edit-btn" data-id="${card.id}" aria-label="編集" title="編集">✏️</button>
        <button class="card-item-btn del-btn"  data-id="${card.id}" aria-label="削除" title="削除">🗑️</button>
      </div>
      ${visualHtml}
      <div class="card-item-name">${escHtml(card.name)}</div>
      <div class="card-item-cat">${cat ? cat.label : card.category}</div>
    `;

    item.querySelector('.edit-btn').addEventListener('click', e => {
      e.stopPropagation();
      openEditModal(card.id);
    });
    item.querySelector('.del-btn').addEventListener('click', e => {
      e.stopPropagation();
      deleteCard(card.id);
    });

    grid.appendChild(item);
  });
}

// ─── モーダル: カテゴリ選択肢を生成 ──────────────────────
function buildCategoryOptions() {
  const sel = $('form-category');
  sel.innerHTML = '';
  CATEGORIES.filter(c => c.id !== 'all').forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.label}`;
    sel.appendChild(opt);
  });
}

// ─── モーダル: 開く（新規） ─────────────────────────────
function openAddModal() {
  AdminState.editingId = null;
  AdminState.imageDataUrl = null;
  AdminState.audioDataUrl = null;

  $('modal-title').textContent = 'カードを追加';
  resetForm();
  openModal();
}

// ─── モーダル: 開く（編集） ─────────────────────────────
function openEditModal(cardId) {
  const card = AdminState.cards.find(c => c.id === cardId);
  if (!card) return;

  AdminState.editingId = cardId;
  AdminState.imageDataUrl = card.image || null;
  AdminState.audioDataUrl = card.audio || null;

  $('modal-title').textContent = 'カードを編集';

  // フォームにデータをセット
  $('form-category').value = card.category;
  $('form-name').value = card.name;
  $('form-reading').value = card.reading || '';
  $('form-emoji').value = card.emoji || '';
  $('form-numeral').value = card.numeral || '';
  $('form-bgcolor').value = card.bgColor || '#fff7ed';
  $('form-bgcolor-text').value = card.bgColor || '#fff7ed';

  // タイプ判定
  if (card.image) {
    $('form-type').value = 'image';
    $('form-image-url').value = card.image.startsWith('data:') ? '' : card.image;
    if (card.image.startsWith('data:')) {
      showImagePreview(card.image, 'アップロード済み');
    }
  } else if (card.colorSwatch) {
    $('form-type').value = 'color';
    $('form-color').value = card.colorSwatch;
    $('form-color-text').value = card.colorSwatch;
  } else if (card.numeral != null) {
    $('form-type').value = 'number';
  } else {
    $('form-type').value = 'emoji';
  }

  // 音声
  if (card.audio) {
    $('audio-status').textContent = '音声ファイルあり';
    $('audio-status').className = 'audio-status has-file';
    $('clear-audio-btn').classList.remove('hidden');
  }

  updateTypeFields();
  updatePreview();
  openModal();
}

function openModal() {
  $('card-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => $('form-name').focus(), 100);
}

function closeModal() {
  $('card-modal').classList.remove('open');
  document.body.style.overflow = '';
  AdminState.imageDataUrl = null;
  AdminState.audioDataUrl = null;
}

// ─── フォームリセット ─────────────────────────────────────
function resetForm() {
  $('form-category').value = 'animals';
  $('form-type').value = 'emoji';
  $('form-name').value = '';
  $('form-reading').value = '';
  $('form-emoji').value = '🐶';
  $('form-numeral').value = '';
  $('form-color').value = '#ef4444';
  $('form-color-text').value = '#ef4444';
  $('form-bgcolor').value = '#fff7ed';
  $('form-bgcolor-text').value = '#fff7ed';
  $('form-image-url').value = '';
  $('image-preview-wrap').classList.remove('visible');
  $('audio-status').textContent = '未設定（TTSを使用）';
  $('audio-status').className = 'audio-status';
  $('clear-audio-btn').classList.add('hidden');
  const recBtn = $('record-audio-btn');
  const stopBtn = $('stop-record-btn');
  if (recBtn) recBtn.classList.remove('hidden');
  if (stopBtn) stopBtn.classList.add('hidden');
  updateTypeFields();
  updatePreview();
}

// ─── 表示タイプ切替 ────────────────────────────────────────
function updateTypeFields() {
  const type = $('form-type').value;
  $('field-emoji').classList.toggle('hidden', type !== 'emoji');
  $('field-numeral').classList.toggle('hidden', type !== 'number');
  $('field-color').classList.toggle('hidden', type !== 'color');
  $('field-image').classList.toggle('hidden', type !== 'image');
}

// ─── プレビュー更新 ────────────────────────────────────────
function updatePreview() {
  const type = $('form-type').value;
  const name = $('form-name').value || 'なまえ';
  const emoji = $('form-emoji').value || '❓';
  const numeral = $('form-numeral').value;
  const color = $('form-color').value;
  const bgcolor = $('form-bgcolor').value || '#f8fafc';

  const vw = $('preview-visual');
  const nw = $('preview-name');
  const pw = $('form-preview-wrap');

  pw.style.background = bgcolor;
  nw.textContent = name;

  if (type === 'emoji') {
    vw.innerHTML = `<span style="font-size:64px;">${emoji}</span>`;
  } else if (type === 'color') {
    vw.innerHTML = `<div style="width:64px;height:64px;border-radius:50%;background:${color};box-shadow:0 4px 12px rgba(0,0,0,0.15);"></div>`;
  } else if (type === 'number') {
    vw.innerHTML = `<span style="font-size:64px;font-weight:900;color:#374151;">${numeral || '？'}</span>`;
  } else if (type === 'image') {
    if (AdminState.imageDataUrl) {
      vw.innerHTML = `<img src="${AdminState.imageDataUrl}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`;
    } else {
      vw.innerHTML = `<span style="font-size:40px;">🖼️</span>`;
    }
  }
}

// ─── 画像プレビュー表示 ────────────────────────────────────
function showImagePreview(dataUrl, filename) {
  const wrap = $('image-preview-wrap');
  $('image-preview').src = dataUrl;
  $('image-preview-name').textContent = filename;
  wrap.classList.add('visible');
}

// ─── カード保存 ────────────────────────────────────────────
function saveCard() {
  const category = $('form-category').value;
  const type = $('form-type').value;
  const name = $('form-name').value.trim();
  const reading = $('form-reading').value.trim();
  const emoji = $('form-emoji').value.trim();
  const numeral = $('form-numeral').value.trim();
  const color = $('form-color').value;
  const bgcolor = $('form-bgcolor').value;
  const imageUrl = $('form-image-url').value.trim();

  // バリデーション
  if (!name) {
    showToast('カード名を入力してください', 'danger');
    $('form-name').focus();
    return;
  }

  // カードオブジェクト構築
  const card = {
    id: AdminState.editingId || `card_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    reading: reading || name,
    category,
    emoji: null,
    colorSwatch: null,
    numeral: null,
    image: null,
    audio: AdminState.audioDataUrl || null,
    bgColor: bgcolor || '#fff7ed',
  };

  if (type === 'emoji') {
    card.emoji = emoji || '❓';
  } else if (type === 'color') {
    card.colorSwatch = color;
  } else if (type === 'number') {
    card.numeral = numeral;
  } else if (type === 'image') {
    card.image = AdminState.imageDataUrl || imageUrl || null;
    card.emoji = emoji || null; // フォールバック用
  }

  // 保存
  if (AdminState.editingId) {
    const idx = AdminState.cards.findIndex(c => c.id === AdminState.editingId);
    if (idx !== -1) AdminState.cards[idx] = card;
    showToast('カードを更新しました', 'success');
  } else {
    AdminState.cards.push(card);
    showToast('カードを追加しました', 'success');
  }

  saveCards(AdminState.cards);
  closeModal();
  renderCardGrid();
}

// ─── カード削除 ────────────────────────────────────────────
function deleteCard(cardId) {
  const card = AdminState.cards.find(c => c.id === cardId);
  if (!card) return;

  if (!confirm(`「${card.name}」を削除しますか？`)) return;

  AdminState.cards = AdminState.cards.filter(c => c.id !== cardId);
  saveCards(AdminState.cards);
  renderCardGrid();
  showToast('カードを削除しました');
}

// ─── エクスポート ─────────────────────────────────────────
function exportCards() {
  const json = JSON.stringify(AdminState.cards, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `flashcard_backup_${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('エクスポートしました', 'success');
}

// ─── インポート ────────────────────────────────────────────
function importCards(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error('不正なフォーマット');
      if (data.length === 0) throw new Error('カードが0枚です');

      if (!confirm(`${data.length}枚のカードをインポートします。\n現在のデータを上書きしますか？`)) return;

      AdminState.cards = data;
      saveCards(AdminState.cards);
      renderCardGrid();
      showToast(`${data.length}枚をインポートしました`, 'success');
    } catch (err) {
      showToast(`インポート失敗: ${err.message}`, 'danger');
    }
  };
  reader.readAsText(file);
}

// ─── 初期化 ────────────────────────────────────────────────
function resetCards() {
  if (!confirm('すべてのカードを初期データに戻します。\nこの操作は元に戻せません。よろしいですか？')) return;
  AdminState.cards = resetToDefault();
  renderCardGrid();
  showToast('初期データに戻しました', 'success');
}

// ─── 設定保存 ─────────────────────────────────────────────
function loadSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('flashcard_settings') || '{}');
    if (s.rate != null) { $('setting-speed').value = s.rate; $('speed-val').textContent = `${s.rate} 倍速`; }
    if (s.pitch != null) { $('setting-pitch').value = s.pitch; $('pitch-val').textContent = s.pitch; }
    if (s.voice != null) { $('setting-voice').value = s.voice; }
    if (s.autoplay != null) { $('setting-autoplay').checked = s.autoplay; }
  } catch { }
}

function saveSettings() {
  const settings = {
    rate: parseFloat($('setting-speed').value),
    pitch: parseFloat($('setting-pitch').value),
    voice: $('setting-voice').value,
    autoplay: $('setting-autoplay').checked,
  };
  localStorage.setItem('flashcard_settings', JSON.stringify(settings));
  showToast('設定を保存しました', 'success');
}

function populateVoiceList() {
  const sel = $('setting-voice');
  const voices = speechSynthesis.getVoices();
  const jpVoices = voices.filter(v => v.lang.startsWith('ja'));

  // 既存のオプション（「自動選択」）を残す
  while (sel.options.length > 1) sel.remove(1);

  jpVoices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = `${v.name} (${v.lang})`;
    sel.appendChild(opt);
  });
}

// ─── ユーティリティ ────────────────────────────────────────
function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function hexToText(hex) { return hex; }

// ─── イベント設定 ─────────────────────────────────────────
function setupEvents() {

  // タブ
  setupTabs();

  // カード追加ボタン
  $('add-card-btn').addEventListener('click', openAddModal);

  // モーダル閉じる
  $('modal-close-btn').addEventListener('click', closeModal);
  $('modal-cancel-btn').addEventListener('click', closeModal);
  $('card-modal').addEventListener('click', e => {
    if (e.target === $('card-modal')) closeModal();
  });

  // 保存
  $('modal-save-btn').addEventListener('click', saveCard);

  // フォーム変更 → プレビュー更新
  ['form-name', 'form-emoji', 'form-numeral', 'form-color', 'form-bgcolor'].forEach(id => {
    $(id).addEventListener('input', updatePreview);
  });

  // タイプ変更
  $('form-type').addEventListener('change', () => {
    updateTypeFields();
    updatePreview();
  });

  // 色入力同期
  $('form-color').addEventListener('input', e => {
    $('form-color-text').value = e.target.value;
    updatePreview();
  });
  $('form-color-text').addEventListener('input', e => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      $('form-color').value = e.target.value;
      updatePreview();
    }
  });

  // 背景色入力同期
  $('form-bgcolor').addEventListener('input', e => {
    $('form-bgcolor-text').value = e.target.value;
    updatePreview();
  });
  $('form-bgcolor-text').addEventListener('input', e => {
    if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
      $('form-bgcolor').value = e.target.value;
      updatePreview();
    }
  });

  // 画像ファイル選択
  $('form-image-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      AdminState.imageDataUrl = ev.target.result;
      showImagePreview(ev.target.result, file.name);
      updatePreview();
    };
    reader.readAsDataURL(file);
  });

  // 画像クリア
  $('clear-image-btn').addEventListener('click', () => {
    AdminState.imageDataUrl = null;
    $('image-preview-wrap').classList.remove('visible');
    $('form-image-url').value = '';
    $('form-image-file').value = '';
    updatePreview();
  });

  // 画像URL入力
  $('form-image-url').addEventListener('input', e => {
    if (!e.target.value) return;
    AdminState.imageDataUrl = null;
    updatePreview();
  });

  // ドラッグ&ドロップ
  const dropZone = $('image-drop-zone');
  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => {
        AdminState.imageDataUrl = ev.target.result;
        showImagePreview(ev.target.result, file.name);
        updatePreview();
      };
      reader.readAsDataURL(file);
    }
  });

  // 録音機能
  const recordBtn = $('record-audio-btn');
  const stopBtn = $('stop-record-btn');
  let mediaRecorder = null;
  let audioChunks = [];

  if (recordBtn && stopBtn) {
    recordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.addEventListener('dataavailable', e => {
          if (e.data.size > 0) audioChunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = ev => {
            AdminState.audioDataUrl = ev.target.result;
            $('audio-status').textContent = '録音済み音声';
            $('audio-status').className = 'audio-status has-file';
            $('clear-audio-btn').classList.remove('hidden');
          };
          reader.readAsDataURL(audioBlob);
          
          // ストリームのトラックを停止
          stream.getTracks().forEach(track => track.stop());
        });

        mediaRecorder.start();
        recordBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        $('audio-status').textContent = '録音中...';
        $('audio-status').className = 'audio-status text-danger';
      } catch (err) {
        showToast('マイクエラー: ' + err.message, 'danger');
      }
    });

    stopBtn.addEventListener('click', () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        recordBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
      }
    });
  }

  // 音声ファイル
  $('form-audio-file').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      AdminState.audioDataUrl = ev.target.result;
      $('audio-status').textContent = file.name;
      $('audio-status').className = 'audio-status has-file';
      $('clear-audio-btn').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  // 音声クリア
  $('clear-audio-btn').addEventListener('click', () => {
    AdminState.audioDataUrl = null;
    $('audio-status').textContent = '未設定（TTSを使用）';
    $('audio-status').className = 'audio-status';
    $('clear-audio-btn').classList.add('hidden');
    $('form-audio-file').value = '';
  });

  // 検索
  $('search-input').addEventListener('input', e => {
    AdminState.searchQuery = e.target.value;
    renderCardGrid();
  });

  // バックアップ
  $('export-btn').addEventListener('click', exportCards);
  $('import-file').addEventListener('change', e => {
    if (e.target.files[0]) importCards(e.target.files[0]);
    e.target.value = '';
  });
  $('reset-btn').addEventListener('click', resetCards);

  // 設定
  $('setting-speed').addEventListener('input', e => {
    $('speed-val').textContent = `${parseFloat(e.target.value).toFixed(2)} 倍速`;
  });
  $('setting-pitch').addEventListener('input', e => {
    $('pitch-val').textContent = parseFloat(e.target.value).toFixed(2);
  });
  $('save-settings-btn').addEventListener('click', saveSettings);
  $('test-tts-btn').addEventListener('click', () => {
    if (!('speechSynthesis' in window)) { showToast('音声合成非対応のブラウザです', 'danger'); return; }
    const u = new SpeechSynthesisUtterance('いぬ、ねこ、うさぎ');
    u.lang = 'ja-JP';
    u.rate = parseFloat($('setting-speed').value);
    u.pitch = parseFloat($('setting-pitch').value);
    const selVoice = $('setting-voice').value;
    if (selVoice) {
      const voice = speechSynthesis.getVoices().find(v => v.name === selVoice);
      if (voice) u.voice = voice;
    }
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });

  // 音声リスト
  if ('speechSynthesis' in window) {
    if (speechSynthesis.getVoices().length > 0) populateVoiceList();
    speechSynthesis.addEventListener('voiceschanged', populateVoiceList);
  }

  // キーボード ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ─── 初期化 ────────────────────────────────────────────────
function initAdmin() {
  AdminState.cards = getCards();
  buildCategoryOptions();
  buildListFilters();
  renderCardGrid();
  loadSettings();
  setupEvents();
  updateTypeFields();
  updatePreview();
}

document.addEventListener('DOMContentLoaded', initAdmin);
