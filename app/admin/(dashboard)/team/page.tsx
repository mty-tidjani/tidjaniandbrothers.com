import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserPlus } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { auth } from "@/lib/auth";
import { ROLE_LABELS } from "@/lib/constants";
import { getTeamMembers, getPendingInvites } from "@/lib/data/team";
import { inviteTeamMember } from "@/lib/actions/team";

export const metadata: Metadata = { title: "Équipe", robots: { index: false } };

export default async function AdminTeamPage() {
  const session = await auth();
  if (session?.user.role !== "ADMIN") {
    redirect("/admin");
  }

  const [members, invites] = await Promise.all([
    getTeamMembers(),
    getPendingInvites(),
  ]);

  return (
    <div className="gap-stack-md flex flex-col">
      <header>
        <h1 className="text-headline-md text-on-surface">Équipe</h1>
        <p className="text-on-surface-variant mt-1">
          Gérez les comptes admin ayant accès au terminal.
        </p>
      </header>

      <GlassCard hover={false} className="p-0">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-glass-stroke/50 text-label-caps text-on-surface-variant border-b uppercase">
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Rôle</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.id}
                className="border-glass-stroke/30 border-b last:border-0"
              >
                <td className="text-on-surface px-4 py-4 font-medium">
                  {member.name}
                </td>
                <td className="text-on-surface-variant px-4 py-4">
                  {member.email}
                </td>
                <td className="text-on-surface-variant px-4 py-4">
                  {ROLE_LABELS[member.role]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {invites.length > 0 ? (
        <GlassCard hover={false} className="p-6">
          <h2 className="text-headline-sm text-on-surface mb-3">
            Invitations en attente
          </h2>
          <ul className="text-on-surface-variant space-y-2">
            {invites.map((invite) => (
              <li key={invite.id}>
                {invite.email} — {ROLE_LABELS[invite.role]}
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}

      <GlassCard hover={false} className="p-6">
        <h2 className="text-headline-sm text-on-surface mb-4 flex items-center gap-2">
          <UserPlus className="text-primary h-5 w-5" aria-hidden="true" />
          Inviter un membre
        </h2>
        <form
          action={inviteTeamMember}
          className="flex flex-col gap-4 sm:flex-row"
        >
          <Input
            name="email"
            type="email"
            placeholder="email@exemple.com"
            required
            className="flex-1"
          />
          <Select name="role" defaultValue="EDITOR" className="sm:w-56">
            <option value="ADMIN">Admin (accès complet)</option>
            <option value="EDITOR">Éditeur (blog / portfolio)</option>
          </Select>
          <button
            type="submit"
            className="bg-primary text-on-accent rounded-lg px-6 py-3 font-bold transition-shadow hover:shadow-[0_0_15px_var(--color-glow)]"
          >
            Inviter
          </button>
        </form>
      </GlassCard>
    </div>
  );
}
