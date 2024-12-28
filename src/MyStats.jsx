import React from 'react';
import { Banner } from "./Banner.jsx";

export function MyStats(){
    return(
        <>
            <Banner/>
            <h1 style={{textAlign: "center"}}>My Stats</h1>
            <hr/>
            <br/>

            <div className="container">
                <div className="statSection1">
                    <h2 className="text-uppercase">Time Played</h2>
                    <h4>00:00:00</h4>
                </div>

                <div className="statSection1">
                    <h2 className="text-uppercase">Audio Files Played</h2>
                    <h4>0</h4>
                </div>
            </div>

            <div className="container">
                <div className="statSection2">
                    <h2 className="text-uppercase">Audio File Play Count</h2>
                    <h4>hit: 0</h4>
                    <h4>miss: 0</h4>
                    <h4>damaged: 0</h4>
                    <h4>stamina: 0</h4>
                </div>

                <div className="statSection2">
                    <h2 className="text-uppercase">Command Usage</h2>
                    <h4>Repeat: 0</h4>
                    <h4>End Game: 0</h4>
                    <h4>Go Faster: 0</h4>
                    <h4>Go Slower: 0</h4>
                    <h4>Restart: 0</h4>
                </div>
            </div>

            <div className="container">
                <div className="statSectionHeatmap">
                    <h1 className="text-uppercase">Heatmap</h1>
                    <img
                        src="https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"/>
                </div>
            </div>
        </>
    )
}

export default MyStats;