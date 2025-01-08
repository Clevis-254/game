import {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react'
import './ConsoleStyling.css';
import SpeechToText from "../../../../utility/SpeechToText.jsx";

export const Console =
    forwardRef(function Console({transcriptRef, commandToGameTrigger,
                                    setCommandToGameTrigger, consoleToGameCommandRef, gameAudioRef, ttsAudioRef}, ref) {

        useImperativeHandle(ref,() => {
            return {
                callPostToConsole: (message, speaker) => {
                    post_new_input(message,speaker)
                }
            }
        })

        const BASEURL = "http://localhost:4173"
        const inputRef = useRef(null);
        const transcriptContainerRef = useRef(null)

        const handleEnterKeyDown = (event) => {
            if (event.key === 'Enter') {
                new_console_input()
            }
        };

        const handleSpeechToText = (speechText) => {
            new_console_input(speechText);
        };

        useEffect(() => {
            scrollConsoleToBottom()
        },[])

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

        const [consoleText, setConsoleText] = useState([])

        useEffect(() => {
            scrollConsoleToBottom()
        }, [consoleText])

        const [historyLoaded, setHistoryLoaded] = useState(false)

        function commandToGame(command){
            consoleToGameCommandRef.current = command
            if(commandToGameTrigger === true){
                setCommandToGameTrigger(false)
            } else {
                setCommandToGameTrigger(true)
            }
        }

        function new_console_input(inputText) {
            if (inputRef.current) {
                inputRef.current.focus();
            }

            const console_input_box = document.getElementById("console_input_box")
            const console_input_text = inputText || console_input_box.value
            console_input_box.value = ""

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
                    post_new_input(consoleResponse, "Console");
                    playTTS(consoleResponse);
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
                case "rewind":
                case "end game":
                case "restart":
                    printUserInput()
                    commandToGame(console_input_text)
                    break
                default:
                    if (console_input_text !== "") {
                        printUserInput()
                        commandToGame(console_input_text)
                    }
            }

            function printUserInput() {
                setConsoleText([...consoleText, ("User : " + console_input_text)])
                post_new_input(console_input_text, "User")
            }

            scrollConsoleToBottom()
        }

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

        function clear_console_history() {
            fetch("/post_clear_console", {
                method : "POST"
            })
            setConsoleText([])
        }

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

        if(historyLoaded === false){
            fetchConsoleHistory()
            setHistoryLoaded(true)
        }

        async function scrollConsoleToBottom(){
            if (transcriptContainerRef.current) {
                await new Promise(resolve => setTimeout(resolve, 30))
                transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
            }
        }
        function playTTS(text) {
            if (ttsAudioRef.current) {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.onend = () => {
                    ttsAudioRef.current.src = '';
                };
                ttsAudioRef.current.src = URL.createObjectURL(new Blob([utterance]));
                ttsAudioRef.current.play();
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
                            <input type="text" id="console_input_box" className="terminal-input-field" ref={inputRef} onKeyDown={handleEnterKeyDown}/>
                            <button onClick={new_console_input} type="button" id="enter_button">Enter</button>

                            <SpeechToText onTextReady={handleSpeechToText} gameAudioRef={gameAudioRef} ttsAudioRef={ttsAudioRef} />
                        </div>
                    </div>
                </div>
            </>
        )

    })
