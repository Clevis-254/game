import React, { useEffect, useRef } from 'react';

const SpeechToText = ({ onTextReady }) => {
    const recognitionRef = useRef(null); // Reference to the SpeechRecognition instance
    const isListeningRef = useRef(false); // Flag to track if recognition is active
    const isRestartingRef = useRef(false); // Flag to prevent double restart

    useEffect(() => {
        // Check if the browser supports the Web Speech API
        if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
            console.error('Web Speech API is not supported in this browser.');
            alert('Web Speech API is not supported in this browser.');
            return;
        }

        // Initialize SpeechRecognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'en-US'; // Set language to English
        recognitionRef.current.interimResults = false; // Disable interim results
        recognitionRef.current.maxAlternatives = 1; // Limit to one alternative

        // Handle recognition results
        recognitionRef.current.onresult = (event) => {
            const speechToText = event.results[event.results.length - 1][0].transcript.trim();
            console.log('Transcribed Text:', speechToText);
            if (onTextReady) {
                onTextReady(speechToText); // Pass the transcribed text to the callback
            }
        };

        // Handle recognition errors
        recognitionRef.current.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isListeningRef.current = false;
            isRestartingRef.current = false;
        };

        // Handle recognition end
        recognitionRef.current.onend = () => {
            // Restart recognition if it is still active
            if (isListeningRef.current && !isRestartingRef.current) {
                isRestartingRef.current = true; // Prevent double restart
                setTimeout(() => {
                    try {
                        recognitionRef.current.start(); // Restart recognition
                        isRestartingRef.current = false;
                    } catch (error) {
                        console.error('Failed to restart SpeechRecognition:', error.message);
                        isRestartingRef.current = false;
                        isListeningRef.current = false; // Stop listening if restart fails
                    }
                }, 100); // Add delay to avoid race conditions
            }
        };

        // Start recognition
        if (!isListeningRef.current) {
            try {
                recognitionRef.current.start(); // Start recognition
                isListeningRef.current = true;
            } catch (error) {
                console.error('Failed to start SpeechRecognition:', error.message);
                isListeningRef.current = false;
            }
        }

        // Cleanup on unmount
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop(); // Stop recognition
                isListeningRef.current = false;
                isRestartingRef.current = false;
            }
        };
    }, [onTextReady]);

    return null; // This component does not render anything
};

export default SpeechToText;
