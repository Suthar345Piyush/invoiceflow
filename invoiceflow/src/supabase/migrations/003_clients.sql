 -- storage for storing generated pdfs 


 insert into storage.buckets (id, name, public)
 values ('invoices', 'invoices', false)
 on conflict do nothing;


-- rls users can access their own pdfs files 
-- PDF file storage format :- {user_id}/{invoice_id}.pdf

create policy "Users can upload their own PDFs"
  on storage.objects for insert
  with check (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );



create policy "Users can read their own PDFs"
  on storage.objects for select
  using  (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


create policy "Users can delete their own PDFs"
  on storage.objects for delete
  using (
    bucket_id = 'invoices'
    and auth.uid()::text = (storage.foldername(name))[1]
  );