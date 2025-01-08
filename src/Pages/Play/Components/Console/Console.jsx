import {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react'
import './ConsoleStyling.css';
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

        const transcriptContainerRef = useRef(null)

        const handleEnterKeyDown = (event) => {
            if (event.key === 'Enter') {
                new_console_input()
            }
        };

        // Upon first page load, scroll the console to the bottom
        useEffect(() => {
            scrollConsoleToBottom()
        },[])

        // Used to make the transcript element re-appear when text is added
        useEffect(() => {
            if (transcriptRef.current) {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        scrollConsoleToBottom()
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
        const [consoleText, setConsoleText] = useState([])

        // If console text is changed, scroll to the bottom
        useEffect(() => {
            scrollConsoleToBottom()
        }, [consoleText])

        // TODO : Potentially replace with useEffect or a ref (might not matter since its only changed once)
        // Used to check if the history has been loaded yet upon first visit
        const [historyLoaded, setHistoryLoaded] = useState(false)

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
        // Function to add a user console input client side
        function new_console_input() {

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
                    for (let i in outputList) {
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
                    commandToGame(console_input_text)
                    break
                default:
                    // In case it is a direction from the game eg "left" or "right". Pass it on
                    if (console_input_text !== "") {
                        printUserInput()
                        commandToGame(console_input_text)
                    }
            }

            // TODO : Probably could remove this and just replace it with the new post_new_input method
            // Print the user input to console
            function printUserInput() {
                setConsoleText([...consoleText, ("User : " + console_input_text)])
                post_new_input(console_input_text, "User")
            }

            // TODO : Check if this is needed since we now do a useEffect for consoleText changes
            scrollConsoleToBottom()
        }

        // TODO STAT TRACK : Total messages sent to the console per user and overall
        // POST to db the new message
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
            try {
                const response = await fetch(BASEURL + '/get_console_history');
                const result = await response.json();

                let resultMessages = []
                for (let i=0;i<result[0].Messages.length;i++){
                    if(result[0].Messages[i].Speaker === ""){
                        resultMessages.push(result[0].Messages[i].Message)
                    } else {
                        resultMessages.push(result[0].Messages[i].Speaker + " : " + result[0].Messages[i].Message)
                    }
                }
                setConsoleText(resultMessages)

            } catch (error) {
                console.error('Error fetching console history:', error);
            }
        }

        // TODO STAT TRACK: fetchStatTracking?

        // TODO : Check if this is even needed anymore.
        if(historyLoaded === false){
            fetchConsoleHistory()
            setHistoryLoaded(true)
        }

        // TODO : Make it so if the user tries scrolling up then it wont force you to the bottom. Aka if
        //  we are at the bottom then a new input is done only then it will lock you to the bottom
        // Scroll to the bottom with the new input
        async function scrollConsoleToBottom(){
            if (transcriptContainerRef.current) {
                // TODO : When making the console cloud-db compatible, refine this.
                await new Promise(resolve => setTimeout(resolve, 30))
                transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
            }
        }

        return (
            <>
                <div className="d-flex justify-content-center gap-3 py-5 bg-dark">
                    <div className="terminal" onClick={new_console_input}>
                        <div className="terminal-output" ref={transcriptContainerRef}>
                                {consoleText.map((item, index) => (
                                    <div key={index} className="terminal-line">
                                     <span className="terminal-response">
                                         <div key={index}>{item}</div>
                                       </span>
                                    </div>
                                ))}
                                <span ref={transcriptRef} className="terminal-line"></span>

                        </div>

                        <div className="terminal-input-line">
                            {/*TODO : make it so the suggestions dont appear on browsers based on previous input because its ugly.*/}
                            <input type="text" id="console_input_box" className="terminal-input-field" ref={inputRef} onKeyDown={handleEnterKeyDown}/>
                            <button onClick={new_console_input} type="button" id="enter_button">Enter</button>
                        </div>
                    </div>
                </div>
            </>
        )

    })
