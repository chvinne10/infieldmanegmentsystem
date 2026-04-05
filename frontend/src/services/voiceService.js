/**
 * Voice Assistant Service - Text to Speech
 */

let synth = null;
let utterance = null;

export const initializeVoiceAssistant = () => {
  if ('speechSynthesis' in window) {
    synth = window.speechSynthesis;
  }
};

export const speakTask = (task) => {
  if (!synth) {
    initializeVoiceAssistant();
  }

  if (!synth) {
    console.error('Speech synthesis not available');
    return;
  }

  // Cancel any ongoing speech
  synth.cancel();

  const time = new Date(task.scheduled_time).toLocaleTimeString();
  const text = `Your next visit is at ${time} to ${task.client_name} at ${task.location}. ${task.purpose || ''}`;

  utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  synth.speak(utterance);
};

export const stopSpeaking = () => {
  if (synth) {
    synth.cancel();
  }
};

export const isSpeaking = () => {
  return synth?.speaking || false;
};

// Voice Recognition
export const startVoiceRecognition = (onResult, onError) => {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    console.error('Speech recognition not available');
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    console.log('Voice recognition started');
  };

  recognition.onresult = (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join('');
    onResult(transcript);
  };

  recognition.onerror = (event) => {
    onError(event.error);
  };

  recognition.onend = () => {
    console.log('Voice recognition ended');
  };

  recognition.start();
  return recognition;
};
