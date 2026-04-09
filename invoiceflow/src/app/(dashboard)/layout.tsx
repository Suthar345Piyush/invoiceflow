// dashboard design layout for  authenticated users 

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard , FilePlus, LogOut, LayoutTemplate } from "lucide-react";

export default async function DashboardLayout({children}: {children : React.ReactNode}) {
    
    const supabase = await createClient();

    const { data : {user} } = await supabase.auth.getUser();

    if(!user) redirect("/login");

    return (

       <div className="min-h-screen bg-ink-50 flex">

        <aside className="w-56 bg-white border-r border-ink-100 flex flex-col  fixed inset-y-0 left-0 z-30">

          <div className="h-14 flex items-center px-5 border-b border-ink-100">

            <Link href="/" className="flex items-center gap-2">

              <div className="w-8 h-7 bg-ink-950 rounded-lg flex items-center justify-center">

                <span className="text-white font-bold text-xs">I</span>

              </div>

              <span className="font-semibold text-ink-900 text-sm">Invoiceflow</span>

            </Link>

          </div>

          {/* navbar  */}

          <nav className="flex-1 px-3 py-4 space-y-1">

            <Link href="/dashboard" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors font-medium">
              <LayoutDashboard size={15}/>
              Dashboard
            </Link>

            <Link href="/invoices/new" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors font-medium">
              <FilePlus size={15}/>
              New Invoice
            </Link>

            <Link
            href="/templates"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors font-medium"
          >
            <LayoutTemplate size={15} />
            Templates
          </Link>
          </nav>


          {/* user section  */}

          <div className="px-3 py-4 border-t border-ink-100">
            <div className="px-3 py-2 mb-1">
              <p className="text-xs font-medium text-ink-800 truncate">
                {user.user_metadata?.full_name || user.email}
              </p>

              <p className="text-xs text-ink-400 truncate">{user.email}</p>
            </div>

            <form action="/api/auth/signout" method="POST">

              <button type="submit" className="cursor-pointer ww-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-ink-500 hover:text-red-600 hover:bg-red-50 transition-colors font-medium">

                <LogOut size={15}/>
                Sign out

              </button>

            </form>

          </div>
        </aside>

        {/* main part  */}

        <main className="flex-1 ml-56 min-h-screen">

          <div className="max-w-5xl  mx-auto px-6 py-8">{children}</div>

        </main>




       </div>

    )


}

