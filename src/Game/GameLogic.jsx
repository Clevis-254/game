import {useState, useRef, useEffect} from 'react'
import transcripts from "../Audio/Narration/transcripts.jsx";

export function GameLogic({gameStarted, setGameStarted, postTextToConsole}) {

    const [audioSpeed, setAudioSpeed] = useState(1)
    const audioRef = useRef(null)
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

    // When gameStarted is updated (from running "start game" in the console) this is run
    useEffect(() => {
        if(gameStarted === true){
            postTextToConsole("hello", "Joe")
            // startGame()
            // setGameConsoleText("AHHHH WE GOT IT FROM useeffect")
        }}, [gameStarted])

    function startGame(){
        // console.log("stargame RAN")
        // setGameConsoleText("Console : AHHHH WE GOT IT FROM startgame")
    }

    return(
        <>
            <h1>{gameStarted.toString()}</h1>
            <button onClick={audioPlay}>Play</button>
            <button onClick={audioPause}>Pause</button>
            <button onClick={audioSpeedUp}>Speed Up</button>
            <button onClick={audioSlowDown}>Slow Down</button>
            <button onClick={() => audioRewind(5)}>Reverse5s</button>
            <audio ref={audioRef} src={audioSourceURL} controls/>
        </>
    )
}

export default GameLogic