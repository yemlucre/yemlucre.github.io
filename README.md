# 茶语 · 一叶知味

一个关于茶的轻量展示网站：茶的种类、评分、冲泡手法与评价。

- 纯 **HTML / CSS / JavaScript**，无需构建工具，开箱即用
- 现代简约风格，响应式布局（适配手机与桌面）
- 支持按茶类筛选、关键词搜索
- 点击茶叶卡片查看详情：冲泡手法、品种品牌列表、各品牌评分与特殊冲泡 Tips

## 目录结构

```
.
├── index.html        # 页面结构
├── css/
│   └── style.css     # 样式
├── js/
│   ├── teas-data.js  # 茶叶数据（依据“喝遍全国”文档整理）
│   └── app.js        # 交互逻辑
└── README.md
```

## 本地预览

直接用浏览器打开 `index.html` 即可，无需服务器。

## 如何修改茶叶数据

编辑 `js/teas-data.js` 中的 `TEAS` 数组即可。每个茶品字段说明：

| 字段 | 说明 |
| --- | --- |
| `id` | 唯一标识（英文） |
| `name` | 茶名 |
| `type` | 茶类（绿茶/红茶/乌龙茶/白茶/黑茶/黄茶/花茶） |
| `origin` | 产地 |
| `flavor` | 风味标签数组 |
| `image` | 图片链接 |
| `description` | 简介 |
| `brewing` | 通用冲泡手法（水温、器具、茶水比、时间、步骤） |
| `varieties` | 品种品牌列表，每项含 `name`（品种名）、`brand`（品牌名，可选）、`rating`（评分 0-5，支持小数，按百分比染色显示）、`price`（价格，元/50g，可选）、`reviews`（该品种的评价数组，含 `user`、`rating`、`content`） |

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

> 提示：示例数据中的茶叶图片来自外链，如需稳定可下载到本地 `images/` 目录并修改 `data.js` 里的 `image` 路径。

## 免责声明

本站所有茶叶数据与价格均为示例，仅用于学习展示。
