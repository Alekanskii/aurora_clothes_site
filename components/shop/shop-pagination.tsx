import Link from "next/link";
import { cn } from "@/lib/utils";

export function ShopPagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefForPage(page: number): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value) params.set(key, value);
    }
    params.set("page", String(page));
    return `?${params.toString()}`;
  }

  return (
    <nav aria-label="Pagination" className="mt-16 flex justify-center gap-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={hrefForPage(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={cn(
            "flex h-9 w-9 items-center justify-center border border-border text-sm",
            page === currentPage && "border-ink bg-ink text-paper"
          )}
        >
          {page}
        </Link>
      ))}
    </nav>
  );
}
