import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Product images are local line-art SVGs, not photography — this carries
// forward a deliberate design decision from the approved prototype (see
// CASE_STUDY.md): no stock photography, original illustration instead.
// Swap ProductImage.url to a Cloudinary secure_url per product once real
// photography exists; nothing else about the schema or components changes.

const categories = [
  { slug: "outerwear", name: "Outerwear" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "tailoring", name: "Tailoring" },
  { slug: "accessories", name: "Accessories" },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  category: (typeof categories)[number]["slug"];
  description: string;
  illustration: string;
  basePriceCents: number;
  colors: string[];
  sizes: string[];
  outOfStockSizes?: string[];
};

const products: SeedProduct[] = [
  {
    slug: "wool-overcoat",
    name: "The Wool Overcoat",
    category: "outerwear",
    description:
      "A single-breasted overcoat in double-faced Italian wool, cut with a dropped shoulder and full canvas construction.",
    illustration: "outerwear.svg",
    basePriceCents: 42000,
    colors: ["Stone", "Ink"],
    sizes: ["XS", "S", "M", "L", "XL"],
    outOfStockSizes: ["XS"],
  },
  {
    slug: "raglan-field-jacket",
    name: "Raglan Field Jacket",
    category: "outerwear",
    description:
      "A waxed-cotton field jacket with a raglan sleeve for unrestricted movement, storm flap and corozo buttons.",
    illustration: "outerwear.svg",
    basePriceCents: 36500,
    colors: ["Olive", "Ink"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "belted-trench",
    name: "Belted Trench",
    category: "outerwear",
    description:
      "A classic belted trench in water-resistant cotton gabardine, with a fully removable wool liner.",
    illustration: "outerwear.svg",
    basePriceCents: 48000,
    colors: ["Ecru", "Ink"],
    sizes: ["S", "M", "L"],
    outOfStockSizes: ["S"],
  },
  {
    slug: "merino-crewneck",
    name: "Merino Crewneck",
    category: "knitwear",
    description:
      "14-gauge merino wool knit in a relaxed crew, fully fashioned shoulders for a clean, seamless line.",
    illustration: "knitwear.svg",
    basePriceCents: 14500,
    colors: ["Ecru", "Stone", "Ink"],
    sizes: ["XS", "S", "M", "L", "XL"],
    outOfStockSizes: ["XL"],
  },
  {
    slug: "cable-roll-neck",
    name: "Cable Roll Neck",
    category: "knitwear",
    description:
      "A heavyweight cable knit roll neck spun from lambswool, built for the coldest months of the year.",
    illustration: "knitwear.svg",
    basePriceCents: 19000,
    colors: ["Sand", "Ink"],
    sizes: ["S", "M", "L"],
  },
  {
    slug: "alpaca-cardigan",
    name: "Alpaca Cardigan",
    category: "knitwear",
    description:
      "An oversized cardigan in brushed alpaca blend, with horn buttons and dropped patch pockets.",
    illustration: "knitwear.svg",
    basePriceCents: 25500,
    colors: ["Sand", "Ink"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "structured-trouser",
    name: "Structured Trouser",
    category: "tailoring",
    description:
      "A tapered wool trouser with a fixed waistband and single pleat, tailored for a tailored-yet-easy silhouette.",
    illustration: "tailoring.svg",
    basePriceCents: 21000,
    colors: ["Ink", "Stone"],
    sizes: ["28", "30", "32", "34", "36"],
    outOfStockSizes: ["28"],
  },
  {
    slug: "wide-leg-trouser",
    name: "Wide Leg Trouser",
    category: "tailoring",
    description:
      "A high-rise wide leg trouser in Japanese twill, finished with a clean waistband and no visible pockets.",
    illustration: "tailoring.svg",
    basePriceCents: 23000,
    colors: ["Sand", "Ecru"],
    sizes: ["30", "32", "34", "36"],
  },
  {
    slug: "wool-blazer",
    name: "Wool Blazer",
    category: "tailoring",
    description:
      "An unstructured wool blazer, half-canvassed for a soft shoulder that moves with you.",
    illustration: "tailoring.svg",
    basePriceCents: 39500,
    colors: ["Ink", "Stone"],
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "poplin-shirt",
    name: "Poplin Shirt",
    category: "tailoring",
    description:
      "A crisp cotton poplin shirt with a slightly dropped shoulder and mother-of-pearl buttons.",
    illustration: "shirt.svg",
    basePriceCents: 13500,
    colors: ["Ecru", "Stone"],
    sizes: ["XS", "S", "M", "L"],
  },
  {
    slug: "leather-tote",
    name: "Leather Tote",
    category: "accessories",
    description:
      "A vegetable-tanned leather tote, hand-stitched, that develops its own patina with wear.",
    illustration: "bag.svg",
    basePriceCents: 34000,
    colors: ["Ink", "Sand"],
    sizes: ["One size"],
  },
  {
    slug: "cashmere-scarf",
    name: "Cashmere Scarf",
    category: "accessories",
    description:
      "A generously sized cashmere scarf, woven in Scotland, finished with a hand-fringed edge.",
    illustration: "scarf.svg",
    basePriceCents: 12000,
    colors: ["Stone", "Olive"],
    sizes: ["One size"],
  },
];

async function main() {
  console.log("Seeding categories...");
  const categoryRecords = await Promise.all(
    categories.map((c) =>
      prisma.category.upsert({
        where: { slug: c.slug },
        update: {},
        create: c,
      })
    )
  );
  const categoryIdBySlug = Object.fromEntries(
    categoryRecords.map((c) => [c.slug, c.id])
  );

  console.log("Seeding products...");
  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        categoryId: categoryIdBySlug[p.category],
        images: {
          create: [
            {
              url: `/illustrations/${p.illustration}`,
              alt: p.name,
              position: 0,
            },
          ],
        },
      },
    });

    for (const color of p.colors) {
      for (const size of p.sizes) {
        const sku = `${p.slug}-${color}-${size}`.toUpperCase().replace(/\s+/g, "-");
        const outOfStock = p.outOfStockSizes?.includes(size) ?? false;
        await prisma.variant.upsert({
          where: { sku },
          update: {},
          create: {
            productId: product.id,
            color,
            size,
            sku,
            priceCents: p.basePriceCents,
            stock: outOfStock ? 0 : 25,
          },
        });
      }
    }
  }

  console.log(`Seeded ${categoryRecords.length} categories and ${products.length} products.`);

  console.log("Seeding demo reviewers and reviews...");
  // These are seed/demo accounts for review attribution only — passwordHash
  // is intentionally null (they can't log in until real accounts exist from
  // Milestone 6 onward). Not every product gets reviews, on purpose: the
  // empty state on the product page needs a real product with zero reviews
  // to actually be exercised, not just coded and never seen.
  const reviewers = [
    { email: "marit.h@example.com", name: "Marit H." },
    { email: "daniel.k@example.com", name: "Daniel K." },
    { email: "priya.s@example.com", name: "Priya S." },
    { email: "tomas.b@example.com", name: "Tomas B." },
  ] as const;

  const reviewerRecords = await Promise.all(
    reviewers.map((r) =>
      prisma.user.upsert({
        where: { email: r.email },
        update: {},
        create: { email: r.email, name: r.name, emailVerified: new Date() },
      })
    )
  );
  const userIdByEmail = Object.fromEntries(reviewerRecords.map((u) => [u.email, u.id]));

  const reviewSeeds: { productSlug: string; reviewerEmail: string; rating: number; body: string }[] = [
    {
      productSlug: "wool-overcoat",
      reviewerEmail: "marit.h@example.com",
      rating: 5,
      body: "The only coat I've owned that got better with every wash. Five years in, still my most-worn piece.",
    },
    {
      productSlug: "wool-overcoat",
      reviewerEmail: "tomas.b@example.com",
      rating: 5,
      body: "Heavier than I expected in a good way — this is a coat for actual winter, not just looking the part.",
    },
    {
      productSlug: "wool-overcoat",
      reviewerEmail: "daniel.k@example.com",
      rating: 4,
      body: "Runs slightly large through the shoulder. Sizing down worked out, but worth knowing before you order.",
    },
    {
      productSlug: "merino-crewneck",
      reviewerEmail: "daniel.k@example.com",
      rating: 5,
      body: "Quietly the best knitwear I own. It doesn't shout, and that's exactly the point.",
    },
    {
      productSlug: "merino-crewneck",
      reviewerEmail: "priya.s@example.com",
      rating: 4,
      body: "Softer than most merino I've tried. One pull started after a few months, otherwise excellent.",
    },
    {
      productSlug: "structured-trouser",
      reviewerEmail: "priya.s@example.com",
      rating: 5,
      body: "Ordered expecting a template fit — it was tailored better than anything from a proper tailor.",
    },
    {
      productSlug: "leather-tote",
      reviewerEmail: "marit.h@example.com",
      rating: 5,
      body: "Already has a patina after two months of daily use. Exactly what I wanted from vegetable-tanned leather.",
    },
    {
      productSlug: "leather-tote",
      reviewerEmail: "tomas.b@example.com",
      rating: 4,
      body: "Beautiful bag. Interior is a little shallow for a 15-inch laptop, so check dimensions first.",
    },
    {
      productSlug: "poplin-shirt",
      reviewerEmail: "daniel.k@example.com",
      rating: 5,
      body: "Crisp without being stiff. Held its shape through a full day with no pressing needed.",
    },
  ];

  for (const seed of reviewSeeds) {
    const product = await prisma.product.findUnique({ where: { slug: seed.productSlug } });
    if (!product) continue;
    const userId = userIdByEmail[seed.reviewerEmail];
    await prisma.review.upsert({
      where: {
        // No natural unique key on Review beyond id, so guard against
        // duplicate seeding by checking existence first instead.
        id: `seed-${seed.productSlug}-${seed.reviewerEmail}`,
      },
      update: {},
      create: {
        id: `seed-${seed.productSlug}-${seed.reviewerEmail}`,
        productId: product.id,
        userId,
        rating: seed.rating,
        body: seed.body,
      },
    });
  }
  console.log(`Seeded ${reviewerRecords.length} reviewers and ${reviewSeeds.length} reviews.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
