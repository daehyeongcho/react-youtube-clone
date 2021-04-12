// rfc 입력하면 자동완성

import React, { useEffect, useState } from "react";
import { Row, Col, List, Avatar } from "antd";
import Axios from "axios";
import SideVideo from "./Sections/SideVideo";
import Subscribe from "./Sections/Subscribe";
import Comment from "./Sections/Comment";
import LikeDislikes from "./Sections/LikeDislikes";

export default function VideoDetailPage(props) {
  const videoId = props.match.params.videoId;
  const variable = { videoId };
  const [videoDetail, setVideoDetail] = useState([]);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    Axios.post("/api/video/getVideoDetail", variable).then((response) => {
      if (response.data.success) {
        setVideoDetail(response.data.videoDetail);
      } else {
        alert("비디오 정보를 가져오지 못했습니다");
      }
    });

    Axios.post("/api/comment/getComments", variable).then((response) => {
      if (response.data.success) {
        setComments(response.data.comments);
        console.log("뭐임이거?");
        console.log(response.data.comments);
      } else {
        alert("코멘트 정보를 가져오는 데에 실패했습니다");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateComments = (newComment) => {
    setComments(comments.concat(newComment));
    // setComments([...comments, newComment]); // 이렇게 작성하면 에러가 난다 이유를 모르겠음.
  };

  // image정보 가져오기 전에 렌더링되면서 image가 undefined가 됨
  // videoDetail.writer가 있으면 렌더링되도록 해야함
  if (videoDetail.writer) {
    const userTo = videoDetail.writer._id;
    const userFrom = localStorage.getItem("userId");
    const subscribeButton = userTo !== userFrom && (
      <Subscribe userTo={userTo} userFrom={userFrom} />
    );

    return (
      <div>
        <Row>
          <Col lg={18} xs={24}>
            <div style={{ width: "100%", padding: "3rem 4rem" }}>
              <video
                style={{ width: "100%" }}
                src={`http://localhost:5000/${videoDetail.filePath}`}
                controls
              />
              <List.Item
                actions={[
                  <LikeDislikes userId={userFrom} videoId={videoId} />,
                  subscribeButton,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={videoDetail.writer.image} />}
                  title={videoDetail.title}
                  description={videoDetail.description}
                />
              </List.Item>
              <Comment
                videoId={videoId}
                comments={comments}
                refreshFunction={updateComments}
              />
            </div>
          </Col>
          <Col lg={6} xs={24}>
            <SideVideo />
          </Col>
        </Row>
      </div>
    );
  } else {
    return <div>...loading</div>;
  }
}
