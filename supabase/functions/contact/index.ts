import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
        status,
        headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
        },
    });

serve(async (req: Request) => {
    // CORS preflight
    if (req.method === "OPTIONS") return json({ ok: true });
    if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

    // Inicializar cliente de Supabase (uso interno)
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) return json({ error: "Missing RESEND_API_KEY" }, 500);

    let body: Record<string, unknown>;
    try {
        body = await req.json();
    } catch {
        return json({ error: "Invalid JSON" }, 400);
    }

    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const subject = String(body?.subject ?? "").trim();
    const message = String(body?.message ?? "").trim();

    // Honeypot anti-bot (campo hidden en el form, los bots lo rellenan)
    const company = String(body?.company ?? "").trim();
    if (company) {
        const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
        const ua = req.headers.get("user-agent") || "unknown";

        console.warn(`[Honeypot Hit] IP: ${ip} caught!`);

        // Registrar en la base de datos de forma asíncrona (pero esperando para asegurar persistencia)
        await edge_log_honeypot(supabase, ip, ua, body);

        return json({ ok: true }); // silencioso para no entrenar al bot
    }

    // Validaciones
    if (!email.includes("@")) return json({ error: "Invalid email" }, 400);
    if (message.length < 5) return json({ error: "Message too short" }, 400);
    if (message.length > 5000) return json({ error: "Message too long" }, 400);

    const safeName = name || "Anonymous";
    const safeSubject = subject || "New message";

    // Email privado (NUNCA se expone al usuario)
    const TO_PRIVATE = "juanku2003@gmail.com";
    const FROM_PUBLIC = "CrackingWall Contact <onboarding@resend.dev>";

    const textBody = [
        `Name:    ${safeName}`,
        `Email:   ${email}`,
        `Subject: ${safeSubject}`,
        ``,
        message,
    ].join("\n");

    const htmlBody = `
    <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 1px solid #eee;">
      <h2 style="color: #111; border-bottom: 2px solid #eee; padding-bottom: 12px; margin-top: 0;">
        📬 New Contact Form Message
      </h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 80px;"><strong>Name</strong></td>
          <td style="padding: 8px 0;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Email</strong></td>
          <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0070f3;">${email}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Subject</strong></td>
          <td style="padding: 8px 0;">${safeSubject}</td>
        </tr>
      </table>
      <div style="background: #f9f9f9; border-left: 4px solid #0070f3; padding: 16px; border-radius: 4px;">
        <p style="margin: 0; white-space: pre-wrap; color: #333;">${message}</p>
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Sent from CrackingWall contact form · Reply to this email to respond to ${safeName}
      </p>
    </div>
  `;

    const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            from: FROM_PUBLIC,
            to: [TO_PRIVATE],
            reply_to: email,
            subject: `[Contact] ${safeSubject} — ${safeName}`,
            text: textBody,
            html: htmlBody,
        }),
    });

    const resendJson = await resendRes.json().catch(() => ({}));

    if (!resendRes.ok) {
        console.error("Resend error:", resendRes.status, resendJson);
        return json({ error: "Failed to send email", details: resendJson }, 502);
    }

    return json({ ok: true, id: (resendJson as { id?: string })?.id });
});

// Función auxiliar para registrar en la DB
async function edge_log_honeypot(supabase: any, ip: string, ua: string, payload: Record<string, unknown>) {
    try {
        const { error } = await supabase
            .from('honeypot_logs')
            .insert([{
                ip_address: ip,
                user_agent: ua,
                payload: payload
            }]);
        if (error) console.error("Error inserting honeypot log:", error);
    } catch (err) {
        console.error("Critical error logging honeypot:", err);
    }
}
