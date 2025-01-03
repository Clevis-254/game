import {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react'

// NOTE : No game logic should be in this module.
// Accessibility logic is fine (e.g rewind to last dialogue)
// DESIGN NOTE : We fetch the entire console history every time we reload because this is a small game with few
// users. If we were to scale up then it would be worth doing only what is needed.

// TODO : Explore not using forwardRefs as they will be depreciated in future versions and perhaps using
//  useEffect to push custom requests similar to how you push commands from console>game
export const Console =
    forwardRef(function Console({transcriptRef, commandToGameTrigger,
                                    setCommandToGameTrigger, consoleToGameCommandRef}, ref) {

        // This allows us to add messages to the console from external components
        useImperativeHandle(ref,() => {
            return {
                callPostToConsole: (message, speaker) => {
                    post_new_input(message,speaker)
                }
            }
        })
        // TODO : If we are expected to actually deploy this then pull this from a file /
        //  dynamically find the base url
        // This base url for some reason is needed sometimes under contexts that
        // make no sense and probably will be needed in full deployment
        const BASEURL = "http://localhost:4173"
        const inputRef = useRef(null);

        // Container for the text actively being transcribed
        const transcriptContainerRef = useRef(null)

        const handleEnterKeyDown = (event) => {
            if (event.key === 'Enter') {
                new_console_input()
            }
        };

        // Removes/adds the element from the DOM when there is no/some text in it.
        useEffect(() => {
            if (transcriptRef.current) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList' || mutation.type === 'characterData') {
                            const transcriptContent = transcriptRef.current.innerHTML.trim()
                            if(transcriptContent !== ""){
                                if (transcriptContainerRef.current.contains(transcriptRef.current)) {
                                    transcriptContainerRef.current.appendChild(transcriptRef.current);
                                }
                            } else {
                                if (!transcriptContainerRef.current.contains(transcriptRef.current)) {
                                    transcriptContainerRef.current.removeChild(transcriptRef.current);
                                }
                            }
                        }
                    });
                });
                observer.observe(transcriptRef.current, {
                    childList: true,
                });
                return () => observer.disconnect();
            }
        },[transcriptRef])

        // State Var holding all client side console text
        // The text is updated by fetching from the db as well so this is only really useful
        // in case fetching from the db takes time.
        const [consoleText, setConsoleText] = useState([])

        // TODO : Potentially replace with useEffect or a ref (might not matter since its only changed once)
        // Used to check if the history has been loaded yet upon first visit
        const [historyLoaded, setHistoryLoaded] = useState(false)

        // Send a command to the GameLogic.jsx file. commandToGameTrigger is toggled to trigger the useEffect in game logic,
        // which then triggers it to check the value of consoleToGameCommandRef. Used a ref as we want to sometimes update
        // it without reloading components.
        function commandToGame(command){
            consoleToGameCommandRef.current = command
            if(commandToGameTrigger === true){
                setCommandToGameTrigger(false)
            } else {
                setCommandToGameTrigger(true)
            }
        }


        // TODO STAT TRACK : Number of commands sent in by user, however note when implementing we dont want
        //  to track when the user doesn't input anything which is handled at the very bottom in the default case.
        // Function to handle user inputs, post it to db, check if it matches a command.
        function new_console_input(){

            // (Re)focus the input box
            if (inputRef.current) {
                inputRef.current.focus();
            }

            const console_input_box = document.getElementById("console_input_box")
            const console_input_text = console_input_box.value
            console_input_box.value = ""

            // TODO STAT TRACK : Number of times a command is called can be done here. For the case stack at the bottom
            //  just add the line(s) to track below but dont add a break so it still falls through.
            switch (console_input_text) {
                case "clear":
                    setConsoleText([...consoleText, ("Console : Clearing Console now...")])
                    clear_console_history()
                    break
                case "start game":
                    printUserInput()
                    const consoleResponse = "Starting game now..."
                    setConsoleText([...consoleText, `Console : ${consoleResponse}`])
                    commandToGame(console_input_text)
                    post_new_input(consoleResponse, "Console")
                    break
                case "help":
                    printUserInput()
                    const outputList = ["Here is a list of all current commands",
                        "- 'start game' : Starts the game from the last saved point",
                        "- 'end game' : Ends the game session",
                        "- 'restart' : Restarts the game session from the beginning",
                        "- 'clear' : Clear the console history (does not affect the game)",
                        "- 'pause' : Pause the current dialogue",
                        "- 'play' : Play paused dialogue",
                        "- 'speed up' : Speed up dialogue",
                        "- 'slow down' : Slow down dialogue",
                        "- 'rewind' : Rewind 10 seconds of dialogue"
                    ]
                    for (let i in outputList){
                        setConsoleText([...consoleText, `Console : ${outputList[i]}`])
                        post_new_input(outputList[i], "Console")
                    }
                    break
                case "play":
                case "pause":
                case "speed up":
                case "slow down":
                    // TODO STAT TRACK : If I implement rewinding for custom seconds (unlikely) then potentially add the total
                    //  seconds rewound as a stat.
                    // TODO : make it so rewind can be "rewind x" for x seconds. Might need to pre-process or use an IF for this.
                case "rewind":
                case "end game":
                case "restart":
                    printUserInput()
                    // Send command to GameLogic.jsx so it can handle it.
                    commandToGame(console_input_text)
                    break
                default:
                    if(console_input_text !== ""){
                        printUserInput()
                        // Send it to GameLogic.jsx in case it is waiting on a custom input.
                        commandToGame(console_input_text)
                        console.log("Console:Not on the command list")
                    }
            }

            // Print the user input to console (used to control the order of display before the db loads
            // in and corrects it.
            function printUserInput(){
                setConsoleText([...consoleText, ("User : " + console_input_text)])
                post_new_input(console_input_text, "User")
            }
        }

        // TODO STAT TRACK : Total messages sent to the console per user and overall
        // POST to db the new message and then refresh the console history
        function post_new_input(message, speaker) {
            fetch('/post_console_history', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    MessageID: consoleText.length,
                    Message: message,
                    Speaker: speaker
                })
            });
            // Ensures everything is ordered correctly.
            fetchConsoleHistory()
        }

        // POST to clear console history in the db
        function clear_console_history() {
            fetch("/post_clear_console", {
                method : "POST"
            })
            setConsoleText([])
        }

        // Get the console history from the db
        const fetchConsoleHistory = async () => {
            // Contact API
            try {
                const response = await fetch(BASEURL + '/get_console_history');
                const result = await response.json();

                // Process response into array.
                let resultMessages = []
                for (let i=0;i<result[0].Messages.length;i++){
                    if(result[0].Messages[i].Speaker === ""){
                        resultMessages.push(result[0].Messages[i].Message)
                    } else {
                        resultMessages.push(result[0].Messages[i].Speaker + " : " + result[0].Messages[i].Message)
                    }
                }
                // Set console text to be the response.
                setConsoleText(resultMessages)

            } catch (error) {
                console.error('Error fetching console history:', error);
            }
        }

        // TODO : Check if this is even needed anymore / can be refactored
        // Checks if the history has already been loaded upon initial load
        // Prevents an infinite re-render loop crash
        if(historyLoaded === false){
            fetchConsoleHistory()
            setHistoryLoaded(true)
        }

        return (
            <>
                <link rel={"stylesheet"} href={"./src/Console/ConsoleStyling.css"} />
                <div className="wholeConsole">
                    {/*Maps the consoleText a set of <p> elements*/}
                    <div className="consoleTextContainer" ref={transcriptContainerRef}>
                        {consoleText.map((item, index) => (
                            <div key={index}>{item}</div>
                        ))}
                        {/*Used when transcribing audio to text*/}
                        <p ref={transcriptRef}></p>
                    </div>
                    <div className="textBoxcontainer">
                        <input type="text" id="console_input_box" ref={inputRef} onKeyDown={handleEnterKeyDown}/>
                        <button onClick={new_console_input} type="button" id="enter_button">Enter</button>
                    </div>
                </div>
            </>
        )
    })