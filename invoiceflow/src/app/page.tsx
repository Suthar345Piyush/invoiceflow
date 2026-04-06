// main website hero section and front part of the site 

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Zap, Shield, Mail} from "lucide-react";



export default async function HomePage() {
     
     const supabase = await createClient();

     const {data : {user}} = await supabase.auth.getUser();

     const isAuthenticated = !!user;

     return (
        
      <div className="min-h-screen bg-ink-50">

        {/* navbar  */}

        <header className="bg-white border-b border-ink-100 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px h-14 flex items-center justify-between">

            <Link href="/" className="flex items-center gap-2">

            <div className="w-7 h-7 bg-ink-950 rounded-lg flex items-center justify-center">

              <span className="text-white font-bold text-xs">I</span>

            </div>

            <span className="font-semibold text-ink-900 text-sm">Invoiceflow</span>

            </Link>



            <nav className="flex items-center gap-2">

              {isAuthenticated ? (
                  <>

                  <Link href="/dashboard" className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                    Dashboard
                  </Link>
                  
                  </> 
              ) : (
                 <>

                  <Link href="/login" className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                    Sign in
                  </Link>


                  <Link href="/login?mode=signup" className="text-sm text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition-colors">

                    Sign up free

                  </Link>
                                 
                 </>
              )}

            </nav>

          </div>
        </header>



        {/* hero section  */}


        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-8">

          <div className="text-center mb-10 animate-fade-up">

            <div className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-xs font-medium px-3 py-1 rounded-full mb-4">

              <Zap size={20} color="yellow"/>
              Free - no signup needed for your first invoice 
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold text-ink-950 tracking-tight leading-tight">
              Invoices that get you paid
            </h1>

            <p className="text-ink-500 text-lg mt-3 max-w-xl mx-auto leading-relaxed">Fill in your details, download a professional PDF, and sent it to your client - in under 2 minutes.</p>

          </div>

          {/* value props section  */}

          <div className="grid grid-cols-3 gap-4 mb-10 max-w-xl mx-auto">
            {[
              { icon : FileText , label : "PDF in seconds"},
              { icon : Shield , label : "Secure & private"},
              { icon : Mail , label : "Email to client"},
            ].map(({icon : Icon, label}) => (

              <div key={label} className="flex flex-col items-center gap-1.5 text-center">

                <div className="w-8 h-8 rounded-xl bg-ink-100 flex items-center justify-center">
                  <Icon size={15} className="text-ink-600"/>

                  </div>

                  <span className="text-xs text-ink-500">{label}</span>


                </div>

            ))}
            </div>


            {/* invoice form section end  */}

            <InvoiceForm isAuthenticated={isAuthenticated} guestUsed={false}/>

        </section>

        {/* footer section  */}

        <footer className="border-t border-ink-100 mt-16 py-8">

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-ink-400">

            @ {new Date().getFullYear()} Invoiceflow . Built for freelancers & small businesses


            

          </div>

          <div className="flex flex-row items-end justify-end pr-6 pb-6 gap-1.5">
           Built with ❤️ by {<Link href="https://piyushtwtz.vercel.app/" className="font-semibold text-balck hover:underline">Piyush</Link>}
          </div>




        </footer>






      </div>
        
       

     )









} 