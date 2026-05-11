export default function Home() {
  return (
    <main className="min-h-screen px-5 py-6 text-[#171512] sm:px-8 lg:px-12">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl grid-rows-[auto_1fr] border-2 border-[#171512] bg-[#fffaf0]">
        <header className="flex items-center justify-between border-b-2 border-[#171512] px-5 py-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em]">Harmony Sketchpad</p>
            <h1 className="text-3xl font-semibold tracking-[-0.06em] sm:text-5xl">Rechorder</h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-full border-2 border-[#171512] bg-[#f05a28] font-mono text-xs font-bold sm:flex">
            REC
          </div>
        </header>

        <div className="grid gap-0 lg:grid-cols-[360px_1fr]">
          <aside className="border-b-2 border-[#171512] p-5 lg:border-r-2 lg:border-b-0">
            <p className="mb-8 max-w-xs text-sm leading-6">
              Explore chords in a key, arrange a sequence, and save useful harmonic takes to your local library.
            </p>

            <div className="grid gap-3 font-mono text-xs uppercase tracking-[0.2em]">
              <div className="border-2 border-[#171512] p-4">
                <span className="block text-[#6f675b]">Key</span>
                <strong className="mt-2 block text-2xl tracking-[-0.04em]">C major</strong>
              </div>
              <div className="border-2 border-[#171512] p-4">
                <span className="block text-[#6f675b]">Chord Mode</span>
                <strong className="mt-2 block text-2xl tracking-[-0.04em]">Triads</strong>
              </div>
            </div>
          </aside>

          <section className="grid content-between gap-12 p-5 sm:p-8">
            <div>
              <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em]">
                <span>Available Chords</span>
                <span>01</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {["I", "ii", "iii", "IV", "V", "vi", "vii°"].map((degree) => (
                  <button
                    className="min-h-32 border-2 border-[#171512] bg-[#f2eee6] p-4 text-left transition hover:-translate-y-0.5 hover:bg-white"
                    key={degree}
                  >
                    <span className="font-mono text-xs uppercase tracking-[0.25em]">{degree}</span>
                    <span className="mt-5 block text-3xl font-semibold tracking-[-0.06em]">C</span>
                    <span className="mt-1 block font-mono text-xs uppercase tracking-[0.2em] text-[#6f675b]">
                      C E G
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-2 border-[#171512] bg-[#171512] p-4 text-[#fffaf0]">
              <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-[0.25em]">
                <span>Sequence Slots</span>
                <span>I - V - vi - IV</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {["I", "V", "vi", "IV"].map((degree) => (
                  <div className="min-h-20 border-2 border-[#fffaf0] p-3" key={degree}>
                    <span className="font-mono text-xs uppercase tracking-[0.25em]">{degree}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
