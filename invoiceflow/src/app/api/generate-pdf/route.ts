import { NextResponse } from "next/server";
import type { InvoiceData } from "@/types/invoice";
import { renderInvoiceHTML } from "@/lib/pdf";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 30;

function findChromiumPath(): string {




  const puppeteer = require("puppeteer");
  const reported = puppeteer.executablePath() as string;
  if (fs.existsSync(reported)) return reported;




  const winPaths = [
    path.join(os.homedir(), ".cache", "puppeteer", "chrome"),
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  ];

  

  // Walk the puppeteer cache dir to find chrome.exe
  const cacheDir = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
  if (fs.existsSync(cacheDir)) {
    const versions = fs.readdirSync(cacheDir);
    for (const version of versions) {
      const candidates = [
        path.join(cacheDir, version, "chrome-win64", "chrome.exe"),
        path.join(cacheDir, version, "chrome-win32", "chrome.exe"),
        path.join(cacheDir, version, "chrome-linux", "chrome"),
        path.join(cacheDir, version, "chrome-mac", "Chromium.app", "Contents", "MacOS", "Chromium"),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) {
          console.log("Found Chromium at:", c);
          return c;
        }
      }
    }
  }



  // 3. Try system Chrome installs on Windows
  for (const p of winPaths) {
    if (fs.existsSync(p)) {
      console.log("Found system Chrome at:", p);
      return p;
    }
  }


  throw new Error(
    `Chromium not found. Run: pnpm exec puppeteer browsers install chrome\nSearched: ${reported}`
  );
}



async function getBrowser() {
  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: {width : 800, height : 600},
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }



  const executablePath = findChromiumPath();
  console.log("Launching Chromium from:", executablePath);



  const puppeteer = await import("puppeteer-core");
  return puppeteer.default.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
    ],
  });
}



export async function POST(request: Request) {
  try {
    const body = await request.json();
    const invoice: InvoiceData = body.invoice;

    if (!invoice) {
      return NextResponse.json({ error: "Invoice data required" }, { status: 400 });
    }


    const html = renderInvoiceHTML(invoice);
    const browser = await getBrowser();


    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("print");

    
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });



    await browser.close();

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("PDF generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}