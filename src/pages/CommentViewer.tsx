import * as React from "react";
import CommentView from "../components/CommentView";
import CommentList from "../components/CommentList";
import CommentForm from "../components/CommentForm";
import SurveyForm from "../components/SurveyForm";
import { CommentContext } from "../contexts/CommentContext";
const CommentViewer: React.FC = () => {
  console.log("レンダリング");
  const { survey } = React.useContext(CommentContext);
  let [isSurveyVisible, setIsSurveyVisible] = React.useState(false);
  React.useEffect(() => {
    setIsSurveyVisible(survey.isVisible);
    console.log(isSurveyVisible);
  }, [survey]);
  return (
    <>
      <CommentView />
      {isSurveyVisible && <SurveyForm />}
      <CommentList />
      <CommentForm />
    </>
  );
};
export default CommentViewer;
