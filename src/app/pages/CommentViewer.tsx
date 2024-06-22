import * as React from "react";
import CommentView from "../components/CommentView";
import SurveyForm from "../components/SurveyForm";
import { CommentContext } from "../../web/contexts/CommentContext";
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
    </>
  );
};
export default CommentViewer;
