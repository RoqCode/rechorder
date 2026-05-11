import { BLACK_KEYS, getKeyRelativeRootPositionKeyIds, WHITE_KEYS } from "@/lib/music/keyboard";

type PianoKeyboardProps = {
  activeNotes: string[];
  rootFloorKey: string;
};

export function PianoKeyboard({ activeNotes, rootFloorKey }: PianoKeyboardProps) {
  const activeKeyIds = getKeyRelativeRootPositionKeyIds(activeNotes, rootFloorKey);

  return (
    <div className="relative mx-auto h-24 max-w-4xl sm:h-28" aria-label={`Piano keys for ${activeNotes.join(" ")}`}>
      <div className="grid h-full" style={{ gridTemplateColumns: `repeat(${WHITE_KEYS.length}, minmax(0, 1fr))` }}>
        {WHITE_KEYS.map((note) => {
          const isActive = activeKeyIds.has(note);

          return (
            <div
              className={`border-2 border-r-0 border-[#171512] last:border-r-2 ${isActive ? "bg-[#f05a28]" : "bg-[#fffaf0]"}`}
              key={note}
              title={note}
            />
          );
        })}
      </div>

      {BLACK_KEYS.map(({ note, leftWhiteKey }) => {
        const isActive = activeKeyIds.has(note);

        return (
          <div
            className={`absolute top-0 h-[62%] w-[3.4%] -translate-x-1/2 border-2 border-[#171512] ${
              isActive ? "bg-[#f05a28]" : "bg-[#171512]"
            }`}
            key={note}
            style={{ left: `${((leftWhiteKey + 1) / WHITE_KEYS.length) * 100}%` }}
            title={note}
          />
        );
      })}
    </div>
  );
}
