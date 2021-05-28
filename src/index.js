import { StrictMode } from "react";
import ReactDOM from "react-dom";

import Line from "./line";
import Earth from "./earth";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Earth />
  </StrictMode>,
  rootElement
);
