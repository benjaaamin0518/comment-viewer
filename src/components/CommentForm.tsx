import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import { CommentContext } from "../contexts/CommentContext";

export default function CommentForm() {
  const { commentsData, onClickEvent, canvas } = React.useContext(
    CommentContext
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Paper
      component="form"
      sx={{
        p: "2px 4px",
        display: "flex",
        alignItems: "center",
        width: canvas.current ? canvas.current.width : 0,
      }}
    >
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="コメントを入力してください。"
        inputProps={{ "aria-label": "コメントを入力してください。" }}
        inputRef={inputRef}
      />
      <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
      <IconButton
        color="primary"
        sx={{ p: "10px" }}
        aria-label="send"
        onClick={() => {
          onClickEvent(inputRef.current!.value);
          inputRef.current!.value = "";
        }}
      >
        <SendIcon />
      </IconButton>
    </Paper>
  );
}
