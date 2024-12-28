import {useState, useRef} from 'react'

// NOTE : No game logic should be in this module.
// Accessibility logic is fine (e.g rewind to last dialogue)

// TODO : Make all API calls include the users ID when users are implemented
export function Console() {

    // TODO : If we are expected to actually deploy this then pull this from a file /
    //  dynamically find the base url
    // This base url for some reason is needed sometimes under contexts that
    // make no sense and probably will be needed in full deployment
    const BASEURL = "http://localhost:4173"
    const inputRef = useRef(null);

    const handleEnterKeyDown = (event) => {
        if (event.key === 'Enter') {
            new_console_input()
        }
    };

    // State Var holding all client side console text
    const [consoleText, setConsoleText] = useState([])

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
        } else {
            post_new_input(console_input_text)
            fetchConsoleHistory()
            setConsoleText([...consoleText, ("User : " + console_input_text)])
        }
    }

    // TODO : GET CONSOLE RESPONSE FROM THIS WHEN THE GAME ACTUALLY IS MADE
    //  (as in if we pick left then the response is what is left)
    // POST to db the new message
    function post_new_input(message) {
        fetch('/post_console_history', {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                MessageID: consoleText.length,
                Message: message,
                Speaker: "User"
            })
        });
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
            <div className="consoleTextContainer">
                {consoleText.map((item,index) => (
                    <div key={index}>{item}</div>
                ))
                }
            </div>

            <input type="text" id="console_input_box" ref={inputRef} onKeyDown={handleEnterKeyDown}/>
                <button onClick={new_console_input} type="button" id="enter_button">Enter</button>

        </>
    )
}

export default Console;