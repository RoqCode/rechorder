import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen px-4 sm:px-8 md:px-14">
      <div className="mx-auto flex min-h-screen max-w-[1320px] flex-col">
        <header className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--rule)] py-5 sm:py-7">
          <div>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="grid h-[18px] w-[18px] place-items-center bg-[var(--accent)] font-mono text-[10px] font-medium leading-none text-[var(--text)]"
              />
              <div className="text-[28px] font-semibold leading-[0.9] tracking-[-0.045em] sm:text-[34px]">
                Rechorder
              </div>
            </div>
            <div className="mt-2 font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[var(--text-3)]">
              Harmony Sketchpad
            </div>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-[var(--text-3)]">
            <span
              className="border-[0.5px] border-[var(--hair)] px-2 py-[6px]"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="text-[var(--text-2)]">Error</span> 404
            </span>
          </div>
        </header>

        <section className="flex flex-1 items-center py-12 lg:py-20">
          <div>
            <div className="font-mono text-[10px] uppercase leading-none tracking-[0.16em] text-[var(--text-3)]">
              Page not found
            </div>
            <h1 className="mt-5 max-w-[820px] text-[clamp(72px,18vw,220px)] font-semibold leading-[0.8] tracking-[-0.07em]">
              404
            </h1>
            <p className="mt-6 max-w-[560px] text-[18px] leading-[1.45] tracking-[-0.02em] text-[var(--text-2)] sm:text-[22px]">
              The page you requested does not exist.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex h-10 items-center border-[0.5px] border-[var(--text)] bg-[var(--text)] px-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--surface)] transition duration-[var(--t)] hover:bg-[var(--accent)] hover:text-[var(--text)]"
              style={{ borderRadius: "var(--radius)" }}
            >
              Back to sketchpad
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
