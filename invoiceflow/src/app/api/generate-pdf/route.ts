import { NextResponse } from "next/server";
import type { InvoiceData } from "@/types/invoice";
import { renderInvoiceHTML } from "@/lib/pdf";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 30;

async function getBrowser() {
  // Production (Vercel): use sparticuz/chromium + puppeteer-core
  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium");
    const puppeteer = await import("puppeteer-core");
    return puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: {width : 800 , height : 600},
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
  }

  // Development: use puppeteer-core + find local Chrome
  const puppeteer = await import("puppeteer-core");
  const executablePath = findLocalChrome();
  console.log("Dev Chromium path:", executablePath);
  return puppeteer.default.launch({
    headless: true,
    executablePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
}

function findLocalChrome(): string {
  // Walk puppeteer cache dir (works after pnpm exec puppeteer browsers install chrome)
  const cacheDir = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
  if (fs.existsSync(cacheDir)) {
    for (const version of fs.readdirSync(cacheDir)) {
      const candidates = [
        path.join(cacheDir, version, "chrome-win64", "chrome.exe"),
        path.join(cacheDir, version, "chrome-win32", "chrome.exe"),
        path.join(cacheDir, version, "chrome-linux", "chrome"),
        path.join(cacheDir, version, "chrome-mac-x64", "Google Chrome for Testing.app", "Contents", "MacOS", "Google Chrome for Testing"),
      ];
      for (const c of candidates) {
        if (fs.existsSync(c)) return c;
      }
    }
  }
  // Fallback to system Chrome
  const systemPaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const p of systemPaths) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Chrome not found. Run: pnpm exec puppeteer browsers install chrome");
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

