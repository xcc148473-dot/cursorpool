
// lib/feishu.js
const crypto = require('crypto');
const { getEnv } = require('./utils');

/**
 * 生成飞书签名
 */
function generateSign(timestamp, secret) {
  const stringToSign = `${timestamp}\n${secret}`;
  const hmac = crypto.createHmac("sha256", stringToSign);
  return hmac.update("").digest("base64");
}

/**
 * 发送飞书富文本消息
 */
async function sendFeishuMessage(title, contentLines) {
  // Use getEnv with required: false to avoid crashing if not configured
  const webhookUrl = process.env.FEISHU_WEBHOOK_URL;
  const secret = process.env.FEISHU_SECRET;

  if (!webhookUrl) {
    console.log("飞书 Webhook 未配置，跳过通知");
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();

  // 构建富文本内容（每个元素是一行）
  const content = contentLines.map((line) => {
    if (typeof line === "string") {
      return [{ tag: "text", text: line }];
    }
    return line; // 允许传入自定义格式
  });

  const body = {
    timestamp,
    sign: secret ? generateSign(timestamp, secret) : undefined,
    msg_type: "post",
    content: {
      post: {
        zh_cn: {
          title: title,
          content: content,
        },
      },
    },
  };

  try {
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await resp.json();

    if (result.code !== 0) {
      console.error("飞书发送失败:", result);
    } else {
      console.log("飞书通知发送成功");
    }
  } catch (err) {
    console.error("飞书通知异常:", err);
  }
}

function detectProductFromPlan(plan) {
  const raw = String(plan || '').trim();
  const normalized = raw.toLowerCase().replace(/[\s_-]/g, '');

  // Explicit plan-id routing first
  if (['p7d', 'p30d', 'p90d', 'p180d', 'p365d', 'q10k180d', 'q30k365d'].includes(normalized)) {
    return 'CursorPool';
  }

  if (normalized.includes('cursorpool') || normalized.includes('pool')) {
    return 'CursorPool';
  }
  if (normalized.includes('cursorpro') || normalized.includes('pro')) {
    return 'CursorPro';
  }
  return '未知';
}

function formatPlanLines(plan) {
  return [
    `🧩 产品：${detectProductFromPlan(plan)}`,
    `📦 套餐：${plan || '未知'}`,
  ];
}

function withProductInTitle(baseTitle, plan) {
  const product = detectProductFromPlan(plan);
  return `${baseTitle} [${product}]`;
}

/**
 * 新订单通知
 */
async function notifyNewOrder(orderId, plan, price, email, paymentStatus = 'unpaid') {
  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
  const statusText = paymentStatus === 'paid' ? '已完成支付' : '待支付';

  await sendFeishuMessage(withProductInTitle("🔔 新订单！请尽快处理", plan), [
    `🧾 支付状态：${statusText}`,
    ...formatPlanLines(plan),
    `📧 邮箱：${email || '未知'}`,
    `🆔 订单号：${orderId}`,
    `💰 金额：$${price}`,
    `⏰ 时间：${time}`,
    ``,
    `👉 请尽快采购并发卡`,
  ]);
}

/**
 * 发卡成功通知
 */
async function notifyFulfilled(orderId, licenseKey, email, plan) {
  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  await sendFeishuMessage(withProductInTitle("✅ 卡密已交付", plan), [
    `🆔 订单号：${orderId}`,
    ...formatPlanLines(plan),
    `📧 邮箱：${email || '未知'}`,
    `🔑 卡密：${licenseKey}`,
    `⏰ 时间：${time}`,
  ]);
}

/**
 * 支付完成通知
 */
async function notifyPaid(orderId, plan, priceAmount, email) {
  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  await sendFeishuMessage(withProductInTitle("✅ 支付已完成", plan), [
    `🆔 订单号：${orderId}`,
    ...formatPlanLines(plan),
    `💰 金额：$${priceAmount ?? '未知'}`,
    `📧 邮箱：${email || '未知'}`,
    `⏰ 时间：${time}`,
  ]);
}

module.exports = {
  sendFeishuMessage,
  notifyNewOrder,
  notifyFulfilled,
  notifyPaid
};
