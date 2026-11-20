import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/p/$slug")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/portfolio/$slug", params: { slug: params.slug }, statusCode: 301 }); },
});
