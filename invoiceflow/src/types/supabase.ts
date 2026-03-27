export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          user_id: string;
          invoice_number: string;
          status: "draft" | "sent" | "paid" | "overdue";
          issue_date: string;
          due_date: string;
          client_name: string;
          client_email: string;
          client_address: string;
          client_city: string;
          client_country: string;
          business_name: string;
          business_email: string;
          business_address: string;
          business_city: string;
          business_country: string;
          business_logo_url: string | null;
          tax_rate: number;
          currency: string;
          notes: string | null;
          pdf_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["invoices"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      line_items: {
        Row: {
          id: string;
          invoice_id: string;
          description: string;
          quantity: number;
          rate: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["line_items"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["line_items"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}