// import React from 'react'
import { useState } from 'react'

export function Console() {

    const [consoleText, setConsoleText] = useState("Hello")

    function enter_clicked() {
        console.log("TEST")
    }

    console.log("test2")

    function handleClick() {
        setCountButton(countButton + 1)
    }

    const [countButton, setCountButton] = useState(0)

    return (
        <>
            
            <p>User : {consoleText}</p>
            <form>
                <input type="text" name="console_input"/>

            </form>
            <button onClick={enter_clicked} type="button" id="enter_button">Enter</button>
            <button onClick={() => setConsoleText((consoleText) => "ERM")} type="button">{consoleText}</button>
            <button onClick={() => alert("HELP ME")} type="button">3</button>
            <button onClick={handleClick}>
                Clicked {countButton} Times
            </button>
        </>
    )
}

export default Console;