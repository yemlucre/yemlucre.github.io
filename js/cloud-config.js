// ============================================================
// 茶语 · 云端后端配置（Supabase）
// ------------------------------------------------------------
// 配置步骤（详见 README.md「后端配置」一节）：
//   1. 在 https://supabase.com 创建一个免费项目
//   2. 在 SQL Editor 中执行 supabase/schema.sql
//   3. 在 Project Settings → API 复制：
//        Project URL       → 填入 url
//        anon public key   → 填入 anonKey
//
// anon / publishable key 是公开密钥（可提交到仓库），数据安全由
// 数据库行级安全策略（RLS）保证；请勿在此填写 secret / service_role key！
// ============================================================

const CLOUD = {
  url: 'https://wrxaclhnylgpjnrxgtpt.supabase.co',
  anonKey: 'sb_publishable_PI53i_7vfuAeJ5Onv_rFMA_hyRGa-PR'
};
