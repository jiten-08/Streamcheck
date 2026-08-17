import { AnimatePresence, motion } from "framer-motion"
import {
  Gauge,
  Keyboard,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  RotateCcw,
  Square,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react"

import { PlayerControlButton } from "@/components/video-player/PlayerControlButton"
import { VideoProgress } from "@/components/video-player/VideoProgress"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2]

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00"
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainder = Math.floor(seconds % 60)
  return hours
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`
    : `${minutes}:${remainder.toString().padStart(2, "0")}`
}

export interface VideoPlayerProps {
  src: string
  title: string
  poster?: string
  autoPlay?: boolean
  className?: string
}

export function VideoPlayer({ src, title, poster, autoPlay = false, className }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(autoPlay)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [fullscreen, setFullscreen] = useState(false)
  const [pictureInPicture, setPictureInPicture] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => setFullscreen(document.fullscreenElement === containerRef.current)
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onEnterPictureInPicture = () => setPictureInPicture(true)
    const onLeavePictureInPicture = () => setPictureInPicture(false)
    video.addEventListener("enterpictureinpicture", onEnterPictureInPicture)
    video.addEventListener("leavepictureinpicture", onLeavePictureInPicture)
    return () => {
      video.removeEventListener("enterpictureinpicture", onEnterPictureInPicture)
      video.removeEventListener("leavepictureinpicture", onLeavePictureInPicture)
    }
  }, [])

  const togglePlayback = async () => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      try {
        await video.play()
      } catch {
        setError("Playback could not be started.")
      }
    } else {
      video.pause()
    }
  }

  const stop = () => {
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setCurrentTime(0)
  }

  const seek = (time: number) => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = Math.max(0, Math.min(time, duration))
    setCurrentTime(video.currentTime)
  }

  const skip = (seconds: number) => seek((videoRef.current?.currentTime ?? 0) + seconds)

  const changeVolume = (nextVolume: number) => {
    const video = videoRef.current
    if (!video) return
    const normalized = Math.max(0, Math.min(1, nextVolume))
    video.volume = normalized
    video.muted = normalized === 0
    setVolume(normalized)
    setMuted(normalized === 0)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = rate
    setPlaybackRate(rate)
  }

  const stepPlaybackRate = (direction: number) => {
    const currentIndex = playbackRates.indexOf(playbackRate)
    const nextIndex = Math.max(0, Math.min(playbackRates.length - 1, currentIndex + direction))
    changePlaybackRate(playbackRates[nextIndex])
  }

  const toggleFullscreen = async () => {
    if (!containerRef.current) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await containerRef.current.requestFullscreen()
  }

  const togglePictureInPicture = async () => {
    const video = videoRef.current
    if (!video || !document.pictureInPictureEnabled) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await video.requestPictureInPicture()
    } catch {
      setError("Picture in Picture is unavailable for this video.")
    }
  }

  const updateBuffered = () => {
    const video = videoRef.current
    if (!video || !video.buffered.length) return setBuffered(0)
    setBuffered(video.buffered.end(video.buffered.length - 1))
  }

  const handleKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (["INPUT", "SELECT", "BUTTON"].includes(target.tagName)) return
    const key = event.key.toLowerCase()
    if ([" ", "k", "arrowleft", "arrowright", "arrowup", "arrowdown", "m", "f", "p", "s", "0", "?", ">", "<", ".", ","].includes(key)) event.preventDefault()
    if (key === " " || key === "k") void togglePlayback()
    else if (key === "arrowleft") skip(-10)
    else if (key === "arrowright") skip(10)
    else if (key === "arrowup") changeVolume(volume + 0.1)
    else if (key === "arrowdown") changeVolume(volume - 0.1)
    else if (key === "m") toggleMute()
    else if (key === "f") void toggleFullscreen()
    else if (key === "p") void togglePictureInPicture()
    else if (key === "s" || key === "0") stop()
    else if (key === "?" || (key === "/" && event.shiftKey)) setShortcutsOpen((value) => !value)
    else if (key === ">" || key === ".") stepPlaybackRate(1)
    else if (key === "<" || key === ",") stepPlaybackRate(-1)
  }

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2

  return (
    <div ref={containerRef} tabIndex={0} onKeyDown={handleKeyboard} className={cn("group/player relative aspect-video w-full overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-primary", fullscreen ? "h-screen aspect-auto" : "rounded-xl", className)} data-testid="video-player">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        preload="metadata"
        className="size-full object-contain"
        onClick={() => void togglePlayback()}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onWaiting={() => setLoading(true)}
        onLoadStart={() => setLoading(true)}
        onCanPlay={() => setLoading(false)}
        onPlaying={() => { setLoading(false); setError(null) }}
        onLoadedMetadata={(event) => { setDuration(event.currentTarget.duration); setLoading(false) }}
        onDurationChange={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onProgress={updateBuffered}
        onEnded={() => setPlaying(false)}
        onError={() => { setLoading(false); setError("This video could not be loaded.") }}
        data-testid="html5-video"
      />

      <AnimatePresence>
        {loading && !error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30" data-testid="video-loading"><Spinner size="lg" label="Buffering video" /></motion.div>}
      </AnimatePresence>

      {!playing && !loading && !error && (
        <button type="button" onClick={() => void togglePlayback()} className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform hover:scale-110 sm:size-20" aria-label="Play video" data-testid="video-center-play"><Play className="ml-1 size-7 fill-current sm:size-9" /></button>
      )}

      {error && <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-5 text-center" role="alert" data-testid="video-error"><p className="text-lg font-semibold">Video unavailable</p><p className="mt-2 max-w-md text-sm text-zinc-400">{error}</p><button type="button" onClick={() => { setError(null); setLoading(true); videoRef.current?.load() }} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"><RotateCcw className="size-4" />Retry video</button></div>}

      <div className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black/75 to-transparent px-4 pb-14 pt-4 opacity-0 transition-opacity group-hover/player:opacity-100 group-focus-within/player:opacity-100"><p className="truncate text-sm font-semibold sm:text-base">{title}</p></div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-16 sm:px-5 sm:pb-4">
        <VideoProgress currentTime={currentTime} duration={duration} buffered={buffered} onSeek={seek} />
        <div className="mt-1 flex items-center gap-1 sm:gap-2">
          <PlayerControlButton label={playing ? "Pause" : "Play"} onClick={() => void togglePlayback()} data-testid="video-play-pause">{playing ? <Pause className="size-5 fill-current" /> : <Play className="ml-0.5 size-5 fill-current" />}</PlayerControlButton>
          <PlayerControlButton label="Stop" onClick={stop} data-testid="video-stop"><Square className="size-4 fill-current" /></PlayerControlButton>
          <PlayerControlButton label={muted ? "Unmute" : "Mute"} onClick={toggleMute} active={muted} data-testid="video-mute"><VolumeIcon className="size-5" /></PlayerControlButton>
          <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume} onChange={(event) => changeVolume(Number(event.target.value))} className="hidden h-1 w-20 cursor-pointer accent-primary sm:block lg:w-24" aria-label="Volume" data-testid="video-volume" />
          <span className="ml-1 hidden whitespace-nowrap text-xs tabular-nums text-zinc-300 sm:inline">{formatTime(currentTime)} / {formatTime(duration)}</span>
          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <label className="relative flex items-center" title="Playback speed"><Gauge className="pointer-events-none absolute left-2 hidden size-4 sm:block" /><select value={playbackRate} onChange={(event) => changePlaybackRate(Number(event.target.value))} className="h-9 appearance-none rounded-full bg-white/10 px-2 text-xs font-semibold outline-none hover:bg-white/15 focus:ring-2 focus:ring-white sm:pl-7" aria-label="Playback speed" data-testid="video-playback-speed">{playbackRates.map((rate) => <option key={rate} value={rate} className="bg-zinc-900">{rate}×</option>)}</select></label>
            <PlayerControlButton label="Keyboard shortcuts" onClick={() => setShortcutsOpen((value) => !value)} active={shortcutsOpen} className="hidden sm:flex" data-testid="video-shortcuts-button"><Keyboard className="size-5" /></PlayerControlButton>
            <PlayerControlButton label="Picture in Picture" onClick={() => void togglePictureInPicture()} disabled={!document.pictureInPictureEnabled} active={pictureInPicture} data-testid="video-picture-in-picture"><PictureInPicture2 className="size-5" /></PlayerControlButton>
            <PlayerControlButton label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"} onClick={() => void toggleFullscreen()} active={fullscreen} data-testid="video-fullscreen">{fullscreen ? <Minimize className="size-5" /> : <Maximize className="size-5" />}</PlayerControlButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {shortcutsOpen && <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="absolute bottom-24 right-4 w-64 rounded-xl border border-white/10 bg-black/85 p-4 text-xs shadow-2xl backdrop-blur-xl" data-testid="video-shortcuts-panel"><p className="mb-3 font-semibold text-white">Keyboard shortcuts</p><div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-zinc-300"><span>Play / Pause</span><kbd>Space · K</kbd><span>Seek</span><kbd>← · →</kbd><span>Volume</span><kbd>↑ · ↓</kbd><span>Mute</span><kbd>M</kbd><span>Fullscreen</span><kbd>F</kbd><span>Picture in Picture</span><kbd>P</kbd><span>Stop</span><kbd>S · 0</kbd><span>Playback speed</span><kbd>&lt; · &gt;</kbd></div></motion.div>}
      </AnimatePresence>
    </div>
  )
}
