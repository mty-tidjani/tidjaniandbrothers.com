export function StepProgress({
  currentStep,
  totalSteps,
  label,
}: {
  currentStep: number;
  totalSteps: number;
  label: string;
}) {
  const pct =
    totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="mb-stack-lg mx-auto w-full max-w-xl">
      <div className="text-label-caps text-on-surface-variant mb-2 flex items-center justify-between">
        <span>
          Étape {currentStep} / {totalSteps}
        </span>
        <span className="text-primary">{label}</span>
      </div>
      <div className="bg-surface-variant relative h-1.5 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary absolute top-0 left-0 h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
