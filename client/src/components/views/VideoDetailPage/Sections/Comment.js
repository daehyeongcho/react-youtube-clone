import React, { useState } from "react";
import Axios from "axios";
import { useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import SingleComment from "./SingleComment";
import ReplyComment from "./ReplyComment";

function Comment({ videoId, comments, refreshFunction, history }) {
  const user = useSelector((state) => state.user);
  const [commentValue, setCommentValue] = useState("");
  const onChange = (e) => {
    setCommentValue(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const variables = {
      content: commentValue,
      writer: user.userData._id,
      videoId,
    };

    Axios.post("/api/comment/saveComment", variables).then((response) => {
      if (response.data.success) {
        console.log(response.data.result);

        refreshFunction(response.data.result);
        setCommentValue("");
      } else {
        alert("커멘트를 저장하지 못했습니다.");
      }
    });
  };

  const checkAuth = () => {
    console.log(`user: ${user}`);
    if (!user.userData._id) {
      alert("로그인이 필요합니다.");
      history.push("/login");
    }
  };
  return (
    <div>
      <br />
      <p>Replies</p>
      <hr />

      {/* Comment Lists */}
      {console.log(comments)}
      {comments &&
        comments.map(
          (comment, index) =>
            !comment.responseTo && (
              <>
                <SingleComment
                  videoId={videoId}
                  comment={comment}
                  refreshFunction={refreshFunction}
                />
                <ReplyComment
                  parentCommentId={comment._id}
                  comments={comments}
                  videoId={videoId}
                  refreshFunction={refreshFunction}
                />
              </>
            )
        )}

      {/* Root Comment Form */}

      <form style={{ display: "flex" }} onSubmit={onSubmit}>
        <textarea
          style={{ width: "100%", borderRadius: "5px" }}
          onChange={onChange}
          value={commentValue}
          placeholder="코멘트를 작성해 주세요"
          onClick={checkAuth}
        />
        <br />
        <button style={{ width: "20%", height: "52px" }} onClick={onSubmit}>
          Submit
        </button>
      </form>
    </div>
  );
}

export default withRouter(Comment);
