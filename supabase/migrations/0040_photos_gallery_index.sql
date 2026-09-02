-- MR Laser — Corrige troca de foto em Nova Sessão: cada slot (avatar,
-- antes, depois, e cada uma das 4 posições da galeria) precisa ter no
-- máximo 1 foto salva por vez, senão a foto antiga continuava sendo
-- mostrada mesmo depois de enviar uma nova (o app buscava sempre a
-- primeira foto daquele "kind", que era a antiga).
-- gallery_index identifica QUAL das 4 posições da galeria a foto ocupa —
-- sem isso não dava pra saber qual delas trocar.
-- Rodar no SQL Editor do projeto Supabase (Dashboard > SQL Editor > New query).

alter table public.photos
  add column if not exists gallery_index int;
