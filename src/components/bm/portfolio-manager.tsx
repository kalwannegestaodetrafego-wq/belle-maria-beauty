import { useEffect, useState } from "react";
import { Copy, Film, ImagePlus, MessageCircle, Trash2, Upload } from "lucide-react";
import { compressImage } from "../../lib/bm-image";
import { supabase } from "@/integrations/supabase/client";
import { useBmSession, listServices, fromCents, type Service } from "../../lib/bm-store";
import { MAX_PORTFOLIO_PHOTOS, MAX_PORTFOLIO_VIDEOS, parseReelCode, reelEmbedUrl, FLORIPA_NEIGHBORHOODS, LOOK_SUGGESTIONS, isValidSlug, parseTags, portfolioUrl, slugify, whatsappShareUrl } from "../../lib/bm-portfolio";

type Video = { id: string; reel_code: string; title: string; service_id: string | null };
type Item = { id: string; image_path: string; title: string | null; tags: string[]; service_id: string | null };
const input = "h-10 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-primary";

export function PortfolioManager() {
  const { user } = useBmSession();
  const [slug, setSlug] = useState("");
  const [savedSlug, setSavedSlug] = useState<string | null>(null);
  const [specialty, setSpecialty] = useState("");
  const [areas, setAreas] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [tags, setTags] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [reel, setReel] = useState("");
  const [reelTitle, setReelTitle] = useState("");
  const [reelService, setReelService] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const sign = async (paths: string[]) => {
    if (!paths.length) return;
    const { data } = await supabase.storage.from("portfolio").createSignedUrls(paths, 3600);
    setUrls((u) => { const n = { ...u }; data?.forEach((d) => { if (d.path && d.signedUrl) n[d.path] = d.signedUrl; }); return n; });
  };
  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("full_name, public_slug, specialty, neighborhoods, avatar_path").eq("id", user.id).maybeSingle().then(({ data }) => {
      setSavedSlug(data?.public_slug ?? null); setSlug(data?.public_slug ?? slugify(data?.full_name ?? "")); setSpecialty(data?.specialty ?? ""); setAreas(data?.neighborhoods ?? []); setAvatar(data?.avatar_path ?? null);
      if (data?.avatar_path) void sign([data.avatar_path]);
    });
    void listServices().then(setServices).catch(() => {});
    void supabase.from("portfolio_items").select("id, image_path, title, tags, service_id").eq("owner_id", user.id).order("created_at", { ascending: false }).then(({ data }) => { setItems(data ?? []); void sign((data ?? []).map((i) => i.image_path)); });
    void supabase.from("portfolio_videos").select("id, reel_code, title, service_id").eq("owner_id", user.id).order("created_at", { ascending: false }).then(({ data }) => setVideos(data ?? []));
  }, [user]);

  if (!user) return <section className="mt-6 rounded-lg border border-border bg-card p-4 shadow-soft"><h2 className="font-display text-2xl">Meu Portfólio</h2><p className="mt-1 text-xs text-muted-foreground">Entre na sua conta profissional para publicar seu portfólio.</p></section>;

  const upload = async (raw: File) => {
    if (!raw.type.startsWith("image/") || raw.size > 15 * 1024 * 1024) throw new Error("Envie uma imagem de até 15 MB.");
    const f = await compressImage(raw);
    const path = `${user.id}/${crypto.randomUUID()}.${(f.name.split(".").pop() ?? "jpg").toLowerCase().slice(0, 5)}`;
    const { error } = await supabase.storage.from("portfolio").upload(path, f, { contentType: f.type });
    if (error) throw new Error("Falha no envio da foto.");
    return path;
  };
  const run = async (fn: () => Promise<void>) => { setBusy(true); setMsg(""); try { await fn(); } catch (e) { setMsg(e instanceof Error ? e.message : "Não foi possível salvar."); } finally { setBusy(false); } };
  const saveProfile = () => run(async () => {
    if (!isValidSlug(slug)) throw new Error("Link: use de 3 a 40 letras minúsculas, números e hífens.");
    const { error } = await supabase.from("profiles").update({ public_slug: slug, specialty: specialty.trim().slice(0, 80) || null, neighborhoods: areas }).eq("id", user.id);
    if (error) throw new Error(error.code === "23505" ? "Esse link já está em uso. Escolha outro." : "Não foi possível salvar o perfil.");
    setSavedSlug(slug); setMsg("Perfil público salvo.");
  });
  const saveAvatar = (f: File) => run(async () => {
    const path = await upload(f);
    const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
    if (error) throw new Error("Não foi possível salvar a foto de perfil.");
    setAvatar(path); await sign([path]);
  });
  const addItem = () => run(async () => {
    if (items.length >= MAX_PORTFOLIO_PHOTOS) throw new Error(`Limite de ${MAX_PORTFOLIO_PHOTOS} fotos atingido. Remova uma para publicar outra.`);
    if (!file || !title.trim()) throw new Error("Escolha a foto e informe o título/estilo.");
    const path = await upload(file);
    const { data, error } = await supabase.from("portfolio_items").insert({ owner_id: user.id, image_path: path, title: title.trim(), caption: title.trim(), service_id: serviceId || null, tags: parseTags(tags) }).select("id, image_path, title, tags, service_id").single();
    if (error) { await supabase.storage.from("portfolio").remove([path]); throw new Error(error.message.includes("photo limit") ? `Limite de ${MAX_PORTFOLIO_PHOTOS} fotos atingido.` : "Não foi possível salvar o trabalho."); }
    setItems((l) => [data, ...l]); await sign([path]); setFile(null); setTitle(""); setTags(""); setMsg("Trabalho publicado no portfólio.");
  });
  const remove = (i: Item) => run(async () => {
    const { error } = await supabase.from("portfolio_items").delete().eq("id", i.id);
    if (error) throw new Error("Não foi possível remover.");
    await supabase.storage.from("portfolio").remove([i.image_path]); setItems((l) => l.filter((x) => x.id !== i.id));
  });
  const addVideo = () => run(async () => {
    if (videos.length >= MAX_PORTFOLIO_VIDEOS) throw new Error(`Limite de ${MAX_PORTFOLIO_VIDEOS} vídeos atingido. Remova um para adicionar outro.`);
    const code = parseReelCode(reel);
    if (!code) throw new Error("Cole um link de Reels do Instagram (ex: instagram.com/reel/...).");
    const { data, error } = await supabase.from("portfolio_videos").insert({ owner_id: user.id, reel_code: code, title: reelTitle.trim(), service_id: reelService || null }).select("id, reel_code, title, service_id").single();
    if (error) throw new Error(error.code === "23505" ? "Esse vídeo já está no portfólio." : error.message.includes("video limit") ? `Limite de ${MAX_PORTFOLIO_VIDEOS} vídeos atingido.` : "Não foi possível salvar o vídeo.");
    setVideos((l) => [data, ...l]); setReel(""); setReelTitle(""); setMsg("Vídeo publicado no portfólio.");
  });
  const removeVideo = (v: Video) => run(async () => {
    const { error } = await supabase.from("portfolio_videos").delete().eq("id", v.id);
    if (error) throw new Error("Não foi possível remover.");
    setVideos((l) => l.filter((x) => x.id !== v.id));
  });
  const link = savedSlug ? portfolioUrl(window.location.origin, savedSlug) : "";
  const copy = () => { void navigator.clipboard.writeText(link).then(() => setMsg("Link copiado! Cole na bio do Instagram."), () => setMsg(link)); };

  return <section className="mt-6 rounded-lg border border-primary/40 bg-card p-4 shadow-soft" aria-label="Meu Portfólio">
    <h2 className="font-display text-2xl">Meu Portfólio</h2>
    <p className="mt-1 text-xs text-muted-foreground">Sua vitrine pública e link na bio. Publique apenas fotos reais dos seus trabalhos.</p>

    <div className="mt-4 flex items-center gap-3">
      <label className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-full border border-primary bg-secondary" aria-label="Foto de perfil">
        {avatar && urls[avatar] ? <img src={urls[avatar]} alt="Foto de perfil" className="h-full w-full object-cover" /> : <ImagePlus size={20} className="m-auto mt-5 text-muted-foreground" />}
        <input type="file" accept="image/*" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; if (f) void saveAvatar(f); }} />
      </label>
      <div className="flex-1 space-y-2">
        <label className="block text-[11px] font-semibold">Link público<div className="mt-1 flex items-center rounded-md border border-border bg-background pl-2 text-xs text-muted-foreground">/portfolio/<input value={slug} onChange={(e) => setSlug(slugify(e.target.value) || e.target.value.toLowerCase())} className="h-9 flex-1 bg-transparent px-1 text-sm text-foreground outline-none" /></div></label>
        <label className="block text-[11px] font-semibold">Especialidade<input value={specialty} maxLength={80} onChange={(e) => setSpecialty(e.target.value)} placeholder="Maquiadora social e noivas" className={`${input} mt-1`} /></label>
      </div>
    </div>
    <p className="mt-3 text-[11px] font-semibold">Bairros atendidos a domicílio</p>
    <div className="mt-1 flex flex-wrap gap-1.5">{FLORIPA_NEIGHBORHOODS.map((n) => { const on = areas.includes(n); return <button key={n} type="button" aria-pressed={on} onClick={() => setAreas((a) => on ? a.filter((x) => x !== n) : [...a, n])} className={`rounded-full px-2.5 py-1 text-[11px] ${on ? "bg-foreground text-background" : "border border-border"}`}>{n}</button>; })}</div>
    <button type="button" disabled={busy} onClick={() => void saveProfile()} className="mt-3 min-h-10 w-full rounded-lg border border-primary text-xs font-bold disabled:opacity-45">Salvar perfil público</button>

    {savedSlug && <div className="mt-3 grid grid-cols-2 gap-2">
      <button type="button" onClick={copy} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-luxe"><Copy size={15} />Copiar Link do Meu Portfólio</button>
      <a href={whatsappShareUrl(link)} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-success/40 bg-success-soft text-xs font-bold text-success"><MessageCircle size={15} />Compartilhar no WhatsApp</a>
      <p className="col-span-2 truncate text-center text-[10px] text-muted-foreground">{link}</p>
    </div>}

    <div className="mt-5 rounded-lg bg-background p-3">
      <p className="flex justify-between text-sm font-bold">Adicionar trabalho<span className="text-xs text-muted-foreground">Fotos: {items.length} / {MAX_PORTFOLIO_PHOTOS}</span></p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">As fotos são otimizadas automaticamente para carregar rápido.</p>
      <input type="file" accept="image/*" aria-label="Foto do trabalho" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-2 w-full text-xs" />
      <label className="mt-2 block text-[11px] font-semibold">Título/Estilo<input list="bm-looks" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Noiva Clássica" className={`${input} mt-1`} /></label>
      <datalist id="bm-looks">{LOOK_SUGGESTIONS.map((l) => <option key={l} value={l} />)}</datalist>
      <label className="mt-2 block text-[11px] font-semibold">Serviço vinculado<select value={serviceId} onChange={(e) => setServiceId(e.target.value)} className={`${input} mt-1`}><option value="">{services.length ? "Selecione um serviço" : "Cadastre serviços na Gestão de Serviços"}</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} · R$ {fromCents(s.price_cents)} · {s.duration_min} min</option>)}</select></label>
      <label className="mt-2 block text-[11px] font-semibold">Tags<input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#noiva #glow #domicilio" className={`${input} mt-1`} /></label>
      <button type="button" disabled={busy || !file || items.length >= MAX_PORTFOLIO_PHOTOS} onClick={() => void addItem()} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-45"><Upload size={14} />{busy ? "Enviando…" : "Publicar no portfólio"}</button>
    </div>
    {msg && <p className="mt-2 text-xs font-semibold" role="status">{msg}</p>}
    {items.length > 0 && <div className="mt-4 grid grid-cols-3 gap-2">{items.map((i) => <div key={i.id} className="relative overflow-hidden rounded-md bg-secondary">
      <div className="aspect-square">{urls[i.image_path] && <img src={urls[i.image_path]} alt={i.title ?? "Trabalho"} className="h-full w-full object-cover" />}</div>
      <p className="truncate px-1 py-1 text-[10px] font-semibold">{i.title}</p>
      <button type="button" aria-label="Remover trabalho" onClick={() => void remove(i)} className="absolute right-1 top-1 rounded-full bg-card/90 p-1"><Trash2 size={12} /></button>
    </div>)}</div>}

    <div className="mt-5 rounded-lg bg-background p-3">
      <p className="flex justify-between text-sm font-bold"><span className="inline-flex items-center gap-1"><Film size={15} />Vídeos (Instagram Reels)</span><span className="text-xs text-muted-foreground">Vídeos: {videos.length} / {MAX_PORTFOLIO_VIDEOS}</span></p>
      <p className="mt-0.5 text-[10px] text-muted-foreground">Cole o link do seu Reels: ele roda direto no seu portfólio BM.</p>
      <label className="mt-2 block text-[11px] font-semibold">Link do Reels<input value={reel} onChange={(e) => setReel(e.target.value)} placeholder="https://www.instagram.com/reel/..." className={`${input} mt-1`} /></label>
      <label className="mt-2 block text-[11px] font-semibold">Título/Estilo<input value={reelTitle} maxLength={80} onChange={(e) => setReelTitle(e.target.value)} placeholder="Making of Noiva" className={`${input} mt-1`} /></label>
      <label className="mt-2 block text-[11px] font-semibold">Serviço vinculado<select value={reelService} onChange={(e) => setReelService(e.target.value)} className={`${input} mt-1`}><option value="">Selecione um serviço</option>{services.map((s) => <option key={s.id} value={s.id}>{s.name} · R$ {fromCents(s.price_cents)}</option>)}</select></label>
      <button type="button" disabled={busy || !reel.trim() || videos.length >= MAX_PORTFOLIO_VIDEOS} onClick={() => void addVideo()} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-1 rounded-lg bg-primary text-xs font-bold text-primary-foreground disabled:opacity-45"><Film size={14} />Publicar vídeo</button>
      {videos.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2">{videos.map((v) => <div key={v.id} className="relative overflow-hidden rounded-md bg-secondary">
        <iframe src={reelEmbedUrl(v.reel_code)} title={v.title || "Reels"} loading="lazy" className="aspect-[9/16] w-full border-0" allow="encrypted-media" />
        <p className="truncate px-1 py-1 text-[10px] font-semibold">{v.title || "Reels"}</p>
        <button type="button" aria-label="Remover vídeo" onClick={() => void removeVideo(v)} className="absolute right-1 top-1 rounded-full bg-card/90 p-1"><Trash2 size={12} /></button>
      </div>)}</div>}
    </div>
  </section>;
}
