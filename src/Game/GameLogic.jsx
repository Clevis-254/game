import {useState, useRef, useEffect} from 'react'
import transcripts from "../Audio/Narration/transcripts.jsx";

export function GameLogic({gameStarted, setGameStarted, postTextToConsole, transcriptRef}) {

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
        if (transcriptRef.current) {
            transcriptRef.current.innerHTML = "This text was updated by Child Two!";
        }
    }
    const audioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
        if (transcriptRef.current) {
            transcriptRef.current.innerHTML = "";
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

    // When gameStarted is updated (from running "start game" in the console) this is run
    useEffect(() => {
        if(gameStarted === true){
            startGame()
        }}, [gameStarted])

    function startGame(){
        console.log("startgame RAN")
        postTextToConsole("hello", "Joe")
    }

    return(
        <>
            <h1>{gameStarted.toString()}</h1>
            <button onClick={audioPlay}>Play</button>
            <button onClick={audioPause}>Pause</button>
            <button onClick={audioSpeedUp}>Speed Up</button>
            <button onClick={audioSlowDown}>Slow Down</button>
            <button onClick={() => audioRewind(5)}>Reverse5s</button>
        </>
    )
}

export default GameLogic