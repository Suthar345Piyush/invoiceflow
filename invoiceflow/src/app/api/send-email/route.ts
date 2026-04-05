import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderInvoiceHTML } from "@/lib/pdf";
import { Resend } from "resend";
import type { InvoiceData } from "@/types/invoice";

export const runtime = "nodejs";
export const maxDuration = 30;

async function generatePDFBuffer(html: string): Promise<Buffer> {

  if (process.env.PDFSHIFT_API_KEY) {
    const response = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${Buffer.from(`api:${process.env.PDFSHIFT_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ source: html, format: "A4", sandbox: false, wait_for: "networkidle2" }),
    });
    if (!response.ok) throw new Error(`PDFShift error: ${await response.text()}`);
    return Buffer.from(await response.arrayBuffer());
  }


  throw new Error("No PDF provider configured. Set PDFSHIFT_API_KEY in Vercel env vars.");
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const invoice: InvoiceData = body.invoice;
    if (!invoice?.client?.email) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }

    const html = renderInvoiceHTML(invoice);
    const pdfBuffer = await generatePDFBuffer(html);

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: `${invoice.business.name} <onboarding@resend.dev>`,
      to: [invoice.client.email],
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.business.name}`,
      html: `<p>Hi ${invoice.client.name}, please find your invoice attached.</p>`,
      attachments: [{ filename: `invoice-${invoice.invoiceNumber}.pdf`, content: pdfBuffer }],
    });

    if (error) throw new Error(error.message);

    if (invoice.id) {
      await supabase.from("invoices")
      .update(status as never)
      .eq("id", invoice.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}