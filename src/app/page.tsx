import { ChordExplorer } from "./chord-explorer";

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-4 text-[#171512] sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl grid-rows-[auto_1fr] border-2 border-[#171512] bg-[#fffaf0]">
        <header className="flex items-center justify-between border-b-2 border-[#171512] px-4 py-3 sm:px-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em]">Harmony Sketchpad</p>
            <h1 className="text-3xl font-semibold leading-none tracking-[-0.06em] sm:text-4xl">Rechorder</h1>
          </div>
          <div className="hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#171512] bg-[#f05a28] font-mono text-[10px] font-bold sm:flex">
            REC
          </div>
        </header>

        <div className="grid min-h-0">
          <ChordExplorer />
        </div>
      </section>
    </main>
  );
}
