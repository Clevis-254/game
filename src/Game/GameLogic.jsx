import {useState, useRef, useEffect} from 'react'
import transcripts from "../Audio/Narration/transcripts.jsx";

export function GameLogic({ postTextToConsole, transcriptRef,
                              commandToGameTrigger, setCommandToGameTrigger, consoleToGameCommandRef}) {
    const audioRef = useRef(null)

    // When the page first loads, create an audio player not attached to the DOM, so it isn't visible.
    useEffect(() => {
        const audioPlayer = document.createElement("audio")
        audioPlayer.src = audioSourceURL
        audioRef.current = audioPlayer
    }, [])
    const audioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
        }
    }
    const audioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }
    const audioSpeedUp = () => {
        if (audioRef.current && audioRef.current.playbackRate < 3) {
            audioRef.current.playbackRate += 0.5;
        }
    }
    const audioSlowDown = () => {
        if (audioRef.current) {
            audioRef.current.playbackRate = Math.max(0.5, audioRef.current.playbackRate - 0.5);
        }
    }
    const audioRewind = (seconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
        }
    }

    const audioSourceURL = "./src/Audio/Narration/Intro.mp3"

    // useEffect to get commands from the console to gameLogic
    // Uses a state variable to trigger this function, then uses a ref to change the value again
    // without re-rendering. Uses isInitialRenderConsoleToGame so it doesn't run on initial render
    const isInitialRenderConsoleToGame = useRef(true);
    useEffect(() => {
        if (isInitialRenderConsoleToGame.current) {
            isInitialRenderConsoleToGame.current = false
            return
        }
        switch (consoleToGameCommandRef.current) {
            case "start game":
                startGame()
                break
            case "play":
                audioPlay()
                break
            case "pause":
                audioPause()
                break
            case "speed up":
                audioSpeedUp()
                break
            case "slow down":
                audioSlowDown()
                break
            // TODO : USE STRING PARSING TO ADD CUSTOM PARAMETERS....
            case "rewind":
                audioRewind(10)
                break
            default:
                console.log("GameLogic:Not a command match")
        }
    },[commandToGameTrigger])

    function startGame(){
        audioPlay()
        transcriptOutput("Intro")
    }

    async function transcriptOutput(transcriptName) {
        // Find the desired transcript
        let transcriptText
        for (const [key, value] of Object.entries(transcripts)) {
            if (key === transcriptName) {
                transcriptText = value
            }
        }
        let delayedTranscript = ""
        for (const char of transcriptText) {
            // ^ in the transcript = 1s delay
            if (char === "^") {
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else if(char === " "){
                await new Promise(resolve => setTimeout(resolve, 0));
                delayedTranscript += char;
            } else {
                await new Promise(resolve => setTimeout(resolve, 80));
                delayedTranscript += char;
            }
            transcriptRef.current.innerHTML = delayedTranscript
        }
        transcriptRef.current.innerHTML = ""
        postTextToConsole(delayedTranscript, "")
    }
    return(
        <>
        </>
    )
}

export default GameLogic