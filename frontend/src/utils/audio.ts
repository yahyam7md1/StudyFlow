import { Howl } from 'howler';

type ActiveSound = {
  instance: Howl;
  position: number;
};

let activeSound: ActiveSound | null = null;

export const sounds = {
  rain: new Howl({ src: ['https://yahyam7md1.github.io/StudyFlow/sounds/rain.mp3'], loop: true }),
lofi: new Howl({ src: ['https://yahyam7md1.github.io/StudyFlow/sounds/lofi.mp3'], loop: true }),
jazz: new Howl({ src: ['https://yahyam7md1.github.io/StudyFlow/sounds/jazz.mp3'], loop: true }),
};

// Session completion sounds
const sessionEndSound = new Howl({
  src: ['./sounds/bell.mp3'],
  volume: 0.8
});

const breakEndSound = new Howl({
  src: ['./sounds/bell.mp3'],
  volume: 0.8
});


export const playSessionEndAlert = () => sessionEndSound.play();
export const playBreakEndAlert = () => breakEndSound.play();




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