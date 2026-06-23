/**
 * app.js — フラッシュカードアプリ メインロジック
 *
 * 機能:
 *   - カード表示・スワイプ・ランダム再生
 *   - Web Speech API による自動音声読み上げ
 *   - カテゴリフィルター
 *   - プログレス管理
 */

'use strict';

// ─── アプリ状態 ────────────────────────────────────────────
const State = {
  deck: [],           // シャッフル済みカード配列
  index: 0,          // 現在のカードインデックス
  category: 'all',  // 選択中のカテゴリ ID
  isSpeaking: false,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  dragCurrentX: 0,
  activeCard: null,  // 現在表示中のカード要素
  hintShown: false,
  voices: [],
};

// ─── DOM 参照 ───────────────────────────────────────────────
const $ = id => document.getElementById(id);
const splashScreen    = $('splash-screen');
const splashStartBtn  = $('splash-start-btn');
const cardArea        = $('card-area');
const deckComplete    = $('deck-complete');
const progressDots    = $('progress-dots');
const categoryBtns    = $('category-btns');
const headerCatIcon   = $('header-cat-icon');
const headerCatName   = $('header-cat-name');
const progressText    = $('progress-text');
const settingsBtn     = $('settings-btn');
const navLeft         = $('nav-left');
const navRight        = $('nav-right');
const againBtn        = $('again-btn');

// ─── カテゴリグラデーション ────────────────────────────────
const CAT_GRADIENTS = {
  all:      ['#fde68a', '#c084fc'],
  animals:  ['#fed7aa', '#fb923c'],
  food:     ['#fecaca', '#f472b6'],
  vehicles: ['#bfdbfe', '#60a5fa'],
  colors:   ['#ddd6fe', '#818cf8'],
  numbers:  ['#a7f3d0', '#34d399'],
  twowords: ['#bbf7d0', '#4ade80'],
};

// ─── 設定読み込み ───────────────────────────────────────────
let AppSettings = {
  rate: 0.78,
  pitch: 1.15,
  voice: '',
  autoplay: true,
};

function loadAppSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('flashcard_settings') || '{}');
    if (s.rate     != null) AppSettings.rate     = s.rate;
    if (s.pitch    != null) AppSettings.pitch    = s.pitch;
    if (s.voice    != null) AppSettings.voice    = s.voice;
    if (s.autoplay != null) AppSettings.autoplay = s.autoplay;
  } catch {}
}

// ─── 音声読み上げ ───────────────────────────────────────────
function loadVoices() {
  State.voices = speechSynthesis.getVoices();
}

function getJapaneseVoice() {
  // 管理画面で選択した音声を優先
  if (AppSettings.voice) {
    const sel = State.voices.find(v => v.name === AppSettings.voice);
    if (sel) return sel;
  }
  // 日本語音声を優先的に選択
  return State.voices.find(v => v.lang === 'ja-JP' && v.localService)
      || State.voices.find(v => v.lang === 'ja-JP')
      || State.voices.find(v => v.lang.startsWith('ja'))
      || null;
}

function speak(text, onEnd) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang   = 'ja-JP';
  utterance.rate   = AppSettings.rate;
  utterance.pitch  = AppSettings.pitch;
  utterance.volume = 1.0;

  const jpVoice = getJapaneseVoice();
  if (jpVoice) utterance.voice = jpVoice;

  utterance.onstart = () => {
    State.isSpeaking = true;
    const btn = document.querySelector('.card-speak-btn');
    if (btn) btn.classList.add('speaking');
  };

  utterance.onend = utterance.onerror = () => {
    State.isSpeaking = false;
    const btn = document.querySelector('.card-speak-btn');
    if (btn) btn.classList.remove('speaking');
    if (onEnd) onEnd();
  };

  speechSynthesis.speak(utterance);
}

function playCardAudio(card) {
  if (!card) return;

  // 音声ファイルがある場合はそちらを優先
  if (card.audio) {
    const audio = new Audio(card.audio);
    audio.play().catch(() => speakCard(card));
    return;
  }
  speakCard(card);
}

function speakCard(card) {
  // 数字カード: 数字 → 読み仮名
  if (card.category === 'numbers') {
    speak(card.numeral + '。' + card.reading);
    return;
  }
  // にもじご: 二語を読む
  if (card.category === 'twowords') {
    speak(card.reading.replace('　', '、'));
    return;
  }
  // 通常
  speak(card.reading || card.name);
}

// ─── デッキ管理 ──────────────────────────────────────────────
function buildDeck() {
  const cards = getCardsByCategory(State.category);
  State.deck = shuffleArray(cards);
  State.index = 0;
  renderProgressDots();
}

function getCurrentCard() {
  return State.deck[State.index] || null;
}

// ─── カードレンダリング ────────────────────────────────────
function createCardElement(card) {
  const el = document.createElement('div');
  el.className = 'flash-card';
  el.setAttribute('role', 'article');
  el.setAttribute('aria-label', card.name);
  el.dataset.cardId = card.id;

  // 背景色
  const bgColor = card.bgColor || '#f8fafc';
  el.style.background = bgColor;

  // ── ビジュアル部分 ──
  const visual = document.createElement('div');
  visual.className = 'card-visual';

  if (card.image) {
    // カスタム画像
    const img = document.createElement('img');
    img.src = card.image;
    img.alt = card.name;
    img.className = 'card-image';
    img.onerror = () => { img.replaceWith(createFallbackVisual(card)); };
    visual.appendChild(img);
  } else if (card.colorSwatch) {
    // 色カード
    const swatch = document.createElement('div');
    swatch.className = 'card-color-swatch';
    swatch.style.background = card.colorSwatch;
    if (card.colorSwatch === '#f8fafc') {
      swatch.style.border = '3px solid #cbd5e1';
    }
    visual.appendChild(swatch);
  } else if (card.numeral != null) {
    // 数字カード
    const numEl = document.createElement('span');
    numEl.className = 'card-numeral';
    numEl.textContent = card.numeral;
    // 数字ごとの色
    const NUM_COLORS = [
      '#ef4444','#f97316','#eab308','#22c55e','#06b6d4',
      '#3b82f6','#8b5cf6','#ec4899','#10b981','#f43f5e',
    ];
    const idx = parseInt(card.numeral) - 1;
    if (idx >= 0 && idx < NUM_COLORS.length) {
      numEl.style.color = NUM_COLORS[idx];
    }
    visual.appendChild(numEl);
  } else if (card.emoji) {
    // 絵文字カード
    const emojiEl = document.createElement('span');
    emojiEl.className = 'card-emoji';
    emojiEl.textContent = card.emoji;
    visual.appendChild(emojiEl);
  }

  el.appendChild(visual);

  // ── 名前テキスト ──
  const nameWrap = document.createElement('div');
  nameWrap.className = 'card-name-wrap';

  const nameEl = document.createElement('span');
  nameEl.className = 'card-name' + (card.category === 'twowords' ? ' twoword' : '');

  if (card.category === 'twowords') {
    // 二文語は改行して表示
    const parts = card.name.split(' ');
    if (parts.length === 2) {
      nameEl.textContent = parts[0] + '\n' + parts[1];
      nameEl.style.whiteSpace = 'pre-line';
    } else {
      nameEl.textContent = card.name;
    }
  } else {
    nameEl.textContent = card.name;
  }
  nameWrap.appendChild(nameEl);

  // 数字カードのみ読み仮名を表示
  if (card.category === 'numbers') {
    const readingEl = document.createElement('span');
    readingEl.className = 'card-reading';
    readingEl.textContent = card.reading;
    nameWrap.appendChild(readingEl);
  }

  el.appendChild(nameWrap);

  // ── 音声ボタン ──
  const speakBtn = document.createElement('button');
  speakBtn.className = 'card-speak-btn';
  speakBtn.setAttribute('aria-label', '音声を再生');
  speakBtn.textContent = '🔊';

  // カード全体をタップした時に音声を再生するように変更
  el.addEventListener('click', (e) => {
    // 既にスワイプ中なら無視
    if (State.isDragging) return;
    playCardAudio(card);
  });
  
  // ボタンクリックでも再生（親要素への伝播は不要）
  speakBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!State.isDragging) playCardAudio(card);
  });
  el.appendChild(speakBtn);

  return el;
}

function createFallbackVisual(card) {
  const emojiEl = document.createElement('span');
  emojiEl.className = 'card-emoji';
  emojiEl.textContent = card.emoji || '❓';
  return emojiEl;
}

// ─── カード表示 (アニメーション付き) ─────────────────────
function showCard(direction = 'right', autoSpeak = true) {
  const card = getCurrentCard();
  if (!card) {
    showDeckComplete();
    return;
  }

  const newCardEl = createCardElement(card);

  // 入場前の位置
  if (direction === 'right') {
    newCardEl.classList.add('entering-from-right');
  } else {
    newCardEl.classList.add('entering-from-left');
  }

  // 旧カードを退場
  if (State.activeCard) {
    const old = State.activeCard;
    old.classList.remove('active');
    old.classList.add(direction === 'right' ? 'leaving-to-left' : 'leaving-to-right');
    setTimeout(() => old.remove(), 400);
  }

  cardArea.appendChild(newCardEl);
  State.activeCard = newCardEl;

  // 次フレームでアクティブ化（アニメーション開始）
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      newCardEl.classList.remove('entering-from-right', 'entering-from-left');
      newCardEl.classList.add('active');
    });
  });

  // ヘッダー更新
  updateHeader(card);
  updateProgressText();

  // 音声再生（少し遅延して読み上げ）
  if (autoSpeak && AppSettings.autoplay) {
    setTimeout(() => playCardAudio(card), 350);
  }

  renderProgressDots();
  showSwipeHint();
}

// ─── ナビゲーション ────────────────────────────────────────
function goNext() {
  if (State.index >= State.deck.length - 1) {
    showDeckComplete();
    return;
  }
  State.index++;
  showCard('right');
}

function goPrev() {
  if (State.index <= 0) return;
  State.index--;
  showCard('left');
}

function showDeckComplete() {
  deckComplete.classList.add('visible');
}

function restartDeck() {
  deckComplete.classList.remove('visible');
  buildDeck();
  showCard('right');
}

// ─── ヘッダー更新 ─────────────────────────────────────────
function updateHeader(card) {
  const cat = getCategoryById(card.category);
  if (cat) {
    headerCatIcon.textContent = cat.icon;
    headerCatName.textContent = cat.label;
  }
}

function updateProgressText() {
  progressText.textContent = `${State.index + 1} / ${State.deck.length}`;
}

// ─── プログレスドット ─────────────────────────────────────
function renderProgressDots() {
  progressDots.innerHTML = '';
  const total = State.deck.length;
  const maxDots = 20; // 多すぎる場合は省略
  const showDots = Math.min(total, maxDots);

  for (let i = 0; i < showDots; i++) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === State.index) dot.classList.add('active');
    else if (i < State.index) dot.classList.add('seen');
    progressDots.appendChild(dot);
  }
}

// ─── カテゴリボタン ────────────────────────────────────────
function buildCategoryButtons() {
  categoryBtns.innerHTML = '';
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat.id === State.category ? ' active' : '');
    btn.setAttribute('aria-label', cat.label + 'カテゴリ');
    btn.dataset.catId = cat.id;
    btn.innerHTML = `<span>${cat.icon}</span><span>${cat.label}</span>`;
    btn.addEventListener('click', () => selectCategory(cat.id));
    categoryBtns.appendChild(btn);
  });
}

function selectCategory(catId) {
  if (catId === State.category) return;
  State.category = catId;

  // ボタン更新
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.catId === catId);
  });

  // デッキ再構築
  buildDeck();
  showCard('right');
}

// ─── スワイプ / ドラッグ操作 ──────────────────────────────
const SWIPE_THRESHOLD = 60;   // px
const SWIPE_ANGLE_MAX = 45;   // degrees（縦スワイプを除外）

function setupGestures() {
  cardArea.addEventListener('touchstart',  onTouchStart, { passive: true });
  cardArea.addEventListener('touchmove',   onTouchMove,  { passive: true });
  cardArea.addEventListener('touchend',    onTouchEnd,   { passive: true });
  cardArea.addEventListener('touchcancel', onTouchCancel,{ passive: true });

  // PC マウス対応
  cardArea.addEventListener('mousedown',  onMouseDown);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup',   onMouseUp);
}

function onTouchStart(e) {
  if (e.touches.length !== 1) return;
  startDrag(e.touches[0].clientX, e.touches[0].clientY);
}

function onTouchMove(e) {
  if (!State.isDragging || e.touches.length !== 1) return;
  moveDrag(e.touches[0].clientX, e.touches[0].clientY);
}

function onTouchEnd(e) {
  if (!State.isDragging) return;
  endDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
}

function onTouchCancel() {
  cancelDrag();
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  startDrag(e.clientX, e.clientY);
}

function onMouseMove(e) {
  if (!State.isDragging) return;
  moveDrag(e.clientX, e.clientY);
}

function onMouseUp(e) {
  if (!State.isDragging) return;
  endDrag(e.clientX, e.clientY);
}

function startDrag(x, y) {
  State.isDragging = true;
  State.dragStartX = x;
  State.dragStartY = y;
  State.dragCurrentX = x;
  if (State.activeCard) State.activeCard.classList.add('dragging');
}

function moveDrag(x, y) {
  State.dragCurrentX = x;
  const dx = x - State.dragStartX;
  if (State.activeCard) {
    State.activeCard.style.transform = `translateX(${dx}px) rotate(${dx * 0.02}deg)`;
  }
}

function endDrag(x, y) {
  State.isDragging = false;
  if (State.activeCard) {
    State.activeCard.classList.remove('dragging');
    State.activeCard.style.transform = '';
  }

  const dx = x - State.dragStartX;
  const dy = y - State.dragStartY;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // 水平スワイプ判定
  if (absDx >= SWIPE_THRESHOLD && absDx > absDy) {
    if (dx < 0) goNext();
    else         goPrev();
  }
}

function cancelDrag() {
  State.isDragging = false;
  if (State.activeCard) {
    State.activeCard.classList.remove('dragging');
    State.activeCard.style.transform = '';
  }
}

// ─── スワイプヒント ─────────────────────────────────────────
let hintEl = null;
let hintTimer = null;

function showSwipeHint() {
  if (State.hintShown) return;

  if (!hintEl) {
    hintEl = document.createElement('div');
    hintEl.className = 'swipe-hint';
    hintEl.innerHTML = '👈 スワイプ 👉';
    cardArea.appendChild(hintEl);
  }

  hintEl.classList.remove('fade-out');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => {
    if (hintEl) hintEl.classList.add('fade-out');
    State.hintShown = true;
  }, 3000);
}

// ─── 設定ボタン（タップで管理画面へ）─────────────────────────
settingsBtn.addEventListener('click', () => {
  window.location.href = 'admin.html';
});

// ─── ナビボタン ────────────────────────────────────────────
navLeft.addEventListener('click',  () => goPrev());
navRight.addEventListener('click', () => goNext());
againBtn.addEventListener('click', () => restartDeck());

// ─── スプラッシュ ──────────────────────────────────────────
splashStartBtn.addEventListener('click', () => {
  splashScreen.classList.add('hidden');
  setTimeout(() => {
    splashScreen.style.display = 'none';
  }, 700);
  // 音声コンテキスト初期化（iOS 用）
  initAudio();
});

function initAudio() {
  // iOS Safari ではユーザー操作後に AudioContext を初期化
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
  loadVoices();
}

// ─── キーボード操作 ────────────────────────────────────────
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === ' ')  { e.preventDefault(); goNext(); }
    if (e.key === 'ArrowLeft')                     { e.preventDefault(); goPrev(); }
    if (e.key === 'Enter')                         { playCardAudio(getCurrentCard()); }
  });
}

// ─── 初期化 ────────────────────────────────────────────────
function init() {
  // 設定読み込み
  loadAppSettings();

  // 音声リスト取得（非同期の場合もある）
  if ('speechSynthesis' in window) {
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices();
    }
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
  }

  // カテゴリボタン生成
  buildCategoryButtons();

  // デッキ構築
  buildDeck();

  // 初期カード表示（スプラッシュ非表示後に表示）
  showCard('right', false);

  // スワイプ設定
  setupGestures();

  // キーボード設定
  setupKeyboard();
}

// DOM 準備完了後に初期化
document.addEventListener('DOMContentLoaded', init);
