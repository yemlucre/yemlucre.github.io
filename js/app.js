// ============================================================
// 茶语 · 交互逻辑
// ============================================================

const state = {
  type: '全部',
  search: ''
};

// 茶类分组（用于筛选 chips 与冲泡指南）
const TEA_TYPES = ['全部', '绿茶', '红茶', '乌龙茶', '白茶', '黑茶', '黄茶', '花茶'];

// 六大茶类冲泡参考
const BREWING_GUIDE = [
  { type: '绿茶', color: '#5f8f6b', temp: '75 - 85℃', utensil: '玻璃杯 / 盖碗', ratio: '3g : 150ml', time: '1 分钟' },
  { type: '红茶', color: '#b3573f', temp: '90 - 95℃', utensil: '盖碗 / 瓷壶', ratio: '5g : 150ml', time: '5 - 10 秒' },
  { type: '乌龙茶', color: '#8a6d3b', temp: '100℃', utensil: '盖碗 / 紫砂壶', ratio: '7 - 8g : 110ml', time: '快进快出' },
  { type: '白茶', color: '#a3a79b', temp: '90℃', utensil: '玻璃杯 / 盖碗', ratio: '3g : 150ml', time: '1 - 2 分钟' },
  { type: '黑茶', color: '#5b4a3f', temp: '100℃', utensil: '紫砂壶 / 盖碗', ratio: '8g : 150ml', time: '洗茶后快出汤' },
  { type: '黄茶', color: '#b8972f', temp: '85℃', utensil: '玻璃杯', ratio: '3g : 150ml', time: '2 分钟' }
];

// ---------- 工具 ----------
// 评分星：空星 + 满星，小数部分按百分比染色
function percentStars(rating) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return `<span class="stars-percent" style="--pct:${pct}%">
    <span class="stars-base">★★★★★</span>
    <span class="stars-fill">★★★★★</span>
  </span>`;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fmtRating(n) {
  return String(Math.round(n * 100) / 100);
}

function avgRating(tea) {
  const vs = (tea.varieties || []).filter(v => v.rating != null);
  if (!vs.length) return 0;
  return vs.reduce((s, v) => s + v.rating, 0) / vs.length;
}

// ---------- 渲染 ----------
function filteredTeas() {
  let list = TEAS.filter(t =>
    (state.type === '全部' || t.type === state.type) &&
    (state.search === '' ||
      t.name.includes(state.search) ||
      t.origin.includes(state.search) ||
      t.type.includes(state.search) ||
      t.flavor.some(f => f.includes(state.search)))
  );
  list.sort((a, b) => avgRating(b) - avgRating(a));
  return list;
}

function renderChips() {
  const box = document.getElementById('filterChips');
  box.innerHTML = TEA_TYPES.map(t =>
    `<button class="chip${t === state.type ? ' active' : ''}" data-type="${t}">${t}</button>`
  ).join('');
}

function renderGrid() {
  const grid = document.getElementById('teaGrid');
  const empty = document.getElementById('emptyState');
  const list = filteredTeas();
  grid.innerHTML = list.map(tea => `
    <article class="tea-card" data-id="${tea.id}" tabindex="0" role="button" aria-label="查看 ${tea.name}">
      <div class="tea-card-img">
        <img src="${tea.image}" alt="${tea.name}" loading="lazy" />
        <span class="tea-badge">${tea.type}</span>
      </div>
      <div class="tea-card-body">
        <div class="tea-card-head">
          <div>
            <h3>${tea.name}</h3>
            <p class="tea-origin">${tea.origin}</p>
          </div>
        </div>
        <div class="tea-flavors">${tea.flavor.map(f => `<span class="flavor-tag">${f}</span>`).join('')}</div>
      </div>
    </article>
  `).join('');
  empty.hidden = list.length > 0;
}

function renderBrewing() {
  const box = document.getElementById('brewingGrid');
  box.innerHTML = BREWING_GUIDE.map(b => `
    <div class="brew-card">
      <h3 style="color:${b.color}">${b.type}</h3>
      <p class="brew-sub">基础冲泡参考</p>
      <div class="brew-row"><span>水温</span><strong>${b.temp}</strong></div>
      <div class="brew-row"><span>器具</span><strong>${b.utensil}</strong></div>
      <div class="brew-row"><span>茶水比</span><strong>${b.ratio}</strong></div>
      <div class="brew-row"><span>出汤时间</span><strong>${b.time}</strong></div>
    </div>
  `).join('');
}

function renderStats() {
  document.getElementById('statTeas').textContent = TEAS.length;
  const totalVarieties = TEAS.reduce((n, t) => n + (t.varieties || []).length, 0);
  document.getElementById('statTypes').textContent = totalVarieties;
  const total = TEAS.reduce((n, t) =>
    n + (t.varieties || []).reduce((m, v) => m + (v.reviews || []).length, 0), 0);
  document.getElementById('statReviews').textContent = total;
}

// ---------- 弹窗 ----------
function openModal(id) {
  const tea = TEAS.find(t => t.id === id);
  if (!tea) return;
  const varieties = tea.varieties || [];

  document.getElementById('modalBody').innerHTML = `
    <div class="modal-hero">
      <img src="${tea.image}" alt="${tea.name}" />
      <span class="modal-badge">${tea.type}</span>
    </div>
    <div class="modal-content">
      <div class="modal-title-row">
        <div>
          <h2 id="modalTitle">${tea.name}</h2>
          <p class="modal-origin">${tea.origin}</p>
        </div>
      </div>
      <p class="modal-desc">${tea.description}</p>
      <div class="modal-flavors">${tea.flavor.map(f => `<span class="flavor-tag">${f}</span>`).join('')}</div>

      <div class="modal-section">
        <h3>冲泡手法</h3>
        <div class="brew-grid">
          <div class="brew-cell"><label>水温</label><strong>${tea.brewing.waterTemp}</strong></div>
          <div class="brew-cell"><label>器具</label><strong>${tea.brewing.utensil}</strong></div>
          <div class="brew-cell"><label>茶水比</label><strong>${tea.brewing.ratio}</strong></div>
          <div class="brew-cell"><label>出汤时间</label><strong>${tea.brewing.time}</strong></div>
        </div>
        <ol class="brew-steps" style="margin-top:14px">
          ${tea.brewing.steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </div>

      <div class="modal-section">
        <h3>品种与品牌（${varieties.length}）</h3>
        <div class="variety-list">
          ${varieties.length ? varieties.map(v => `
            <div class="variety-item">
              <div class="variety-head">
                <h4>${v.brand ? `${escapeHtml(v.brand)} · ${escapeHtml(v.name)}` : escapeHtml(v.name)}</h4>
                <div class="variety-right">
                  ${v.price != null ? `<span class="variety-price">¥${fmtRating(v.price)}<small>/50g</small></span>` : ''}
                  <div class="variety-rating">
                    ${v.rating != null
                      ? `${percentStars(v.rating)}<span class="variety-num">${fmtRating(v.rating)}</span>`
                      : '<span class="variety-num">暂无评分</span>'}
                  </div>
                </div>
              </div>
              <div class="review-list">
                ${(v.reviews || []).map(r => `
                  <div class="review-item">
                    <div class="review-head">
                      <span class="review-user">${escapeHtml(r.user)}</span>
                      <span class="review-meta">
                        <span class="r-stars">${percentStars(r.rating)}</span>
                        ${r.date ? `<span>${r.date}</span>` : ''}
                      </span>
                    </div>
                    <p class="review-content">${escapeHtml(r.content)}</p>
                  </div>
                `).join('') || '<p style="color:var(--ink-mute)">暂无评价</p>'}
              </div>
            </div>
          `).join('') : '<p style="color:var(--ink-mute)">该茶品暂未收录品牌信息。</p>'}
        </div>
      </div>
    </div>
  `;

  const overlay = document.getElementById('modalOverlay');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').hidden = true;
  document.body.style.overflow = '';
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---------- 事件绑定 ----------
function bindEvents() {
  // 筛选 chips
  document.getElementById('filterChips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    state.type = chip.dataset.type;
    renderChips();
    renderGrid();
  });

  // 搜索
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value.trim();
    renderGrid();
  });

  // 卡片点击（含键盘）
  document.getElementById('teaGrid').addEventListener('click', e => {
    const card = e.target.closest('.tea-card');
    if (card) openModal(card.dataset.id);
  });
  document.getElementById('teaGrid').addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      const card = e.target.closest('.tea-card');
      if (card) { e.preventDefault(); openModal(card.dataset.id); }
    }
  });

  // 弹窗关闭
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // 导航高亮
  const links = document.querySelectorAll('.nav-link');
  const sections = ['home', 'teas', 'brewing', 'about'];
  window.addEventListener('scroll', () => {
    let cur = 'home';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 120) cur = id;
    }
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  });
}

// ---------- 初始化 ----------
function init() {
  renderChips();
  renderGrid();
  renderBrewing();
  renderStats();
  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
