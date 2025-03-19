import { useState } from 'react';
import Timer from './components/timer';
import AudioControls from './components/AudioControls';
import BackgroundSelector from './components/BackgroundSelector';
import { getSavedBackground, saveBackground } from './utils/storage';
import { SoundType } from './utils/audio'; // Add this import
import Clock from './components/Clock';
import Onboarding from './components/Onboarding';
import ToDoList from './components/ToDoList';
import VersionHistory from './components/VersionHistory';

export default function App() {
  // Add explicit type declaration for SoundType
  const [selectedSound, setSelectedSound] = useState<SoundType>('rain');
  const [background, setBackground] = useState(getSavedBackground());
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  const handleBackgroundChange = (bg: string) => {
    setBackground(bg);
    saveBackground(bg);
  };

  return (
    
    <div 
      className="min-h-screen flex items-center justify-center transition-all duration-500 page-background"
      style={{ 
        backgroundImage: `url(${background})`
      }}
    >
      
      <div className="absolute inset-0 backdrop-blur-sm backdrop-overlay" />
      <Clock />
      
      {/* Version indicator */}
      <div 
        onClick={() => setShowVersionHistory(true)}
        className="version-indicator"
      >
        v1.0.0
      </div>
      
      {showVersionHistory && (
        <VersionHistory onClose={() => setShowVersionHistory(false)} />
      )}
      
      {showOnboarding ? (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      ) : (
      
      
      <div className="main-container">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          🎧 Study Flow
        </h1>
        
        <Timer studyMins={25} breakMins={5} sessions={4} />
        
        <AudioControls 
          selectedSound={selectedSound}
          onSoundChange={(sound: SoundType) => setSelectedSound(sound)}
        />
        

        <BackgroundSelector 
          currentBackground={background}
          onSelect={handleBackgroundChange}
          
        />
        <ToDoList />
      </div>
      )}
    </div>
  );
}