// ============================================================
// 茶语 · 用户账号与茶友评分（云端版，Supabase 后端）
// ------------------------------------------------------------
// 账号、邀请码与茶友评分保存在 Supabase 云端数据库中：
// 跨设备、跨浏览器同步，清除浏览器数据不会丢失。
// 通过 REST API（fetch）直连，不依赖任何 SDK；
// 项目地址与 anon key 在 cloud-config.js 中配置。
// ============================================================

const SESSION_KEY_V2 = 'teayu_session_v2'; // { access_token, refresh_token }

function _lsRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) { return fallback; }
}

function _lsWrite(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 隐私模式等场景下静默失败 */ }
}

function _lsRemove(key) {
  try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

const UserStore = {
  _listeners: [],
  _session: null,   // { access_token, refresh_token }
  _user: null,      // { id, email, name, createdAt, inviteCode }
  _reviews: {},     // { [teaId]: { [varietyKey]: { [userId]: { user, rating, review, updatedAt } } } }
  _initPromise: null,

  // 数据变化时通知订阅者（app.js 用于刷新界面）
  subscribe(fn) { if (typeof fn === 'function') this._listeners.push(fn); },
  _emit() { this._listeners.forEach(fn => { try { fn(); } catch (e) { /* ignore */ } }); },

  // ---------- 配置与本地校验 ----------
  configured() {
    return typeof CLOUD !== 'undefined' && !!CLOUD.url && !!CLOUD.anonKey;
  },

  _validName(name) {
    return /^[0-9a-zA-Z_\u4e00-\u9fa5]{2,16}$/.test(String(name || '').trim());
  },

  // ---------- REST 基础 ----------
  _base() { return String(CLOUD.url).replace(/\/+$/, ''); },

  async _api(path, opts) {
    if (!this.configured()) {
      throw new Error('站点后端尚未配置：请先在 js/cloud-config.js 中填写 Supabase 地址与 anon key');
    }
    let res;
    try {
      res = await fetch(this._base() + path, {
        method: (opts && opts.method) || 'GET',
        headers: Object.assign(
          { 'apikey': CLOUD.anonKey, 'Content-Type': 'application/json' },
          (opts && opts.headers) || {}
        ),
        body: opts && opts.body != null ? JSON.stringify(opts.body) : undefined
      });
    } catch (e) {
      throw new Error('网络连接失败，请检查网络后重试');
    }
    let data = null;
    try { data = await res.json(); } catch (e) { /* 无响应体 */ }
    if (!res.ok) {
      const err = new Error(this._errMsg(data, res.status));
      err.status = res.status;
      throw err;
    }
    return data;
  },

  // 把常见后端错误翻译成人话
  _errMsg(data, status) {
    const raw = String((data && (data.error_description || data.msg || data.message || data.error)) || '');
    const map = {
      'Invalid login credentials': '邮箱或密码错误',
      'Email not confirmed': '请先到邮箱完成验证后再登录',
      'User already registered': '该邮箱已被注册',
      'Password should be at least 6 characters': '密码至少需要 6 位',
      'Signups not allowed for this instance': '该站点未开放注册',
      'Database error saving new user': '注册失败：邀请码无效或用户名已被占用，请检查后重试'
    };
    if (map[raw]) return map[raw];
    if (/at least 6 characters/i.test(raw)) return '密码至少需要 6 位';
    if (/already registered/i.test(raw)) return '该邮箱已被注册';
    if (/Database error/i.test(raw)) return map['Database error saving new user'];
    if (/duplicate key/i.test(raw)) return '数据冲突，请重试';
    return raw && raw !== 'invalid_grant' && raw !== 'undefined'
      ? ('请求失败（' + status + '）：' + raw)
      : ('请求失败（' + status + '），请稍后重试');
  },

  // 携带用户令牌的请求；401 时自动刷新令牌并重试一次
  async _authed(path, opts) {
    if (!this._session) throw new Error('请先登录');
    const doFetch = () => this._api(path, Object.assign({}, opts, {
      headers: Object.assign({}, (opts && opts.headers) || {}, {
        Authorization: 'Bearer ' + this._session.access_token
      })
    }));
    try {
      return await doFetch();
    } catch (err) {
      if (err.status !== 401) throw err;
      try {
        await this._refresh();
        return await doFetch();
      } catch (e) {
        this._clearLocal();
        this._emit();
        throw new Error('登录已过期，请重新登录');
      }
    }
  },

  async _refresh() {
    const saved = _lsRead(SESSION_KEY_V2, null);
    if (!saved || !saved.refresh_token) throw new Error('无登录会话');
    const data = await this._api('/auth/v1/token?grant_type=refresh_token', {
      method: 'POST',
      body: { refresh_token: saved.refresh_token }
    });
    this._session = { access_token: data.access_token, refresh_token: data.refresh_token };
    _lsWrite(SESSION_KEY_V2, this._session);
    return this._session;
  },

  _clearLocal() {
    this._session = null;
    this._user = null;
    _lsRemove(SESSION_KEY_V2);
  },

  _rpc(fn, params) {
    return this._api('/rest/v1/rpc/' + fn, { method: 'POST', body: params || {} });
  },

  // ---------- 启动：恢复会话 + 拉取茶友评分 ----------
  init() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = (async () => {
      if (!this.configured()) return;
      try {
        const saved = _lsRead(SESSION_KEY_V2, null);
        if (saved && saved.refresh_token) {
          await this._refresh();
          await this._loadUser();
        }
      } catch (e) { this._clearLocal(); }
      try { await this.loadReviews(); } catch (e) { /* 评分加载失败不阻塞浏览 */ }
      this._emit();
    })();
    return this._initPromise;
  },

  // ---------- 账号 ----------
  currentUser() {
    if (!this._user) return null;
    return {
      name: this._user.name,
      email: this._user.email,
      createdAt: this._user.createdAt,
      inviteCode: this._user.inviteCode
    };
  },

  async _loadUser() {
    const u = await this._api('/auth/v1/user', {
      headers: { Authorization: 'Bearer ' + this._session.access_token }
    });
    let profile = null;
    try {
      const rows = await this._api(
        '/rest/v1/profiles?id=eq.' + encodeURIComponent(u.id) + '&select=name,invite_code,created_at',
        { headers: { Authorization: 'Bearer ' + this._session.access_token } }
      );
      profile = rows && rows[0] ? rows[0] : null;
    } catch (e) { /* 档案读取失败时退回注册元数据 */ }
    this._user = {
      id: u.id,
      email: u.email,
      name: profile ? profile.name : ((u.user_metadata && u.user_metadata.display_name) || u.email),
      createdAt: profile ? profile.created_at : u.created_at,
      inviteCode: profile ? profile.invite_code : ''
    };
  },

  // 邀请制注册：用户名 + 邮箱 + 密码 + 邀请码
  async register(name, email, password, inviteCode) {
    name = String(name || '').trim();
    email = String(email || '').trim();
    inviteCode = String(inviteCode || '').trim().toUpperCase();
    if (!this._validName(name)) throw new Error('用户名需为 2-16 位中文、字母、数字或下划线');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('请输入有效的邮箱地址');
    if (String(password || '').length < 6) throw new Error('密码至少需要 6 位');
    if (!inviteCode) throw new Error('请输入邀请码');

    // 预检查（提升报错体验；最终原子校验由服务端触发器完成）
    if (await this._rpc('name_taken', { p_name: name })) throw new Error('该用户名已被注册');
    if (!(await this._rpc('check_invite', { p_code: inviteCode }))) throw new Error('邀请码无效');

    const data = await this._api('/auth/v1/signup', {
      method: 'POST',
      body: {
        email: email,
        password: password,
        data: { display_name: name, invite_code: inviteCode }
      }
    });

    if (data && data.access_token) {
      // 免邮箱验证模式：注册即登录
      this._session = { access_token: data.access_token, refresh_token: data.refresh_token };
      _lsWrite(SESSION_KEY_V2, this._session);
      await this._loadUser();
      this._emit();
      return this.currentUser();
    }
    // 开启邮箱验证时：返回提示，用户验证后即可登录
    return { needsConfirmation: true, email: email };
  },

  async login(email, password) {
    const data = await this._api('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: { email: String(email || '').trim(), password: password }
    });
    this._session = { access_token: data.access_token, refresh_token: data.refresh_token };
    _lsWrite(SESSION_KEY_V2, this._session);
    await this._loadUser();
    this._emit();
    return this.currentUser();
  },

  async logout() {
    const sess = this._session;
    this._clearLocal();
    this._emit();
    if (sess) {
      try {
        await this._api('/auth/v1/logout', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + sess.access_token }
        });
      } catch (e) { /* 服务器端撤销失败不阻塞本地退出 */ }
    }
  },

  // ---------- 邀请码 ----------
  // 邀请码可重复使用：档案中的 invite_code 即我的专属邀请码，
  // 不存在“用完/生成新码”的概念，前端直接展示即可。

  // ---------- 茶友评分 / 评价（云端，本地缓存；按「茶 × 品牌」维度） ----------
  async loadReviews() {
    const rows = await this._api(
      '/rest/v1/reviews?select=tea_id,variety,user_id,user_name,rating,review,updated_at&order=updated_at.desc'
    );
    const map = {};
    (rows || []).forEach(r => {
      if (!r.variety) return; // 旧版按茶整体保存的评价（无品牌维度），保留在库中但不展示
      if (!map[r.tea_id]) map[r.tea_id] = {};
      if (!map[r.tea_id][r.variety]) map[r.tea_id][r.variety] = {};
      map[r.tea_id][r.variety][r.user_id] = { user: r.user_name, rating: r.rating, review: r.review, updatedAt: r.updated_at };
    });
    this._reviews = map;
  },

  // 某茶某品牌下的全部茶友评价（按时间倒序）
  varietyReviews(teaId, variety) {
    const m = (this._reviews[teaId] || {})[variety] || {};
    return Object.keys(m)
      .map(k => Object.assign({}, m[k]))
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  // 品牌总评分 = 该品牌所有用户评分的平均分（五分制）
  varietyStats(teaId, variety) {
    const rs = this.varietyReviews(teaId, variety);
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return { avg: sum / rs.length, count: rs.length };
  },

  // 某茶下所有品牌的全部茶友评价（用于茶叶卡片上的整茶平均分）
  teaReviews(teaId) {
    const m = this._reviews[teaId] || {};
    return Object.keys(m).reduce((rs, vk) => rs.concat(this.varietyReviews(teaId, vk)), []);
  },

  // 整茶总评分 = 该茶所有品牌评分的平均分（五分制，卡片展示用）
  teaStats(teaId) {
    const rs = this.teaReviews(teaId);
    if (!rs.length) return { avg: 0, count: 0 };
    const sum = rs.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return { avg: sum / rs.length, count: rs.length };
  },

  myReview(teaId, variety) {
    if (!this._user) return null;
    return ((this._reviews[teaId] || {})[variety] || {})[this._user.id] || null;
  },

  async saveReview(teaId, variety, rating, review) {
    if (!this._user) throw new Error('请先登录');
    rating = Math.round(Number(rating));
    if (!(rating >= 1 && rating <= 5)) throw new Error('评分需在 1 - 5 分之间');
    variety = String(variety || '').trim();
    if (!variety) throw new Error('缺少品牌信息，无法保存评分');
    const body = {
      tea_id: teaId,
      variety: variety,
      user_id: this._user.id,
      user_name: this._user.name,
      rating: rating,
      review: String(review || '').trim().slice(0, 500)
    };
    const rows = await this._authed('/rest/v1/reviews', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: body
    });
    const r = rows && rows[0];
    if (!this._reviews[teaId]) this._reviews[teaId] = {};
    if (!this._reviews[teaId][variety]) this._reviews[teaId][variety] = {};
    this._reviews[teaId][variety][this._user.id] = {
      user: this._user.name,
      rating: rating,
      review: body.review,
      updatedAt: (r && r.updated_at) || new Date().toISOString()
    };
    this._emit();
  },

  async deleteReview(teaId, variety) {
    if (!this._user) return;
    await this._authed(
      '/rest/v1/reviews?tea_id=eq.' + encodeURIComponent(teaId) +
      '&variety=eq.' + encodeURIComponent(variety) +
      '&user_id=eq.' + encodeURIComponent(this._user.id),
      { method: 'DELETE' }
    );
    if (this._reviews[teaId] && this._reviews[teaId][variety]) {
      delete this._reviews[teaId][variety][this._user.id];
    }
    this._emit();
  },

  totalUserReviews() {
    return Object.keys(this._reviews).reduce(
      (n, tid) => Object.keys(this._reviews[tid]).reduce(
        (m, vk) => m + Object.keys(this._reviews[tid][vk]).length, 0),
      0);
  }
};
