import type { Metadata } from "next";
import { CaseStudyEditorForm } from "@/components/forms/CaseStudyEditorForm";
import { createCaseStudy } from "@/lib/actions/portfolio";

export const metadata: Metadata = {
  title: "Nouvelle étude de cas",
  robots: { index: false },
};

export default function NewCaseStudyPage() {
  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">
          Nouvelle étude de cas
        </h1>
      </header>
      <CaseStudyEditorForm action={createCaseStudy} />
    </div>
  );
}
