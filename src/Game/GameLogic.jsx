import {useState, useRef} from 'react'

export function GameLogic({gameStarted, setGameStarted}) {

    console.log("GameLogic ran")

    // new Audio("./src/Audio/Game Sounds/hit.mp3").play().then(r => console.log("audio played"))

    if (gameStarted === true){
        new Audio("./src/Audio/Game Sounds/hit.mp3").play().then(r => console.log("audio played"))
    }
    return(
    <>
        <h1>{gameStarted.toString()}</h1>
    </>
    )
}

 export default GameLogic