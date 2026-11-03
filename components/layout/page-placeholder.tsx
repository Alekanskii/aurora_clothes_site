import { Container } from "./container";

export function PagePlaceholder({
  milestone,
  title,
  description,
}: {
  milestone: string;
  title: string;
  description: string;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-xs uppercase tracking-widest text-stone">{milestone}</p>
      <h1 className="font-heading text-3xl font-extrabold">{title}</h1>
      <p className="max-w-md text-sm text-stone">{description}</p>
    </Container>
  );
}
