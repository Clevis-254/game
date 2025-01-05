import Banner from "../Banner.jsx";
import "../../styles/index.css";
import { Hero } from "./Components/Hero.jsx";
import { Features } from "./Components/Features.jsx";
import { Story } from "./Components/Story.jsx";

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
        </>
    );
}