// pdf generation route 

import  {NextResponse} from "next/server";
import type { InvoiceData } from "@/types/invoice";
import { renderInvoiceHTML } from "@/lib/pdf";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request : Request) {
     
    try{
        const body = await request.json();
        const invoice : InvoiceData = body.invoice;

        if(!invoice) {

           return NextResponse.json({error : "Invoice data required"}, {status : 400});

        }

        const html = renderInvoiceHTML(invoice);

        let browser;

        if(process.env.NODE_ENV === "production") {
           const chromium = await import("@sparticuz/chromium");
           const puppeteer = await import("puppeteer-core");

           browser = await puppeteer.default.launch({
              args : chromium.default.args,
              defaultViewport: (chromium.default as any).defaultViewport,
              executablePath : await chromium.default.executablePath(),
              headless : true,
           });


        }  else {

           //local development 
           const puppeteer = await import("puppeteer-core");
           browser = await puppeteer.default.launch({headless : true});
           
        }


        const page  = await browser.newPage();

        await page.setContent(html, {waitUntil : "networkidle0"});

        await page.emulateMediaType("print");


        const pdf = await page.pdf({
           format : "A4",
           printBackground : true,
           margin : {top : "0", bottom : "0", left:"0", right:"0"},
        });


        await browser.close();


        return new NextResponse(pdf , {
           headers : {
             "Content-Type" : "application/pdf",
             "Content-Disposition" : `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
             "Cache-Control" : "no-store",
           },
        });

    } catch(err) {
       console.error("PDF generation error:", err);

       return NextResponse.json(
          {error : "Failed to generate PDF"},
          {status : 500}
       );
    }
}

