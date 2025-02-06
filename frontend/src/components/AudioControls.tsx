import { useState, useEffect } from 'react';
import { SoundType, audioControls, sounds } from '../utils/audio';

const displayNames: Record<SoundType, string> = {
  rain: 'Rain Sounds 🌧️',
  piano: 'Calming Piano 🎧',
  jazz: 'Jazz Music 🎷'
};

type Props = {
  selectedSound: SoundType;
  onSoundChange: (sound: SoundType) => void;
};

export default function AudioControls({ selectedSound, onSoundChange }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Critical fix: Add useEffect for volume control
  useEffect(() => {
    audioControls.setVolume(volume);
  }, [volume]);

  const handlePlayToggle = () => {
    audioControls.playPause(selectedSound);
    setIsPlaying(audioControls.isPlaying());
  };

  const handleSoundChange = (sound: SoundType) => {
    audioControls.stop();
    onSoundChange(sound);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 justify-center">
        {(Object.keys(sounds) as SoundType[]).map((sound) => (
          <button
            key={sound}
            onClick={() => handleSoundChange(sound)}
            className={`px-4 py-2 rounded-lg ${
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

        <div className="flex items-center gap-2 text-white">
          <span className="text-sm">🔊 Volume:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-32 accent-blue-500"
          />
          <span className="text-sm w-8">{(volume * 100).toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
}