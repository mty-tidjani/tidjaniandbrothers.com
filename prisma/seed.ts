import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@spartiat-it.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (!adminPassword) {
    throw new Error(
      "ADMIN_SEED_PASSWORD is not set — refusing to seed with a default password",
    );
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "Équipe Spartiat-AI",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.companySettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      phone: "+237 6 98 96 67 19",
      email: "contact@spartiat-it.com",
      address: "Awaye — près du Collège Père Monti, Yaoundé, Cameroun",
      facebookUrl: "https://www.facebook.com",
      defaultLocale: "fr",
    },
  });

  const tiers: Array<{
    name: string;
    priceMin: number;
    priceMax: number | null;
    features: string[];
    maxUsers: string;
    isMaintenance: boolean;
    sortOrder: number;
  }> = [
    {
      name: "Starter",
      priceMin: 250_000,
      priceMax: 600_000,
      features: ["Ventes", "Facturation", "Inventaire"],
      maxUsers: "1 à 5 utilisateurs",
      isMaintenance: false,
      sortOrder: 0,
    },
    {
      name: "Standard",
      priceMin: 700_000,
      priceMax: 1_800_000,
      features: [
        "Tout du Starter, plus :",
        "Comptabilité",
        "Point de vente (POS)",
        "CRM",
      ],
      maxUsers: "Jusqu'à 15 utilisateurs",
      isMaintenance: false,
      sortOrder: 1,
    },
    {
      name: "Custom",
      priceMin: 2_000_000,
      priceMax: null,
      features: [
        "Multi-modules",
        "Fabrication",
        "RH",
        "Multi-entrepôts",
        "Intégrations sur-mesure",
      ],
      maxUsers: "Sur devis",
      isMaintenance: false,
      sortOrder: 2,
    },
    {
      name: "Maintenance & Support",
      priceMin: 30_000,
      priceMax: 100_000,
      features: ["Support continu", "Mises à jour", "Assistance prioritaire"],
      maxUsers: "",
      isMaintenance: true,
      sortOrder: 3,
    },
  ];

  for (const tier of tiers) {
    const existing = await prisma.serviceTier.findFirst({
      where: { name: tier.name },
    });
    if (existing) {
      await prisma.serviceTier.update({
        where: { id: existing.id },
        data: tier,
      });
    } else {
      await prisma.serviceTier.create({ data: tier });
    }
  }

  await prisma.caseStudy.upsert({
    where: { slug: "commerce-detail-yaounde" },
    update: {},
    create: {
      slug: "commerce-detail-yaounde",
      sector: "Commerce de détail, Yaoundé",
      before:
        "Facturation manuelle, suivi de stock sur papier, erreurs fréquentes.",
      after:
        "Installation d'Odoo (Facturation + Stock + Ventes) : traitement des factures le jour même au lieu de 2 jours, visibilité en temps réel sur le stock, formation de 4 membres de l'équipe.",
      resultMetric: "Facturation : 2 jours → le jour même",
      imagePaths: [],
      published: true,
    },
  });

  // Real card structure kept identical to the first case study on purpose —
  // these are explicit placeholders for real client data, not fabricated results.
  const placeholderStudies = [
    { slug: "etude-de-cas-2", sector: "[Secteur à préciser], [Ville]" },
    { slug: "etude-de-cas-3", sector: "[Secteur à préciser], [Ville]" },
  ];
  for (const study of placeholderStudies) {
    await prisma.caseStudy.upsert({
      where: { slug: study.slug },
      update: {},
      create: {
        slug: study.slug,
        sector: study.sector,
        before:
          "[TODO: décrire la situation manuelle ou déconnectée avant l'intervention]",
        after:
          "[TODO: décrire la solution Odoo déployée et les résultats mesurés]",
        imagePaths: [],
        published: false,
      },
    });
  }

  const blogPosts: Array<{
    title: string;
    slug: string;
    excerpt: string;
    contentHtml: string;
    category: "ODOO" | "DIGITALISATION" | "ACTUALITES";
  }> = [
    {
      title: "3 signes que votre entreprise a dépassé Excel",
      slug: "3-signes-entreprise-depasse-excel",
      excerpt:
        "Les feuilles de calcul sont excellentes pour démarrer, mais deviennent un frein en grandissant. Voici les signaux à surveiller.",
      contentHtml:
        "<p>Les feuilles de calcul sont excellentes pour démarrer, mais deviennent un frein à mesure que votre activité grandit. Trois signes ne trompent pas : du temps perdu à chercher une facture, une visibilité nulle sur les stocks réels, et des chiffres qui ne correspondent jamais d'un fichier à l'autre.</p>",
      category: "DIGITALISATION",
    },
    {
      title:
        "Pourquoi Odoo, et pourquoi nous ? Ce qu'on a appris sur le terrain",
      slug: "pourquoi-odoo-pourquoi-nous",
      excerpt:
        "La plateforme est puissante, mais l'intégration est un art. Notre approche pour sécuriser votre succès.",
      contentHtml:
        "<p>Odoo est une plateforme puissante, mais son intégration réussie dépend d'une chose : bien cadrer les besoins réels de l'entreprise avant de configurer quoi que ce soit. C'est l'approche que nous appliquons à chaque projet.</p>",
      category: "ODOO",
    },
    {
      title:
        "Le piège du numérique : ce que risquent les entreprises qui ignorent la digitalisation",
      slug: "piege-du-numerique",
      excerpt:
        "Acheter des logiciels n'est pas se digitaliser. Comment éviter le syndrome de l'empilement technologique.",
      contentHtml:
        "<p>Acheter des logiciels n'est pas se digitaliser. Beaucoup d'entreprises accumulent des outils déconnectés qui ne communiquent pas entre eux, ce qui aggrave le problème qu'ils étaient censés résoudre.</p>",
      category: "DIGITALISATION",
    },
    {
      title:
        "Odoo Community vs Enterprise : que choisir pour une PME camerounaise ?",
      slug: "odoo-community-vs-enterprise",
      excerpt:
        "Démêler le vrai du faux. Quelle version est réellement adaptée à l'échelle de votre PME africaine ?",
      contentHtml:
        "<p>Odoo Community offre une base solide, mais la version Enterprise devient rapidement rentable dès que la comptabilité avancée, le support mobile et l'assistance officielle deviennent critiques pour l'activité.</p>",
      category: "ODOO",
    },
    {
      title:
        "Comment le paiement mobile (MTN MoMo, Orange Money) s'intègre à Odoo",
      slug: "paiement-mobile-momo-orange-money-odoo",
      excerpt:
        "L'intégration vitale pour le marché local : synchroniser Mobile Money directement dans votre comptabilité.",
      contentHtml:
        "<p>Le paiement mobile est incontournable au Cameroun. Une intégration correcte avec Odoo permet de rapprocher automatiquement les transactions MTN Mobile Money et Orange Money avec votre comptabilité, sans ressaisie manuelle.</p>",
      category: "ODOO",
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        status: "PUBLISHED",
        authorId: admin.id,
        publishedAt: new Date(),
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
