import { Howl } from 'howler';

type ActiveSound = {
  instance: Howl;
  position: number;
};

let activeSound: ActiveSound | null = null;

export const sounds = {
  rain: new Howl({ src: ['/sounds/rain.mp3'], loop: true }),
  piano: new Howl({ src: ['/sounds/piano.mp3'], loop: true }),
  jazz: new Howl({ src: ['/sounds/jazz.mp3'], loop: true }),
};

export type SoundType = keyof typeof sounds;

export const audioControls = {
  playPause: (soundType: SoundType) => {
    if (activeSound) {
      if (activeSound.instance.playing()) {
        // Pause current sound
        activeSound.position = activeSound.instance.seek() as number;
        activeSound.instance.pause();
      } else {
        // Resume paused sound
        activeSound.instance.seek(activeSound.position);
        activeSound.instance.play();
      }
    } else {
      // Start new sound
      activeSound = {
        instance: sounds[soundType],
        position: 0
      };
      activeSound.instance.play();
    }
  },
  stop: () => {
    if (activeSound) {
      activeSound.instance.stop();
      activeSound = null;
    }
  },
  setVolume: (volume: number) => {
    if (activeSound) activeSound.instance.volume(volume);
  },
  isPlaying: (): boolean => {
    return activeSound?.instance.playing() || false;
  }
};