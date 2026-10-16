"use client";

import { useState } from "react";
import type { UsageDay } from "@/lib/data/sms-portal";

const PLOT_HEIGHT = 160;

/** Rounds up to 1 / 2 / 5 × 10ⁿ so the top gridline is a clean number. */
function niceMax(value: number): number {
  if (value <= 0) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 5, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

function compact(n: number): string {
  return new Intl.NumberFormat("fr-FR", { notation: "compact" }).format(n);
}

function dayLabel(day: string, style: "short" | "long") {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: style === "short" ? "short" : "long",
    timeZone: "UTC",
  }).format(new Date(`${day}T00:00:00Z`));
}

/** Credits used per day — single series, so no legend: the title names it. */
export function UsageChart({ data }: { data: UsageDay[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...data.map((d) => d.credits)));
  const ticks = [max, max / 2, 0];
  const total = data.reduce((sum, d) => sum + d.credits, 0);
  const hovered = active === null ? null : data[active];

  return (
    <figure>
      <div className="relative flex gap-2">
        {/* Y axis */}
        <div
          className="text-on-surface-variant flex w-8 shrink-0 flex-col justify-between text-right text-xs"
          style={{ height: PLOT_HEIGHT }}
          aria-hidden="true"
        >
          {ticks.map((t) => (
            <span
              key={t}
              className="-translate-y-1/2 first:translate-y-0 last:translate-y-0"
            >
              {compact(t)}
            </span>
          ))}
        </div>

        {/* Plot */}
        <div
          className="relative min-w-0 flex-1"
          style={{ height: PLOT_HEIGHT }}
        >
          {ticks.map((t) => (
            <div
              key={t}
              className="border-surface-variant absolute inset-x-0 border-t"
              style={{ bottom: `${(t / max) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <div
            className="absolute inset-0 flex items-end gap-[2px]"
            onPointerLeave={() => setActive(null)}
          >
            {data.map((d, i) => (
              <div
                key={d.day}
                role="img"
                tabIndex={0}
                aria-label={`${dayLabel(d.day, "long")} : ${d.credits} crédits, ${d.messages} envois`}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                className="group flex h-full flex-1 cursor-default items-end justify-center outline-none"
              >
                <div
                  className={`bg-primary w-full max-w-6 rounded-t transition-opacity ${
                    active === i
                      ? "opacity-100"
                      : active === null
                        ? "opacity-90"
                        : "opacity-60"
                  } group-focus-visible:ring-primary group-focus-visible:ring-2`}
                  style={{
                    height:
                      d.credits > 0
                        ? `max(2px, ${(d.credits / max) * 100}%)`
                        : 0,
                  }}
                />
              </div>
            ))}
          </div>

          {hovered && active !== null ? (
            <div
              className="border-glass-stroke bg-surface-container-highest text-on-surface pointer-events-none absolute -top-2 z-10 -translate-y-full rounded-lg border px-3 py-2 text-xs whitespace-nowrap shadow-lg"
              style={{
                left: `${((active + 0.5) / data.length) * 100}%`,
                transform: `translate(${active < data.length / 2 ? "-20%" : "-80%"}, -100%)`,
              }}
            >
              <p className="font-bold">{dayLabel(hovered.day, "long")}</p>
              <p>
                {hovered.credits} crédit{hovered.credits > 1 ? "s" : ""} ·{" "}
                {hovered.messages} envoi{hovered.messages > 1 ? "s" : ""}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* X axis: first, middle, last day */}
      <div
        className="text-on-surface-variant mt-2 ml-10 flex justify-between text-xs"
        aria-hidden="true"
      >
        <span>{dayLabel(data[0].day, "short")}</span>
        <span>{dayLabel(data[Math.floor(data.length / 2)].day, "short")}</span>
        <span>{dayLabel(data[data.length - 1].day, "short")}</span>
      </div>

      <figcaption className="text-on-surface-variant mt-3 text-sm">
        {total} crédits utilisés sur les 30 derniers jours.
      </figcaption>

      <details className="mt-2 text-sm">
        <summary className="text-primary cursor-pointer">
          Voir les données
        </summary>
        <div className="mt-2 max-h-64 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-on-surface-variant">
                <th className="py-1 font-normal">Jour</th>
                <th className="py-1 text-right font-normal">Crédits</th>
                <th className="py-1 text-right font-normal">Envois</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {[...data].reverse().map((d) => (
                <tr key={d.day} className="border-glass-stroke/30 border-t">
                  <td className="text-on-surface py-1">
                    {dayLabel(d.day, "long")}
                  </td>
                  <td className="text-on-surface py-1 text-right">
                    {d.credits}
                  </td>
                  <td className="text-on-surface py-1 text-right">
                    {d.messages}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
