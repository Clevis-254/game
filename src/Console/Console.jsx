import {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react'

// NOTE : No game logic should be in this module.
// Accessibility logic is fine (e.g rewind to last dialogue)
// DESIGN NOTE : We fetch the entire console history every time we reload because this is a small game with few
// users. If we were to scale up then it would be worth doing.

// TODO : Make all API calls include the users ID when users are implemented
export const Console =
    forwardRef(function Console({setGameStarted, transcriptRef}, ref) {

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

        // Used to make the transcript element re-appear when text is added
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
        const [consoleText, setConsoleText] = useState([])

        // TODO : Potentially replace with useEffect (might not matter since its only changed once)
        // Used to check if the history has been loaded yet upon first visit
        const [historyLoaded, setHistoryLoaded] = useState(false)

        // Function to add a user console input client side
        function new_console_input(){

            // (Re)focus the input box
            if (inputRef.current) {
                inputRef.current.focus();
            }

            const console_input_box = document.getElementById("console_input_box")
            const console_input_text = console_input_box.value
            console_input_box.value = ""

            // TODO : if we add more commands replace with a switch statement
            // TODO : Functionality for choosing paths in game
            // If the input text is a default command (not game related) then run that if not treat is as a input
            if (console_input_text === "clear"){
                setConsoleText([...consoleText, ("Console : Clearing Console now...")])
                clear_console_history()
            } else if (console_input_text === "start game"){
                printUserInput()
                const consoleResponse = "Starting game now..."
                setConsoleText([...consoleText, `Console : ${consoleResponse}`])
                setGameStarted(true)
                post_new_input(consoleResponse, "Console")
            } else if (console_input_text === "help"){
                printUserInput()
                const outputList = ["Here is a list of all current commands",
                    "- 'start game' : Starts the game from the last saved point",
                    "- 'clear' : Clear the console history (does not affect the game)"]
                for (let i in outputList){
                    setConsoleText([...consoleText, `Console : ${outputList[i]}`])
                    post_new_input(outputList[i], "Console")
                }
            }
                // Doesn't match any commands
            // TODO : At this point path choosing should be implemented
            else {
                printUserInput()
            }

            // Print the user input to console
            function printUserInput(){
                setConsoleText([...consoleText, ("User : " + console_input_text)])
                post_new_input(console_input_text, "User")
            }
        }

        // TODO : GET CONSOLE RESPONSE FROM THIS WHEN THE GAME ACTUALLY IS MADE
        //  (as in if we pick left then the response is what is left)
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
                    resultMessages.push(result[0].Messages[i].Speaker + " : " + result[0].Messages[i].Message)
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

        return (
            <>
                <link rel={"stylesheet"} href={"./src/Console/ConsoleStyling.css"} />
                <div className="wholeConsole">
                    <div className="consoleTextContainer" ref={transcriptContainerRef}>
                        {consoleText.map((item, index) => (
                            <div key={index}>{item}</div>
                        ))}
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