import { NextResponse } from "next/server";
import type { InvoiceData } from "@/types/invoice";
import { renderInvoiceHTML } from "@/lib/pdf";
import type { TemplateId } from "@/types/supabase";
 


export const runtime = "nodejs";
export const maxDuration = 30;
 


export async function POST(request: Request) {

  try {
    const body = await request.json();
    const invoice: InvoiceData = body.invoice;
    const templateId : TemplateId = body.templateId ?? "classic";
 
    if (!invoice) {
      return NextResponse.json({ error: "Invoice data required" }, { status: 400 });
    }
 

    const html = renderInvoiceHTML(invoice, templateId);

    // using pdf shift api key 
 
 
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
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
          sandbox: false,        
        }),
      });
 

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`PDFShift error: ${err}`);
      }
 

      const pdfBuffer = await response.arrayBuffer();
      return new NextResponse(pdfBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }
  

    
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}