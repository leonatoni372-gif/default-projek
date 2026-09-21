/**
 * Shared bot message handler — interactive mode.
 * Understands natural language + commands. Feels like chatting with an assistant.
 */

import orchestrator from "@/agents";

export type BotMessage = {
  platform: "telegram" | "whatsapp";
  userId: string;
  text: string;
};

export type BotResponse = {
  text: string;
  parseMode?: "HTML" | "Markdown";
};

// Natural language patterns → commands
const INTENT_MAP: Array<{ pattern: RegExp; action: (args: string) => Promise<BotResponse> }> = [
  { pattern: /^(halo|hai|hi|hey|yo|sup|pagi|siang|sore|malam)/i, action: async () => ({
    text: "Hai! 👋 Ada yang bisa saya bantu?\n\nKetik /help untuk lihat semua command, atau langsung aja tanya apa aja!",
    parseMode: "HTML",
  })},
  { pattern: /^(apa kabar|kabar|kamu apa kabar)/i, action: async () => ({
    text: "Baik! Siap bantu kamu manage affiliate marketing 🚀\n\nMau cek apa hari ini?",
    parseMode: "HTML",
  })},
  { pattern: /^(terima kasih|thanks|thx|makasih)/i, action: async () => ({
    text: "Sama-sama! Kalau butuh bantuan lagi, tinggal panggil aja 😊",
    parseMode: "HTML",
  })},
  { pattern: /^(siapa kamu|kamu siapa|nama kamu)/i, action: async () => ({
    text: "Saya AI Affiliate OS Bot — asisten digital kamu untuk:\n\n📈 Analisis tren\n🎯 Skor produk\n✅ Cek compliance\n💰 Ringkasan keuangan\n\nKetik /help untuk mulai!",
    parseMode: "HTML",
  })},
  { pattern: /^(bantuan|help|cara pakai|gimana pakai)/i, action: async () => ({
    text: COMMANDS["/help"].format(""),
    parseMode: "Markdown" as const,
  })},
];

// Command definitions
const COMMANDS: Record<string, { agent: string; format: (result: unknown) => string }> = {
  "/start": {
    agent: "",
    format: () => [
      "🤖 *AI Affiliate OS Bot*",
      "",
      "Hai! Saya AI bot yang bantu kamu manage affiliate marketing.",
      "",
      "Ketik /help untuk lihat semua command.",
      "",
      "Atau langsung aja tanya apa aja — saya ngerti bahasa manusia juga! 😄",
    ].join("\n"),
  },
  "/help": {
    agent: "",
    format: () => [
      "🤖 *AI Affiliate OS Bot*",
      "",
      "*Commands:*",
      "/trend <keywords> — Cari tren topik",
      "/score <nama>,<harga>,<komisi> — Skor produk",
      "/compliance <teks> — Cek compliance konten",
      "/products — Lihat semua produk",
      "/finance — Ringkasan keuangan",
      "",
      "*Tips:*",
      "• Kirim `/trend AI,marketing` untuk analisis tren",
      "• Kirim `/score ProductName,99,30` untuk skor produk",
      "• Kirim `/compliance teks konten` untuk cek compliance",
      "",
      "Atau langsung tanya apa aja — saya ngerti! 😊",
    ].join("\n"),
  },
  "/trend": {
    agent: "trend",
    format: (result: unknown) => {
      const r = result as { trends?: Array<{ keyword: string; direction: string; strength: number; rationale: string }> };
      if (!r?.trends?.length) return "Tidak ada data tren untuk keyword ini.\n\nCoba keyword lain: /trend AI,marketing";
      const lines = r.trends.map((t) => {
        const emoji = t.direction === "up" ? "📈" : t.direction === "down" ? "📉" : "➡️";
        return `${emoji} *${t.keyword}*\n  ${t.direction === "up" ? "Naik" : t.direction === "down" ? "Turun" : "Stabil"} (${(t.strength * 100).toFixed(0)}%)\n  ${t.rationale}`;
      });
      return `📊 *Hasil Analisis Tren:*\n\n${lines.join("\n\n")}`;
    },
  },
  "/score": {
    agent: "productScoring",
    format: (result: unknown) => {
      const r = result as { scores?: Record<string, number>; rationale?: Record<string, string>; overall?: number; recommendations?: string[] };
      if (!r) return "Gagal menghitung skor.";
      const overall = r.overall ?? r.scores?.overall ?? "N/A";
      const grade = typeof overall === "number" ? (overall >= 0.8 ? "A" : overall >= 0.6 ? "B" : overall >= 0.4 ? "C" : overall >= 0.2 ? "D" : "F") : "N/A";
      const emoji = grade === "A" || grade === "B" ? "🔥" : grade === "C" ? "👍" : "⚠️";
      const rationaleLines = r.rationale
        ? Object.entries(r.rationale).map(([k, v]) => `• ${k}: ${v}`)
        : [];
      return [
        `${emoji} *Skor Produk: ${overall} (${grade})*`,
        "",
        ...rationaleLines,
        ...(r.recommendations || []).map((rec: string) => `💡 ${rec}`),
      ].join("\n");
    },
  },
  "/compliance": {
    agent: "compliance",
    format: (result: unknown) => {
      const r = result as { result?: { status: string; issues?: Array<{ severity: string; message: string }> } };
      const res = r?.result || r;
      const status = (res as { status?: string })?.status || "UNKNOWN";
      const emoji = status === "PASS" ? "✅" : status === "NEEDS_REVISION" ? "⚠️" : "🚫";
      const issues = (res as { issues?: Array<{ severity: string; message: string }> })?.issues || [];
      const lines = issues.map((i) => {
        const icon = i.severity === "critical" ? "🔴" : i.severity === "warning" ? "🟡" : "ℹ️";
        return `${icon} [${i.severity}] ${i.message}`;
      });
      return [
        `${emoji} *Compliance: ${status}*`,
        "",
        ...lines,
        issues.length === 0 ? "Tidak ada masalah." : "",
      ].join("\n");
    },
  },
  "/products": {
    agent: "",
    format: () => "",
  },
  "/finance": {
    agent: "",
    format: () => "",
  },
};

async function handleOpenQuestion(q: string): Promise<BotResponse> {
  const lower = q.toLowerCase();

  // Try AI first if available (now falls back to mock gracefully)
  if (process.env.AI_API_KEY) {
    try {
      const { generateCompletion } = await import("@/lib/ai/provider");
      const res = await generateCompletion(
        [
          { role: "system", content: "You are a helpful affiliate marketing assistant. Answer concisely in Indonesian. If the question is outside affiliate marketing, guide the user to use /help." },
          { role: "user", content: q },
        ],
        { temperature: 0.7 }
      );
      // If mock, don't return mock text — fall through to local answers
      if (!res.content.includes("[mock]")) {
        return { text: res.content, parseMode: "HTML" };
      }
    } catch {
      // fall through to local answers
    }
  }

  // Local answers — no AI needed, always works
  if (lower.includes("affiliate") && (lower.includes("apa") || lower.includes("itu apa") || lower.includes("pengertian"))) {
    return { text: "Affiliate marketing itu kamu promosiin produk orang lain, tiap ada yang beli lewat link kamu, kamu dapat komisi 💸\n\nMau cari produk? Coba /products\nMau cek tren? Coba /trend AI,marketing", parseMode: "HTML" };
  }
  if (lower.includes("komisi") || lower.includes("commission")) {
    return { text: "Komisi = % yang kamu dapat dari harga produk.\n\nContoh: produk $100, komisi 30% → kamu dapat $30 per sale.\n\nCek produk & komisinya: /products\nHitung skor produk: /score Nama,99,30", parseMode: "HTML" };
  }
  if (lower.includes("produk") && (lower.includes("rekomendasi") || lower.includes("bagus") || lower.includes("cari") || lower.includes("pilih"))) {
    return { text: "Mau cari produk bagus?\n\n1. Lihat list: /products\n2. Skor produk: /score NamaProduk,99,30\n3. Cek tren: /trend AI,marketing\n\nSaya hitung skor dari komisi, harga, demand, & competition 🔥", parseMode: "HTML" };
  }
  if (lower.includes("tren") || lower.includes("trend") || lower.includes("viral")) {
    return { text: "Mau cek tren?\n\nKetik: /trend keyword1,keyword2\nContoh: /trend AI,affiliate marketing\n\nSaya kasih arah naik/turun + kekuatan sinyal 📈", parseMode: "HTML" };
  }
  if (lower.includes("compliance") || lower.includes("aman") || lower.includes("melanggar") || lower.includes(" disclosure")) {
    return { text: "Cek compliance konten:\n\nKetik: /compliance teks konten kamu\nContoh: /compliance Produk ini bagus banget affiliate link di bio\n\nSaya cek disclosure, klaim, dll ✅🚫", parseMode: "HTML" };
  }
  if (lower.includes("cara") || lower.includes("gimana") || lower.includes("bagaimana") || lower.includes("mulai")) {
    return { text: "Mau mulai affiliate?\n\n1. /products — lihat produk\n2. /trend — cek tren\n3. /score — hitung potensi\n4. /compliance — cek konten aman\n5. /finance — lihat cuan 💰\n\nAtau langsung tanya: \"produk apa yang bagus?\"", parseMode: "HTML" };
  }
  if (lower.includes("cuannya") || lower.includes("profit") || lower.includes("untung") || lower.includes("finance") || lower.includes("duit")) {
    return { text: "Mau lihat keuangan?\n\nKetik: /finance\n\nSaya kasih summary 30 hari: revenue, commission, expenses, profit 💰", parseMode: "HTML" };
  }

  // Generic fallback — guide to commands
  return {
    text: `Saya ngerti kamu tanya: "${q.slice(0, 60)}..."\n\nSaya bisa bantu tanpa AI:\n📦 /products — list produk\n📈 /trend — cek tren\n🎯 /score — skor produk\n✅ /compliance — cek konten\n💰 /finance — keuangan\n\nAtau ketik /help untuk semua command!`,
    parseMode: "HTML",
  };
}

export async function handleMessage(msg: BotMessage): Promise<BotResponse> {
  const text = msg.text.trim();

  // Check natural language patterns first
  for (const intent of INTENT_MAP) {
    if (intent.pattern.test(text)) {
      return intent.action(text);
    }
  }

  // Parse command
  const spaceIdx = text.indexOf(" ");
  const command = spaceIdx > -1 ? text.slice(0, spaceIdx) : text;
  const args = spaceIdx > -1 ? text.slice(spaceIdx + 1).trim() : "";

  const cmd = COMMANDS[command.toLowerCase()];
  if (!cmd) {
    // Open question — try to answer without AI (works even when AI_API_KEY missing)
    return handleOpenQuestion(text);
  }

  // /start and /help
  if (command === "/start" || command === "/help") {
    return { text: cmd.format(""), parseMode: "Markdown" };
  }

  // /products
  if (command === "/products") {
    const { getDb } = await import("@/lib/supabase/db");
    const db = getDb();
    if (!db) return { text: "Supabase belum dikonfigurasi." };

    const { data } = await db.from("products").select("name, price, commission_rate, status").limit(10);
    if (!data?.length) return { text: "Belum ada produk.\n\nTambah produk di dashboard: /dashboard/products" };

    const lines = data.map((p: Record<string, unknown>) => `• *${p.name}* — $${p.price} (${p.commission_rate}%) [${p.status}]`);
    return { text: `📦 *Produk (${data.length}):*\n\n${lines.join("\n")}`, parseMode: "Markdown" };
  }

  // /finance
  if (command === "/finance") {
    const { getDb } = await import("@/lib/supabase/db");
    const db = getDb();
    if (!db) return { text: "Supabase belum dikonfigurasi." };

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [ordersRes, commissionsRes, expensesRes] = await Promise.all([
      db.from("orders").select("amount").gte("order_date", thirtyDaysAgo),
      db.from("commissions").select("amount").gte("created_at", thirtyDaysAgo),
      db.from("expenses").select("amount").gte("occurred_at", thirtyDaysAgo),
    ]);

    const orders = ordersRes.data || [];
    const commissions = commissionsRes.data || [];
    const expenses = expensesRes.data || [];
    const totalRevenue = orders.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
    const totalCommission = commissions.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
    const totalExpenses = expenses.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
    const profit = totalCommission - totalExpenses;
    const profitEmoji = profit > 0 ? "📈" : profit < 0 ? "📉" : "➡️";

    return {
      text: [
        "💰 *Finance Summary (30 hari)*",
        "",
        `💵 Revenue: $${totalRevenue.toLocaleString()}`,
        `💸 Commission: $${totalCommission.toLocaleString()}`,
        `🛒 Expenses: $${totalExpenses.toLocaleString()}`,
        `${profitEmoji} *Profit: $${profit.toLocaleString()}*`,
        "",
        profit > 0 ? "Bagus! Profit positif 🎉" : profit < 0 ? "Waspada! Profit negatif ⚠️" : "Belum ada transaksi.",
      ].join("\n"),
      parseMode: "Markdown",
    };
  }

  // Agent commands
  if (!cmd.agent) {
    return { text: "Command tidak dikenali.", parseMode: "HTML" };
  }

  // Send typing indicator (Telegram only)
  if (msg.platform === "telegram") {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (token) {
      fetch(`https://api.telegram.org/bot${token}/sendChatAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: msg.userId, action: "typing" }),
      }).catch(() => {});
    }
  }

  try {
    let input: Record<string, unknown> = {};

    if (command === "/trend") {
      const keywords = args.split(",").map((k) => k.trim()).filter(Boolean);
      if (!keywords.length) return { text: "Masukkan keyword: /trend AI,marketing", parseMode: "HTML" };
      input = { keywords };
    } else if (command === "/score") {
      const parts = args.split(",").map((p) => p.trim());
      if (parts.length < 3) return { text: "Format: /score nama,harga,komisi\nContoh: /score AI Masterclass,99,30", parseMode: "HTML" };
      input = {
        product: {
          id: "user_input",
          name: parts[0],
          price: parseFloat(parts[1]) || 0,
          commission_rate: parseFloat(parts[2]) || 0,
        },
      };
    } else if (command === "/compliance") {
      if (!args) return { text: "Masukkan teks: /compliance teks konten", parseMode: "HTML" };
      const complianceService = (await import("@/domain/compliance.service")).default;
      const result = await complianceService.check("bot_input", {
        script: args,
        hasAffiliateDisclosure: args.toLowerCase().includes("affiliate"),
        platform: "tiktok",
      });
      return { text: cmd.format({ result }), parseMode: "Markdown" };
    }

    const result = await orchestrator.execute(cmd.agent, input);
    return { text: cmd.format(result), parseMode: "Markdown" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { text: `Error: ${message}`, parseMode: "HTML" };
  }
}
