import * as React from "react";
import { CommentContext as CC } from "../contexts/CommentContext";
import { useRef } from "react";
import CommentView from "../components/CommentView";
import CommentList from "../components/CommentList";
import CommentForm from "../components/CommentForm";
const CommentViewer: React.FC = () => {
  console.log("レンダリング");
  return (
    <>
      <CommentView />
      <CommentList />
      <CommentForm />
    </>
  );
};
export default CommentViewer;
