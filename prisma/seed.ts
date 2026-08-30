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
    update: {
      imagePaths: ["/uploads/case-studies/commerce-detail-yaounde.jpg"],
    },
    create: {
      slug: "commerce-detail-yaounde",
      sector: "Commerce de détail, Yaoundé",
      before:
        "Facturation manuelle, suivi de stock sur papier, erreurs fréquentes.",
      after:
        "Installation d'Odoo (Facturation + Stock + Ventes) : traitement des factures le jour même au lieu de 2 jours, visibilité en temps réel sur le stock, formation de 4 membres de l'équipe.",
      resultMetric: "Facturation : 2 jours → le jour même",
      imagePaths: ["/uploads/case-studies/commerce-detail-yaounde.jpg"],
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
    coverImagePath: string;
  }> = [
    {
      title: "3 signes que votre entreprise a dépassé Excel",
      slug: "3-signes-entreprise-depasse-excel",
      excerpt:
        "Les feuilles de calcul sont excellentes pour démarrer, mais deviennent un frein en grandissant. Voici les signaux à surveiller.",
      contentHtml:
        "<p>Les feuilles de calcul sont excellentes pour démarrer, mais deviennent un frein à mesure que votre activité grandit. Trois signes ne trompent pas : du temps perdu à chercher une facture, une visibilité nulle sur les stocks réels, et des chiffres qui ne correspondent jamais d'un fichier à l'autre.</p>",
      category: "DIGITALISATION",
      coverImagePath: "/uploads/blog/depasse-excel.jpg",
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
      coverImagePath: "/uploads/blog/pourquoi-odoo.jpg",
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
      coverImagePath: "/uploads/blog/piege-numerique.jpg",
    },
    {
      title:
        "Odoo Community vs Enterprise : que choisir pour une PME camerounaise ?",
      slug: "odoo-community-vs-enterprise",
      excerpt:
        "Démêler le vrai du faux. Quelle version est réellement adaptée à l'échelle de votre PME africaine ?",
      contentHtml: `<p>La digitalisation n'est plus une option pour les PME en Afrique Centrale, c'est une question de survie et de compétitivité. Face au marché des ERP, Odoo s'impose comme un acteur majeur grâce à sa flexibilité et son modèle open-source. Cependant, une question revient systématiquement lors de nos consultations : <strong>faut-il opter pour la version Community (gratuite) ou investir dans la version Enterprise ?</strong></p>
<p>Chez Spartiat-AI, nous croyons en une approche chirurgicale de la technologie. Voici une analyse sans concession pour vous aider à trancher.</p>
<h2>L'illusion de la gratuité : le cas Community</h2>
<p>Odoo Community est une base solide. Elle offre un accès au code source et permet de déployer des modules fondamentaux (CRM, Ventes, Facturation de base). C'est souvent le point d'entrée idéal pour une TPE ou un développeur indépendant souhaitant tester l'écosystème.</p>
<blockquote><p>Le coût réel d'un logiciel gratuit se mesure en heures de maintenance, en compromis fonctionnels et en dette technique.</p></blockquote>
<p>Cependant, les limites apparaissent rapidement lorsque l'entreprise cherche à <em>scaler</em>. La version Community est amputée de fonctionnalités critiques :</p>
<ul>
<li><strong>Comptabilité avancée :</strong> absence de lettrage automatisé, de gestion multi-devises complète et de rapports dynamiques.</li>
<li><strong>Interface mobile :</strong> l'interface n'est pas optimisée (responsive) pour les smartphones, un frein majeur sur le continent.</li>
<li><strong>Hébergement et support :</strong> vous êtes seul responsable de l'infrastructure, de la sécurité et des mises à jour.</li>
</ul>
<h2>La force de frappe Enterprise</h2>
<p>Odoo Enterprise est l'armure complète. Elle transforme le framework en une machine prête à l'emploi. Le coût de la licence est largement compensé par le gain de productivité et la sécurité opérationnelle.</p>
<h3>Les avantages décisifs de l'Enterprise</h3>
<ul>
<li><strong>Odoo Studio :</strong> personnalisation de l'interface et création d'applications sans coder (no-code).</li>
<li><strong>Modules exclusifs :</strong> qualité, code-barres pour la logistique, automatisation du marketing, et applications bancaires complètes.</li>
<li><strong>Migration garantie :</strong> Odoo s'engage à migrer votre base de données vers les nouvelles versions, sécurisant ainsi votre investissement sur le long terme.</li>
</ul>
<h2>Le verdict Spartiate</h2>
<p>Si votre chiffre d'affaires dépend de la robustesse de votre système d'information, la version Community est un risque. Le temps passé par vos équipes à contourner ses limitations ou à développer des modules sur-mesure vous coûtera infiniment plus cher que la licence Enterprise.</p>
<p>Notre mission chez Spartiat-AI est de déployer des systèmes qui accélèrent votre croissance, pas qui la freinent. C'est pourquoi nous recommandons et intégrons exclusivement <strong>Odoo Enterprise</strong>, calibré sur-mesure pour les réalités de votre secteur.</p>`,
      category: "ODOO",
      coverImagePath: "/uploads/blog/community-vs-enterprise.jpg",
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
      coverImagePath: "/uploads/blog/paiement-mobile.jpg",
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
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
