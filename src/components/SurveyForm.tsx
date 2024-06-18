import * as React from "react";
import { CommentContext as CC } from "../contexts/CommentContext";
import { Box, Grid, Paper, alpha, styled } from "@mui/material";
import { amber } from "@mui/material/colors";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));
const SurveyForm: React.FC = () => {
  const {
    canvas,
    survey,
    surveyAnswers,
    onSurveyOptionClick,
  } = React.useContext(CC);
  console.log(surveyAnswers);
  return (
    <>
      <Box
        width={canvas.current ? canvas.current.width : 0}
        height={canvas.current ? canvas.current.height * 1.1 : 0}
        sx={{
          top: 10,
          left: 10,
          position: "absolute",
          backgroundColor: alpha(amber[100], 0.2),
          flexGrow: 1,
        }}
      >
        <Grid container spacing={2} alignItems={"center"} sx={{ opacity: 0.8 }}>
          <Grid item xs={12}>
            <Item>{survey.title}</Item>
          </Grid>
          {survey.surveyOption.map((option, index) => (
            <Grid item xs={6} key={index}>
              <Item
                key={index}
                onClick={() => {
                  onSurveyOptionClick(option);
                }}
              >
                {option}
                {survey.isAnswered && <br />}
                {survey.isAnswered && `${surveyAnswers[option]?.percentage}%`}
              </Item>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};
export default SurveyForm;
