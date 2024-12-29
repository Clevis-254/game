import { Console } from "./Console/Console.jsx"
import Banner from "./Banner.jsx";
import GameLogic from "./Game/GameLogic.jsx";
import { useState }from "react"

export function Play(){

    const [gameStarted, setGameStarted] = useState(false)

    console.log(`gameStarted : ${gameStarted}`)
    // tells me in console that its a string
    console.log(`gameStarted type : ${typeof gameStarted}`)
    return (
        <>
        <h1>Play</h1>
            <Banner />
            <Console setGameStarted={setGameStarted} />
            <GameLogic gameStarted={gameStarted} setGameStarted={setGameStarted}/>
        </>
    )
}