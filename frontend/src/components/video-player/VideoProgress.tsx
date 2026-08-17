interface VideoProgressProps {
  currentTime: number
  duration: number
  buffered: number
  onSeek: (time: number) => void
}

export function VideoProgress({ currentTime, duration, buffered, onSeek }: VideoProgressProps) {
  const playedPercent = duration ? (currentTime / duration) * 100 : 0
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0

  return (
    <div className="group/progress relative flex h-5 w-full items-center">
      <div className="pointer-events-none absolute inset-x-0 h-1 overflow-hidden rounded-full bg-white/20 transition-all group-hover/progress:h-1.5">
        <div className="absolute inset-y-0 left-0 bg-white/25" style={{ width: `${bufferedPercent}%` }} />
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${playedPercent}%` }} />
      </div>
      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.1}
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="absolute inset-x-0 z-10 h-5 w-full cursor-pointer opacity-0"
        aria-label="Video progress"
        aria-valuetext={`${Math.round(playedPercent)} percent played`}
        data-testid="video-progress"
      />
    </div>
  )
}

