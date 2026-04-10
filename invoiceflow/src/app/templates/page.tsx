// app -> templates -> page.tsx 

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {TemplatesClient} from "./TemplatesClient";


export default async function TemplatePage() {

   const supabase = await createClient();
   const {data : {user}} = await supabase.auth.getUser();
   const isAuthenticated = !!user;

   let currentTemplate = "classic";
   
   if(user) {

    // explicitly casting the query result to avoid the type 'never' ts error

      const {data} = await supabase.from("profiles").select("selected_template").eq("id", user.id).single();

      const profile = data as {selected_template : string} | null;

      currentTemplate = profile?.selected_template ?? "classic";
   }

   return (
      
      <div>
         <header className="bg-white border-b border-ink-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-ink-950 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">I</span>
            </div>
            <span className="font-semibold text-ink-900 text-sm">Invoiceflow</span>
          </Link>
 

          <nav className="flex items-center gap-2">

            <Link href="/templates" className="text-sm font-medium text-ink-900 px-3 py-1.5 rounded-lg bg-ink-100">

              Templates
            </Link>

            {isAuthenticated ? (

              <Link href="/dashboard" className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                Dashboard
              </Link>

            ) : (
              <>

                <Link href="/login?mode=signup" className="text-sm bg-ink-950 text-white font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition-colors">
                  Sign up
                </Link>

              </>
            )}

          </nav>
        </div>
      </header>


      {/* template pages   */}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-ink-950 tracking-tight">Invoice Templates</h1>

          <p className="text-ink-500 mt-2 text-base">

            {isAuthenticated ? "Choose a template - it will be used in all your PDF downloads and emails." : "Browse our templates. Sign up to select and use one."}

          </p>

        </div>

        <TemplatesClient isAuthenticated={isAuthenticated} currentTemplate={currentTemplate}/>





      </div>







      </div>
   )



}





