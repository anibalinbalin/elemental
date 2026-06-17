import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function esc(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "email requerido" }, { status: 400 });
    }

    const date = new Date().toLocaleString("es-UY", {
      timeZone: "America/Montevideo",
      dateStyle: "long",
      timeStyle: "short",
    });

    const { error } = await resend.emails.send({
      from: "MicroCore Newsletter <quiz@elementalbloomco.com>",
      to: "hola@elementalbloomco.com",
      subject: "Nueva suscripción al newsletter",
      html: [
        `<h2>Nueva suscripción al newsletter</h2>`,
        `<p><strong>Email:</strong> ${esc(email)}</p>`,
        `<p><strong>Fecha:</strong> ${esc(date)}</p>`,
      ].join("\n"),
    });

    if (error) {
      console.error("[newsletter] resend error:", error);
      return NextResponse.json({ error: "error interno" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[newsletter] error:", err);
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
