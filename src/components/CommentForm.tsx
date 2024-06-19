import * as React from "react";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import PollIcon from '@mui/icons-material/Poll';
import { CommentContext } from "../contexts/CommentContext";

export default function CommentForm() {
  const { commentsData, survey, onClickEvent, canvas,isAnswered, onClickSurveyVisible } = React.useContext(
    CommentContext
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDoneSend = React.useRef<boolean>(false);
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
        color={!survey.isAnswered && survey.isVisible?"warning":survey.isAnswered && survey.isVisible?"inherit":"primary"}
        sx={{ p: "10px" }}
        aria-label="send"
        onClick={() => {
          isDoneSend.current=onClickSurveyVisible(isDoneSend.current);
        }}
      >
        <PollIcon />
      </IconButton>
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
