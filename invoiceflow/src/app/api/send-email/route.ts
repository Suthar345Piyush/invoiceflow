import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderInvoiceHTML } from "@/lib/pdf";
import { Resend } from "resend";
import type { InvoiceData } from "@/types/invoice";
import { Database } from "@/types/supabase";


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
      body: JSON.stringify({
        source: html,
        format: "A4",
        sandbox: false,
      }),
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
    
      from: `${invoice.business.name} <${process.env.EMAIL_FROM}>`,
      to: [invoice.client.email],
      replyTo: invoice.business.email,
      subject: `Invoice ${invoice.invoiceNumber} from ${invoice.business.name}`,
      html: buildEmailBody(invoice),
      attachments: [
        {
          filename: `invoice-${invoice.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (error) throw new Error(error.message);

    // Update invoice status to sent
    if (invoice.id) {
      await supabase
        .from("invoices")
        .update({status : "sent"} as never)
        .eq("id", invoice.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}


function buildEmailBody(invoice: InvoiceData): string {

  return `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1c1a17;">
      <div style="margin-bottom:24px;">
        <div style="width:40px;height:40px;background:#052e16;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="color:#fff;font-weight:700;font-size:16px;">${invoice.business.name.charAt(0).toUpperCase()}</span>

        </div>
        <h2 style="font-size:20px;font-weight:600;margin:0 0 4px;">Invoice from ${invoice.business.name}</h2>
        <p style="color:#706a60;font-size:14px;margin:0;">Hi ${invoice.client.name}, please find your invoice attached to this email.</p>
      </div>

      <div style="background:#f8f8f7;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#706a60;font-size:13px;">Invoice Number</span>
          <span style="font-weight:500;font-size:13px;">${invoice.invoiceNumber}</span>
        </div>

        <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
          <span style="color:#706a60;font-size:13px;">Issue Date</span>
          <span style="font-weight:500;font-size:13px;">${new Date(invoice.issueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>

        <div style="display:flex;justify-content:space-between;border-top:1px solid #e2e0db;padding-top:10px;margin-top:4px;">
          <span style="color:#706a60;font-size:13px;">Due Date</span>
          <span style="font-weight:600;font-size:13px;color:#14532d;">${new Date(invoice.dueDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
        </div>
      </div>

      <p style="color:#706a60;font-size:12px;margin-bottom:24px;">
        The invoice PDF is attached. If you have any questions, reply directly to this email.
      </p>

      <hr style="border:none;border-top:1px solid #e2e0db;margin:24px 0;" />
      <p style="color:#a9a39a;font-size:11px;text-align:center;margin:0;">
        Sent by ${invoice.business.name} · ${invoice.business.email}
      </p>
    </div>

  `;
}