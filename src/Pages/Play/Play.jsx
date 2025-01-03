import Banner from "../Banner.jsx";
import "../../styles/index.css";
import { Hero } from "./Components/Hero.jsx";
import { Features } from "./Components/Features.jsx";
import { Story } from "./Components/Story.jsx";
import GameLogic from "@/Game/GameLogic.jsx";
import {useRef, useState} from "react";
import {Console} from "@/Pages/Play/Components/Console/Console.jsx";

export function Play() {

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