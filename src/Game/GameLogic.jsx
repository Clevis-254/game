import {useState, useRef, useEffect} from 'react'
import transcripts from "../Audio/Narration/transcripts.jsx";

export function GameLogic({ postTextToConsole, transcriptRef,
                              commandToGameTrigger, setCommandToGameTrigger, consoleToGameCommandRef}) {

    const audioRef = useRef(null)
    const waitingForUserInput = useRef("")
    let transcriptInterrupt = useRef(false)
    let delayedPosition = useRef(0)
    let isTranscriptRunning = useRef(false)
    let transcriptRewindSeconds = useRef(0)
    // TODO remove all references of this in the code and replace it directly with audioRef.current.playbackRate
    let audioSpeed = useRef(1)

    // When the page first loads, create an audio player not attached to the DOM, so it isn't visible.
    useEffect(() => {
        audioRef.current = document.createElement("audio")
        // TODO look into axing this function and event handlers we handle it elsewhere now
        const handleAudioEnd = () => {
            console.log("audio finished")
        }
        audioRef.current.addEventListener("ended", handleAudioEnd)
        // Clean up the listener
        return () => {
            audioRef.current.removeEventListener("ended", handleAudioEnd)
        }
    }, [])

    const audioStart = async () => {
        return new Promise((resolve) => {
            const onAudioEnd = () => {
                audioRef.current.removeEventListener('ended', onAudioEnd)
                resolve()
            }
            audioRef.current.playbackRate = audioSpeed.current
            audioRef.current.addEventListener('ended', onAudioEnd);
            audioRef.current.play().catch((error) => {
                console.error('Error playing audio:', error)
                resolve()
            });
        })
    }
    const audioPlay = () => {
        if (audioRef.current) {
            audioRef.current.play();
            // TODO : TEMP REPLACE HARD CODED + MAKE IT SO PLAY DOESNT RUN THE TRANSCRIPT IF THERES NO AUDIO
            transcriptOutput("forestIntro")
        }
    }
    const audioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            transcriptInterrupt.current = true
        }
    }
    const audioSpeedUp = () => {
        if (audioRef.current && audioRef.current.playbackRate < 3) {
            audioSpeed.current = audioRef.current.playbackRate += 0.5;
        }
    }
    // TODO use the same IF statement as above but for != 0.5 to remove the math.max function
    //  and simplify code
    const audioSlowDown = () => {
        if (audioRef.current) {
            audioRef.current.playbackRate = audioSpeed.current
                = Math.max(0.5, audioRef.current.playbackRate - 0.5);
        }
    }
    const audioRewind = (seconds) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - seconds);
            transcriptInterrupt.current = true
            transcriptRewindSeconds.current = seconds
        }
    }

    let audioSourceURL = ""

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
            case "end game":
                endGame()
                break
            case "restart":
                endGame(true)
                break
            // TODO : consider setting the command ref to blank to prevent double commands on re-renders
            default:
                // Used for in game path branching
                switch (waitingForUserInput.current){
                    case "Forest":
                        if (consoleToGameCommandRef.current === "left"){forestLeft()}
                        else if (consoleToGameCommandRef.current === "right"){forestRight()}
                        // TODO : integrate tts
                        else {postTextToConsole(`Please pick either "left" or "right"`)}
                        break
                    default:
                        console.log("GameLogic:Not a command match")
                }
        }
    },[commandToGameTrigger])

    // Resets all possible variables it can.
    async function endGame(restart){
        if (cancel) cancel("Ended Game")
        audioPause()
        transcriptInterrupt.current = true
        gameStarted.current = false
        // Just to make sure the transcript is printed before this.
        await new Promise(resolve => setTimeout(resolve, 300))
        delayedPosition.current = 0
        if(restart){
            postTextToConsole("Starting game from the beginning.", "Console")
            startGame()
        } else {
            postTextToConsole("Game session ended.", "Console")
        }
    }

    let gameStarted = useRef(false)

    let cancel
    async function startGame() {
        // Prevents this from running multiple times
        if (gameStarted.current === true){
            postTextToConsole("The game is already started", "Console")
            return
        }
        gameStarted.current = true
        await new Promise(async (resolve, reject) => {
            cancel = reject;
            // Intro
            audioRef.current.src = "./src/Audio/Narration/Intro.mp3"
            transcriptOutput("Intro")
            await audioStart()
            // Forest
            audioRef.current.src = "./src/Audio/Narration/forestIntro.mp3"
            transcriptOutput("forestIntro")
            await audioStart()
            waitingForUserInput.current = "Forest"
            // TODO : integrate tts
            // Slight delay to make sure the transcript is printed.
            await new Promise(resolve => setTimeout(resolve, 300))
            postTextToConsole("Choose your path. Do you want to go left or right?", "")
        })
    }

    // TODO : Develop on next issue
    async function forestLeft(){
        postTextToConsole("You picked 'left'", "")
    }
    // TODO : Develop on next issue
    async function forestRight(){
        postTextToConsole("You picked 'right'", "")
    }

    // TODO : Perhaps add another symbol to the transcripts to make a new paragraph
    async function transcriptOutput(transcriptName) {
        // Prevents this from running multiple times
        if (isTranscriptRunning.current){return}
        isTranscriptRunning.current = true
        // TODO : make finding the transcript text its own function so it only gets run when it needs to
        // Find the desired transcript
        let transcriptText
        for (const [key, value] of Object.entries(transcripts)) {
            if (key === transcriptName) {
                transcriptText = value
            }
        }
        let delayedTranscript = ""
        let char = ""
        // This is for when we use ^ for a second-long delay
        let transcriptDelayTimer
        let transcriptCharacterDelayTimer
        for (let i=delayedPosition.current; i < transcriptText.length; i++) {
            char = transcriptText[i]

            transcriptDelayTimer = 1000 / audioSpeed.current
            transcriptCharacterDelayTimer = 80 / audioSpeed.current
            if (transcriptInterrupt.current === false){
                // ^ in the transcript = 1s delay
                if (char === "^") {
                    await new Promise(resolve => setTimeout(resolve, transcriptDelayTimer))
                } else if(char === " "){
                    await new Promise(resolve => setTimeout(resolve, 0))
                    delayedTranscript += char
                } else {
                    await new Promise(resolve => setTimeout(resolve, transcriptCharacterDelayTimer))
                    delayedTranscript += char
                }
                transcriptRef.current.innerHTML = delayedTranscript
                // Transcript was interrupted
            } else {
                transcriptRef.current.innerHTML = ""
                postTextToConsole(delayedTranscript, "")

                delayedPosition.current = i

                // Go in reverse, adding up all the ms that the chars will take to traverse, then once
                // it matches the seconds (within a small range not exact) we pick that position
                if (transcriptRewindSeconds.current !== 0){
                    let timeAddition = 0
                    for(let i=delayedPosition.current;i>=0;i--){
                        if(transcriptText[i] === "^"){
                            timeAddition += transcriptDelayTimer
                        } if (transcriptText[i] === " "){} // Add nothing
                        else {
                            timeAddition += transcriptCharacterDelayTimer
                        }
                        console.log(timeAddition)
                        if (timeAddition >= (transcriptRewindSeconds.current * 1000)){
                            delayedPosition.current = i
                            break
                        }
                    }
                    // If time addition never met the rewind amount, then we must have hit the start of the rewind
                    if (timeAddition < (transcriptRewindSeconds.current * 1000)){delayedPosition.current = 0}
                    // delayedPosition.current =  Math.round(Math.max(0, delayedPosition.current -= (1000 / 80)))
                }
                // TODO : figure out if this break is even needed
                break
            }
        }
        // Don't run if the transcript was interrupted
        if (transcriptInterrupt.current === false) {
            // Clear the transcript element, post whole transcript to console
            transcriptRef.current.innerHTML = ""
            postTextToConsole(delayedTranscript, "")
            delayedPosition.current = 0
            isTranscriptRunning.current = false
            // Reset transcript interrupt
        } else {
            transcriptInterrupt.current = false
            isTranscriptRunning.current = false
        }
        if (transcriptRewindSeconds.current !== 0){
            transcriptOutput(transcriptName)
            // The amount of time to rewind had already been calculated in this final pass.
            transcriptRewindSeconds.current = 0
        }
    }
    return(
        <>
        </>
    )
}

export default GameLogic