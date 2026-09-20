/**
 * Shared bot message handler — parses commands, routes to agents, formats responses.
 * Used by both Telegram and WhatsApp bots.
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

const COMMANDS: Record<string, { agent: string; describe: (args: string) => string; format: (result: unknown) => string }> = {
  "/start": {
    agent: "",
    describe: () => "",
    format: () => [
      "🤖 *AI Affiliate OS Bot*",
      "",
      "Commands:",
      "/trend <keywords> — Cari tren topik",
      "/score <nama produk> <harga> <komisi> — Skor produk",
      "/compliance <teks> — Cek compliance konten",
      "/products — Lihat semua produk",
      "/finance — Ringkasan keuangan",
      "/help — Bantuan",
      "",
      "Contoh: /trend AI productivity,affiliate marketing",
    ].join("\n"),
  },
  "/help": {
    agent: "",
    describe: () => "",
    format: () => COMMANDS["/start"].format(""),
  },
  "/trend": {
    agent: "trend",
    describe: (args) => `Analisis tren: ${args}`,
    format: (result: unknown) => {
      const r = result as { trends?: Array<{ keyword: string; direction: string; strength: number; rationale: string }> };
      if (!r?.trends?.length) return "Tidak ada data tren.";
      return r.trends.map((t) => `📈 *${t.keyword}*\n  ${t.direction} (${t.strength})\n  ${t.rationale}`).join("\n\n");
    },
  },
  "/score": {
    agent: "productScoring",
    describe: (args) => `Skor produk: ${args}`,
    format: (result: unknown) => {
      const r = result as { scores?: Record<string, number>; rationale?: Record<string, string>; overall?: number; recommendations?: string[] };
      if (!r) return "Gagal menghitung skor.";
      const overall = r.overall ?? r.scores?.overall ?? "N/A";
      const rationaleLines = r.rationale
        ? Object.entries(r.rationale).map(([k, v]) => `• ${k}: ${v}`)
        : [];
      return [
        `📊 *Skor Produk: ${overall}*`,
        "",
        ...rationaleLines,
        ...(r.recommendations || []).map((rec: string) => `💡 ${rec}`),
      ].join("\n");
    },
  },
  "/compliance": {
    agent: "compliance",
    describe: (args) => `Cek compliance: ${args.slice(0, 50)}`,
    format: (result: unknown) => {
      const r = result as { result?: { status: string; issues?: Array<{ severity: string; message: string }> } };
      const res = r?.result || r;
      const status = (res as { status?: string })?.status || "UNKNOWN";
      const emoji = status === "PASS" ? "✅" : status === "NEEDS_REVISION" ? "⚠️" : "🚫";
      const issues = (res as { issues?: Array<{ severity: string; message: string }> })?.issues || [];
      return [
        `${emoji} *Compliance: ${status}*`,
        "",
        ...issues.map((i) => `• [${i.severity}] ${i.message}`),
        issues.length === 0 ? "Tidak ada masalah." : "",
      ].join("\n");
    },
  },
  "/products": {
    agent: "",
    describe: () => "Lihat produk",
    format: () => "", // handled specially
  },
  "/finance": {
    agent: "",
    describe: () => "Ringkasan keuangan",
    format: () => "", // handled specially
  },
};

export async function handleMessage(msg: BotMessage): Promise<BotResponse> {
  const text = msg.text.trim();

  // Parse command
  const spaceIdx = text.indexOf(" ");
  const command = spaceIdx > -1 ? text.slice(0, spaceIdx) : text;
  const args = spaceIdx > -1 ? text.slice(spaceIdx + 1).trim() : "";

  const cmd = COMMANDS[command.toLowerCase()];
  if (!cmd) {
    return { text: `Unknown command: ${command}\nKetik /help untuk bantuan.`, parseMode: "HTML" };
  }

  // Special: /start and /help
  if (command === "/start" || command === "/help") {
    return { text: cmd.format(""), parseMode: "Markdown" };
  }

  // Special: /products — direct Supabase query
  if (command === "/products") {
    const { getDb } = await import("@/lib/supabase/db");
    const db = getDb();
    if (!db) return { text: "Supabase belum dikonfigurasi." };

    const { data } = await db.from("products").select("name, price, commission_rate, status").limit(10);
    if (!data?.length) return { text: "Belum ada produk." };

    const lines = data.map((p: Record<string, unknown>) => `• *${p.name}* — $${p.price} (${p.commission_rate}%) [${p.status}]`);
    return { text: `📦 *Produk:*\n\n${lines.join("\n")}`, parseMode: "Markdown" };
  }

  // Special: /finance — direct Supabase query
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

    return {
      text: [
        "💰 *Finance Summary (30 hari)*",
        "",
        `Revenue: $${totalRevenue.toLocaleString()}`,
        `Commission: $${totalCommission.toLocaleString()}`,
        `Expenses: $${totalExpenses.toLocaleString()}`,
        `Profit: $${profit.toLocaleString()}`,
      ].join("\n"),
      parseMode: "Markdown",
    };
  }

  // Agent commands
  if (!cmd.agent) {
    return { text: "Command tidak dikenali.", parseMode: "HTML" };
  }

  try {
    let input: Record<string, unknown> = {};

    if (command === "/trend") {
      const keywords = args.split(",").map((k) => k.trim()).filter(Boolean);
      if (!keywords.length) return { text: "Masukkan keyword: /trend AI,marketing", parseMode: "HTML" };
      input = { keywords };
    } else if (command === "/score") {
      const parts = args.split(",").map((p) => p.trim());
      if (parts.length < 3) return { text: "Format: /score nama,harga,komisi", parseMode: "HTML" };
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
      input = {
        content_text: args,
        has_affiliate_disclosure: args.toLowerCase().includes("affiliate"),
        platform: "tiktok",
        claims: [],
        testimonials: [],
        scarcity_claims: [],
      };
      // Route to compliance service directly
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
