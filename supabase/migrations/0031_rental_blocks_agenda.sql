-- MR Laser — Quando uma Locação (Hakon 4D) tem uma data reservada, a
-- clínica fecha nesse dia: bloqueia automaticamente o mesmo dia na agenda
-- de atendimento normal (mesma tabela blocked_slots que a Agenda Online e
-- a Agenda do admin já consultam — nenhuma mudança de frontend necessária).
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.blocked_slots
  add column if not exists rental_booking_id uuid references public.rental_bookings(id) on delete cascade;

-- No máximo um bloqueio automático por locação (evita duplicar ao reeditar).
create unique index if not exists blocked_slots_rental_booking_unique
  on public.blocked_slots (rental_booking_id) where rental_booking_id is not null;

create or replace function public.sync_rental_blocked_slot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rental_date is null then
    delete from public.blocked_slots where rental_booking_id = new.id;
  elsif exists (select 1 from public.blocked_slots where rental_booking_id = new.id) then
    update public.blocked_slots set blocked_date = new.rental_date where rental_booking_id = new.id;
  else
    insert into public.blocked_slots (blocked_date, blocked_time, reason, rental_booking_id)
    values (new.rental_date, null, 'Locação Hakon 4D', new.id);
  end if;
  return new;
end;
$$;

drop trigger if exists rental_bookings_sync_blocked_slot on public.rental_bookings;
create trigger rental_bookings_sync_blocked_slot
  after insert or update of rental_date on public.rental_bookings
  for each row execute function public.sync_rental_blocked_slot();

-- Locações já cadastradas com data preenchida também bloqueiam o dia.
insert into public.blocked_slots (blocked_date, blocked_time, reason, rental_booking_id)
select rental_date, null, 'Locação Hakon 4D', id
from public.rental_bookings
where rental_date is not null
on conflict (rental_booking_id) where rental_booking_id is not null do nothing;
