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
    // Lets the game know what to do post fight
    let opponent = useRef(0)

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
        console.log(`commandRef thing ran with command ${consoleToGameCommandRef.current}`)
        if (isInitialRenderConsoleToGame.current) {
            isInitialRenderConsoleToGame.current = false
            return
        }
        // TODO STAT TRACK : Don't do the tracking of commands here, do it in Console.jsx as not
        //  all commands are passed to this component.
        // Check the incoming command
        switch (consoleToGameCommandRef.current) {
            case "start game":
                // startGame()
                debugGame()
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
                // Dont run if the input is blank (from re-rendering)
            if (consoleToGameCommandRef !==""){
                switch (waitingForUserInput.current){
                    case "Forest":
                        if (consoleToGameCommandRef.current === "left"){forestLeft()}
                        else if (consoleToGameCommandRef.current === "right"){forestRight()}
                        // TODO : integrate tts
                        else {postTextToConsole(`Please pick either "left" or "right"`, "")}
                        waitingForUserInput.current = ""
                        break
                    case "Combat":
                        switch (consoleToGameCommandRef.current){
                            case "slash":
                            case "stab":
                            case "parry slash":
                            case "parry stab":
                                combatMove(consoleToGameCommandRef.current)
                                break
                            default:
                                postTextToConsole("Not a valid move. Use help combat to learn more", "")
                                break
                        }
                        postTextToConsole("Pick your move!", "")
                        break
                    case "riddleStart":
                        switch (consoleToGameCommandRef.current){
                            case "up":
                            case "right":
                            case "left":
                                riddleSearchWrong()
                                break
                            case "down":
                                riddleFound()
                                break
                            default:
                                postTextToConsole("Not a place to search on the wall. Try again", "")
                        }
                        break
                    case "Riddle":
                        switch (consoleToGameCommandRef.current){
                            case "door":
                            case "a door":
                                riddleDoorOpen()
                                break
                            default:
                                postTextToConsole("That is not the answer. Guess again", "")
                        }
                        break
                    case "forestObstacle":
                        if (consoleToGameCommandRef.current === "hint"){
                            forestRight()
                        }
                        else if (consoleToGameCommandRef.current === forestObstacleOrder[forestObstacleProgress.current]){
                            postTextToConsole("Correct guess, move forward", "")
                            forestObstacleProgress.current++
                            if(forestObstacleProgress.current === 6){
                                postTextToConsole("You made it past the traps!", "")
                                riddleStart()
                            }
                        } else if (consoleToGameCommandRef.current === "crouch" || consoleToGameCommandRef.current === "jump"){
                            if (obstacleStamina.current !== 0){
                                obstacleStamina.current--
                                postTextToConsole(`The trap pushes Musashi but he manages to stabalise himself. He can only do this ${obstacleStamina.current} more times before he falls!`, "")
                            } else {
                                postTextToConsole("Musashi was knocked into the ocean! Game Over.", "")
                                endGame(true)
                            }
                        } else {
                            postTextToConsole(`Not a valid option. Please say "jump" or "crouch"`, "")
                        }
                    default:
                        console.log("GameLogic:Not a command match")
                }
            }
        }
        consoleToGameCommandRef.current = ""
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
        forestObstacleProgress.current = 0
        obstacleStamina.current = 5
        // Just to make sure the transcript is printed before this.
        await new Promise(resolve => setTimeout(resolve, 300))
        delayedPosition.current = 0
        if(restart){
            postTextToConsole("Starting game from the beginning.", "Console")
            transcriptInterrupt.current = false
            startGame()
        } else {
            postTextToConsole("Game session ended.", "Console")
        }
    }

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


    // Used whilst debugging as a "startGame" replacement so we can start where we want
    async function debugGame(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;
            postTextToConsole("debug game started", "")
            // ending()

            forestRight()
            // First fight
            // opponent.current = 1
            // startCombat()
            resolve()
        })
    }

    async function riddleStart(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;
            console.log("we riddlin'")

            audioRef.current.src = "./src/Audio/Narration/riddleIntro.mp3"
            transcriptOutput("riddleIntro")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            postTextToConsole("Do you want to look left, right, up, or down?", "")
            waitingForUserInput.current = "riddleStart"
            resolve()
        })
    }

    // When the player is looking at the wrong spot on the wall
    async function riddleSearchWrong(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            waitingForUserInput.current = ""
            audioRef.current.src = "./src/Audio/Narration/notHere.mp3"
            transcriptOutput("notHere")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})
            waitingForUserInput.current = "riddleStart"

            resolve()
        })
    }
    // When the player finds the riddle
    async function riddleFound(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            waitingForUserInput.current = ""
            audioRef.current.src = "./src/Audio/Narration/ahRiddle.mp3"
            transcriptOutput("ahRiddle")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            audioRef.current.src = "./src/Audio/Narration/riddle.mp3"
            transcriptOutput("riddle")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            waitingForUserInput.current = "Riddle"

            resolve()
        })
    }

    // When the player answers the riddle correctly
    async function riddleDoorOpen(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            waitingForUserInput.current = ""
            audioRef.current.src = "./src/Audio/Narration/openDoor.mp3"
            transcriptOutput("openDoor")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            finale()

            resolve()
        })
    }

    async function finale(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            audioRef.current.src = "./src/Audio/Narration/finale.mp3"
            transcriptOutput("finale")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            opponent.current = 2
            startCombat()
            resolve()
        })
    }
    async function ending(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            audioRef.current.src = "./src/Audio/Narration/ending.mp3"
            transcriptOutput("ending")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})
            postTextToConsole("You just finished Toxic Rōnin", "")
            endGame()
            resolve()
        })
    }

    async function temp1(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            resolve()
        })
    }
    async function temp2(){
        await new Promise(async (resolve, reject) => {
            cancelGame = reject;

            resolve()
        })
    }




            // TODO STAT TRACK : Alternative place(s) to put the heatmap data instead of the switch, I
    //  would personally recommend the switch to keep code cleaner and keep heatmap tracking code bundled
    // Picked left on forest branching choice (fight)
    async function forestLeft(){
        postTextToConsole("You picked 'left'", "")
        await new Promise(async (resolve, reject) => {
            cancelGame = reject

            audioRef.current.src = "./src/Audio/Narration/forestFight.mp3"
            transcriptOutput("forestFight")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            opponent.current = 1
            startCombat()

            resolve()
        })
    }
    const forestObstacleOrder = ["crouch", "crouch", "crouch", "jump", "crouch", "jump"]
    let forestObstacleProgress = useRef(0)
    // Picked right on forest branching choice (deal with trap)
    let obstacleStamina = useRef(5)
    async function forestRight(){
        postTextToConsole("You picked 'right'", "")
        await new Promise(async (resolve, reject) => {
            cancelGame = reject

            audioRef.current.src = "./src/Audio/Narration/forestObstacle.mp3"
            transcriptOutput("forestObstacle")
            audioStart()
            // Block until transcript and audio are done
            await new Promise(async resolve => {storyBlock=resolve})

            waitingForUserInput.current = "forestObstacle"
            postTextToConsole(`Say crouch, or jump in line with Musashis guess. Say "hint" in order to hear the dialogue again`, "")

            resolve()
        })
    }


    async function startCombat(){
        await new Promise(async (resolve, reject) => {
            // TODO CHECK IF THIS WORKS
            cancelGame = reject

            // TODO : Check if removing the second quotes for no speaker actually has an effect
            postTextToConsole("You have entered battle!", "")
            postTextToConsole("Use the help combat command to learn about combat", "")
            playerHealth.current = 100
            enemyHealth.current = 100
            firstTurn.current = true
            waitingForUserInput.current = "Combat"
            postTextToConsole("Pick your first move!", "")
            resolve()
        })
    }

    let playerHealth = useRef(100)
    let enemyHealth = useRef(100)
    // 0 = No one stunned. 1 = Player stunned. 2 = Enemy stunned
    let stunned = useRef(0)
    let playerChargingStab = useRef(false)
    let enemyChargingStab = useRef(false)
    const cTextPlayerParrySuccess = "You predicted the enemy and parried their attack!"
    const cTextEnemyParrySuccess = "The enemy predicted you and parried your attack!"
    const cTextPlayerStunned = "You are stunned for the next turn!"
    const cTextEnemyStunned = "The enemy is stunned for the next turn!"
    const cTextEnemySlash = "The enemy slashes his sword towards you!"
    const cTextEnemyStab = "The enemy stabs his sword towards you!"
    const cTextPlayerStabCharge = "You pull back your sword and strengthen your stance in " +
        "preparation to stab your opponent next turn!"
    const cTextEnemyStabCharge = "The enemy pulls his sword back and strengthens his stance in " +
        "preparation to stab you next turn!"
    const cTextEnemyParrySlash = "The enemy used parry slash!"
    const cTextEnemyParryStab = "The enemy used parry stab!"

    let firstTurn = useRef(true)
    function combatMove(movePicked){

        // Run enemy move AI
        const enemyMovePicked = enemyMoveAI()
        // Stun logic already handled. Resetting it here so the AI can take advantage of you being stunned
        if(stunned.current === 1){stunned.current = 0}
        console.log(`enemy move picked ${enemyMovePicked}`)

        // Enemy parry logic
        // Enemy parried slash
        if(movePicked === "slash" &&  enemyMovePicked === "parry slash"){
            // If the player swapped from charging stab and go parried, stun them
            if(playerChargingStab.current){
                stunned.current = 1
                postTextToConsole(cTextEnemyParrySuccess, "")
                postTextToConsole(cTextPlayerStunned, "")
                // TODO refactor this with stunned only being for the enemy
                // If the player is stunned automatically do the next move
                postTextToConsole("You were stunned and so your move was skipped!", "")
                combatMove("")
                return
            } else {
                postTextToConsole(cTextEnemyParrySuccess, "")
                return
            }
        // Enemy parried stab
        } else if (movePicked === "stab" && enemyMovePicked === "parry stab" && playerChargingStab.current){
            stunned.current = 1
            playerChargingStab.current = false
            postTextToConsole(cTextEnemyParrySuccess, "")
            postTextToConsole(cTextPlayerStunned, "")
            // TODO refactor this with stunned only being for the enemy since its not needed now for the player
            // If the player is stunned automatically do the next move
            postTextToConsole("You were stunned and so your move was skipped!", "")
            combatMove("")
            return
        }

        // Player parry logic
        // Player parried slash
        if(movePicked === "parry slash" &&  enemyMovePicked === "slash"){
            // If the player swapped from charging stab and go parried, stun them
            if(enemyChargingStab.current){
                stunned.current = 2
                postTextToConsole(cTextPlayerParrySuccess, "")
                postTextToConsole(cTextEnemyStunned, "")
                return
            } else {
                postTextToConsole(cTextPlayerParrySuccess, "")
                return
            }
            // Player parried stab
        } else if (movePicked === "parry stab" && enemyMovePicked === "stab" && enemyChargingStab.current === true){
            stunned.current = 2
            enemyChargingStab.current = false
            postTextToConsole(cTextPlayerParrySuccess, "")
            postTextToConsole(cTextEnemyStunned, "")
            return
        }
        // If they didn't pick stab a second time, wipe their stab status
        if(movePicked !== "stab"){playerChargingStab.current = false}
        if(enemyMovePicked !== "stab"){enemyChargingStab.current = false}

        let damage = 0
        // Handle player move
        if(movePicked === "slash"){damage = 30; playerChargingStab.current = false}
        else if (movePicked === "stab" && playerChargingStab.current === true){damage = 70; playerChargingStab.current = false}
        else if (movePicked === "stab"){postTextToConsole(cTextPlayerStabCharge, ""); playerChargingStab.current = true}
        let damageMessage = ` and did ${damage} damage`

        // Don't run when the player is charging
        if(!playerChargingStab.current && movePicked !== ""){postTextToConsole(`You picked ${movePicked}${damageMessage}!`, "")}
        enemyHealth.current -= damage

        // If the enemy has been killed
        if (enemyHealth.current <= 0){
            waitingForUserInput.current = ""
            postTextToConsole("You killed your foe and won the fight!", "")
            // Only two opponents in the game so 1 = Forest, 2 = Ending
            // TODO implement ending
            if (opponent.current === 1){
                riddleStart()
            } else if (opponent.current === 2) {
                ending()
            }
            return
        }

        // Handle enemy move
        damage = 0
        if(enemyMovePicked === "slash"){damage = 30; enemyChargingStab.current = false}
        else if (enemyMovePicked === "stab" && enemyChargingStab.current === true){damage = 70; enemyChargingStab.current = false}
        else if (enemyMovePicked === "stab"){postTextToConsole(cTextEnemyStabCharge, ""); enemyChargingStab.current = true}
        damageMessage = ` and did ${damage} damage`

        // Don't run when enemy is charging
        if(!enemyChargingStab.current && stunned.current !== 2){postTextToConsole(`The enemy picked ${enemyMovePicked}${damageMessage}!`, "")}
        playerHealth.current -= damage

        // If the player has been killed
        if (playerHealth.current <= 0){
            postTextToConsole("You have been killed and lost the fight. Game over.", "")
            waitingForUserInput.current = ""
            endGame(true)
            return
        }
        if(stunned.current === 2){postTextToConsole("The enemy was stunned and so their move was skipped!", ""); stunned.current = 0}

        // Remaining health
        postTextToConsole(`You have ${playerHealth.current} health remaining and the enemy has ${enemyHealth.current} remaining!`, "")
    }

    // TODO : The random math on this I don't think is working. Enemy parried when he had charged.
    function enemyMoveAI(){
        // If it's the first move, pick randomly (except parry stab since it won't be turn 1 charged)
        if(firstTurn.current){
            firstTurn.current = false
            console.log("ENEMY AI : first turn")
            return randomMove(1, 3)
        }
        // If the enemy is stunned, don't return a move
        if (stunned.current === 2){
            console.log("ENEMY AI : enemy stunned")
            return ""
        }
        // If you are charging a stab, he will always pick one of the two parries
        else if(playerChargingStab.current){
            console.log("ENEMY AI : player charging stab")
            return randomMove(3, 4)
        }
        // If he is charging (and you aren't) then he will either stab or slash
        else if (enemyChargingStab.current){
            console.log("ENEMY AI : enemy charging stab")
            return randomMove(1,2)
        }
        // If you are stunned, he will always slash to take advantage
        else if (stunned.current === 1){
            console.log("ENEMY AI : player stunned")
            return "slash"
        }
        // If none of the above, pick randomly (except parry stab as it can't be charging)
        console.log("ENEMY AI : no match. Random move")
        return randomMove(1,4)
        // Note Javascript random sucks as it picks the same number over and over often
        function randomMove(min, max){
            // Pick a random number between min-max
            // 1 = Slash, 2 = Stab, 3 = Parry Slash, 4 = Parry Stab
            const enemyMoveNum = Math.floor(Math.random() * (max - min + 1)) + min
            switch (enemyMoveNum){
                case 1:
                    return "slash"
                case 2:
                    return "stab"
                case 3:
                    return "parry slash"
                case 4:
                    return "parry stab"
            }
        }
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
            // TODO : Hacky solution. For some reason if the transcript solves before the audio then story block works
            //  but it should not matter
            await new Promise(resolve => setTimeout(resolve, 1000))
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