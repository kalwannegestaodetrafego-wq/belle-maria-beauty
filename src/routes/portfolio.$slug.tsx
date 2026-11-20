import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Award, CalendarHeart, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getPublicPortfolio } from "../lib/bm-portfolio.functions";
import { reelEmbedUrl, serviceForItem } from "../lib/bm-portfolio";

export const Route = createFileRoute("/portfolio/$slug")({
  loader: async ({ params }) => {
    const p = await getPublicPortfolio({ data: { slug: params.slug } });
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => {
    const title = loaderData ? `${loaderData.name} — Portfólio BM` : "Portfólio indisponível — BM";
    const description = loaderData ? `${loaderData.specialty ?? "Beleza"} em Florianópolis. Veja trabalhos, preços e agende pelo Belle Maria Beauty.` : "Portfólio Belle Maria Beauty.";
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" }] };
  },
  component: PortfolioPage,
  errorComponent: ({ error }) => <main className="p-8 text-center"><p role="alert">{error instanceof Error ? error.message : "Erro ao carregar o portfólio."}</p><Link to="/" className="mt-4 inline-block font-bold text-primary">Voltar à BM</Link></main>,
  notFoundComponent: () => <main className="p-8 text-center"><h1 className="font-display text-3xl">Portfólio não encontrado</h1><Link to="/" className="mt-4 inline-block font-bold text-primary">Conhecer a BM</Link></main>,
});

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function PortfolioPage() {
  const p = Route.useLoaderData();
  const navigate = useNavigate();
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [tag, setTag] = useState("Todos");
  useEffect(() => {
    const paths = [...p.items.map((i) => i.imagePath), ...(p.avatar ? [p.avatar] : [])];
    if (!paths.length) return;
    void supabase.storage.from("portfolio").createSignedUrls(paths, 3600).then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl; });
      setUrls(map);
    });
  }, [p]);
  const filters = useMemo(() => ["Todos", ...new Set(p.items.flatMap((i) => [i.title ?? "", ...i.tags.map((t) => `#${t}`)]).filter(Boolean))].slice(0, 16), [p]);
  const items = p.items.filter((i) => tag === "Todos" || i.title === tag || i.tags.includes(tag.replace(/^#/, "")));
  const book = (itemId?: string) => void navigate({ to: "/", search: itemId ? { book: p.slug, look: itemId } : { book: p.slug } });

  return <main className="mx-auto min-h-screen max-w-3xl bg-background pb-16">
    <header className="flex items-center justify-between px-5 py-4"><Link to="/" className="font-display text-2xl font-bold">BM</Link><span className="text-[11px] text-muted-foreground">Portfólio oficial</span></header>
    <section className="px-5 text-center">
      <div className="mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-primary bg-secondary shadow-luxe">{p.avatar && urls[p.avatar] ? <img src={urls[p.avatar]} alt={`Foto de ${p.name}`} className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center font-display text-3xl">{p.name.slice(0, 2).toUpperCase()}</span>}</div>
      <h1 className="mt-4 font-display text-4xl">{p.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{p.specialty ?? "Profissional de beleza"}{p.salon ? ` · ${p.salon}` : ""}</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-[11px] font-bold">
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 shadow-soft"><Star size={13} className="fill-primary text-primary" />{p.rating ? `${p.rating.toLocaleString("pt-BR")} · ${p.reviewCount} avaliações verificadas` : "Novo na BM"}</span>
        {p.founder && <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/15 px-3 py-1 text-foreground"><Award size={13} className="text-primary" />Profissional Fundador • Floripa</span>}
        {p.verified && <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-soft px-3 py-1 text-success"><ShieldCheck size={13} />Identidade Verificada BM</span>}
      </div>
      {p.bio && <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground">{p.bio}</p>}
      <button type="button" onClick={() => book()} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-bold text-primary-foreground shadow-luxe"><CalendarHeart size={17} />Agendar horário</button>
    </section>

    {p.neighborhoods.length > 0 && <section className="mt-8 px-5"><h2 className="flex items-center gap-2 font-display text-xl"><MapPin size={18} className="text-primary" />Atende a domicílio em</h2><div className="mt-3 flex flex-wrap gap-2">{p.neighborhoods.map((n) => <span key={n} className="rounded-full border border-border bg-card px-3 py-1 text-xs">{n}</span>)}</div></section>}

    <section className="mt-8 px-5"><h2 className="font-display text-xl">Portfólio</h2>
      {filters.length > 1 && <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist">{filters.map((f) => <button key={f} type="button" role="tab" aria-selected={tag === f} onClick={() => setTag(f)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${tag === f ? "bg-foreground text-background" : "border border-border bg-card"}`}>{f}</button>)}</div>}
      {items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Nenhum trabalho publicado ainda.</p> :
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{items.map((i) => { const s = serviceForItem(p, i); return <figure key={i.id} className="overflow-hidden rounded-lg bg-card shadow-soft">
        <div className="aspect-[4/5] bg-secondary">{urls[i.imagePath] && <img src={urls[i.imagePath]} alt={i.title ?? `Trabalho de ${p.name}`} loading="lazy" className="h-full w-full object-cover" />}</div>
        <figcaption className="p-2.5"><p className="text-xs font-bold">{i.title}</p>{i.tags.length > 0 && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{i.tags.map((t) => `#${t}`).join(" ")}</p>}
          {s && <p className="mt-1 text-[11px] text-muted-foreground">{s.name} · {money(s.priceCents)}</p>}
          <button type="button" onClick={() => book(i.id)} disabled={!s} className="mt-2 w-full rounded-md border border-primary px-2 py-1.5 text-[11px] font-bold hover:bg-primary hover:text-primary-foreground disabled:opacity-40">Agendar este visual</button></figcaption>
      </figure>; })}</div>}
    </section>

    {(p.videos?.length ?? 0) > 0 && <section className="mt-8 px-5"><h2 className="font-display text-xl">Vídeos</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">{p.videos!.map((v) => { const s = serviceForItem(p, v); return <figure key={v.id} className="overflow-hidden rounded-lg bg-card shadow-soft">
        <iframe src={reelEmbedUrl(v.reelCode)} title={v.title || `Vídeo de ${p.name}`} loading="lazy" allow="encrypted-media" className="h-[560px] w-full border-0" />
        <figcaption className="p-2.5">{v.title && <p className="text-xs font-bold">{v.title}</p>}{s && <p className="mt-1 text-[11px] text-muted-foreground">{s.name} · {money(s.priceCents)}</p>}
          <button type="button" onClick={() => book()} disabled={!s} className="mt-2 w-full rounded-md border border-primary px-2 py-1.5 text-[11px] font-bold hover:bg-primary hover:text-primary-foreground disabled:opacity-40">Agendar este visual</button></figcaption>
      </figure>; })}</div>
    </section>}

    {p.services.length > 0 && <section className="mt-8 px-5"><h2 className="font-display text-xl">Serviços e preços</h2><div className="mt-3 space-y-2">{p.services.map((s) => <div key={s.id} className="flex items-center justify-between rounded-lg bg-card px-3 py-2.5 text-sm shadow-soft"><span><b>{s.name}</b><span className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={12} />{s.durationMin} min</span></span><span className="font-bold">{money(s.priceCents)}</span></div>)}</div></section>}

    {p.reviews.length > 0 && <section className="mt-8 px-5"><h2 className="font-display text-xl">Avaliações verificadas</h2><div className="mt-3 space-y-2">{p.reviews.map((r, idx) => <blockquote key={idx} className="rounded-lg bg-card p-3 text-sm shadow-soft"><span className="flex gap-0.5">{Array.from({ length: r.rating }, (_, k) => <Star key={k} size={12} className="fill-primary text-primary" />)}</span>{r.comment && <p className="mt-1 text-muted-foreground">{r.comment}</p>}</blockquote>)}</div></section>}
    <p className="mt-10 px-5 text-center text-[11px] text-muted-foreground">Pagamento protegido pela BM: o valor só é liberado após o atendimento.</p>
  </main>;
}
