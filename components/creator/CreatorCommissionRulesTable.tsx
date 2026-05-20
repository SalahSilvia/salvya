import { CREATOR_FOLLOWER_COMMISSION_TIERS } from "@/lib/creator/follower-commission";

type Props = {
  variant?: "dark" | "light";
  className?: string;
};

/** Follower-band commission table — shared by wallet, programme landing, and legal terms. */
export function CreatorCommissionRulesTable({ variant = "dark", className = "" }: Props) {
  const light = variant === "light";

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table
        className={`w-full min-w-[320px] border-collapse text-left text-[13px] ${
          light ? "text-slate-800" : "text-white/85"
        }`}
      >
        <thead>
          <tr className={light ? "border-b border-slate-200 text-slate-500" : "border-b border-white/10 text-white/45"}>
            <th className="py-2.5 pr-4 font-semibold">Instagram followers</th>
            <th className="py-2.5 font-semibold">You earn per item sold</th>
          </tr>
        </thead>
        <tbody>
          {CREATOR_FOLLOWER_COMMISSION_TIERS.map((tier) => (
            <tr
              key={tier.id}
              className={light ? "border-b border-slate-100" : "border-b border-white/[0.06] last:border-0"}
            >
              <td className="py-2.5 pr-4">{tier.followerRangeLabel}</td>
              <td className={`py-2.5 font-semibold tabular-nums ${light ? "text-slate-950" : "text-fuchsia-200/95"}`}>
                {tier.perItemDh} DH
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
