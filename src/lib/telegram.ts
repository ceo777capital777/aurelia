export type TelegramLead = {
  name: string;
  phone: string;
  email: string;
  message?: string;
  apartmentNumber?: string;
  floor?: number;
  area?: number;
  price?: number;
  status?: string;
};

export async function notifyTelegram(lead: TelegramLead) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { sent: false as const, reason: "unconfigured" as const };

  const residence = lead.apartmentNumber
    ? `${lead.apartmentNumber} · floor ${lead.floor ?? "—"} · ${lead.area ?? "—"} m² · AED ${lead.price ?? "—"} · ${lead.status ?? ""}`
    : "General enquiry";

  const text = [
    "Aurelia Residence — new enquiry",
    lead.name,
    lead.phone,
    lead.email,
    residence,
    lead.message || "",
  ]
    .filter((line) => line && line.trim().length > 0)
    .join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return { sent: response.ok, reason: response.ok ? ("ok" as const) : ("rejected" as const) };
  } catch {
    return { sent: false as const, reason: "network" as const };
  }
}
