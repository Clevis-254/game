import Banner from "../Banner.jsx";
import "../../styles/index.css";
import { Hero } from "./Components/Hero.jsx";
import { Features } from "./Components/Features.jsx";
import { Story } from "./Components/Story.jsx";
import GameLogic from "@/Game/GameLogic.jsx";
import {useRef, useState} from "react";
import {Console} from "@/Pages/Play/Components/Console/Console.jsx";

export function Play() {

    // Ref used in handling posting from GameLogic.jsx to Console.jsx
    const consoleRef = useRef()
    // Ref used to allow GameLogic.jsx to edit the transcript printing element in console
    const transcriptRef = useRef()

    // Used in sending commands from Console.jsx to GameLogic.jsx. More info in both files
    const [commandToGameTrigger, setCommandToGameTrigger] = useState(true)
    const consoleToGameCommandRef = useRef("")

    // Links posting from GameLogic.jsx to Console.jsx
    function postGameLogicToConsole (message, speaker) {
        if (consoleRef.current){
            // IDE error as current is defined at runtime, so it does run as intended.
            consoleRef.current.callPostToConsole(message, speaker)
        }
    }

    return (
        <>
            <Banner />
            <Hero />
            <Features />
            <Banner />
            <Story />
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
    );
}