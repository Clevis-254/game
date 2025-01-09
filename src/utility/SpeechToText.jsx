import React, { useEffect, useRef, useState } from 'react';

const SpeechToText = ({ onTextReady }) => {
    const recognitionRef = useRef(null);
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        if ('SpeechRecognition' in window) {
            recognitionRef.current = new window.SpeechRecognition();
        } else if ('webkitSpeechRecognition' in window) {
            recognitionRef.current = new window.webkitSpeechRecognition();
        } else {
            console.error('Web Speech API is not supported in this browser.');
            alert('Web Speech API is not supported in this browser.');
        }

        if (recognitionRef.current) {
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                const speechToText = event.results[event.results.length - 1][0].transcript.trim();
                setTranscript(speechToText);
                if (onTextReady) {
                    onTextReady(speechToText);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error', event);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    recognitionRef.current.start();
                }
            };

            recognitionRef.current.start();
            setIsListening(true);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [isListening, onTextReady]);

    return null;
};

export default SpeechToText;