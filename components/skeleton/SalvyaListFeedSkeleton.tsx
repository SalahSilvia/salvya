import { SkFieldDark, SkHeaderBarDark, SkKicker, SkShellDark, cx } from "./SalvyaSkeletonPrimitives";

type Props = { titleClassName?: string };

/** Notifications, inbox-style lists — editorial rows, not gray bars. */
export function SalvyaListFeedSkeleton({ titleClassName = "w-40" }: Props) {
  return (
    <SkShellDark>
      <SkHeaderBarDark showMenuSlot={false} />
      <div className="px-4 pb-28 pt-[calc(4.5rem+env(safe-area-inset-top))] sm:px-6">
        <div className="mx-auto max-w-md">
          <div
            className={cx(
              "mb-6 h-7 rounded-md bg-white/[0.07] ring-1 ring-white/[0.05] salvya-sk-sheen-dark salvya-sk-breathe-dark",
              titleClassName,
            )}
          />
          <SkKicker className="mb-4 w-28" />
          <ul className="flex flex-col gap-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <li key={i}>
                <SkFieldDark className="flex min-h-[72px] flex-col justify-end rounded-2xl p-4">
                  <div className="h-2.5 w-[55%] rounded-md bg-white/[0.08]" />
                  <div className="mt-2 h-2 w-[35%] rounded-md bg-white/[0.05]" />
                </SkFieldDark>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SkShellDark>
  );
}
