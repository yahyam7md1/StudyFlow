import { useState} from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            title : "Welcome to Study Flow 🎧",
            content : "This website is designed to help you maximize your productivity and focus using proven techniques.",
            button: "Next"
        },
        {
            title : "Pomodoro Technique 🍅",
            content: "The Pomodoro Technique is a time management method developed by Francesco Cirillo in the late 1980s. StudyFlow uses the Pomodoro method which consists of 4 focused sessions (25 minutes) with a short breaks (5 minutes) in between them.",
            button: "Next"

        },
        {
            title : "Extended Breaks ⏱️",
            content: "After completing 4 focused sessions, you may enjoy a 30-minutes break before restarting the cycle.",
            button: "Start Focusing"
        }
    ];
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 z-50">
            <AnimatePresence mode = 'wait'>
                <motion.div
                   key={step}
                   initial = {{ opacity : 0, y: 20 }}
                   animate = {{ opacity : 1, y: 0 }}
                     exit = {{ opacity : 0, y: -20 }}
                     transition = {{ duration : 0.3 }}
                     className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-xl"
                >
                    <div className = "text-center space-y-6">
                        <h1 className ="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {steps[step].title}
                        </h1>

                        <p className = "text-white/80 text-lg leading-relaxed">
                            {steps[step].content}
                        </p>

                        <div className = "flex justify-center gap-4 mt-8">
                            { step > 0 && (
                                <button
                                    onClick={() => setStep(s => s - 1)}
                                    className = "px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all"
                                >
                                    ← Back 
                                </button>

                            )}
                            <button 
                                onClick = {() => {
                                    if(step === steps.length - 1){
                                        onComplete();

                                    }else {
                                        setStep(s => s + 1);
                                    }
                                }}
                                className = "px-6 py-3 bg-grdient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white font-semibold transition-all"
                            >
                              {steps[step].button}
                            </button>
                        </div>

                        <div className = "flex justify-center gap-2 mt-6">
                            {steps.map((_, index) => (
                                <div
                                    key = {index}
                                    className={`w-2 h-2 rounded-full transition-all ${index === step ? 'bg-blue-400 w-6' : 'bg-white/20'}`}
                                />

                            ))}
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
            </div>
    );
};

export default Onboarding;