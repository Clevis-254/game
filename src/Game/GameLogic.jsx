import {useRef, useEffect} from 'react'
import transcripts from "../Audio/Narration/transcripts.jsx";


// TODO STAT TRACKING : Please keep in mind the project brief encourages us to use any additional statistics
//  that we think might be valuable to the client so think of extras and implement some of the (optional)
//  ones I have marked that aren't directly project brief related.

// TODO : Print transcripts current output when the page is exited / reloaded so we can get a better idea
//   on where we left off
export function GameLogic({ postTextToConsole, transcriptRef,
                              commandToGameTrigger, setCommandToGameTrigger, consoleToGameCommandRef}) {

    const audioRef = useRef(null)
    const waitingForUserInput = useRef("")
    // Set to true when a command is played to interrupt the currently running transcript
    let transcriptInterrupt = useRef(false)
    // Set the position we start at when transcribing
    let delayedPosition = useRef(0)
    // Stops multiple runs of transcript function
    let isTranscriptRunning = useRef(false)
    let transcriptRewindSeconds = useRef(0)
    // TODO remove all references of this in the code and replace it directly with audioRef.current.playbackRate
    let audioSpeed = useRef(1)
    let transcriptNameRef = useRef("")
    let audioFinished = useRef(false)

    // When the page first loads, create an audio player not attached to the DOM, so it isn't visible.
    useEffect(() => {
        audioRef.current = document.createElement("audio")
        // TODO look into axing this function and event handlers we handle it elsewhere now
        const handleAudioEnd = () => {
            console.log("audio finished")
            checkStoryBlock()
            audioFinished.current = true
        }
        audioRef.current.addEventListener("ended", handleAudioEnd)
        // Clean up the listener
        return () => {
            audioRef.current.removeEventListener("ended", handleAudioEnd)
        }
    }, [])

    // audio... functions for handling playing of audio + some transcript code
    const audioStart = async () => {
        return new Promise((resolve) => {
            // TODO STAT TRACK : (Optional) Could at the end of an audio add its length
            //  + any extra time from rewinding to a "total audio time" stat
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
            if(transcriptNameRef.current){transcriptOutput(transcriptNameRef.current)}
        }
    }
    const audioPause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            transcriptInterrupt.current = true
        }
    }
    // TODO : feedback to the user on current speed
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

    // useEffect to get commands from the console to gameLogic
    // Uses a state variable to trigger this function, then uses a ref to change the value again
    // without re-rendering. Uses isInitialRenderConsoleToGame so it doesn't run on initial render
    const isInitialRenderConsoleToGame = useRef(true);
    useEffect(() => {
        if (isInitialRenderConsoleToGame.current) {
            isInitialRenderConsoleToGame.current = false
            return
        }
        // TODO STAT TRACK : Don't do the tracking of commands here, do it in Console.jsx as not
        //  all commands are passed to this component.
        // Check the incoming command
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
            default:
                // TODO STAT TRACK : waitingForUserInput will match the current choice point, any
                //  thing added in this switch will need to be tracked. More to be added in the next
                //  game feature branch.
                // Used for in game path branching
                switch (waitingForUserInput.current){
                    case "Forest":
                        if (consoleToGameCommandRef.current === "left"){forestLeft()}
                        else if (consoleToGameCommandRef.current === "right"){forestRight()}
                        // TODO : integrate tts
                        else {postTextToConsole(`Please pick either "left" or "right"`)}
                        waitingForUserInput.current = ""
                        break
                    default:
                        console.log("GameLogic:Not a command match")
                }
        }
        consoleToGameCommandRef = ""
    },[commandToGameTrigger])

    // Will run a resolve on the current await promise being used to block story progress
    // Only runs if the audio and transcript is finished
    let storyBlock
    function checkStoryBlock(){
        if (storyBlock &&
            audioFinished.current === true &&
            delayedPosition.current === 0){
            audioFinished.current = false
            storyBlock("storyBlock ran")
        }
    }


    // Posts time played in seconds to server
    async function updateTimePlayed(gameSeconds){
        try {
            const response = await fetch("/user/stats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    timePlayed: gameSeconds,
                }),
            });

            if (!response.ok) {
                console.error(`Failed to update stats: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    // Stores the time the game starts
    let startTime = useRef(null)

    // TODO STAT TRACK : Add in-game tracking time here.
    let gameStarted = useRef(false)
    // Cancel holds the reject function of the promise. This allows us to cancel the function
    // from anywhere else in the code.
    let cancelGame
    async function startGame() {
        // Prevents this from running multiple times
        if (gameStarted.current === true){
            postTextToConsole("The game is already started", "Console")
            return
        }
        gameStarted.current = true
        startTime.current = new Date() // Tracks start time

        // Promise used to cancel the game at any point
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;
            // Intro
            // TODO STAT TRACK : Number of audio files played here and other similar code blocks
            // TODO make these 3 lines a function since it doesn't need to be repeated
            audioRef.current.src = "./src/Audio/Narration/Intro.mp3"
            transcriptOutput("Intro")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})
            // Forest
            audioRef.current.src = "./src/Audio/Narration/forestIntro.mp3"
            transcriptOutput("forestIntro")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})
            waitingForUserInput.current = "Forest"
            // Slight delay to make sure the transcript is printed.
            await new Promise(resolve => setTimeout(resolve, 300))
            // TODO : integrate tts
            postTextToConsole("Choose your path. Do you want to go left or right?", "")
            resolve()
        })
    }

    // TODO STAT TRACK : Stop the in game time tracking here
    //  Please note you might need to use useEffect or something of the
    //  sort that will track when the page is left / closed / reloaded
    //  by the user to stop the timer as well
    // Resets all possible variables it can and stops/restarts the game
    async function endGame(restart){
        if (cancelGame) cancelGame("Ended Game")
        audioPause()
        transcriptInterrupt.current = true
        gameStarted.current = false

        // Calculates how long the game lasted in seconds
        const elapsedTime = Math.floor((new Date() - startTime.current) / 1000)
        updateTimePlayed(elapsedTime)

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

    // Calculates time played in seconds when the page is closed.
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (gameStarted.current) {
                const elapsedTime = Math.floor((new Date() - startTime.current) / 1000)
                updateTimePlayed(elapsedTime)
            }
        }
        window.addEventListener('beforeunload', handleBeforeUnload)

        // Cleanup function to remove event listeners when the component is unmounted or game is stopped
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

    // TODO STAT TRACK : Alternative place(s) to put the heatmap data instead of the switch, I
    //  would personally recommend the switch to keep code cleaner and keep heatmap tracking code bundled
    // TODO : Develop on next issue
    // Picked left on forest branching choice
    async function forestLeft(){
        postTextToConsole("You picked 'left'", "")
    }
    // TODO : Develop on next issue
    // Picked right on forest branching choice
    async function forestRight(){
        postTextToConsole("You picked 'right'", "")
    }

    // TODO : Perhaps add another symbol to the transcripts to make a new paragraph
    // Called when we need to start transcribing a text in line with an audio.
    // Works by printing over the transcript letter by letter with a delay
    // For breaks in the audio with no dialogue it will parse a "^" as a 1 second delay
    async function transcriptOutput(transcriptName) {
        // Prevents this from running multiple times
        if (isTranscriptRunning.current){return}
        isTranscriptRunning.current = true
        // TODO : make finding the transcript text its own function so it only gets run when it needs to
        // Find the desired transcript out of the whole list in transcripts.jsx
        let transcriptText
        // Used for when we use the "play" command
        transcriptNameRef.current = transcriptName
        for (const [key, value] of Object.entries(transcripts)) {
            if (key === transcriptName) {
                transcriptText = value
            }
        }
        // This is the transcript as seen by the user on the page
        let delayedTranscript = ""
        // Current letter being iterated over
        let char = ""
        // This is for when we use ^ for a second-long delay
        let transcriptDelayTimer
        // Character delay
        let transcriptCharacterDelayTimer
        // Iterate over the transcript. Starts part way though if delayedPosition isn't 0 (for rewinding and pause/play)
        for (let i=delayedPosition.current; i < transcriptText.length; i++) {
            char = transcriptText[i]

            // Change the delay timer based on the audio speed, so they match.
            transcriptDelayTimer = 1000 / audioSpeed.current
            transcriptCharacterDelayTimer = 90 / audioSpeed.current
            // Interrupt if a process requires it
            if (transcriptInterrupt.current === false){
                // ^ in the transcript = 1s delay
                if (char === "^") {
                    await new Promise(resolve => setTimeout(resolve, transcriptDelayTimer))
                // No delay for spaces
                } else if(char === " "){
                    await new Promise(resolve => setTimeout(resolve, 0))
                    delayedTranscript += char
                // Regular character
                } else {
                    await new Promise(resolve => setTimeout(resolve, transcriptCharacterDelayTimer))
                    delayedTranscript += char
                }
                // Update the visual transcript
                transcriptRef.current.innerHTML = delayedTranscript
                // Transcript was interrupted
            } else {
                // Clear visual transcript then print what we processed to the console
                transcriptRef.current.innerHTML = ""
                postTextToConsole(delayedTranscript, "")

                // Set the delayed position to wherever we got interrupted
                delayedPosition.current = i

                // If we requested a rewind transcriptRewindSeconds will not be 0.
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
                        // We have roughly met the requested rewind.
                        if (timeAddition >= (transcriptRewindSeconds.current * 1000)){
                            delayedPosition.current = i
                            break
                        }
                    }
                    // If time addition never met the rewind amount, then we must have hit the start of the rewind
                    if (timeAddition < (transcriptRewindSeconds.current * 1000)){delayedPosition.current = 0}
                }
                // TODO : figure out if this break is even needed
                break
            }
        }
        // Don't run if the transcript was interrupted
        if (transcriptInterrupt.current === false) {
            // Clear the transcript element, post whole transcript to console, reset necessary variables
            transcriptRef.current.innerHTML = ""
            postTextToConsole(delayedTranscript, "")
            delayedPosition.current = 0
            isTranscriptRunning.current = false
            checkStoryBlock()
        // Transcript was interrupted
        } else {
            // Reset necessary variables
            transcriptInterrupt.current = false
            isTranscriptRunning.current = false
        }
        // If we called rewind, then play the transcript again but minus the calculated time
        // The amount of time to rewind had already been calculated in this final pass.
        if (transcriptRewindSeconds.current !== 0){
            transcriptRewindSeconds.current = 0
            transcriptOutput(transcriptName)
        }
    }
    return(
        <>
        </>
    )
}

export default GameLogic