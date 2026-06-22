/**
 * cards-data.js
 * フラッシュカードアプリ — カードデータ定義
 *
 * カードを追加・編集する場合は admin.html を使用してください。
 * ここのデフォルトデータはlocalStorageにカスタムデータが無い場合に使われます。
 */

'use strict';

// ─── カテゴリ定義 ───────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',      label: 'ぜんぶ',     icon: '✨', gradient: ['#f9a8d4','#c084fc'] },
  { id: 'animals',  label: 'どうぶつ',   icon: '🐾', gradient: ['#fde68a','#fb923c'] },
  { id: 'food',     label: 'たべもの',   icon: '🍴', gradient: ['#fca5a5','#f472b6'] },
  { id: 'vehicles', label: 'のりもの',   icon: '🚗', gradient: ['#93c5fd','#60a5fa'] },
  { id: 'colors',   label: 'いろ',       icon: '🎨', gradient: ['#c4b5fd','#818cf8'] },
  { id: 'numbers',  label: 'かず',       icon: '🔢', gradient: ['#6ee7b7','#34d399'] },
  { id: 'twowords', label: 'にもじご',   icon: '💬', gradient: ['#86efac','#4ade80'] },
];

// ─── デフォルトカードデータ ─────────────────────────────────
const DEFAULT_CARDS = [

  // ═══ どうぶつ ═══════════════════════════════════════════════
  { id:'dog',      name:'いぬ',         reading:'いぬ',           category:'animals',  emoji:'🐶', bgColor:'#fff7ed', image:null, audio:null },
  { id:'cat',      name:'ねこ',         reading:'ねこ',           category:'animals',  emoji:'🐱', bgColor:'#fef3c7', image:null, audio:null },
  { id:'rabbit',   name:'うさぎ',       reading:'うさぎ',         category:'animals',  emoji:'🐰', bgColor:'#fce7f3', image:null, audio:null },
  { id:'bear',     name:'くま',         reading:'くま',           category:'animals',  emoji:'🐻', bgColor:'#fef9c3', image:null, audio:null },
  { id:'elephant', name:'ぞう',         reading:'ぞう',           category:'animals',  emoji:'🐘', bgColor:'#e0f2fe', image:null, audio:null },
  { id:'giraffe',  name:'きりん',       reading:'きりん',         category:'animals',  emoji:'🦒', bgColor:'#fef3c7', image:null, audio:null },
  { id:'monkey',   name:'さる',         reading:'さる',           category:'animals',  emoji:'🐵', bgColor:'#ffedd5', image:null, audio:null },
  { id:'bird',     name:'とり',         reading:'とり',           category:'animals',  emoji:'🐦', bgColor:'#e0f2fe', image:null, audio:null },
  { id:'fish',     name:'さかな',       reading:'さかな',         category:'animals',  emoji:'🐟', bgColor:'#cffafe', image:null, audio:null },
  { id:'pig',      name:'ぶた',         reading:'ぶた',           category:'animals',  emoji:'🐷', bgColor:'#fce7f3', image:null, audio:null },
  { id:'sheep',    name:'ひつじ',       reading:'ひつじ',         category:'animals',  emoji:'🐑', bgColor:'#f0fdf4', image:null, audio:null },
  { id:'cow',      name:'うし',         reading:'うし',           category:'animals',  emoji:'🐄', bgColor:'#f0fdf4', image:null, audio:null },
  { id:'panda',    name:'パンダ',       reading:'パンダ',         category:'animals',  emoji:'🐼', bgColor:'#f1f5f9', image:null, audio:null },
  { id:'lion',     name:'ライオン',     reading:'ライオン',       category:'animals',  emoji:'🦁', bgColor:'#fef3c7', image:null, audio:null },
  { id:'penguin',  name:'ペンギン',     reading:'ペンギン',       category:'animals',  emoji:'🐧', bgColor:'#e0f2fe', image:null, audio:null },

  // ═══ たべもの ══════════════════════════════════════════════
  { id:'apple',    name:'りんご',       reading:'りんご',         category:'food',     emoji:'🍎', bgColor:'#fee2e2', image:null, audio:null },
  { id:'banana',   name:'バナナ',       reading:'バナナ',         category:'food',     emoji:'🍌', bgColor:'#fef9c3', image:null, audio:null },
  { id:'strawb',   name:'いちご',       reading:'いちご',         category:'food',     emoji:'🍓', bgColor:'#fee2e2', image:null, audio:null },
  { id:'orange',   name:'みかん',       reading:'みかん',         category:'food',     emoji:'🍊', bgColor:'#ffedd5', image:null, audio:null },
  { id:'grapes',   name:'ぶどう',       reading:'ぶどう',         category:'food',     emoji:'🍇', bgColor:'#ede9fe', image:null, audio:null },
  { id:'watermel', name:'すいか',       reading:'すいか',         category:'food',     emoji:'🍉', bgColor:'#dcfce7', image:null, audio:null },
  { id:'bread',    name:'パン',         reading:'パン',           category:'food',     emoji:'🍞', bgColor:'#fef3c7', image:null, audio:null },
  { id:'rice',     name:'ごはん',       reading:'ごはん',         category:'food',     emoji:'🍚', bgColor:'#f0fdf4', image:null, audio:null },
  { id:'egg',      name:'たまご',       reading:'たまご',         category:'food',     emoji:'🥚', bgColor:'#fef9c3', image:null, audio:null },
  { id:'icecream', name:'アイス',       reading:'アイスクリーム', category:'food',     emoji:'🍦', bgColor:'#fce7f3', image:null, audio:null },
  { id:'cake',     name:'ケーキ',       reading:'ケーキ',         category:'food',     emoji:'🎂', bgColor:'#fce7f3', image:null, audio:null },
  { id:'ramen',    name:'ラーメン',     reading:'ラーメン',       category:'food',     emoji:'🍜', bgColor:'#fef3c7', image:null, audio:null },
  { id:'juice',    name:'ジュース',     reading:'ジュース',       category:'food',     emoji:'🧃', bgColor:'#ecfdf5', image:null, audio:null },
  { id:'milk',     name:'ぎゅうにゅう', reading:'ぎゅうにゅう',   category:'food',     emoji:'🥛', bgColor:'#f0f9ff', image:null, audio:null },

  // ═══ のりもの ══════════════════════════════════════════════
  { id:'car',       name:'くるま',         reading:'くるま',         category:'vehicles', emoji:'🚗', bgColor:'#dbeafe', image:null, audio:null },
  { id:'train',     name:'でんしゃ',       reading:'でんしゃ',       category:'vehicles', emoji:'🚂', bgColor:'#ede9fe', image:null, audio:null },
  { id:'bus',       name:'バス',           reading:'バス',           category:'vehicles', emoji:'🚌', bgColor:'#fef3c7', image:null, audio:null },
  { id:'airplane',  name:'ひこうき',       reading:'ひこうき',       category:'vehicles', emoji:'✈️', bgColor:'#e0f2fe', image:null, audio:null },
  { id:'ship',      name:'ふね',           reading:'ふね',           category:'vehicles', emoji:'🚢', bgColor:'#cffafe', image:null, audio:null },
  { id:'bicycle',   name:'じてんしゃ',     reading:'じてんしゃ',     category:'vehicles', emoji:'🚲', bgColor:'#d1fae5', image:null, audio:null },
  { id:'firetruck', name:'しょうぼうしゃ', reading:'しょうぼうしゃ', category:'vehicles', emoji:'🚒', bgColor:'#fee2e2', image:null, audio:null },
  { id:'ambulance', name:'きゅうきゅうしゃ',reading:'きゅうきゅうしゃ',category:'vehicles',emoji:'🚑',bgColor:'#eff6ff', image:null, audio:null },
  { id:'helicopter',name:'ヘリコプター',   reading:'ヘリコプター',   category:'vehicles', emoji:'🚁', bgColor:'#ecfdf5', image:null, audio:null },
  { id:'motorcycle',name:'オートバイ',     reading:'オートバイ',     category:'vehicles', emoji:'🏍️', bgColor:'#f5f3ff', image:null, audio:null },

  // ═══ いろ ═══════════════════════════════════════════════════
  { id:'red',      name:'あか',   reading:'あか',   category:'colors',   emoji:null, colorSwatch:'#ef4444', bgColor:'#fee2e2', image:null, audio:null },
  { id:'blue',     name:'あお',   reading:'あお',   category:'colors',   emoji:null, colorSwatch:'#3b82f6', bgColor:'#dbeafe', image:null, audio:null },
  { id:'yellow',   name:'きいろ', reading:'きいろ', category:'colors',   emoji:null, colorSwatch:'#eab308', bgColor:'#fef9c3', image:null, audio:null },
  { id:'green',    name:'みどり', reading:'みどり', category:'colors',   emoji:null, colorSwatch:'#22c55e', bgColor:'#dcfce7', image:null, audio:null },
  { id:'white',    name:'しろ',   reading:'しろ',   category:'colors',   emoji:null, colorSwatch:'#f8fafc', bgColor:'#f1f5f9', image:null, audio:null },
  { id:'black',    name:'くろ',   reading:'くろ',   category:'colors',   emoji:null, colorSwatch:'#1e293b', bgColor:'#e2e8f0', image:null, audio:null },
  { id:'orange_c', name:'オレンジ',reading:'オレンジ',category:'colors',  emoji:null, colorSwatch:'#f97316', bgColor:'#ffedd5', image:null, audio:null },
  { id:'purple',   name:'むらさき',reading:'むらさき',category:'colors',  emoji:null, colorSwatch:'#a855f7', bgColor:'#faf5ff', image:null, audio:null },
  { id:'pink',     name:'ピンク', reading:'ピンク', category:'colors',   emoji:null, colorSwatch:'#ec4899', bgColor:'#fdf2f8', image:null, audio:null },
  { id:'brown',    name:'ちゃいろ',reading:'ちゃいろ',category:'colors',  emoji:null, colorSwatch:'#92400e', bgColor:'#fef3c7', image:null, audio:null },

  // ═══ かず ═══════════════════════════════════════════════════
  { id:'num1',  name:'いち', reading:'いち', numeral:'１', category:'numbers', emoji:null, bgColor:'#fee2e2', image:null, audio:null },
  { id:'num2',  name:'に',   reading:'に',   numeral:'２', category:'numbers', emoji:null, bgColor:'#ffedd5', image:null, audio:null },
  { id:'num3',  name:'さん', reading:'さん', numeral:'３', category:'numbers', emoji:null, bgColor:'#fef9c3', image:null, audio:null },
  { id:'num4',  name:'し',   reading:'し',   numeral:'４', category:'numbers', emoji:null, bgColor:'#dcfce7', image:null, audio:null },
  { id:'num5',  name:'ご',   reading:'ご',   numeral:'５', category:'numbers', emoji:null, bgColor:'#cffafe', image:null, audio:null },
  { id:'num6',  name:'ろく', reading:'ろく', numeral:'６', category:'numbers', emoji:null, bgColor:'#dbeafe', image:null, audio:null },
  { id:'num7',  name:'なな', reading:'なな', numeral:'７', category:'numbers', emoji:null, bgColor:'#ede9fe', image:null, audio:null },
  { id:'num8',  name:'はち', reading:'はち', numeral:'８', category:'numbers', emoji:null, bgColor:'#fce7f3', image:null, audio:null },
  { id:'num9',  name:'きゅう',reading:'きゅう',numeral:'９',category:'numbers', emoji:null, bgColor:'#ecfdf5', image:null, audio:null },
  { id:'num10', name:'じゅう',reading:'じゅう',numeral:'10',category:'numbers', emoji:null, bgColor:'#fff7ed', image:null, audio:null },

  // ═══ にもじご ══════════════════════════════════════════════
  { id:'tw1',  name:'ワンワン きた',     reading:'ワンワン　きた',     category:'twowords', emoji:'🐶', bgColor:'#fff7ed', image:null, audio:null },
  { id:'tw2',  name:'ブーブー はしる',   reading:'ブーブー　はしる',   category:'twowords', emoji:'🚗', bgColor:'#dbeafe', image:null, audio:null },
  { id:'tw3',  name:'ごはん たべる',     reading:'ごはん　たべる',     category:'twowords', emoji:'🍚', bgColor:'#dcfce7', image:null, audio:null },
  { id:'tw4',  name:'おみず のむ',       reading:'おみず　のむ',       category:'twowords', emoji:'💧', bgColor:'#e0f2fe', image:null, audio:null },
  { id:'tw5',  name:'ねんね する',       reading:'ねんね　する',       category:'twowords', emoji:'😴', bgColor:'#fce7f3', image:null, audio:null },
  { id:'tw6',  name:'そと いく',         reading:'そと　いく',         category:'twowords', emoji:'🌳', bgColor:'#dcfce7', image:null, audio:null },
  { id:'tw7',  name:'バイバイ する',     reading:'バイバイ　する',     category:'twowords', emoji:'👋', bgColor:'#fef9c3', image:null, audio:null },
  { id:'tw8',  name:'おてて あらう',     reading:'おてて　あらう',     category:'twowords', emoji:'🧼', bgColor:'#e0f2fe', image:null, audio:null },
  { id:'tw9',  name:'もっと ちょうだい', reading:'もっと　ちょうだい', category:'twowords', emoji:'🙏', bgColor:'#fff7ed', image:null, audio:null },
  { id:'tw10', name:'ないない する',     reading:'ないない　する',     category:'twowords', emoji:'📦', bgColor:'#f5f3ff', image:null, audio:null },
];

// ─── データアクセス関数 ──────────────────────────────────────
function getCards() {
  try {
    const stored = localStorage.getItem('flashcard_cards');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('カードデータ読み込みエラー:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CARDS)); // deep copy
}

function saveCards(cards) {
  try {
    localStorage.setItem('flashcard_cards', JSON.stringify(cards));
    return true;
  } catch (e) {
    console.error('カードデータ保存エラー:', e);
    return false;
  }
}

function resetToDefault() {
  localStorage.removeItem('flashcard_cards');
  return JSON.parse(JSON.stringify(DEFAULT_CARDS));
}

function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) || CATEGORIES[0];
}

function getCardsByCategory(categoryId) {
  const cards = getCards();
  if (!categoryId || categoryId === 'all') return cards;
  return cards.filter(c => c.category === categoryId);
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
