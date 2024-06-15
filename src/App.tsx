// App.tsx
/**
 * App
 * @packageDocumentation
 */

import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import CommentViewer from "./pages/CommentViewer";
import CommentContextProvider from "./contexts/CommentContext";

const App: React.FC = () => (
  <CommentContextProvider>
    <Router>
      <Route exact path="/" component={CommentViewer} />
    </Router>
  </CommentContextProvider>
);

export default App;
