import { useState } from 'react';
import Timer from './components/timer';
import AudioControls from './components/AudioControls';
import BackgroundSelector from './components/BackgroundSelector';
import { getSavedBackground, saveBackground } from './utils/storage';
import { SoundType } from './utils/audio'; // Add this import

export default function App() {
  // Add explicit type declaration for SoundType
  const [selectedSound, setSelectedSound] = useState<SoundType>('rain');
  const [background, setBackground] = useState(getSavedBackground());

  const handleBackgroundChange = (bg: string) => {
    setBackground(bg);
    saveBackground(bg);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center transition-all duration-500"
      style={{ 
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      
      <div className="relative bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          🎧 Study Flow
        </h1>
        
        <Timer studyMins={0.1} breakMins={0.1} sessions={4} />
        
        <AudioControls 
          selectedSound={selectedSound}
          onSoundChange={(sound: SoundType) => setSelectedSound(sound)}
        />

        <BackgroundSelector 
          currentBackground={background}
          onSelect={handleBackgroundChange}
        />
      </div>
    </div>
  );
}