"use client";



import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Lock } from "lucide-react";
import Link from "next/link";



interface Props {
  isAuthenticated  : boolean;
  currentTemplate: string;
}



const TEMPLATES = [
  {
    id: "classic",
    name: "Classic",
    description: "Warm off-white tones, DM Sans typeface. Clean and professional.",
    accent: "#052e16",
    bg: "#f8f8f7",
    preview: <ClassicPreview />,
  },
  {
    id: "modern",
    name: "Modern",
    description: "Dark header with green accent. Bold and contemporary.",
    accent: "#22c55e",
    bg: "#111827",
    preview: <ModernPreview />,
  },
  {
    id: "minimal",
    name: "Minimal",
    description: "Pure whitespace and thin lines. Elegant simplicity.",
    accent: "#2d2d2d",
    bg: "#ffffff",
    preview: <MinimalPreview />,
  },
];



export function TemplatesClient({ isAuthenticated, currentTemplate }: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState(currentTemplate);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);



  const handleSelect = async (templateId: string) => {
    if (!isAuthenticated) return;
    if (templateId === selected) return;

    setSaving(templateId);
    try {
      const res = await fetch("/api/user/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: templateId }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSelected(templateId);
      setSaved(templateId);
      setTimeout(() => setSaved(null), 2500);
      router.refresh();
    } catch {
      alert("Failed to save template. Please try again.");
    } finally {
      setSaving(null);
    }
  };



  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {TEMPLATES.map((template) => {
        const isActive = selected === template.id;
        const isSaving = saving === template.id;
        const justSaved = saved === template.id;

        return (
          <div
            key={template.id}
            className={`bg-white rounded-2xl border-2 overflow-hidden transition-all duration-200 ${
              isActive
                ? "border-ink-900 shadow-lg"
                : "border-ink-100 hover:border-ink-300 shadow-sm"
            }`}
          >
            {/* Template preview */}
            <div className="relative bg-ink-50 p-4 h-72 overflow-hidden">
              <div className="transform scale-[0.62] origin-top-left w-[161%]">
                {template.preview}
              </div>

              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3 right-3 bg-ink-950 text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Check size={11} />
                  Active
                </div>
              )}
            </div>

            {/* Template info */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-ink-900">{template.name}</h3>
                <div
                  className="w-4 h-4 rounded-full border border-ink-200 shrink-0"
                  style={{ background: template.accent }}
                />
              </div>
              <p className="text-xs text-ink-500 mb-4 leading-relaxed">{template.description}</p>

              {isAuthenticated ? (
                <button
                  onClick={() => handleSelect(template.id)}
                  disabled={isActive || isSaving}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-ink-950 text-white cursor-default"
                      : justSaved
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 text-ink-700 hover:bg-ink-200 disabled:opacity-60"
                  }`}
                >
                  {isSaving ? (
                    "Saving…"
                  ) : justSaved ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check size={14} /> Saved!
                    </span>
                  ) : isActive ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Check size={14} /> Selected
                    </span>
                  ) : (
                    "Use this template"
                  )}
                </button>
              ) : (
                <Link
                  href="/login?mode=signup"
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-ink-100 text-ink-500 flex items-center justify-center gap-1.5 hover:bg-ink-200 transition-colors"
                >
                  <Lock size={13} />
                  Sign up to use
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// template preview 

function ClassicPreview() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#1c1a17", background: "#fff", padding: "28px 32px", lineHeight: 1.5, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ width: 32, height: 32, background: "#052e16", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>A</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#052e16" }}>Invoice</div>
          <div style={{ fontSize: 9, color: "#706a60", fontFamily: "monospace" }}>INV-2025-0042</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 20, padding: 12, background: "#f8f8f7", borderRadius: 8 }}>
        {["Issue Date", "Due Date", "Amount", "Currency"].map((l, i) => (
          <div key={l} style={{ flex: 1 }}>
            <div style={{ fontSize: 7, color: "#a9a39a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
            <div style={{ fontSize: 9, fontWeight: 500 }}>{["Mar 28, 2025", "Apr 27, 2025", "$1,800.00", "USD"][i]}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
        {["From", "Bill To"].map((label) => (
          <div key={label} style={{ width: "46%" }}>
            <div style={{ fontSize: 7, color: "#a9a39a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 10, fontWeight: 600 }}>Acme Studio</div>
            <div style={{ fontSize: 9, color: "#706a60" }}>hello@acme.co<br />Mumbai, India</div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1.5px solid #1c1a17", paddingTop: 6, marginBottom: 4 }}>
        {["Web Design", "Development", "SEO"].map((item, i) => (
          <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e2e0db", fontSize: 9 }}>
            <span>{item}</span><span style={{ color: "#3d3a36" }}>{["$800", "$600", "$400"][i]}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
        <div style={{ width: 120 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "#706a60", padding: "3px 0" }}><span>Subtotal</span><span>$1,800</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 600, borderTop: "1.5px solid #1c1a17", paddingTop: 5, marginTop: 3 }}><span>Total</span><span>$1,800</span></div>
        </div>
      </div>
    </div>
  );
}

function ModernPreview() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, background: "#fff", lineHeight: 1.5, width: "100%" }}>
      <div style={{ background: "#111827", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#22c55e", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>A</div>
          <div><div style={{ fontSize: 11, fontWeight: 600, color: "#fff" }}>Acme Studio</div><div style={{ fontSize: 8, color: "#9ca3af" }}>hello@acme.co</div></div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: -0.5 }}>INVOICE</div>
          <div style={{ fontSize: 8, color: "#6b7280", fontFamily: "monospace" }}>INV-2025-0042</div>
        </div>
      </div>
      <div style={{ padding: "14px 24px" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 14, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          {["Issue Date\nMar 28", "Due Date\nApr 27", "Amount\n$1,800", "Currency\nUSD"].map((item, i) => (
            <div key={i} style={{ flex: 1, padding: "8px 10px", borderRight: i < 3 ? "1px solid #e5e7eb" : "none" }}>
              <div style={{ fontSize: 7, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>{item.split("\n")[0]}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: i === 2 ? "#16a34a" : "#111827" }}>{item.split("\n")[1]}</div>
            </div>
          ))}
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 10 }}>
          <thead>
            <tr style={{ background: "#111827" }}>
              {["Description", "Qty", "Rate", "Amount"].map((h) => (
                <th key={h} style={{ fontSize: 7, color: "#9ca3af", padding: "6px 8px", textAlign: h === "Description" ? "left" : "right", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[["Web Design", "1", "$800", "$800"], ["Development", "1", "$600", "$600"], ["SEO", "3", "$133", "$400"]].map((row) => (
              <tr key={row[0]} style={{ borderBottom: "1px solid #f3f4f6" }}>
                {row.map((cell, i) => (
                  <td key={i} style={{ padding: "5px 8px", fontSize: 9, textAlign: i === 0 ? "left" : "right" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ width: 130, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 10px", fontSize: 9, color: "#6b7280", borderBottom: "1px solid #f3f4f6" }}><span>Subtotal</span><span>$1,800</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", fontSize: 10, fontWeight: 700, background: "#111827", color: "#fff" }}><span>Total</span><span style={{ color: "#22c55e" }}>$1,800</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MinimalPreview() {
  return (
    <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "#2d2d2d", background: "#fff", padding: "28px 32px", lineHeight: 1.6, width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Acme Studio</div>
          <div style={{ fontSize: 9, color: "#999", fontWeight: 300 }}>hello@acme.co</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#bbb" }}>Invoice</div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>INV-0042</div>
        </div>
      </div>
      <div style={{ height: 1, background: "#e8e8e8", marginBottom: 16 }} />
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#bbb", marginBottom: 5 }}>From</div>
          <div style={{ fontSize: 10, fontWeight: 700 }}>Acme Studio</div>
          <div style={{ fontSize: 9, color: "#888", fontWeight: 300 }}>Mumbai, India</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#bbb", marginBottom: 5 }}>Bill To</div>
          <div style={{ fontSize: 10, fontWeight: 700 }}>Client Corp</div>
          <div style={{ fontSize: 9, color: "#888", fontWeight: 300 }}>New York, USA</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 24, borderTop: "1px solid #e8e8e8", borderBottom: "1px solid #e8e8e8", padding: "10px 0", marginBottom: 14 }}>
        {["Issue Date\nMar 28", "Due Date\nApr 27", "Amount\n$1,800"].map((item, i) => (
          <div key={i}>
            <div style={{ fontSize: 7, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "#bbb", marginBottom: 2 }}>{item.split("\n")[0]}</div>
            <div style={{ fontSize: i === 2 ? 13 : 9, fontWeight: i === 2 ? 700 : 400 }}>{item.split("\n")[1]}</div>
          </div>
        ))}
      </div>
      {[["Web Design", "$800"], ["Development", "$600"], ["SEO", "$400"]].map(([item, price]) => (
        <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 9, borderBottom: "1px solid #f0f0f0", fontWeight: 300 }}>
          <span style={{ fontWeight: 400 }}>{item}</span><span>{price}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
        <div style={{ width: 110 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, borderTop: "1px solid #2d2d2d", paddingTop: 6 }}><span>Total</span><span>$1,800</span></div>
        </div>
      </div>
    </div>
  );
}