// the modal components , after first invoice generation it pop up 

'use client';


import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "./Button";
import { Input } from "./Input";
import { cn } from "@/lib/utils";
import {X, Mail, Lock, User} from "lucide-react";


// auth modal shown up after first invoice generation 
interface AuthModalProps {
   open : boolean;
   onClose : () => void;
   onSuccess?: () => void;
   message?: string;
}


type AuthMode = "login" | "signup";


export function AuthModal({open , onClose , onSuccess , message} : AuthModalProps) {
    
     const [mode, setMode] = useState<AuthMode>("signup");
     const [email, setEmail] = useState("");
     const [password, setPassword] = useState("");
     const [name, setName] = useState("");
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState("");
     const [sent, setSent] = useState(false);


     const supabase = createClient();


     const handleSubmit = async(e : React.SubmitEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");


        try {

          if(mode === "signup"){

             const {error} = await supabase.auth.signUp({
                 email,
                 password,
                 options : {data : {full_name : name}},     
             });


             if (error) throw error;
             
             setSent(true);
          }  
            else {

             const {error} = await supabase.auth.signInWithPassword({email, password});

             if(error) throw error;

             onSuccess?.();
             onClose();

          }

        } catch(err: unknown) {
           setError(err instanceof Error ? err.message : "Something went wrong");
           
        } 
          finally {
             setLoading(false);
          }

     };


     // google oauth function

     const handleGoogle = async () => {
        await supabase.auth.signInWithOAuth({
           provider: "google",
           options : {redirectTo: `${window.location.origin}/auth/callback`},
        });
     };

     if(!open) return null;



     return (
         
       <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={(e) => e.currentTarget}>


        <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm animate-fade-in" />


 {/* modal  */}


        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-up overflow-hidden">

          <div className="h-1 bg-linear-to-r from-brand-400 via-brand-600 to-brand-800" />


         <div className="p-8">
           
            <button onClick={onClose} className="absolute top-6 right-6 p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-colors">

              <X size={16}/>

            </button>


            <div className="mb-6">

               <div className="w-10 h-10 rounded-xl bg-ink-950 flex items-center justify-center mb-4">

                <span className="text-white font-bold text-lg">I</span>

               </div>

               <h2 className="text-xl font-semibold text-ink-900">

                {
                  sent ? "Check your email" : mode === "signup" ? "Create your account" : "Welcome back"
                }

               </h2>

               <p className="text-sm text-ink-500 mt-1">

                {
                  sent ? `We sent a confirmation link to ${email}` : message || (mode === "signup" ? "Save your invoice and access them anytime" : "Sign in to manage your invoices")
                }

               </p>

            </div>

            {
              sent ? (
                 
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-3">

                      <Mail size={24} className="text-brand-700"/>
                      
                      </div>
                      
                      <p className="text-sm text-ink-600">
                        Click the link in the email to activate your account.
                      </p>


                      <Button variant="ghost" className="mt-4 w-full" onClick={() => {setSent(false); setMode("login")}}>
                        Back to sign in
                      </Button>

                    </div>

              ) : (

                     <>

                     {/* google auth  */}

                     <button
                       onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-ink-200 hover:border-ink-300 hover:bg-ink-50 transition-all text-sm font-medium text-ink-700 mb-5 cursor-pointer"
                      >


                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
                  <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
                  <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
                </svg>

                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-ink-100"/>
                <span className="text-xs text-ink-400">or</span>
                <div className="flex-1 h-px bg-ink-100"/>
              </div>


            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                 
                 <div className="relative">

                  <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none mt-0.5"/>

                    <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"/> 

                 </div>
                  
              )}

              <div className="relative">

                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>

                <input type="email" placeholder="Email address" value={email}  onChange={(e) => setEmail(e.target.value)} required className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"/>

              </div>


            <div className="relative">

               <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"/>

               <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-ink-200 hover:border-ink-300 focus:border-transparent focus:ring-2 focus:ring-brand-500 outline-none transition-all"/>

            </div>


            {error && (

               <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
               </p>

            )}

            <Button type="submit" className="w-full" loading={loading} size="lg">
              {mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>


          <p className="text-center text-sm text-ink-500 mt-5">

            {mode === "signup" ? "Already have an account? " : "Don't have an account? "}

            <button onClick={() => {setMode(mode === "signup" ? "login" : "signup"); setError("");
          
             }} className="text-ink-900 font-medium hover:underline">

              {mode === "signup" ? "Sign in" : "Sign up free"}

            </button>

            </p>
                     
           </>
              )
            }
         </div>
        </div>
         
       </div>

     );
}






