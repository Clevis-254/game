import Banner from "../Banner.jsx";
import "../styles/index.css";
import { Hero } from "../Componenets/Hero.jsx";
import { Features } from "../Componenets/Features.jsx";
import { Story } from "../Componenets/Story.jsx";

export function Play() {
    return (
        <>
        <Banner />
        <Hero />
        <Features />
        <Story />
        </>
    );
}