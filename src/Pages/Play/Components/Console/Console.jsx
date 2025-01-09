import {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react'
import './ConsoleStyling.css';
import {speakText} from "@/utility/Speech.jsx";
import SpeechToText from '../../../../utility/SpeechToText';
// NOTE : No game logic should be in this module.
// Accessibility logic is fine (e.g rewind to last dialogue)
// DESIGN NOTE : We fetch the entire console history every time we reload because this is a small game with few
// users. If we were to scale up then it would be worth doing only what is needed.

export const Console =
    forwardRef(function Console({transcriptRef, commandToGameTrigger,
                                    setCommandToGameTrigger, consoleToGameCommandRef, gameAudioRef, ttsAudioRef}, ref) {

        // This allows us to add messages to the console from external components
        useImperativeHandle(ref,() => {
            return {
                callPostToConsole: (message, speaker, isTranscript) => {
                    post_new_input(message,speaker, isTranscript)
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

    // Runs when the page first loads to initially get the history
    useEffect(() => {
        fetchConsoleHistory()
    }, [])


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

    function commandToGame(command){
        consoleToGameCommandRef.current = command
        if(commandToGameTrigger === true){
            setCommandToGameTrigger(false)
        } else {
            setCommandToGameTrigger(true)
        }
    }

     async function incrementStat(command){
        try {
            const response = await fetch("/user/stats", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commands: { [command]: 1 },
                }),
            });

            if (!response.ok) {
                console.error(`Failed to update stats: ${response.statusText}`);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }


    // Function to add a user console input client side
    function new_console_input() {

        // (Re)focus the input box
        if (inputRef.current) {
            inputRef.current.focus();
        }

        const console_input_box = document.getElementById("console_input_box")
        const console_input_text = console_input_box.value
        console_input_box.value = ""

        switch (console_input_text) {
            case "clear":
                incrementStat("clear"); // Tracks command use
                // User should never see this theoretically, but it's here just in case
                setConsoleText([...consoleText, ("Console : Clearing Console now...")])
                clear_console_history()
                break
            case "start game":
                incrementStat("startGame"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                post_new_input("Starting game now...", "Console")
                break
            // TODO : Pause transcript until this is done narrating.
            case "help":
                incrementStat("help"); // Tracks command use
                post_new_input(console_input_text, "User")
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
                    post_new_input(outputList[i], "Console")
                }
                break
            case "help combat":
                post_new_input("In this game you will fight many enemies in battle. These battles are turn based." +
            "In battle you have four moves," +
            " slash, stab, parry slash and parry stab. Slash is a standard attack that can be parried with" +
            "parry slash, stab is a move that you charge up on your initial turn and can then either go through" +
            "with it  on your next turn and do lots of damage to your opponent or you can switch to slash to trick your opponent." +
            "Be wary however as if your opponent predicts this and picks parry slash then you will the stunned and" +
            "miss a turn. The same goes for if your opponent predicts you follow through and they pick parry stab." +
            "This makes stab a risky move but with high reward.", "")
                break
            case "play":
                incrementStat("play"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "pause":
                incrementStat("pause"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "speed up":
                incrementStat("speedUp"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "slow down":
                incrementStat("slowDown"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "rewind":
                incrementStat("rewind"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "end game":
                incrementStat("endGame"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            case "restart":
                incrementStat("restart"); // Tracks command use
                post_new_input(console_input_text, "User")
                commandToGame(console_input_text)
                break
            default:
                // In case it is a direction from the game eg "left" or "right". Pass it on
                if (console_input_text !== "") {
                    post_new_input(console_input_text, "User")
                    commandToGame(console_input_text)
                }
        }

            // TODO : Check if this is needed since we now do a useEffect for consoleText changes
            scrollConsoleToBottom()
        }

    // POST to db the new message
    function post_new_input(message, speaker, isTranscript) {
        if(speaker !== "User" && !isTranscript) speakText(message)
        if(speaker !== ""){
            setConsoleText((prevConsoleText) =>[...prevConsoleText, `${speaker} : ${message}`])
        } else {
            setConsoleText((prevConsoleText) =>[...prevConsoleText, `${message}`])
        }
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
    }

    // POST to clear console history in the db
    function clear_console_history() {
        setConsoleText([])
        fetch("/post_clear_console", {
            method : "POST"
        })
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
