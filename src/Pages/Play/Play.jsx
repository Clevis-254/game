import Banner from "../Banner.jsx";
import "../../styles/index.css";
import { Hero } from "./Components/Hero.jsx";
import { Features } from "./Components/Features.jsx";
import { Story } from "./Components/Story.jsx";

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