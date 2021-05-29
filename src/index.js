import { StrictMode } from "react";
import ReactDOM from "react-dom";
import Earth from "./earth";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Earth />
  </StrictMode>,
  rootElement
);
