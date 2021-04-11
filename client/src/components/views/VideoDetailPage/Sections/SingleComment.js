import React, { useState } from "react";
import { useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { Comment, Avatar } from "antd";
import Axios from "axios";

function SingleComment({ videoId, comment, refreshFunction, history }) {
  const user = useSelector((state) => state.user);
  const [openReply, setOpenReply] = useState(false);
  const [commentValue, setCommentValue] = useState("");

  const onClickReplyOpen = () => {
    setOpenReply(!openReply);
  };
  const onChange = (e) => {
    setCommentValue(e.target.value);
  };
  const onSubmit = (e) => {
    e.preventDefault();

    const variables = {
      content: commentValue,
      writer: user.userData._id,
      videoId,
      responseTo: comment._id,
    };

    console.log(variables);
    Axios.post("/api/comment/saveComment", variables).then((response) => {
      if (response.data.success) {
        console.log(response.data.result);
        refreshFunction(response.data.result);
        setOpenReply(!openReply);
        setCommentValue("");
      } else {
        alert("커멘트를 저장하지 못했습니다.");
      }
    });
  };

  const actions = [
    <span onClick={onClickReplyOpen} key="comment-basic-reply-to">
      Reply to
    </span>,
  ];

  const checkAuth = () => {
    console.log(`user: ${user}`);
    if (!user.userData._id) {
      alert("로그인이 필요합니다.");
      history.push("/login");
    }
  };

  return (
    <div>
      <Comment
        actions={actions}
        author={comment.writer.name}
        avatar={<Avatar src={comment.writer.image} alt="image" />}
        content={<p>{comment.content}</p>}
      />
      {openReply && (
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
      )}
    </div>
  );
}

export default withRouter(SingleComment);
