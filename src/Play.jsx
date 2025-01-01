import { Console } from "./Console/Console.jsx"
import Banner from "./Banner.jsx";
import GameLogic from "./Game/GameLogic.jsx";
import { useRef, useState } from "react"

export function Play(){

    const consoleRef = useRef()
    const transcriptRef = useRef()

    const [commandToGameTrigger, setCommandToGameTrigger] = useState(true)
    const consoleToGameCommandRef = useRef("")

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
            <Console ref={consoleRef}
                     transcriptRef={transcriptRef}
                     commandToGameTrigger={commandToGameTrigger}
                     setCommandToGameTrigger={setCommandToGameTrigger}
                     consoleToGameCommandRef={consoleToGameCommandRef} />
            <GameLogic transcriptRef={transcriptRef}
                       postTextToConsole={postGameLogicToConsole}
                       commandToGameTrigger={commandToGameTrigger}
                       setCommandToGameTrigger={setCommandToGameTrigger}
                       consoleToGameCommandRef={consoleToGameCommandRef}/>
        </>
    )
}