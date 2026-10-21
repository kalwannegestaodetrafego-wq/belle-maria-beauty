import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { getAdminAccess } from "@/lib/bm-admin.functions";
import { translateUi, useLanguage } from "@/lib/bm-i18n";

export function AdminLink() {
  const { language } = useLanguage();
  const check = useServerFn(getAdminAccess);
  const { data } = useQuery({ queryKey: ["bm-admin-access"], queryFn: () => check(), retry: false, staleTime: 30000 });
  if (!data) return null;
  return <Link to="/admin" className="mt-3 flex min-h-9 items-center gap-2 text-xs font-semibold text-muted-foreground"><ShieldCheck size={15} />{translateUi("Painel Admin - BM", language)}</Link>;
}