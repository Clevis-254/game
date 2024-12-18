import React from 'react';
import { Banner } from "./src/Banner";

export function MyStats(){
    return(
        <>
            <Banner />
            <h1>My Stats</h1>
            <hr /><br />

            <div>
                <h2>Time Played</h2>
                <h3>00:00:00</h3>

                <h2>Audio Files Played</h2>
                <h3>0</h3>
            </div>

            <br />

            <h2>Audio File Play Count</h2>
            <h3>hit: 0</h3>
            <h3>miss: 0</h3>
            <h3>damaged: 0</h3>
            <h3>stamina: 0</h3>

            <br />

            <h2>Command Usage</h2>
            <h3>Repeat: 0</h3>
            <h3>End Game: 0</h3>
            <h3>Go Faster: 0</h3>
            <h3>Go Slower: 0</h3>
            <h3>Restart: 0</h3>

            <br /><hr />

            <h2>Heatmap</h2>
            <img src="https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"/>
        </>
    )
}

export default MyStats;