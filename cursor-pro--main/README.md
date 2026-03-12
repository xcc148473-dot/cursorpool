## 极简数字商品后端（Chain2Pay + Supabase + 网页即时交付）

后端为 Vercel Serverless Functions，无构建、低依赖，仅使用 Node 内置模块和原生 fetch。
当前支付网关已切到 **Chain2Pay**。

### 目录结构

- `api/checkout.js` - 创建订单并调用 Chain2Pay 生成支付链接
- `api/chain2pay-callback.js` - Chain2Pay 回调处理（先记录参数，再主动查单确认）
- `api/check-order-status.js` - 前端轮询接口，查询订单状态与交付结果
- `api/admin/fulfill.js` - 管理员/脚本发货接口（支持 `license_key` 或 `delivery_message`）
- `api/admin/orders.js` - 管理员查看近期订单
- `api/admin/support-reply.js` - 管理员回复用户消息
- `api/query-last-order.js` - 兜底查询接口
- `api/support.js` - 用户客服消息接口（按订单读写）
- `api/health.js` - 健康检查
- `lib/chain2pay.js` - Chain2Pay API 封装（创建链接 + 查询状态）
- `lib/supabase.js` - Supabase REST 调用封装
- `lib/webhook.js` - 触发下游发货 webhook
- `public/` - 前端页面 (order-status.html, buy.html, query.html)
- `sql/create_orders_table.sql` - 建表 SQL（含 Chain2Pay 字段）
- `sql/migrate_to_chain2pay.sql` - 旧表迁移 SQL

### 环境变量

- `CHAIN2PAY_MERCHANT_WALLET` - 你的 Polygon USDC 地址
- `CHAIN2PAY_CALLBACK_URL` - 回调地址（示例：`https://your-project.vercel.app/api/chain2pay-callback`）
- `CHAIN2PAY_PROVIDER` - 可选，默认 `auto`（按金额自动选 provider，并带失败回退）；如填固定值则强制使用该 provider
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SITE_URL` - 网站根地址，如 `https://your-project.vercel.app`
- `ADMIN_SECRET` - 管理员发货接口鉴权密钥

兼容保留（可后续清理）：
- `NOWPAYMENTS_API_KEY`
- `NOWPAYMENTS_IPN_SECRET`

### 流程说明

1. 用户下单：前端 `buy.html` 调用 `/api/checkout`，后端按金额自动选择 provider（失败会回退），返回并跳转 `payment_url`。如果请求体传入 `site_url`，会优先用它生成 success/cancel/return URL，方便同一个支付后端服务多个前端站点。
2. 支付成功：Chain2Pay GET 回调 `/api/chain2pay-callback`。
3. 后端确认：回调处理里用 `ipn_token` 主动查询 `payment-status.php`，确认 `paid` 才标记支付成功。
4. 发货触发：支付确认后触发飞书通知 + agent webhook。
5. 用户等待：`order-status.html` 轮询 `/api/check-order-status`，发货后显示卡密或 `delivery_message`。

### 数据库迁移

如果你是老库（NOWPayments 版本），先在 Supabase 执行：
- `sql/migrate_to_chain2pay.sql`
- `sql/alter_orders_add_delivery_message.sql`
- `sql/create_support_messages_table.sql`

新库直接执行：
- `sql/create_orders_table.sql`
- `sql/create_support_messages_table.sql`

### 常用接口

- **创建支付**: `POST /api/checkout`
  - 支持可选字段：`site_url`
- **回调处理**: `GET /api/chain2pay-callback`
- **查询状态**: `GET /api/check-order-status?order_id=...&email=...`
- **用户消息**: `GET /api/support?order_id=...&email=...` / `POST /api/support`
- **人工发货**: `POST /api/admin/fulfill`
- **管理员订单列表**: `GET /api/admin/orders`
- **管理员回复消息**: `POST /api/admin/support-reply`

### 新增 $10 套餐

可用于你的 ChatGPT Business Team Shared Seat 页面：
- `gpt_team_30d` → `$10`

兼容别名：
- `chatgpt_team`
- `business_team`
- `gptteam`
- `team_shared_30d`
