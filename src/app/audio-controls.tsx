import { AUDIO_ARTS, type AudioArt } from "@/lib/audio/chord-audio";
import { ControlGroup, SegmentedControl } from "./form-controls";

const AUDIO_ART_LABELS: Record<AudioArt, string> = {
  piano: "Piano",
  pad: "Pad",
  arp: "Arp",
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
    <div className="grid gap-1 border-2 border-[#171512] bg-[#f2eee6] p-2">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6f675b]">Audio</span>
        <button
          className={`border-2 border-[#171512] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] ${
            isMuted ? "bg-[#171512] text-[#fffaf0]" : "bg-[#f05a28] text-[#171512]"
          }`}
          type="button"
          aria-pressed={!isMuted}
          onClick={() => onMutedChange(!isMuted)}
        >
          {isMuted ? "Muted" : "Sound On"}
        </button>
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#6f675b]">Volume {volume}</span>
          <input
            className="h-5 w-24 accent-[#f05a28]"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
          />
        </label>
        <label className="grid gap-1">
          <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#6f675b]">Tempo</span>
          <input
            className="h-7 w-16 border-2 border-[#171512] bg-[#fffaf0] px-1 font-mono text-[10px] outline-none focus:bg-white"
            type="number"
            min="60"
            max="180"
            value={tempo}
            onChange={(event) => onTempoChange(Number(event.target.value))}
          />
        </label>
        <ControlGroup label="Art">
          <SegmentedControl options={AUDIO_ARTS.map((value) => ({ value, label: AUDIO_ART_LABELS[value] }))} value={audioArt} onChange={onAudioArtChange} />
        </ControlGroup>
      </div>
    </div>
  );
}
