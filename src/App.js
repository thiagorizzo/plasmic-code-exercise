import React from "react";
import CanvasArea from "./components/CanvasArea";
import "./App.css";
import CursorStyle from "./enums/CursorStyle";

function App() {
  return (
    <>
      <CanvasArea height={768} width={1024}></CanvasArea>
      <div id="info">
        <h1>Plasmic Code Exercise</h1>
        <h2>Instructions</h2>
        <ul>
          <li>
            Select a box and press key <em>DELETE</em> to remove it.
          </li>
          <li>Select box to resize it.</li>
          <li>Its not necessary to select a box to move it, just drag it.</li>
          <li>Deselect a box clicking outside of it, or select another one.</li>
          <li>Draw a box outside any box to create a new one.</li>
        </ul>
      </div>
    </>
  );
}

export default App;
