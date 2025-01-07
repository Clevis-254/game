import React, { useState, useEffect } from "react";
import { Banner } from "../Banner.jsx";

export function UserStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/site/stats", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stats.");
                }

                const data = await response.json();
                setStats(data.stats);
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <p>Loading stats...</p>;
    }

    if (error) {
        return <p>Error loading stats: {error}</p>;
    }

    return (
        <>
            <Banner />
            <h1 style={{textAlign: "center"}}>User Stats</h1>
            <hr/>
            <br/>

            <div className="statsContainer">
                <div className="timePlayed">
                    <h2 className="text-uppercase">Time Played</h2>
                    <h4>{stats.timePlayed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Number of Players</h2>
                    <h4>1</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Most Active Player</h2>
                    <h4>Smelvin Potter | 00:00:00</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Total Game Completions</h2>
                    <h4>0</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Total Deaths</h2>
                    <h4>0</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Riddle Guesses: 0</h2>
                    <h2 className="text-success">Correct: 0</h2>
                    <h2 className="text-danger">Incorrect: 0</h2>
                </div>
                <div className="statSection">
                    <h2 className="text-uppercase">Forest Path Choices: 0</h2>
                    <h2>Chose to Fight: 0</h2>
                    <h2>Chose to Traverse: 0</h2>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio Files Played</h2>
                    <h4>0</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Commands Used</h2>
                    <h4>0</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio File Play Count</h2>
                    <h4>hit: 0</h4>
                    <h4>miss: 0</h4>
                    <h4>damaged: 0</h4>
                    <h4>stamina: 0</h4>
                    <h4>eating: 0</h4>
                    <h4>death: 0</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Command Usage</h2>
                    <h4>Start Game: 0</h4>
                    <h4>Repeat: 0</h4>
                    <h4>Pause: 0</h4>
                    <h4>End Game: 0</h4>
                    <h4>Go Faster: 0</h4>
                    <h4>Slow Down: 0</h4>
                    <h4>Restart: 0</h4>
                    <h4>Clear: 0</h4>
                    <h4>Rewind: 0</h4>
                    <h4>Help: 0</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSectionHeatmap">
                    <h1 className="text-uppercase">Heatmap</h1>
                    <img
                        src="https://talos-interactive.com/wp-content/uploads/2022/04/GameTelemetryGallery05-1024x576.jpg"/>
                </div>
            </div>
        </>
    );
}

export default UserStats;