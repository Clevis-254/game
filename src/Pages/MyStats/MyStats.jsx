import React, { useState, useEffect } from "react";
import { Banner } from "../Banner.jsx";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function MyStats(){
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/user/stats", {
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

    // Prepare the data for the bar chart
    const barChartData = {
        labels: ['Forest Fight', 'Forest Obstacle', 'Riddle', 'Boss'],
        datasets: [
            {
                label: '(Measured in Seconds)',
                data: [
                    stats.heatmap.forestObstacle,
                    stats.heatmap.forestFight,
                    stats.heatmap.riddle,
                    stats.heatmap.boss
                ],
                backgroundColor: ['red', 'blue', 'green', 'pink'], // different colors for each bar
                borderColor: '#000',
                borderWidth: 1
            }
        ]
    };

    return(
        <>
            <Banner/>
            <h1 style={{textAlign: "center"}}>My Stats</h1>
            <hr/>
            <br/>

            <div className="statsContainer">
                <div className="timePlayed">
                    <h2 className="text-uppercase">Seconds Played</h2>
                    <h4>{stats.timePlayed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Total Game Completions</h2>
                    <h4>{stats.gameCompletions}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Total Deaths</h2>
                    <h4>{stats.numberOfDeaths}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Riddle Guesses: {stats.totalRiddleGuesses}</h2>
                    <h2 className="text-success">Correct: {stats.riddleGuesses.correct}</h2>
                    <h2 className="text-danger">Incorrect: {stats.riddleGuesses.incorrect}</h2>
                </div>
                <div className="statSection">
                    <h2 className="text-uppercase">Forest Path Choices: {stats.totalPathChoices}</h2>
                    <h2>Chose to Fight: {stats.pathChoices.left}</h2>
                    <h2>Chose to Traverse: {stats.pathChoices.right}</h2>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio Files Played</h2>
                    <h4>{stats.totalAudioPlayed}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Commands Used</h2>
                    <h4>{stats.totalCommandsUsed}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSection">
                    <h2 className="text-uppercase">Audio File Play Count</h2>
                    <h4>hit: {stats.audioFiles.hit}</h4>
                    <h4>miss: {stats.audioFiles.miss}</h4>
                    <h4>damaged: {stats.audioFiles.damaged}</h4>
                    <h4>stamina: {stats.audioFiles.stamina}</h4>
                    <h4>eating: {stats.audioFiles.eating}</h4>
                    <h4>death: {stats.audioFiles.death}</h4>
                </div>

                <div className="statSection">
                    <h2 className="text-uppercase">Command Usage</h2>
                    <h4>Start Game: {stats.commands.startGame}</h4>
                    <h4>Repeat: {stats.commands.repeat}</h4>
                    <h4>Pause: {stats.commands.pause}</h4>
                    <h4>Play: {stats.commands.play}</h4>
                    <h4>End Game: {stats.commands.endGame}</h4>
                    <h4>Speed Up: {stats.commands.speedUp}</h4>
                    <h4>Slow Down: {stats.commands.slowDown}</h4>
                    <h4>Restart: {stats.commands.restart}</h4>
                    <h4>Clear: {stats.commands.clear}</h4>
                    <h4>Rewind: {stats.commands.rewind}</h4>
                    <h4>Help: {stats.commands.help}</h4>
                </div>
            </div>

            <div className="statsContainer">
                <div className="statSectionHeatmap">
                    <h1 className="text-uppercase">Time Spent in Each Area</h1>
                    <Bar data={barChartData} options={{ responsive: true, scales: { x: { beginAtZero: true }, y: { beginAtZero: true } } }} />
                </div>
            </div>
        </>
    )
}

export default MyStats;