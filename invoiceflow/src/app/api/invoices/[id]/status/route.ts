import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { InvoiceStatus } from "@/types/supabase";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { status } = await request.json();

  const validStatuses: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const { error } = await supabase
    .from("invoices")
    .update({ status: status as InvoiceStatus })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}