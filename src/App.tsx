import React, { Suspense, useEffect } from "react";
import "./App.css";
import { Canvas, useThree } from "@react-three/fiber";
import MainScene from "./MainScene";

function App() {
	return (
		<div className="App relative w-full h-full bg-black">
			<Canvas className="w-full h-full">
				<MainScene />
			</Canvas>
		</div>
	);
}

export default App;
