import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendInvoiceEmail } from "@/lib/email";
import { renderInvoiceHTML } from "@/lib/pdf";
import type { InvoiceData } from "@/types/invoice";
import fs from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 30;

async function getPDFBuffer(html: string): Promise<Buffer> {
  const puppeteer = await import("puppeteer-core");

  let executablePath: string;

  if (process.env.NODE_ENV === "production") {
    const chromium = await import("@sparticuz/chromium");
    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: {width : 800 , height : 600},
      executablePath: await chromium.default.executablePath(),
      headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();
    return Buffer.from(pdf);
  }

  // Dev: find local Chrome
  const cacheDir = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
  executablePath = "";
  if (fs.existsSync(cacheDir)) {
    for (const version of fs.readdirSync(cacheDir)) {
      for (const candidate of [
        path.join(cacheDir, version, "chrome-win64", "chrome.exe"),
        path.join(cacheDir, version, "chrome-win32", "chrome.exe"),
        path.join(cacheDir, version, "chrome-linux", "chrome"),
      ]) {
        if (fs.existsSync(candidate)) { executablePath = candidate; break; }
      }
      if (executablePath) break;
    }
  }
  if (!executablePath) {
    for (const p of [
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "/usr/bin/google-chrome",
    ]) {
      if (fs.existsSync(p)) { executablePath = p; break; }
    }
  }

  const browser = await puppeteer.default.launch({
    headless: true,
    executablePath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });
  const pdf = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return Buffer.from(pdf);
}

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
    const pdfBuffer = await getPDFBuffer(html);

    await sendInvoiceEmail({ invoice, pdfBuffer });

    if (invoice.id) {
      await supabase
        .from("invoices")
        .update(status as never)
        .eq("id", invoice.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}