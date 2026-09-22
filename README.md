# 茶语 · 一叶知味

一个关于茶的轻量展示网站：茶的种类、评分、冲泡手法与评价。

- 纯 **HTML / CSS / JavaScript**，无需构建工具
- 现代简约风格，响应式布局（适配手机与桌面）
- 支持按茶类筛选、关键词搜索
- 支持**邀请制**注册 / 登录（邮箱 + 密码 + 邀请码，[Supabase](https://supabase.com) 云端存储、跨设备同步）：邀请码**可重复使用**，每位注册用户自动获得一枚专属邀请码；登录后可在每款茶的**每个品牌**下进行十分制星级评分与评价，按品牌显示平均分
- 点击茶叶卡片查看详情：冲泡手法、品种品牌列表、各品牌评分与特殊冲泡 Tips

## 目录结构

```
.
├── index.html            # 页面结构
├── css/
│   └── style.css         # 样式
├── js/
│   ├── teas-data.js      # 茶叶数据（依据“喝遍全国”文档整理）
│   ├── cloud-config.js   # Supabase 后端配置（URL + anon key）
│   ├── users.js          # 账号 / 邀请码 / 茶友评分（云端 REST）
│   └── app.js            # 交互逻辑
├── supabase/
│   └── schema.sql        # 后端建表脚本（在 Supabase SQL Editor 执行）
└── README.md
```

## 本地预览

直接用浏览器打开 `index.html` 即可，无需服务器。浏览茶叶不受后端配置影响；注册 / 登录 / 评分需要先完成下方的后端配置并保持联网。

## 如何修改茶叶数据

编辑 `js/teas-data.js` 中的 `TEAS` 数组即可。每个茶品字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识（英文） |
| `name` | 茶名 |
| `type` | 茶类（绿茶/红茶/乌龙茶/白茶/黑茶/黄茶/花茶） |
| `origin` | 产地 |
| `flavor` | 风味标签数组 |
| `image` | 图片路径（本地图片存放于 `Picture/` 目录） |
| `description` | 简介 |
| `brewing` | 通用冲泡手法（水温、器具、茶水比、时间、步骤） |
| `varieties` | 品种品牌列表，每项含 `name`（品种名）、`brand`（品牌名，可选）、`rating`（评分 0-5，支持小数，按百分比染色显示）、`price`（价格，元/50g，可选；当前由 `js/app.js` 顶部的 `SHOW_PRICE` 开关隐藏，改为 `true` 可恢复显示）、`reviews`（该品种的评价数组，含 `user`、`rating`、`content`） |

## 邀请制注册 / 登录与茶友评分

- 本站采用**邀请制**注册：需要「用户名 + 邮箱 + 密码 + 邀请码」，类似早期 Linux.do 的玩法。
- 邀请码**可重复使用**：一枚邀请码可以邀请多位茶友，被使用后不会失效。
- 每位用户注册成功后会自动获得一枚**专属邀请码**（`TEA-XXXXXXXX` 形式）；登录后点击右上角头像即可查看与复制。
- 登录后可在茶叶详情弹窗中，对每款茶收录的**每个品牌**分别进行 **1-10 分（十分制）星级评分**并撰写文字评价；同一用户对同一品牌保留一条评价，可随时更新或删除。
- 「茶友评分」按品牌独立显示所有用户评分的**平均分**；茶叶卡片上显示该茶所有品牌评分的综合平均分与评分人数。
- 账号、邀请码与评分均保存在 **Supabase 云端数据库**，跨设备、跨浏览器同步，清除浏览器数据不会丢失。
- 旧版本（localStorage 本地账号）的数据不会自动迁移，请使用初始邀请码重新注册。

## 后端配置（Supabase，一次性）

注册 / 邀请码 / 评分需要后端存储。本站使用 Supabase 免费套餐，前端通过 REST API（`fetch`）直连，**无需引入 SDK 与构建工具**，站点仍可托管在 GitHub Pages：

1. 到 [supabase.com](https://supabase.com) 注册并 **New project** 创建项目（免费套餐即可，地区选离自己近的）。
2. 打开左侧 **SQL Editor**，把 [`supabase/schema.sql`](supabase/schema.sql) 的内容整段粘贴进去，点 **Run**。这一步会创建数据表、注册触发器（邀请码原子校验，可重复使用）、安全策略，并预置一枚初始创始人邀请码。脚本可重复执行：**已部署过旧版本的站点，升级后把本脚本重新执行一遍即可完成迁移**（`reviews` 表自动补上品牌维度，邀请码改为可重复使用；旧版按茶整体保存的评价会保留在库中，但不再在前端展示）。
3. 打开 **Project Settings → API**，复制 **Project URL** 与公开密钥，填入 [`js/cloud-config.js`](js/cloud-config.js) 的 `anonKey` 字段。公开密钥新版叫 **Publishable key**（`sb_publishable_…` 开头），旧版叫 **anon public**（`eyJ…` 开头），两者用法相同。
   > 公开密钥可以提交到仓库；数据安全由数据库行级安全策略（RLS）保证，客户端只能读写属于自己的数据。**切勿**填写 secret / service_role key。
4. （可选，影响注册体验）
   - 保持默认的 **Email confirmations** 开启：注册后需到邮箱点击验证链接才能登录（更符合“邮箱注册”的语义）；建议同时在 **Authentication → URL Configuration** 把 Site URL 设为站点正式地址。
   - 或到 **Authentication → Sign In / Up** 关闭邮箱验证：注册即登录，体验最顺滑。
5. **初始邀请码**为 `TEA-FOUNDER-0001`（可重复使用）。建议先到 **Table Editor → `invite_codes`** 把它改成你自己的随机串，再用它完成你的注册；以后想再发“官方码”，在该表插入新行、`owner` 留空即可。
6. 之后按下方步骤部署到 GitHub Pages，流程不变。

## 部署到 GitHub Pages（子域名）

GitHub Pages 免费提供 `https://<你的用户名>.github.io` 子域名，也可以为每个仓库开启独立的 Pages 站点。两种常见方式：

### 方式一：用户主页（`用户名.github.io`）

1. 新建一个名为 `<你的用户名>.github.io` 的仓库（必须是这个名称）。
2. 把本项目所有文件上传到该仓库。
3. 打开仓库 **Settings → Pages**，将 Source 选为 **Deploy from a branch**，分支选择 `main`（或 `master`），目录选 `/ (root)`，保存。
4. 稍等片刻，访问 `https://<你的用户名>.github.io` 即可。

### 方式二：项目站点（`用户名.github.io/仓库名`）

1. 新建任意名称的仓库（如 `tea`），上传本项目文件。
2. 同样在 **Settings → Pages** 中启用分支部署。
3. 访问 `https://<你的用户名>.github.io/tea`。

### 上传文件的方式

- **网页上传**：在 GitHub 仓库页点 `Add file → Upload files`，把 `index.html`、`css`、`js` 拖进去提交。
- **命令行**（已安装 git）：

```bash
git init
git add .
git commit -m "init: 茶语网站"
git branch -M main
git remote add origin https://github.com/<你的用户名>/<仓库名>.git
git push -u origin main
```

> 提示：茶叶图片存放在 `Picture/` 目录中，文件名使用拼音，便于在不同操作系统和部署环境中稳定加载。

## 免责声明

本站所有茶叶数据与价格均为示例，仅用于学习展示。
