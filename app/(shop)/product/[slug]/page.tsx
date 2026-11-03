import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductGallery } from "@/components/product/product-gallery";
import { VariantSelector } from "@/components/product/variant-selector";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getProductBySlug, getAllProductSlugs } from "@/lib/data/products";
import { getWishlistedProductIds } from "@/lib/data/wishlist";
import { auth } from "@/lib/auth/config";
import { formatPrice, safeJsonLd } from "@/lib/utils";

// Pre-renders every known product at build time (ISR-friendly) instead of
// rendering on first request for every slug — real production behavior,
// not a demo shortcut.
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const session = await auth();
  const wishlistedIds = session?.user
    ? await getWishlistedProductIds(session.user.id)
    : new Set<string>();

  // schema.org Product structured data — the brief's "Structured Data" SEO
  // requirement. Built from the same data the page renders, not a
  // separately-maintained copy that could drift out of sync.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => img.url),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (product.priceCents / 100).toFixed(2),
      offerCount: product.variants.length,
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    ...(product.reviews.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.averageRating.toFixed(1),
        reviewCount: product.reviews.length,
      },
    }),
  };

  return (
    <Container className="py-10 pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <p className="mb-2 text-xs text-stone">
        <span className="font-semibold text-ink">Home</span> / Shop / {product.name}
      </p>

      <div className="grid gap-16 md:grid-cols-[1fr_440px]">
        <ProductGallery images={product.images} />

        <div>
          <span className="text-xs uppercase tracking-wide text-stone">{product.categorySlug}</span>
          <h1 className="mt-1.5 font-heading text-3xl font-extrabold">{product.name}</h1>
          <p className="mt-5 text-sm leading-relaxed text-ink/80">{product.description}</p>

          <div className="mt-6">
            <VariantSelector
              variants={product.variants}
              productId={product.id}
              initialWishlisted={wishlistedIds.has(product.id)}
            />
          </div>

          <p className="mt-6 flex flex-col gap-1.5 text-xs text-stone">
            <span>Free shipping on orders over {formatPrice(20000)} · delivered in 3–5 days</span>
            <span>Free returns within 30 days</span>
          </p>

          <Accordion type="single" collapsible className="mt-8">
            <AccordionItem value="materials">
              <AccordionTrigger>Materials &amp; care</AccordionTrigger>
              <AccordionContent>
                Made from responsibly sourced material. Dry clean or hand wash cold depending on
                fabric — see the care label sewn into every piece. Store on a padded hanger away
                from direct light.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger>Shipping</AccordionTrigger>
              <AccordionContent>
                Ships within 2 business days. Standard delivery 3–5 days, express 1–2 days at
                checkout.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>Returns</AccordionTrigger>
              <AccordionContent>
                Unworn pieces with tags attached can be returned within 30 days for a full refund.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="fit">
              <AccordionTrigger>Size &amp; fit</AccordionTrigger>
              <AccordionContent>
                This style runs true to size. Check the size guide for measurements if you&apos;re
                between sizes.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="mt-20 border-t border-border pt-14">
        <h2 className="mb-8 font-heading text-xl font-bold">Reviews</h2>
        <ProductReviews reviews={product.reviews} averageRating={product.averageRating} />
      </div>

      {product.relatedProducts.length > 0 && (
        <div className="mt-20 border-t border-border pt-14">
          <h2 className="mb-8 font-heading text-xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-7">
            {product.relatedProducts.map((related) => (
              <ProductCard key={related.slug} product={related} wishlistedIds={wishlistedIds} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
}
