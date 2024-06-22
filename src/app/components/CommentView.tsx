import * as React from "react";
import { CommentContext as CC } from "../../web/contexts/CommentContext";
const CommentView: React.FC = () => {
  const { canvas } = React.useContext(CC);
  return (
    <>
      <canvas className="comment-canvas" ref={canvas}></canvas>
    </>
  );
};
export default CommentView;
