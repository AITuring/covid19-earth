import { StrictMode } from "react";
import ReactDOM from "react-dom";

import Line from "./line";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <StrictMode>
    <Line />
  </StrictMode>,
  rootElement
);
