import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AdminPageShell({
  children,
  platformName = "Acme Corp",
}: {
  children: React.ReactNode;
  platformName?: string;
}) {
  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[260px] 2xl:w-[292px]">
        <Sidebar />
      </div>
      <div className="min-w-0 lg:pl-[260px] 2xl:pl-[292px]">
        <TopBar platformName={platformName} />
        <main className="min-w-0 px-4 pb-12 pt-4 lg:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
