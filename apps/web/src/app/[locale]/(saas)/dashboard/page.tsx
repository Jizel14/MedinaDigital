import { currentUser } from '@/lib/auth/server';
import { LogoutButton } from '@/components/auth/logout-button';

/**
 * Phase 6 placeholder dashboard. Full dashboard arrives in Phase 7.
 */
export default async function DashboardPage() {
  const me = await currentUser();
  if (!me) return null; // layout already redirected

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Bienvenue, {me.user.email}</h1>
      <p className="mt-2 text-stone-600">
        Rôle : <span className="font-mono">{me.user.role}</span>
      </p>
      <pre className="mt-6 overflow-x-auto rounded-md bg-stone-100 p-4 text-xs">
        {JSON.stringify(me.profile, null, 2)}
      </pre>
      <div className="mt-8">
        <LogoutButton />
      </div>
    </div>
  );
}
