import * as React from "react";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { FixedSizeList, ListChildComponentProps } from "react-window";
import { CommentContext } from "../contexts/CommentContext";

function renderRow(props: ListChildComponentProps) {
  const { index, style } = props;
  const { commentsDataRef } = React.useContext(CommentContext);
  return (
    <ListItem
      style={style}
      key={commentsDataRef[index].id}
      component="div"
      disablePadding
    >
      <ListItemButton>
        <ListItemText primary={commentsDataRef[index].comment_value} />
      </ListItemButton>
    </ListItem>
  );
}

export default function CommentList() {
  const { commentsDataRef, canvas } = React.useContext(CommentContext);
  return (
    <Box
      sx={{
        width: "100%",
        height: 400,
        maxWidth: canvas.current?.width,
        bgcolor: "background.paper",
      }}
    >
      <FixedSizeList
        height={400}
        width={canvas.current ? canvas.current.width : 0}
        itemSize={46}
        itemCount={commentsDataRef.length}
        overscanCount={5}
      >
        {renderRow}
      </FixedSizeList>
    </Box>
  );
}
