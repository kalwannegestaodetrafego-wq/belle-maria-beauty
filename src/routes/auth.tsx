import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthModal } from "@/components/bm/extras";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [
    { title: "BM — Acesso à conta" }, { name: "description", content: "Entre na sua conta BM para acessar suas informações e serviços." },
    { property: "og:title", content: "BM — Acesso à conta" }, { property: "og:description", content: "Acesso seguro à sua conta BM." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AuthPage,
});
function AuthPage() {
  const navigate = useNavigate();
  return <main className="min-h-screen bg-background"><AuthModal onClose={() => { void navigate({ to: "/" }); }} /></main>;
}