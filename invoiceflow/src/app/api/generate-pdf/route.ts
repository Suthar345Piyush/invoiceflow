import { NextResponse } from "next/server";
import type { InvoiceData } from "@/types/invoice";
import { renderInvoiceHTML } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

const RENDER_API_URL = process.env.RENDER_API_URL || "http://localhost:4000";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoice: InvoiceData = body.invoice;

    if (!invoice) {
      return NextResponse.json({ error: "Invoice data required" }, { status: 400 });
    }



    // Render the HTML here (no Puppeteer needed on Vercel)


    const html = renderInvoiceHTML(invoice);

    // Call the Render backend to generate the PDF


    const res = await fetch(`${RENDER_API_URL}/generate-pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, invoiceNumber: invoice.invoiceNumber }),
    });



    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "PDF generation failed");
    }



    const pdfBuffer = await res.arrayBuffer();



    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });


    
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}