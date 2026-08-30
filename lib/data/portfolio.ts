import { prisma } from "@/lib/prisma";

export async function getPublishedCaseStudies() {
  return prisma.caseStudy.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPublishedCaseStudyBySlug(slug: string) {
  return prisma.caseStudy.findFirst({
    where: { slug, published: true },
  });
}

export async function getAllCaseStudies() {
  return prisma.caseStudy.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getCaseStudyById(id: string) {
  return prisma.caseStudy.findUnique({ where: { id } });
}
