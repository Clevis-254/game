import Banner from "../Banner.jsx";
import "../../styles/index.css";
import { Hero } from "./Components/Hero.jsx";
import { Features } from "./Components/Features.jsx";
import { Story } from "./Components/Story.jsx";
import GameLogic from "@/Game/GameLogic.jsx";
import {useRef, useState} from "react";
import {Console} from "@/Pages/Play/Components/Console/Console.jsx";

import { speakText } from '../../utility/Speech.jsx';
import { playVoiceDialogue, playSoundEffect, playMusic } from '../../utility/Audio.jsx';

const message = 'Welcome to the workout tracker. You can add a new workout by filling out the form below.';

const handleClick = () => {
    speakText(message);
  };

const handleClick2 = () => {
    playVoiceDialogue('/assets/voiceLine.mp3');
  };

const handleClick3 = () => {
    playMusic('/assets/short_opening_music_.mp3');
  };

const handleClick4 = () => {
    playSoundEffect('/assets/samurai_sword_clash.mp3');
  };

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
        <Story />
        <div>
            <p>{}</p>
            <button onClick={handleClick}>Speak</button>
        </div> 

        <div>
            <p>{}</p>
            <button onClick={handleClick2}>Voice line</button>
        </div> 

        <div>
            <p>{}</p>
            <button onClick={handleClick3}>music</button>
        </div> 

        <div>
            <p>{}</p>
            <button onClick={handleClick4}>Sfx</button>
        </div> 
        
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