-- Enable UUID extension 

create extension if not exists "uuid-ossp";

-- invoices table  

create table public.invoices (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id  uuid not null references auth.users(id) on delete cascade,
    invoice_number text not null,
    status text not null default 'draft'
            check (status in ('draft', 'sent', 'paid', 'overdue')),
    issue_date date not null,
    due_date date not null,




    --client part 

    client_name text not null,
    client_email text not null,
    client_address text not null default '',
    client_city text not null default '',
    client_country text not null default '',


    -- business / sender 

    business_name text not null,
    business_email text not null,
    business_address text not null default '',
    business_city text not null default '',
    business_country text not null default '',
    business_logo_url text,



    -- finance part 
    tax_rate numeric(5,2) not null default 0,
    currency text not null default 'INR',



    notes text,
    pdf_url text,


    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- index for fast lookups  

create index invoices_user_id_idx on public.invoices(user_id);
create index invoices_status_idx on public.invoices(status);


-- auto update updated_at 

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- -- dropping trigger if exists 

-- drop trigger if exists invoices_updated_at on public.invoices;



create trigger invoices_updated_at
  before update on public.invoices
  for each row execute procedure public.set_updated_at();


-- rls (row level security)

alter table public.invoices enable row level security;


create policy "Users can view their own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);



create policy "Users can update their own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can insert their own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);


create policy "Users can delete their own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);







