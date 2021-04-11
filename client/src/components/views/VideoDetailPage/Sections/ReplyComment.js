import React, { useEffect, useState } from "react";
import SingleComment from "./SingleComment";

export default function ReplyComment({
  parentCommentId,
  comments,
  videoId,
  refreshFunction,
}) {
  const [childCommentNumber, setChildCommentNumber] = useState(0);
  const [openReplyComments, setOpenReplyComments] = useState(false);
  useEffect(() => {
    let commentNumber = 0;
    comments.forEach((comment) => {
      if (comment.responseTo === parentCommentId) {
        commentNumber = commentNumber + 1;
      }
    });

    setChildCommentNumber(commentNumber);
  }, [comments, parentCommentId]);

  const renderReplyComment = (parentCommentId) =>
    comments.map((comment, index) => (
      <>
        {comment.responseTo === parentCommentId && (
          <div style={{ width: "80%", marginLeft: "40px" }}>
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
          </div>
        )}
      </>
    ));

  const onClick = () => {
    setOpenReplyComments(!openReplyComments);
  };
  return (
    <div>
      {childCommentNumber > 0 && (
        <p
          style={{ fontSize: "14px", margin: 0, color: "gray" }}
          onClick={onClick}
        >
          View {childCommentNumber} more content{childCommentNumber > 1 && "s"}
        </p>
      )}
      {openReplyComments && renderReplyComment(parentCommentId)}
    </div>
  );
}
