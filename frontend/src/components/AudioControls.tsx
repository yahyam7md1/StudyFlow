import { useState, useEffect } from 'react';
import { SoundType, audioControls, sounds } from '../utils/audio';

const displayNames: Record<SoundType, string> = {
  rain: 'Rain Sounds 🌧️',
  lofi: 'Lofi beats 🎧',
  jazz: 'Jazz Music 🎷'
};

type Props = {
  selectedSound: SoundType;
  onSoundChange: (sound: SoundType) => void;
};

export default function AudioControls({ selectedSound, onSoundChange }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(50);

  // Critical fix: Add useEffect for volume control
  useEffect(() => {
    audioControls.setVolume(isMuted ? 0 : volume / 100);
  }, [volume, isMuted]);

  const handlePlayToggle = () => {
    audioControls.playPause(selectedSound);
    setIsPlaying(audioControls.isPlaying());
  };

  const handleSoundChange = (sound: SoundType) => {
    audioControls.stop();
    onSoundChange(sound);
    setIsPlaying(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute - restore previous volume
      setIsMuted(false);
    } else {
      // Mute - save current volume and set to 0
      setPreviousVolume(volume);
      setIsMuted(true);
    }
  };

  return (
    <div className="audio-controls">
      <div className="audio-buttons">
        {(Object.keys(sounds) as SoundType[]).map((sound) => (
          <button
            key={sound}
            onClick={() => handleSoundChange(sound)}
            className={`audio-button ${
              selectedSound === sound
                ? 'bg-blue-500/5 backdrop-blur-lg border-2 border-blue-300/50 shadow-lg'
                : 'bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-transparent'
            }`}
          >
            {displayNames[sound]}
          </button>
        ))}
      </div>
      

      <div className="flex items-center gap-4">
        <button
          onClick={handlePlayToggle}
          className="px-8 py-4 bg-white/20 backdrop-blur-lg rounded-xl text-white 
                     hover:bg-white/30 transition-all shadow-lg text-l"
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>

        <div className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-full pl-4 pr-3 py-2">
          <span 
            className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
            onClick={toggleMute}
          >
            {isMuted ? '🔇' : '🔊'}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value);
              setVolume(newVolume);
              if (isMuted && newVolume > 0) {
                setIsMuted(false);
              }
            }}
            className="w-32 h-2 bg-white/20 rounded-full appearance-none 
                     [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:bg-white
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:hover:scale-125
                     [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:bg-white
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:border-none"
          />
          <span className="text-sm font-medium w-8 text-white/90">
            {isMuted ? 0 : volume}%
          </span>
        </div>
      </div>
    </div>
  );
}