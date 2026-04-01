import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderInvoiceHTML } from "@/lib/pdf";
import type { InvoiceData } from "@/types/invoice";

export const runtime = "nodejs";
export const maxDuration = 30;

const RENDER_API_URL = process.env.RENDER_API_URL || "http://localhost:4000";



export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    
    const body = await request.json();
    const invoice: InvoiceData = body.invoice;

    if (!invoice?.client?.email) {
      return NextResponse.json({ error: "Client email is required" }, { status: 400 });
    }

    const html = renderInvoiceHTML(invoice);



    // Call Render backend to send email with PDF


    const res = await fetch(`${RENDER_API_URL}/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        invoice,
        invoiceNumber: invoice.invoiceNumber,
      }),
    });



    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Email sending failed");
    }



    // Update invoice status to sent


    if (invoice.id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      await db
        .from("invoices")
        .update({ status: "sent" })
        .eq("id", invoice.id);
    }



    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}