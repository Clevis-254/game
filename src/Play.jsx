import { Console } from "./Console/Console.jsx"
import Banner from "./Banner.jsx";
import GameLogic from "./Game/GameLogic.jsx";
import {forwardRef, useRef, useState} from "react"

export function Play(){

    const [gameStarted, setGameStarted] = useState(false)

    const consoleRef = useRef()
    const transcriptRef = useRef()

    function postGameLogicToConsole (message, speaker) {
        if (consoleRef.current){
            // IDE error as current is defined at runtime, so it does run as intended.
            consoleRef.current.callPostToConsole(message, speaker)
        }
    }

    return (
        <>
        <h1>Play</h1>
            <Banner />
            <Console ref={consoleRef} transcriptRef={transcriptRef} setGameStarted={setGameStarted} />
            <GameLogic transcriptRef={transcriptRef} gameStarted={gameStarted} setGameStarted={setGameStarted}
                       postTextToConsole={postGameLogicToConsole}/>
        </>
    )
}