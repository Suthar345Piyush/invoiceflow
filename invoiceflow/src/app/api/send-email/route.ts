// sent - email API route 

// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";
// import {sendInvoiceEmail} from "@/lib/email";
// import {renderInvoiceHTML} from "@/lib/pdf";
// import type { InvoiceData } from "@/types/invoice";



// export const runtime = "nodejs";
// export const maxDuration = 30;

// export async function POST(request : Request) {
    
//     try {
      
//          //authentication check 

//          const supabase = await createClient();

//          const {data : {user}} = await supabase.auth.getUser();

//          if(!user) {
//             return NextResponse.json({error : "Unauthorized"}, {status : 401});
//          }


//          const body = await request.json();
//          const invoice:InvoiceData = body.invoice;

//          if(!invoice?.client?.email) {
//             return NextResponse.json(
//               {error : "Client email is required"},
//               {status : 400}
//             );
//          }


//          // generating pdf buffer 

//          const html = renderInvoiceHTML(invoice);


//          let pdfBuffer : Buffer;

//          if(process.env.NODE_ENV === "production") {
  
//            // chromium , sprticiz module

//            const chromium = await import("@sparticuz/chromium");
//            const puppeteer = await import("puppeteer-core");

//            const browser = await  puppeteer.default.launch({

//              args : chromium.default.args,
//              defaultViewport : (chromium.default as any).defaultViewport,
//              executablePath : await chromium.default.executablePath(),
//              headless : true,

//            });



//            const page = await browser.newPage();
//            await page.setContent(html, {waitUntil : "networkidle0"});
//            const pdf = await page.pdf({format : "A4", printBackground : true});

//            await browser.close();

//            pdfBuffer = Buffer.from(pdf);
//          }

//            else {
//               const puppeteer = await import("puppeteer-core");
//               const browser = await puppeteer.default.launch({headless : true});
//               const page = await browser.newPage();

//               await page.setContent(html, {waitUntil : "networkidle0"});
//               const pdf = await page.pdf({format : "A4", printBackground : true});

//               await browser.close();

//               pdfBuffer = Buffer.from(pdf);
//             }

//             await sendInvoiceEmail({invoice, pdfBuffer});


//             if(invoice.id) {
//                await supabase.from("invoices").update({status : "sent"}).eq("id", invoice.id);
//             }



//             return NextResponse.json({success : true});

//     } catch(err) {
//       console.error("Send email error:", err);
//       return NextResponse.json({error : "Failed to send email"}, {status : 500});

//     }


// }
