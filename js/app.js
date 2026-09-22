// ============================================================
// 茶语 · 交互逻辑
// ============================================================

// 暂时隐藏各品牌价格显示；需要恢复时改回 true 即可
const SHOW_PRICE = false;

const state = {
  type: '全部',
  search: '',
  activeTea: null,   // 当前打开详情弹窗的茶叶 id
  authTab: 'login',  // 登录/注册弹窗当前标签
  rateValues: {}     // 详情弹窗中各品牌当前选中的星级（0.5-5，支持半星），键为品牌标识
};

// 茶类分组（用于筛选 chips 与冲泡指南）
const TEA_TYPES = ['全部', '绿茶', '红茶', '乌龙茶', '白茶', '黑茶', '黄茶', '花茶'];

// 六大茶类冲泡参考
const BREWING_GUIDE = [
  { type: '绿茶', color: '#5f8f6b', temp: '80 - 85℃', utensil: '玻璃杯 / 盖碗', ratio: '3g : 150ml', time: '1 分钟' },
  { type: '红茶', color: '#b3573f', temp: '90 - 95℃', utensil: '盖碗 / 瓷壶', ratio: '5g : 110ml', time: '5 - 10 秒' },
  { type: '乌龙茶', color: '#8a6d3b', temp: '100℃', utensil: '盖碗 / 紫砂壶', ratio: '7 - 8g : 110ml', time: '快进快出' },
  { type: '白茶', color: '#a3a79b', temp: '90 - 100℃', utensil: '盖碗 / 玻璃杯', ratio: '5g : 110ml / 3g : 150ml', time: '盖碗快出汤，杯泡 1 - 2 分钟' },
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

function fmtDate(iso) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const p = n => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function avgRating(tea) {
  const vs = (tea.varieties || []).filter(v => v.rating != null);
  if (!vs.length) return 0;
  return vs.reduce((s, v) => s + v.rating, 0) / vs.length;
}

// 品牌条目标识：云端评分以「茶 × 品牌」为维度保存
function varietyKey(v) {
  return v.brand ? v.brand + '·' + v.name : v.name;
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
        ${cardRatingHtml(tea)}
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
    n + (t.varieties || []).reduce((m, v) => m + (v.reviews || []).length, 0), 0)
    + UserStore.totalUserReviews();
  document.getElementById('statReviews').textContent = total;
}

// ---------- 弹窗 ----------
function openModal(id) {
  const tea = TEAS.find(t => t.id === id);
  if (!tea) return;
  const varieties = tea.varieties || [];
  state.activeTea = id;
  // 各品牌独立记录当前选中的星级（默认取我已发布的评分）
  state.rateValues = {};
  varieties.forEach(v => {
    const my = UserStore.myReview(id, varietyKey(v));
    state.rateValues[varietyKey(v)] = my ? my.rating : 0;
  });

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

      ${varietiesSectionHtml(tea, varieties)}
    </div>
  `;

  const overlay = document.getElementById('modalOverlay');
  overlay.hidden = false;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modalOverlay').hidden = true;
  document.body.style.overflow = '';
  state.activeTea = null;
  state.rateValues = {};
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.hidden = true; }, 2200);
}

// ---------- 用户与茶友评分 ----------
function renderAuthArea() {
  const box = document.getElementById('authArea');
  const user = UserStore.currentUser();
  if (!user) {
    box.innerHTML = '<button type="button" class="btn btn-primary btn-sm" id="loginBtn">登录 / 注册</button>';
    return;
  }
  const initial = user.name.trim().charAt(0).toUpperCase();
  box.innerHTML = `
    <div class="account-wrap">
      <button type="button" class="user-chip" id="accountBtn" title="账号与邀请码" aria-haspopup="true">
        <span class="user-avatar">${escapeHtml(initial)}</span>
        <span class="user-name">${escapeHtml(user.name)}</span>
        <svg class="chip-caret" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>
      </button>
      <div class="account-menu" id="accountMenu" hidden>
        <div class="account-head">
          <span class="account-name">${escapeHtml(user.name)}</span>
          <span class="account-mail">${escapeHtml(user.email || '')}</span>
        </div>
        <div class="invite-box">
          <span class="invite-label">我的邀请码（可重复使用）</span>
          <div class="invite-code-row">
            <code class="invite-code" id="myInviteCode">${escapeHtml(user.inviteCode || '—')}</code>
            <button type="button" class="btn btn-ghost btn-xs" id="copyInviteBtn">复制</button>
          </div>
          <span class="invite-status">茶友注册时填写即可，一枚邀请码可邀请多位茶友。</span>
        </div>
        <button type="button" class="btn btn-ghost btn-sm account-logout" id="logoutBtn">退出登录</button>
      </div>
    </div>`;
}

// ---------- 账号菜单（邀请码） ----------
function toggleAccountMenu() {
  const menu = document.getElementById('accountMenu');
  if (!menu) return;
  menu.hidden = !menu.hidden;
}

function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
    } catch (e) {
      reject(e);
    } finally {
      ta.remove();
    }
  });
}

function switchAuthTab(tab) {
  state.authTab = tab === 'register' ? 'register' : 'login';
  document.querySelectorAll('#authTabs .auth-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === state.authTab));
  document.getElementById('loginForm').hidden = state.authTab !== 'login';
  document.getElementById('registerForm').hidden = state.authTab !== 'register';
}

function openAuth(tab) {
  switchAuthTab(tab);
  showAuthError('loginError', '');
  showAuthError('registerError', '');
  document.getElementById('authOverlay').hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    const el = document.getElementById(state.authTab === 'login' ? 'loginEmail' : 'regName');
    if (el) el.focus();
  }, 60);
}

function closeAuth() {
  document.getElementById('authOverlay').hidden = true;
  if (document.getElementById('modalOverlay').hidden) document.body.style.overflow = '';
}

function showAuthError(id, msg) {
  const box = document.getElementById(id);
  if (!box) return;
  box.textContent = msg || '';
  box.hidden = !msg;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  showAuthError('loginError', '');
  const btn = e.target.querySelector('.auth-submit');
  btn.disabled = true;
  UserStore.login(email, pass)
    .then(u => { closeAuth(); showToast(`欢迎回来，${u.name}！`); })
    .catch(err => showAuthError('loginError', err.message))
    .finally(() => { btn.disabled = false; });
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const pass = document.getElementById('regPass').value;
  const pass2 = document.getElementById('regPass2').value;
  const invite = document.getElementById('regInvite').value.trim();
  showAuthError('registerError', '');
  if (pass !== pass2) { showAuthError('registerError', '两次输入的密码不一致'); return; }
  const btn = e.target.querySelector('.auth-submit');
  btn.disabled = true;
  UserStore.register(name, email, pass, invite)
    .then(res => {
      closeAuth();
      if (res && res.needsConfirmation) {
        showToast('注册成功！请到邮箱完成验证后再登录');
      } else {
        showToast(`欢迎加入茶语，${res.name}！点击右上角头像可查看你的邀请码`);
      }
    })
    .catch(err => showAuthError('registerError', err.message))
    .finally(() => { btn.disabled = false; });
}

// 账号 / 评分数据变化后，刷新受影响的区域
function onUserDataChange() {
  renderAuthArea();
  renderGrid();
  renderStats();
  const overlay = document.getElementById('modalOverlay');
  if (state.activeTea && !overlay.hidden) {
    const modal = overlay.querySelector('.modal');
    const top = modal ? modal.scrollTop : 0;
    openModal(state.activeTea);
    if (modal) modal.scrollTop = top;
  }
}

// 卡片上的茶友平均分（五分制）
function cardRatingHtml(tea) {
  const s = UserStore.teaStats(tea.id);
  if (!s.count) return '';
  return `<div class="tea-rating"><span class="star">★</span><span class="num">${s.avg.toFixed(1)} 分 · ${s.count} 人评</span></div>`;
}

// 详情弹窗「品种与品牌」区块：茶友评分与评价按品牌独立展示（五分制）
function varietiesSectionHtml(tea, varieties) {
  const user = UserStore.currentUser();
  const loginTip = user ? '' : `
      <div class="rate-login-tip">
        <span>登录后可在下方每个品牌后打分（1 - 5 星）并撰写评价，评分按品牌独立计算平均分。</span>
        <button type="button" class="btn btn-primary btn-sm" id="rateLoginBtn">登录 / 注册</button>
      </div>`;

  const items = varieties.length ? varieties.map(v => {
    const vk = varietyKey(v);
    const stats = UserStore.varietyStats(tea.id, vk);
    const reviews = UserStore.varietyReviews(tea.id, vk);
    const my = UserStore.myReview(tea.id, vk);

    // 数据文件中收录的该品种评价
    const staticReviews = (v.reviews || []).map(r => `
      <div class="review-item">
        <div class="review-head">
          <span class="review-user">${escapeHtml(r.user)}</span>
          <span class="review-meta">
            <span class="r-stars">${percentStars(r.rating)}</span>
            ${r.date ? `<span>${r.date}</span>` : ''}
          </span>
        </div>
        <p class="review-content">${escapeHtml(r.content)}</p>
      </div>`).join('');

    // 该品牌的茶友平均分（五分制）
    const summary = stats.count
      ? `<div class="variety-rate-summary">
          ${percentStars(stats.avg)}
          <span class="r-num">${stats.avg.toFixed(1)} / 5</span>
          <span class="rate-count">${stats.count} 位茶友评分</span>
        </div>`
      : '<span class="rate-none">暂无茶友评分，登录后来做第一个打分的人吧。</span>';

    // 该品牌的茶友评价列表
    const list = reviews.length ? `
      <div class="review-list user-review-list">
        ${reviews.map(r => `
          <div class="review-item">
            <div class="review-head">
              <span class="review-user">${escapeHtml(r.user)}</span>
              <span class="review-meta">${percentStars(r.rating)}<span class="r-num">${r.rating} / 5</span>${r.updatedAt ? `<span>${fmtDate(r.updatedAt)}</span>` : ''}</span>
            </div>
            ${r.review ? `<p class="review-content">${escapeHtml(r.review)}</p>` : ''}
          </div>`).join('')}
      </div>` : '';

    // 我的评分表单（同一品牌保留一条，可随时更新/删除）
    const form = user ? `
      <div class="review-form" data-vkey="${escapeHtml(vk)}">
        <h4>我的评分与评价（五分制，支持半星，可随时更新）</h4>
        <div class="star-picker" data-vkey="${escapeHtml(vk)}">
          ${Array.from({ length: 5 }, (_, i) => {
            const v = i + 1;
            const cls = state.rateValues[vk] >= v ? ' on' : (state.rateValues[vk] >= v - 0.5 ? ' half' : '');
            return `<span class="star-slot${cls}" data-slot="${v}"><button type="button" data-value="${v - 0.5}" aria-label="${v - 0.5} 分"></button><button type="button" data-value="${v}" aria-label="${v} 分"></button></span>`;
          }).join('')}
          <span class="picker-hint">${state.rateValues[vk] ? `${state.rateValues[vk]} / 5 分` : '点击星星评分'}</span>
        </div>
        <div class="form-row">
          <textarea maxlength="500" placeholder="这个品牌喝起来怎么样？写下你的感受（可不填）…">${my ? escapeHtml(my.review || '') : ''}</textarea>
        </div>
        <div class="form-submit">
          ${my ? `<button type="button" class="btn btn-ghost btn-sm review-delete" data-vkey="${escapeHtml(vk)}">删除我的评价</button>` : ''}
          <button type="button" class="btn btn-primary btn-sm review-submit" data-vkey="${escapeHtml(vk)}">${my ? '更新评价' : '发布评价'}</button>
        </div>
      </div>` : '';

    return `
      <div class="variety-item">
        <div class="variety-head">
          <h4>${v.brand ? `${escapeHtml(v.brand)} · ${escapeHtml(v.name)}` : escapeHtml(v.name)}</h4>
          <div class="variety-right">
            ${SHOW_PRICE && v.price != null ? `<span class="variety-price">¥${fmtRating(v.price)}<small>/50g</small></span>` : ''}
            <div class="variety-rating">
              ${v.rating != null
                ? `${percentStars(v.rating)}<span class="variety-num">${fmtRating(v.rating)}</span>`
                : '<span class="variety-num">暂无评分</span>'}
            </div>
          </div>
        </div>
        ${staticReviews ? `<div class="review-list">${staticReviews}</div>` : ''}
        <div class="variety-rate">
          <div class="variety-rate-head">
            <span class="variety-rate-title">茶友评分</span>
            ${summary}
          </div>
          ${list}
          ${form}
        </div>
      </div>`;
  }).join('') : '<p style="color:var(--ink-mute)">该茶品暂未收录品牌信息，收录品牌后即可在对应品牌下打分与评价。</p>';

  return `
    <div class="modal-section">
      <h3>品种与品牌（${varieties.length}）</h3>
      ${loginTip}
      <div class="variety-list">${items}</div>
    </div>`;
}

// 设置选择器高亮：upto 为 0.5 的整数倍，满星/半星/空星按区间落位
function setPickerStars(picker, upto) {
  picker.querySelectorAll('.star-slot').forEach(slot => {
    const v = Number(slot.dataset.slot);
    slot.classList.toggle('on', upto >= v);
    slot.classList.toggle('half', upto < v && upto >= v - 0.5);
  });
  const hint = picker.querySelector('.picker-hint');
  if (hint) hint.textContent = upto ? `${upto} / 5 分` : '点击星星评分';
}

// 在弹窗中按品牌标识找到对应的评价表单
function modalReviewForm(vkey) {
  return Array.from(document.querySelectorAll('#modalBody .review-form'))
    .find(f => f.dataset.vkey === vkey) || null;
}

async function submitMyReview(vkey) {
  if (!state.activeTea || !UserStore.currentUser() || !vkey) return;
  const rating = state.rateValues[vkey] || 0;
  if (!rating) { showToast('请先点击星星选择 0.5 - 5 分'); return; }
  const form = modalReviewForm(vkey);
  const box = form ? form.querySelector('textarea') : null;
  const btn = form ? form.querySelector('.review-submit') : null;
  if (btn) btn.disabled = true;
  try {
    await UserStore.saveReview(state.activeTea, vkey, rating, box ? box.value : '');
    showToast('评价已保存，感谢分享！');
  } catch (err) {
    showToast(err.message || '保存失败，请重试');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function deleteMyReview(vkey) {
  if (!state.activeTea || !UserStore.currentUser() || !vkey) return;
  const form = modalReviewForm(vkey);
  const btn = form ? form.querySelector('.review-delete') : null;
  if (btn) btn.disabled = true;
  try {
    await UserStore.deleteReview(state.activeTea, vkey);
    showToast('已删除我的评价');
  } catch (err) {
    showToast(err.message || '删除失败，请重试');
  } finally {
    if (btn) btn.disabled = false;
  }
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
    if (e.key !== 'Escape') return;
    if (!document.getElementById('authOverlay').hidden) { closeAuth(); return; }
    closeModal();
  });

  // 页头用户登录区（含账号菜单与邀请码）
  document.getElementById('authArea').addEventListener('click', e => {
    if (e.target.closest('#loginBtn')) { openAuth('login'); return; }
    if (e.target.closest('#accountBtn')) { toggleAccountMenu(); return; }
    if (e.target.closest('#copyInviteBtn')) {
      const codeEl = document.getElementById('myInviteCode');
      if (codeEl) {
        copyText(codeEl.textContent.trim())
          .then(() => showToast('邀请码已复制'))
          .catch(() => showToast('复制失败，请手动选择复制'));
      }
      return;
    }
    if (e.target.closest('#logoutBtn')) {
      UserStore.logout();
      showToast('已退出登录');
    }
  });

  // 点击页面其他位置时收起账号菜单
  document.addEventListener('click', e => {
    const menu = document.getElementById('accountMenu');
    if (menu && !menu.hidden && !e.target.closest('.account-wrap')) menu.hidden = true;
  });

  // 登录 / 注册弹窗
  document.getElementById('authClose').addEventListener('click', closeAuth);
  document.getElementById('authOverlay').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuth();
  });
  document.getElementById('authTabs').addEventListener('click', e => {
    const tab = e.target.closest('.auth-tab');
    if (tab) switchAuthTab(tab.dataset.tab);
  });
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('registerForm').addEventListener('submit', handleRegister);

  // 详情弹窗内的评分交互（内容会整体重渲染，使用事件委托；品牌通过 data-vkey 区分）
  const modalBody = document.getElementById('modalBody');
  modalBody.addEventListener('click', e => {
    if (e.target.closest('#rateLoginBtn')) { openAuth('login'); return; }
    const submit = e.target.closest('.review-submit');
    if (submit) { submitMyReview(submit.dataset.vkey); return; }
    const del = e.target.closest('.review-delete');
    if (del) { deleteMyReview(del.dataset.vkey); return; }
    const star = e.target.closest('.star-picker button');
    if (star) {
      const picker = star.closest('.star-picker');
      const vk = picker.dataset.vkey;
      if (vk) {
        state.rateValues[vk] = Number(star.dataset.value);
        setPickerStars(picker, state.rateValues[vk]);
      }
    }
  });
  modalBody.addEventListener('mouseover', e => {
    const picker = e.target.closest('.star-picker');
    if (!picker || !picker.dataset.vkey) return;
    const star = e.target.closest('.star-picker button');
    setPickerStars(picker, star ? Number(star.dataset.value) : (state.rateValues[picker.dataset.vkey] || 0));
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
  renderAuthArea();
  bindEvents();
  // 账号或评分数据变化时，刷新相关区域
  UserStore.subscribe(onUserDataChange);
  // 恢复云端登录会话并拉取茶友评分（完成后自动刷新界面）
  UserStore.init();
}

document.addEventListener('DOMContentLoaded', init);
