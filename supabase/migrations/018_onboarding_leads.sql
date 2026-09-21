-- 018: onboarding leads (internal intake → assisted provision)
-- Solo service_role; sin policies para anon/authenticated.

create table if not exists public.onboarding_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Captura taller / contacto
  contact_name text not null,
  salon_nombre text not null,
  whatsapp text not null,
  interes text not null
    check (interes in ('agenda', 'vitrina', 'ambas', 'otro')),
  interes_otro text,
  notas text,

  -- Datos para provision-salon
  slug text,
  email text,
  admin_nombre text,
  plan_tipo text not null default 'trial'
    check (plan_tipo in ('trial', 'pago', 'founder')),
  slot_step_minutes int not null default 15
    check (slot_step_minutes in (15, 30, 60)),
  permite_reserva_otra_persona boolean not null default false,

  -- Pipeline
  status text not null default 'borrador'
    check (status in ('borrador', 'listo', 'autorizado', 'enrolado', 'error')),
  error_message text,
  salon_id uuid references public.salones (id) on delete set null,
  -- Solo uso interno (dueño producto); no exponer en UI pública
  temp_password text,
  authorized_at timestamptz,
  enrolled_at timestamptz
);

create index if not exists onboarding_leads_status_idx
  on public.onboarding_leads (status, created_at desc);

create index if not exists onboarding_leads_slug_idx
  on public.onboarding_leads (slug)
  where slug is not null;

comment on table public.onboarding_leads is
  'Leads internos Gota+Check: captura → autorizar → provision. No self-serve.';

alter table public.onboarding_leads enable row level security;

-- Sin políticas: anon/authenticated denegados; service_role bypassa RLS.

create or replace function public.set_onboarding_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists onboarding_leads_updated_at on public.onboarding_leads;
create trigger onboarding_leads_updated_at
  before update on public.onboarding_leads
  for each row
  execute function public.set_onboarding_leads_updated_at();
