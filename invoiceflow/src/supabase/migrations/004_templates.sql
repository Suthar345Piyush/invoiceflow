
-- creating  the profiles table 

-- references auth.users via uuid without explicit fk to avoid cross db-error 

create table if not exists public.profiles (
   id uuid primary key references auth.users(id) on delete cascade,
   selected_template text not null default 'classic',
   created_at timestamptz not null default now(),
   updated_at timestamptz not null default now()
);


-- checking constraints separately 

alter table public.profiles 
   drop constraint if exists profiles_selected_template_check;


alter table public.profiles
   add constraint profiles_selected_template_check
   check (selected_template in ('classic', 'modern', 'minimal'));



-- enabling RLS 

alter table public.profiles enable row level security;


-- dropping old policy 

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;



-- creating policy  

create policy "Users can view own profile"
  on public.profiles for select  
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert  
  with check (auth.uid() = id);


create policy "Users can update own profile"
  on public.profiles for update  
  using (auth.uid() = id);



-- auto create new profile  on sign up 

create or replace function public.handle_new_user()
returns trigger      
language plpgsql     
security definer   
set search_path = public 
as $$
begin   
   insert into public.profiles (id)
   values (new.id)
   on conflict (id) do nothing;
   return new;
end;
$$;




drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
   after insert on auth.users 
   for each row 
   execute procedure public.handle_new_user();


-- creating user profile if any user don't have  

insert into public.profiles (id)
select id from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;




