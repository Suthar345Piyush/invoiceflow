// main website hero section and front part of the site 

import { InvoiceForm } from "@/components/invoice/InvoiceForm";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FileText, Zap, Shield, Mail} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";





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

                <Link
                  href="/templates"
                  className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors"
                >
                  Templates
                </Link>

                  <Link href="/dashboard" className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                    Dashboard
                  </Link>
                  
                  </> 
              ) : (
                 <>

                  {/* <Link href="/login" className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors">
                    Sign in
                  </Link> */}


                  <Link href="/login?mode=signup" className="text-sm text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-800 transition-colors">
                    Sign up
                  </Link>

                  <Link
                  href="/templates"
                  className="text-sm text-ink-600 hover:text-ink-900 font-medium px-3 py-1.5 rounded-lg hover:bg-ink-100 transition-colors"
                >
                  Templates
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

              <Zap size={18} color="orange"/>
              Free - no signup needed for your first invoice 
            </div>

            <h1 className="text-4xl sm:text-5xl font-semibold text-ink-950 tracking-tight leading-tight text-shadow-gray-700">
               Invoices that get you paid
            </h1>

            <p className="text-ink-500 text-lg mt-3 max-w-xl mx-auto leading-relaxed">Fill in your details, download a professional PDF, and sent it to your client - in under 2 minutes.</p>

          </div>

          {/* peerlist section - link to peerlist dashboard*/}

          <a href="https://peerlist.io/piyushs/project/invoiceflow" target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-4 max-w-sm mx-auto mb-8 px-4 py-3 rounded-xl border border-ink-200 bg-white hover:bg-ink-50 hover:border-ink-300 transition-all cursor-pointer">


            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#00AA45] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">

                  <path d="M7 2L7 12M2 7L7 2L12 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <div>
                <p className="text-sm font-medium text-ink-900 leading-tight">Featured on Peerlist🚀</p>
                <p className="text-xs text-ink-500">Upvote invoiceflow if it helps you</p>
              </div>
            </div>


            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#00aa447a] bg-[#f0faf4] shrink-0">

            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
               <path d="M6 1L6 11M1 6L6 1L10 6" stroke="#00AA45" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>

              <span className="text-xs font-medium text-[#00884a]">Upvote</span>

            </div>
          </a>


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
          <div className="max-w-6xl mx-auto px-2 sm:px-6 text-center text-xs text-ink-400">
            @ {new Date().getFullYear()} Invoiceflow . Built for freelancers & small businesses
          </div>

          <div className="flex flex-wrap justify-center sm:justify-start gap-3 pl-5 sm:mt-5">
    
            <a href="https://x.com/invoiceflow12" className="text-gray-700 hover:text-black">
              <FaXTwitter size={25}/>
            </a>
        
            <a href="https://github.com/Suthar345Piyush/invoiceflow" className="text-gray-700 hover:text-black">
              <FaGithub size={25}/>
            </a> 
        </div>

     <div className="text-center sm:text-right text-sm sm:text-base pr-6 gap-4 px-3">
        Built with ❤️ by 
         <Link 
           href="https://piyushtwtz.vercel.app/" 
            className="font-semibold text-black hover:underline ml-0.5"
            >
            Piyush
          </Link>
         </div>
    </footer>
  </div>
  );
} 