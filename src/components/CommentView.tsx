import * as React from "react";
import { CommentContext as CC } from "../contexts/CommentContext";
const CommentViewe: React.FC = () => {
  const { canvas } = React.useContext(CC);
  return (
    <>
      <canvas
        className="comment-canvas"
        ref={canvas}
        style={{ background: "#001122" }}
      ></canvas>
    </>
  );
};
export default CommentViewe;
