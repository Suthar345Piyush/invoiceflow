-- Seed file: only runs in local dev via `supabase db reset`
-- Inserts a demo invoice for testing (requires a real user_id from auth.users)

-- To use: replace the user_id below with your actual user UUID from the Supabase Auth dashboard
-- or run `supabase status` and sign up via the local app first

do $$
declare
  demo_user_id uuid;
  demo_invoice_id uuid;
begin
  -- Get first user (works after signing up locally)
  select id into demo_user_id from auth.users limit 1;

  if demo_user_id is null then
    raise notice 'No users found — sign up first, then re-run seed.';
    return;
  end if;

  -- Demo invoice
  insert into public.invoices (
    user_id, invoice_number, status,
    issue_date, due_date,
    client_name, client_email, client_address, client_city, client_country,
    business_name, business_email, business_address, business_city, business_country,
    tax_rate, currency, notes
  ) values (
    demo_user_id, 'INV-2025-0001', 'sent',
    current_date, current_date + interval '30 days',
    'Acme Corp', 'billing@acme.com', '456 Park Avenue', 'New York', 'United States',
    'Freelance Studio', 'hello@freelancestudio.com', '12 Creator Lane', 'Mumbai', 'India',
    18, 'USD', 'Payment due within 30 days. Thank you!'
  )
  returning id into demo_invoice_id;

  -- Line items
  insert into public.line_items (invoice_id, description, quantity, rate) values
    (demo_invoice_id, 'Website Design — 5 pages', 1, 1200),
    (demo_invoice_id, 'Responsive Mobile Development', 1, 800),
    (demo_invoice_id, 'SEO Optimization', 3, 150);

  raise notice 'Seed complete. Invoice ID: %', demo_invoice_id;
end;
$$;


