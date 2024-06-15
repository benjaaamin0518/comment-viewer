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
type onClickEvent = (value: string) => void;
type CommentContext = {
  canvas: React.RefObject<HTMLCanvasElement>;
  commentsData: CommentExt[];
  onClickEvent: onClickEvent;
  commentsDataRef: CommentExt[];
};
const CommentContextValue = {
  canvas: { current: null },
  commentsData: [],
  onClickEvent: (value: string) => {},
  commentsDataRef: [],
};
export const CommentContext = createContext<CommentContext>(
  CommentContextValue
);
type Props = {
  children: JSX.Element;
};
type Comment = {
  comment_value: string;
  client_id: string;
  timestamp: number;
  comment_index: number;
  delete_flg: number;
};
type CommentExt = {
  id: string;
} & Comment;
const CommentContextProvider = ({ children }: Props) => {
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const canvasContext = React.useRef<CanvasRenderingContext2D | null>(null);
  const commentMaxRow = 10;
  const renderCanvasFrame = React.useRef<number>(0);
  const rowHeight = React.useRef<number>(0);
  const [commentsData, setCommentsData] = useState<CommentExt[]>([]);
  const client_id = useMemo(() => uuidv4(), []);
  const commentsDataRef = useRef<CommentExt[]>([]);
  const CommentsRef = useMemo(
    () =>
      db
        .collection("comment")
        .doc("test")
        .collection("comments"),
    []
  );
  const indexData = useRef<{ index: number; id: string }>({ index: 1, id: "" });
  const onClickEvent: onClickEvent = (value) => {
    sendComment(value);
  };
  /**
   * コメント送信
   */
  const sendComment = async (value: string) => {
    if (value.length === 0) {
      return;
    }
    db.collection("comment")
      .doc("test")
      .collection("comments")
      .orderBy("timestamp", "desc")
      .limit(1)
      .get()
      .then(({ docs }) => {
        let data: number = 0;
        let commentDataIndex = 0;
        if (docs != null && docs.length > 0) {
          data = docs[0].data().comment_index;
          commentDataIndex = data;
        }
        commentDataIndex++;
        const index = commentMaxRow < commentDataIndex ? 1 : commentDataIndex;
        const comment: Comment = {
          client_id: client_id,
          comment_value: value,
          timestamp: new Date().getTime(),
          comment_index: index,
          delete_flg: 0,
        };
        CommentsRef.add({
          ...comment,
        });
      });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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
      db.collection("comment")
        .doc("test")
        .collection("comments")
        .doc(data.id)
        .update({ delete_flg: 1 });
    }
  }, [commentsData]);
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
    canvas.current.height = parent.offsetHeight * 0.5;

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
    let { index, id } = indexData.current;
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
      }}
    >
      {children}
    </CommentContext.Provider>
  );
};
export default CommentContextProvider;
