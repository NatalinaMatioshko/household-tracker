import { auth } from "@/lib/auth";
import HouseholdTracker from "./HouseholdTracker";

export default async function Home() {
  const session = await auth();
  const userLabel =
    session?.user?.email ?? session?.user?.name ?? undefined;

  return (
    <main className="flex-1">
      <HouseholdTracker userLabel={userLabel} />
    </main>
  );
}
