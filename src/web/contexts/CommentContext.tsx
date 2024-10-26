import React, {
  ReactChild,
  createContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";
import getCanvasLineHeight from "../utils/getCanvasLineHeight";
import { TweenMax, Linear } from "gsap";
import db from "../api/firebaseConfig";
import { firestore } from "firebase";
type onClickEvent = (value: string) => void;
type onSurveyOptionClickEvent = (option: string) => void;
type onClickSurveyVisibleEvent = (isDoneSend: boolean) => boolean;
type CommentContext = {
  canvas: React.RefObject<HTMLCanvasElement>;
  commentsData: CommentExt[];
  onClickEvent: onClickEvent;
  commentsDataRef: CommentExt[];
  survey: SurveyExt;
  onSurveyOptionClick: onSurveyOptionClickEvent;
  surveyAnswers: surveyAnswer;
  onClickSurveyVisible: onClickSurveyVisibleEvent;
  isAnswered: boolean;
  setIsAnswered: React.Dispatch<boolean>;
};
const CommentContextValue = {
  canvas: { current: null },
  commentsData: [],
  onClickEvent: (value: string) => {},
  commentsDataRef: [],
  survey: {
    id: "",
    surveyOption: [],
    isAnswered: false,
    title: "",
    isVisible: false,
  },
  onSurveyOptionClick: (option: string) => {},
  surveyAnswers: {},
  onClickSurveyVisible: () => {
    return false;
  },
  isAnswered: false,
  setIsAnswered: () => {},
};
export const CommentContext = createContext<CommentContext>(
  CommentContextValue
);
type Props = {
  children: JSX.Element;
  canvasheightScale: number;
};
type Comment = {
  comment_value: string;
  client_id: string;
  timestamp: number;
  comment_index: number;
  delete_flg: number;
};
type Survey = {
  id: string;
  title: string;
  surveyOption: string;
  isAnswered: boolean;
  isVisible: boolean;
  timestamp: number;
};
type SurveyField = Omit<Survey, "id">;
type SurveyExt = Pick<Survey, "id" | "isAnswered" | "title" | "isVisible"> & {
  surveyOption: string[];
};
type surveyAnswer = {
  [key: string]: {
    percentage: number;
  };
};
type surveyAnswers = {
  id: string;
  option: string;
};
type CommentExt = {
  id: string;
} & Comment;
const CommentContextProvider = ({ children, canvasheightScale }: Props) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const canvasContext = React.useRef<CanvasRenderingContext2D | null>(null);
  const commentMaxRow = 15;
  const renderCanvasFrame = React.useRef<number>(0);
  const rowHeight = React.useRef<number>(0);
  const [commentsData, setCommentsData] = useState<CommentExt[]>([]);
  const client_id = useMemo(() => uuidv4(), []);
  const commentsDataRef = useRef<CommentExt[]>([]);
  const [isAnswered, setIsAnswered] = React.useState(
    CommentContextValue.isAnswered
  );
  const [surveyAnswers, setSurveyAnswers] = useState<surveyAnswer>(
    CommentContextValue.surveyAnswers
  );
  const [survey, setSurvey] = useState<SurveyExt>(CommentContextValue.survey);
  const CommentsRef = useMemo(
    () =>
      db
        .collection("comment")
        .doc("test")
        .collection("comments"),
    []
  );
  const SurveyRef = useMemo(
    () =>
      db
        .collection("comment")
        .doc("test")
        .collection("survey"),
    []
  );
  const SurveyAnswerRef = useMemo(
    () =>
      db
        .collection("comment")
        .doc("test")
        .collection("surveyAnswer"),
    []
  );
  const onClickEvent: onClickEvent = (value) => {
    sendComment(value);
  };
  const onClickSurveyVisible: onClickSurveyVisibleEvent = (isDoneSend) => {
    if (survey.isVisible && survey.isAnswered) {
      SurveyRef.doc(survey.id).update({ isVisible: false });
      return false;
    }
    if (!survey.isAnswered) {
      SurveyRef.doc(survey.id).update({ isAnswered: true });
      return true;
    }
    const data = ["test1", "test2", "test3", "test4"];
    const surveyData: SurveyField = {
      title: "test",
      surveyOption: JSON.stringify(data),
      timestamp: new Date().getTime(),
      isAnswered: false,
      isVisible: true,
    };
    SurveyRef.add({ ...surveyData });
    return true;
  };
  /**
   * コメント送信
   */
  const sendComment = async (value: string) => {
    if (value.length === 0) {
      return;
    }
    const batch = db.batch();
    await db.runTransaction(
      async (transaction: {
        get: (arg0: firestore.DocumentReference<firestore.DocumentData>) => any;
        set: (
          arg0: firestore.DocumentReference<firestore.DocumentData>,
          arg1: {
            comment_value: string;
            client_id: string;
            timestamp: number;
            comment_index: number;
            delete_flg: number;
          }
        ) => void;
      }) => {
        CommentsRef.orderBy("timestamp", "desc")
          .limit(2)
          .get()
          .then(async ({ docs }) => {
            let commentDataIndex = 0;
            let indexes: number[] = [];
            if (docs != null && docs.length > 0) {
              for (const doc of docs) {
                const docRef = await transaction.get(doc.ref);
                const index = docRef.data()!.comment_index as number;
                // const index = doc.data().comment_index as number;
                console.log(index);
                indexes.push(index);
              }
            }
            commentDataIndex = getNextCommentIndex(indexes);
            console.log(commentDataIndex);
            const index =
              commentMaxRow < commentDataIndex ? 1 : commentDataIndex;
            const comment: Comment = {
              client_id: client_id,
              comment_value: value,
              timestamp: new Date().getTime(),
              comment_index: index,
              delete_flg: 0,
            };

            const docRef = db
              .collection("comment")
              .doc("test")
              .collection("comments")
              .doc();
            batch.set(docRef, {
              ...comment,
            });
            // });
            await batch.commit().then(() => {});
          });
      }
    );
  };
  const getNextCommentIndex = (commentIndexes: number[]) => {
    const getIndexes = () => {
      let indexes = [];
      for (let i = 1; i <= commentMaxRow; i++) {
        indexes.push(i);
      }
      return indexes;
    };
    let indexes = getIndexes();
    indexes = indexes.filter((index) => !commentIndexes.includes(index));
    console.log(indexes);
    const max = indexes.length - 1;
    const min = 0;
    const index = Math.floor(Math.random() * (max - min + 1) + min);
    console.log(indexes);
    return indexes[index];
  };
  /**
   * componentDidMount
   */
  React.useEffect(() => {
    registerEventHandler();
    updateCanvas();
    setTimeout(updateCanvas, 500);
    renderCanvas();

    /**
     * componentWillUnmount
     */
    // return () => {
    //   cancelAnimationFrame(renderCanvasFrame.current);
    // };
  }, []);
  React.useEffect(() => {
    // 同期処理イベント（最新10件をとるためdateでソート)
    CommentsRef.orderBy("timestamp", "desc")
      .limit(20)
      .onSnapshot((snapshot) => {
        for (const change of snapshot.docChanges()) {
          let data = change.doc.data() as CommentExt;
          if (change.type === "added" && data.delete_flg == 0) {
            data = { ...data, id: change.doc.id };
            commentsDataRef.current.unshift(data);
            setComments(data);
          } else if (data.delete_flg == 1) {
            setCommentsData((prev) => {
              const datas = prev.filter((data) => data.id != change.doc.id);
              return datas;
            });
          }
        }
      });
    SurveyRef.orderBy("timestamp", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        for (const change of snapshot.docChanges()) {
          const data = change.doc.data() as Survey;
          if (change.type === "added") {
            const survey: SurveyExt = {
              id: change.doc.id,
              title: data.title,
              surveyOption: JSON.parse(data.surveyOption),
              isAnswered: data.isAnswered,
              isVisible: data.isVisible,
            };
            setSurvey((prev) => {
              if (data.isAnswered && data.isVisible)
                resultSurveyAnswer(survey.id, survey.surveyOption);
              return {
                ...survey,
              };
            });
          } else if (change.type === "modified") {
            const data = change.doc.data() as Survey;
            const survey: SurveyExt = {
              id: change.doc.id,
              title: data.title,
              surveyOption: JSON.parse(data.surveyOption),
              isAnswered: data.isAnswered,
              isVisible: data.isVisible,
            };
            if (!data.isVisible) setIsAnswered(false);
            setSurvey((prev) => {
              if (data.isAnswered && data.isVisible)
                resultSurveyAnswer(survey.id, survey.surveyOption);
              return {
                ...survey,
                isAnswered: data.isAnswered,
                isVisible: data.isVisible,
              };
            });
          }
        }
      });
  }, []);
  const resultSurveyAnswer = (id: string, surveyOption: string[]) => {
    let sum = 0;
    let answers = {};
    SurveyAnswerRef.where("id", "==", id)
      .get()
      .then(({ docs }) => {
        sum = docs.length;
        for (const answerOption of surveyOption) {
          const count: number = docs
            .map((doc) => (doc.data() as surveyAnswers).option)
            .filter((option) => option == answerOption).length;
          console.log(count, sum);
          const data = { percentage: Math.floor((count / sum) * 100) };
          answers = { ...answers, [answerOption]: { ...data } };
        }
        setSurveyAnswers({
          ...answers,
        });
      });
  };
  const setComments = (data: CommentExt) => {
    setCommentsData((prev) => {
      const datas: CommentExt[] = [];
      datas.push(data);
      return datas;
    });
  };
  React.useLayoutEffect(() => {
    for (const data of commentsData) {
      createCommentCanvasView({
        ...data,
      });
      setTimeout(() => {}, 500);
      CommentsRef.doc(data.id).update({ delete_flg: 1 });
    }
  }, [commentsData]);
  const onSurveyOptionClick: onSurveyOptionClickEvent = (option) => {
    const data: surveyAnswers = {
      id: survey.id,
      option,
    };
    SurveyAnswerRef.add({ ...data });
  };
  /**
   * イベント登録
   */
  const registerEventHandler = () => {
    window.addEventListener("resize", handleResize);
  };

  /**
   * リサイズイベント
   */
  const handleResize = () => {
    updateCanvas();
  };
  /**
   * canvas設定の更新
   */
  const updateCanvas = (): void => {
    if (canvas.current === null) return;

    const parent = canvas.current.parentNode as HTMLElement;
    if (parent === null) return;
    canvas.current.width = parent.offsetWidth;
    canvas.current.height = parent.offsetHeight * canvasheightScale;
    // コメントを1行分の高さ
    rowHeight.current = canvas.current.height / commentMaxRow;
    // 画面にコメントが10行収まるフォントサイズ
    const fontSize = rowHeight.current * getCanvasLineHeight;

    canvasContext.current = canvas.current.getContext("2d");

    if (canvasContext.current !== null) {
      canvasContext.current.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', 'ヒラギノ角ゴ ProN W3'`;
      canvasContext.current.fillStyle = "#fff";
    }
  };

  /**
   * Canvasを描画する
   */
  const renderCanvas = () => {
    if (canvasContext.current !== null)
      canvasContext.current.clearRect(
        0,
        0,
        canvas.current!.width,
        canvas.current!.height
      );
    renderCanvasFrame.current = requestAnimationFrame(renderCanvas);
  };

  /**
   * 1画面に収まる分のコメントy位置を配列で返す
   */
  const getRandomCommentPosition = (index: number): number => {
    let position: number = 0;
    position = rowHeight.current * index;

    return position;
  };

  /**
   * キャンバス上にコメント描写する
   */
  const createCommentCanvasView = async (data: Comment) => {
    if (canvas.current === null) return;
    if (canvasContext.current === null) return;

    const canvasCurrent = canvas.current;
    const canvasContextCurrent = canvasContext.current;
    const comment = data.comment_value;
    const commentWidth = canvasContextCurrent.measureText(comment).width;
    // 同じ時間に投稿されたコメントがcommentMaxRowを超えた場合はランダムな位置
    const y = getRandomCommentPosition(data.comment_index);
    // TweenMaxで動かす用の疑似テキストオブジェクト
    const text = {
      x: canvasCurrent.width,
      y,
    };
    TweenMax.to(text, 3, {
      x: -commentWidth,
      ease: Linear.easeNone,
      onUpdate: () => {
        if (data.client_id == client_id) {
          canvasContextCurrent.strokeRect(
            text.x - commentWidth * 0.4,
            y - rowHeight.current * 1,
            commentWidth * 1 + commentWidth * 0.7,
            rowHeight.current * 1.3
          );
          canvasContextCurrent.strokeStyle = "yellow";
        }
        canvasContextCurrent.fillText(comment, text.x, text.y);
      },
    });
  };
  return (
    <CommentContext.Provider
      value={{
        canvas,
        commentsData,
        onClickEvent,
        commentsDataRef: commentsDataRef.current,
        survey,
        onSurveyOptionClick,
        surveyAnswers: surveyAnswers,
        onClickSurveyVisible,
        isAnswered,
        setIsAnswered,
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};
export default CommentContextProvider;
function writeBatch(db: firestore.Firestore) {
  throw new Error("Function not implemented.");
}
