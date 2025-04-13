// Timer worker that runs in a separate thread and won't be throttled by the browser
let timerId: ReturnType<typeof setInterval> | null = null;
let expectedEndTime: number = 0;

self.onmessage = (e: MessageEvent) => {
  const { type, timeLeft } = e.data;
  
  if (type === 'start') {
    // Clear any existing timer
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    
    // Calculate the expected end time
    expectedEndTime = Date.now() + (timeLeft * 1000);
    
    // Start a new timer that checks every 100ms
    timerId = setInterval(() => {
      const now = Date.now();
      const remainingTime = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
      
      // Send the remaining time back to the main thread
      self.postMessage({ type: 'tick', remainingTime });
      
      // If the timer has expired, clear the interval and send complete message
      if (remainingTime <= 0) {
        if (timerId !== null) {
          clearInterval(timerId);
          timerId = null;
        }
        // Make sure to send the complete message
        self.postMessage({ type: 'complete' });
      }
    }, 100);
  } 
  else if (type === 'stop') {
    // Clear the timer
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  else if (type === 'pause') {
    // Pause the timer by clearing the interval
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }
  else if (type === 'resume') {
    // Resume the timer by recalculating the end time and starting a new interval
    if (timerId === null) {
      expectedEndTime = Date.now() + (timeLeft * 1000);
      
      timerId = setInterval(() => {
        const now = Date.now();
        const remainingTime = Math.max(0, Math.ceil((expectedEndTime - now) / 1000));
        
        self.postMessage({ type: 'tick', remainingTime });
        
        // If the timer has expired, clear the interval and send complete message
        if (remainingTime <= 0) {
          if (timerId !== null) {
            clearInterval(timerId);
            timerId = null;
          }
          // Make sure to send the complete message
          self.postMessage({ type: 'complete' });
        }
      }, 100);
    }
  }
};

// Export an empty object to satisfy TypeScript
export {}; 