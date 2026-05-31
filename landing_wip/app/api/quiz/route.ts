import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, consent, profile, answers } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "email requerido" }, { status: 400 });
    }

    const PROFILE_NAMES: Record<number, string> = {
      1: "Equilibrio y soporte diario",
      2: "Energía y recuperación",
      3: "Optimización consciente",
    };

    const profileName = PROFILE_NAMES[profile] || "Desconocido";

    const text = [
      `Nuevo quiz completado`,
      ``,
      `Email: ${email}`,
      `Consiente newsletter: ${consent ? "Sí" : "No"}`,
      `Perfil: ${profileName} (${profile})`,
      ``,
      `Respuestas (índice de opciones por pregunta):`,
      ...Object.entries(answers).map(
        ([q, opts]) => `  Pregunta ${Number(q) + 1}: ${(opts as number[]).join(", ")}`,
      ),
    ].join("\n");

    const html = [
      `<h2>Nuevo quiz completado</h2>`,
      `<p><strong>Email:</strong> ${email}</p>`,
      `<p><strong>Newsletter:</strong> ${consent ? "Sí" : "No"}</p>`,
      `<p><strong>Perfil:</strong> ${profileName}</p>`,
      `<hr>`,
      `<h3>Respuestas</h3>`,
      `<ul>`,
      ...Object.entries(answers).map(
        ([q, opts]) =>
          `<li>Pregunta ${Number(q) + 1}: opción(es) ${(opts as number[]).join(", ")}</li>`,
      ),
      `</ul>`,
    ].join("\n");

    // Send via simple SMTP fetch to a mail relay or use a transactional service.
    // For now, log and store. Replace with your preferred email service.
    // Example with Resend, Brevo, etc:
    //
    // await fetch("https://api.resend.com/emails", {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     from: "quiz@elementalbloomco.com",
    //     to: "hola@elementalbloomco.com",
    //     subject: `Quiz MicroCore - ${profileName} - ${email}`,
    //     text,
    //     html,
    //   }),
    // });

    console.log("[quiz] submission:", { email, profile: profileName, consent });

    return NextResponse.json({ ok: true, profile });
  } catch (err) {
    console.error("[quiz] error:", err);
    return NextResponse.json({ error: "error interno" }, { status: 500 });
  }
}
