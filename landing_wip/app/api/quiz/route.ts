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
    const { email, consent, profile, answers } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "email requerido" }, { status: 400 });
    }

    const PROFILE_NAMES: Record<number, string> = {
      1: "Equilibrio y soporte diario",
      2: "Energía y recuperación",
      3: "Optimización consciente",
    };

    const profileName = PROFILE_NAMES[profile] || "Desconocido";

    const answersHtml = Object.entries(answers)
      .map(([q, opts]) => {
        const qNum = Number(q);
        const optNums = (opts as number[]).filter((n) => Number.isFinite(n));
        return `<li>Pregunta ${qNum + 1}: opción(es) ${optNums.join(", ")}</li>`;
      })
      .join("\n");

    const { error } = await resend.emails.send({
      from: "MicroCore Quiz <onboarding@resend.dev>",
      to: "hola@elementalbloomco.com",
      subject: `Quiz MicroCore - ${profileName} - ${esc(email)}`,
      html: [
        `<h2>Nuevo quiz completado</h2>`,
        `<p><strong>Email:</strong> ${esc(email)}</p>`,
        `<p><strong>Newsletter:</strong> ${consent ? "Sí" : "No"}</p>`,
        `<p><strong>Perfil:</strong> ${esc(profileName)}</p>`,
        `<hr>`,
        `<h3>Respuestas</h3>`,
        `<ul>${answersHtml}</ul>`,
      ].join("\n"),
    });

    if (error) {
      console.error("[quiz] resend error:", error);
    }

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("[quiz] error:", err);
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
