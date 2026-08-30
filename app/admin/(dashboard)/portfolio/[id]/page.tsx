import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyEditorForm } from "@/components/forms/CaseStudyEditorForm";
import { getCaseStudyById } from "@/lib/data/portfolio";
import { updateCaseStudy } from "@/lib/actions/portfolio";

export const metadata: Metadata = {
  title: "Modifier l'étude de cas",
  robots: { index: false },
};

type PageProps = { params: Promise<{ id: string }> };

export default async function EditCaseStudyPage({ params }: PageProps) {
  const { id } = await params;
  const study = await getCaseStudyById(id);
  if (!study) notFound();

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">
          Modifier l&rsquo;étude de cas
        </h1>
      </header>
      <CaseStudyEditorForm
        action={updateCaseStudy.bind(null, id)}
        study={study}
      />
    </div>
  );
}
