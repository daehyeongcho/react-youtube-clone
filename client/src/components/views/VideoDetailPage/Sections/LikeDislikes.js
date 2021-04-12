import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { withRouter } from "react-router-dom";
import { Tooltip, Icon } from "antd";
import Axios from "axios";

function LikeDislikes(props) {
  const user = useSelector((state) => state.user);

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [likeAction, setLikeAction] = useState(null);

  const variable = { userId: props.userId };

  if (props.videoId) {
    variable.videoId = props.videoId;
  } else {
    variable.commentId = props.commentId;
  }

  useEffect(() => {
    Axios.post("/api/like/getLikes", variable).then((response) => {
      if (response.data.success) {
        // 얼마나 많은 좋아요를 받았는지
        setLikes(response.data.likes.length);

        // 내가 이미 그 좋아요를 눌렀는지
        response.data.likes.forEach((like) => {
          if (like.userId === props.userId) {
            setLikeAction("liked");
          }
        });
      } else {
        alert("Likes 정보를 가져오지 못했습니다.");
      }
    });

    Axios.post("/api/like/getDislikes", variable).then((response) => {
      if (response.data.success) {
        // 얼마나 많은 싫어요를 받았는지
        setDislikes(response.data.dislikes.length);

        // 내가 이미 그 싫어요를 눌렀는지
        response.data.dislikes.forEach((dislike) => {
          if (dislike.userId === props.userId) {
            setLikeAction("disliked");
          }
        });
      } else {
        alert("Dislikes 정보를 가져오지 못했습니다.");
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onLike = () => {
    if (!user.userData._id) {
      alert("로그인이 필요합니다.");
      return props.history.push("/login");
    }

    if (likeAction === "liked") {
      Axios.post("/api/like/unLike", variable).then((response) => {
        console.log(response);
        if (response.data.success) {
          setLikes(likes - 1);
          setLikeAction(null);
        } else {
          alert("좋아요 취소에 실패했습니다");
        }
      });
    } else {
      Axios.post("/api/like/upLike", variable).then((response) => {
        console.log(response);
        if (response.data.success) {
          if (likeAction === "disliked") {
            setDislikes(dislikes - 1);
          }
          setLikes(likes + 1);
          setLikeAction("liked");
        } else {
          alert("좋아요에 실패했습니다");
        }
      });
    }
  };

  const onDislike = () => {
    if (!user.userData._id) {
      alert("로그인이 필요합니다.");
      return props.history.push("/login");
    }

    if (likeAction === "disliked") {
      Axios.post("/api/like/unDislike", variable).then((response) => {
        console.log(response);
        if (response.data.success) {
          setDislikes(dislikes - 1);
          setLikeAction(null);
        } else {
          alert("싫어요 취소에 실패했습니다");
        }
      });
    } else {
      Axios.post("/api/like/upDislike", variable).then((response) => {
        console.log(response);
        if (response.data.success) {
          if (likeAction === "liked") {
            setLikes(likes - 1);
          }
          setDislikes(dislikes + 1);
          setLikeAction("disliked");
        } else {
          alert("싫어요에 실패했습니다");
        }
      });
    }
  };

  return (
    <div>
      <span key="comment-basic-like">
        <Tooltip title="Like">
          <Icon
            type="like"
            theme={likeAction === "liked" ? "filled" : "outlined"}
            onClick={onLike}
          />
        </Tooltip>
        <span style={{ paddingLeft: "8px", cursor: "auto" }}> {likes} </span>
      </span>
      &nbsp;&nbsp;
      <span key="comment-basic-dislike">
        <Tooltip title="Dislike">
          <Icon
            type="dislike"
            theme={likeAction === "disliked" ? "filled" : "outlined"}
            onClick={onDislike}
          />
        </Tooltip>
        <span style={{ paddingLeft: "8px", cursor: "auto" }}> {dislikes} </span>
      </span>
      &nbsp;&nbsp;
    </div>
  );
}

export default withRouter(LikeDislikes);
