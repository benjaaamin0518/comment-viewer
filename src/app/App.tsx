// App.tsx
/**
 * App
 * @packageDocumentation
 */

import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import CommentViewer from "./pages/CommentViewer";
import CommentContextProvider from "../web/contexts/CommentContext";

const App: React.FC = () => (
  <CommentContextProvider {...{ canvasheightScale: 0.6 }}>
    <Router>
      <Route exact path="/" component={CommentViewer} />
    </Router>
  </CommentContextProvider>
);

export default App;
