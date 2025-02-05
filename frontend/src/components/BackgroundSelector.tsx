import { useState } from 'react';

const backgrounds = [
  '/backgrounds/default-1.jpg',
  '/backgrounds/default-2.jpg',
  '/backgrounds/default-3.jpg',
  '/backgrounds/default-4.jpg'
];

type Props = {
  currentBackground: string;
  onSelect: (bg: string) => void;
};

export default function BackgroundSelector({ currentBackground, onSelect }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white/70 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
      >
        🖼️
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-black/90 backdrop-blur-sm rounded-xl shadow-xl">
          <div className="grid grid-cols-2 gap-4">
            {backgrounds.map((bg) => (
              <button
                key={bg}
                onClick={() => {
                  onSelect(bg);
                  setIsOpen(false);
                }}
                className={`relative h-20 w-32 rounded-lg overflow-hidden border-2 ${
                  currentBackground === bg 
                    ? 'border-blue-500' 
                    : 'border-transparent'
                }`}
              >
                <img
                  src={bg}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
