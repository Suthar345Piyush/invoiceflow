export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue"; 
export type TemplateId = "classic" | "modern" | "minimal";

export interface Database {
  public: {
    Tables: {
      profiles : {
         Row : {
           id: string;
           selected_template: TemplateId;
           created_at: string;
           updated_at: string;
         };
         Insert : {
           id?: string;
           selected_template?: TemplateId;
           created_at?: string;
           updated_at?: string;
         };
         Update : {
           id?: string;
           selected_template?: TemplateId;
           updated_at?: string;
         };
      };

      invoices: {
        Row: {
          id: string;
          user_id: string;
          invoice_number: string;
          status: InvoiceStatus;
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
        Insert: {
          id?: string;
          user_id: string;
          invoice_number: string;
          status?: InvoiceStatus;
          issue_date: string;
          due_date: string;
          client_name: string;
          client_email: string;
          client_address?: string;
          client_city?: string;
          client_country?: string;
          business_name: string;
          business_email: string;
          business_address?: string;
          business_city?: string;
          business_country?: string;
          business_logo_url?: string | null;
          tax_rate?: number;
          currency?: string;
          notes?: string | null;
          pdf_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          invoice_number?: string;
          status?: InvoiceStatus;
          issue_date?: string;
          due_date?: string;
          client_name?: string;
          client_email?: string;
          client_address?: string;
          client_city?: string;
          client_country?: string;
          business_name?: string;
          business_email?: string;
          business_address?: string;
          business_city?: string;
          business_country?: string;
          business_logo_url?: string | null;
          tax_rate?: number;
          currency?: string;
          notes?: string | null;
          pdf_url?: string | null;
          updated_at?: string;
        };
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
        Insert: {
          id?: string;
          invoice_id: string;
          description: string;
          quantity: number;
          rate: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          description?: string;
          quantity?: number;
          rate?: number;
        };
      };
   };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}
