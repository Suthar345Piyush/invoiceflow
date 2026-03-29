-- line items table  


create table public.line_items (
    id uuid primary key default uuid_generate_v4(),
    invoice_id  uuid not null references public.invoices(id) on delete cascade,
    description text not null,
    quantity numeric(10,2) not null default 1 check (quantity > 0),
    rate numeric(12,2) not null default 0 check (rate >= 0),
    created_at timestamptz not null default now()
);


 
create index line_items_invoice_id_idx on public.line_items(invoice_id);

-- rls 
alter table public.line_items enable row level security;

--view policy  

create policy "Users can view line items of their invoices"
 on public.line_items for select
 using (
   exists (
     select 1 from public.invoices
     where invoices.id = line_items.invoice_id
       and invoices.user_id = auth.uid()
   )
 );

 -- insert policy 

 create policy "Users can insert line items for their invoices"
 on public.line_items for insert
 with check(
   exists (
     select 1 from public.invoices
     where invoices.id = line_items.invoice_id
       and invoices.user_id = auth.uid()
   )
 );


-- update policy  


create policy "Users can update line items of their invoices"
 on public.line_items for update
 using (
   exists (
     select 1 from public.invoices
     where invoices.id = line_items.invoice_id
       and invoices.user_id = auth.uid()
   )
 );



-- delete policy  

create policy "Users can delete line items of their invoices"
 on public.line_items for delete
 using (
   exists (
     select 1 from public.invoices
     where invoices.id = line_items.invoice_id
       and invoices.user_id = auth.uid()
   )
 );
