import { AUDIO_ARTS, type AudioArt } from "@/lib/audio/chord-audio";
const AUDIO_ART_LABELS: Record<AudioArt, string> = {
  piano: "Piano",
  pad: "Pad",
  arp: "Arp",
  strings: "Strings",
};

type AudioControlsProps = {
  isMuted: boolean;
  volume: number;
  tempo: number;
  audioArt: AudioArt;
  onMutedChange: (isMuted: boolean) => void;
  onVolumeChange: (volume: number) => void;
  onTempoChange: (tempo: number) => void;
  onAudioArtChange: (audioArt: AudioArt) => void;
};

export function AudioControls({
  isMuted,
  volume,
  tempo,
  audioArt,
  onMutedChange,
  onVolumeChange,
  onTempoChange,
  onAudioArtChange,
}: AudioControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-2 border-[#171512] bg-[#f2eee6] px-2 py-1">
      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">Audio</span>
      <button
        className={`h-9 border-2 border-[#171512] px-2.5 font-mono text-[9px] uppercase tracking-[0.14em] ${
          isMuted ? "bg-[#171512] text-[#fffaf0]" : "bg-[#f05a28] text-[#171512]"
        }`}
        type="button"
        aria-pressed={!isMuted}
        onClick={() => onMutedChange(!isMuted)}
      >
        {isMuted ? "Muted" : "Sound On"}
      </button>
      <label className="flex items-center gap-1">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#6f675b]">Vol {volume}</span>
          <input
            className="h-4 w-24 accent-[#f05a28]"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
      </label>
      <label className="flex items-center gap-1">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#6f675b]">BPM</span>
        <input
          className="h-9 w-16 border-2 border-[#171512] bg-[#fffaf0] px-2 font-mono text-[10px] outline-none focus:bg-white"
          type="number"
          min="60"
          max="180"
          value={tempo}
          onChange={(event) => onTempoChange(Number(event.target.value))}
        />
      </label>
      <div className="flex h-9 border-2 border-[#171512]">
        {AUDIO_ARTS.map((value) => {
          const isSelected = value === audioArt;

          return (
            <button
              className={`px-2.5 font-mono text-[9px] uppercase leading-none tracking-normal ${isSelected ? "bg-[#171512] text-[#fffaf0]" : "bg-[#fffaf0] hover:bg-white"}`}
              key={value}
              type="button"
              onClick={() => onAudioArtChange(value)}
            >
              {AUDIO_ART_LABELS[value]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
