import { Container } from "@/components/layout/container";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-[420px]">
        <h1 className="font-heading text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-stone">{subtitle}</p>}
        <div className="mt-8">{children}</div>
      </div>
    </Container>
  );
}
