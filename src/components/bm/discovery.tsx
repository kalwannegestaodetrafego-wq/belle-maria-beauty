import { ChevronDown, Gift, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import hair from "../../assets/category-hair.jpg";
import makeup from "../../assets/category-makeup.jpg";
import nails from "../../assets/category-nails.jpg";
import bridal from "../../assets/category-bridal.jpg";
import events from "../../assets/category-events.jpg";
import bundles from "../../assets/category-bundles.jpg";
import club from "../../assets/category-club.jpg";
import gift from "../../assets/category-gift.jpg";

export const showcases = [
  { title: "Cabelo & Penteados", filter: "Cabelo & Penteado", image: hair },
  { title: "Maquiagem VIP", filter: "Maquiagem", image: makeup },
  { title: "Unhas", filter: "Unhas", image: nails },
  { title: "Casamentos & Noivas", filter: "Casamentos & Noivas", image: bridal },
  { title: "Eventos", filter: "Eventos", image: events },
  { title: "Pacotes & Combos", filter: "Combos VIP", image: bundles },
  { title: "Clube BM", filter: "Clube BM", image: club },
  { title: "Vale Presente", filter: "Vale Presente", image: gift },
];

export function CategoryShowcase({ selected, onSelect }: { selected: string; onSelect: (filter: string) => void }) {
  return <section aria-label="Explore experiências de beleza" className="mb-8">
    <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase text-primary">Descubra a BM</p><h2 className="mt-1 font-display text-3xl">Seu momento, do seu jeito</h2></div><Sparkles className="mb-1 shrink-0 text-primary" size={22} /></div>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">{showcases.map((item) => <Button key={item.title} variant="ghost" onClick={() => onSelect(item.filter)} aria-pressed={selected === item.filter} className={`group relative h-auto aspect-[5/4] overflow-hidden rounded-lg border p-0 text-left shadow-soft transition-transform hover:scale-[1.02] ${selected === item.filter ? "border-primary ring-2 ring-primary" : "border-border"}`}>
      <img src={item.image} alt="" width={384} height={512} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <span className="absolute inset-x-0 bottom-0 bg-overlay/70 px-3 py-2.5 text-sm font-bold leading-tight text-success-foreground backdrop-blur-sm">{item.title}</span>
      {item.title === "Maquiagem VIP" && <span className="absolute left-2 top-2 rounded-md bg-card px-2 py-1 text-[10px] font-bold text-foreground">R$ 20 OFF na 1ª reserva</span>}
      {item.title === "Vale Presente" && <Gift className="absolute right-2 top-2 text-success-foreground" size={18} />}
    </Button>)}</div>
  </section>;
}

type ServiceDetails = { name: string; price: number; duration: string; techniques: string; included: string; restrictions: string };

export const serviceDetails: Record<string, Omit<ServiceDetails, "price">> = {
  "Maquiagem Social": { name: "Maquiagem Social", duration: "1h30", techniques: "Preparação da pele, correção, olhos e acabamento personalizado.", included: "Pincéis higienizados e produtos de maquiagem.", restrictions: "Avise sobre alergias a cosméticos, infecções ou irritações ativas na pele e nos olhos. Não realizamos aplicação sobre áreas inflamadas." },
  "Escova": { name: "Escova", duration: "1h", techniques: "Lavagem, secagem e modelagem com escova e finalização.", included: "Produtos de finalização e proteção térmica.", restrictions: "Informe sensibilidade no couro cabeludo, feridas, alergias a produtos ou procedimentos químicos recentes. Não aplicamos calor em áreas lesionadas." },
  "Unha em Gel": { name: "Unha em Gel", duration: "1h45", techniques: "Preparação da unha, aplicação de gel, modelagem e acabamento.", included: "Materiais esterilizados e insumos descartáveis de uso individual.", restrictions: "Não atendemos unhas com suspeita de micose, feridas, infecção ou inflamação ativa. Informe alergia a acrilatos ou produtos de manicure." },
  "Massagem Relaxante": { name: "Massagem Relaxante", duration: "1h", techniques: "Manobras suaves de relaxamento muscular e bem-estar corporal.", included: "Levamos maca, lençóis descartáveis e óleo de massagem.", restrictions: "Contraindicada em caso de trombose, febre, infecção, lesão aguda ou condição cardiovascular descompensada. Na gestação ou com doença crônica, consulte seu médico antes de reservar." },
};

export function ServiceMenu({ services }: { services: { name: string; price: number }[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className="space-y-2">{services.map((service) => {
    const detail = serviceDetails[service.name];
    const open = expanded === service.name;
    return <div key={service.name} className="overflow-hidden rounded-lg border border-border bg-card/90 shadow-soft">
      <Button variant="ghost" onClick={() => setExpanded(open ? null : service.name)} aria-expanded={open} className="flex h-auto min-h-16 w-full items-center justify-between gap-3 rounded-none px-4 py-3 text-left hover:bg-accent">
        <span className="min-w-0"><span className="block text-sm font-bold">{service.name}</span><span className="mt-1 block text-xs text-muted-foreground">{detail?.duration ?? "Duração sob consulta"} · Ver detalhes</span></span><span className="ml-auto shrink-0 font-display text-lg">R$ {service.price}</span><ChevronDown size={16} className={`shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && detail && <div className="space-y-3 border-t border-border px-4 py-4 text-xs leading-5 animate-in fade-in duration-200"><p><strong className="block text-foreground">Técnicas</strong><span className="text-muted-foreground">{detail.techniques}</span></p><p><strong className="block text-foreground">Incluso</strong><span className="text-muted-foreground">{detail.included}</span></p><p className="rounded-md bg-secondary p-3"><strong className="block text-foreground">Contraindicações médicas & restrições</strong><span className="text-muted-foreground">{detail.restrictions}</span></p></div>}
    </div>;
  })}</div>;
}

export function PortfolioNotice() {
  return <p className="mt-2 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" /> Fotos demonstrativas. O selo “Fotos Autorais e Reais (Verificado sem IA)” será exibido quando o portfólio da especialista for validado.</p>;
}