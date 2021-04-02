import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Dropzone from "react-dropzone";

import { Typography, Button, Form, message, Input, Icon } from "antd";
import { InputSizes } from "antd/lib/input/Input";

import Axios from "axios";

const { TextArea } = Input;
const { Title } = Typography;

const PrivateOptions = [
  { value: 0, label: "Private" },
  { value: 1, label: "Public" },
];

const CategoryOptions = [
  { value: 0, label: "Film & Animation" },
  { value: 1, label: "Autos & Vehicles" },
  { value: 2, label: "Music" },
  { value: 3, label: "Pets & Animals" },
];

const initialInputs = {
  videoTitle: "",
  description: "",
  isPrivate: 0,
  category: 0,
};

const initialFileInfo = {
  filePath: "",
  duration: "",
  thumbnailPath: "",
};

function VideoUploadPage(props) {
  const user = useSelector((state) => state.user);
  const [inputs, setInputs] = useState(initialInputs);
  const [fileInfo, setFileInfo] = useState(initialFileInfo);

  const { videoTitle, description, isPrivate, category } = inputs;
  const { filePath, duration, thumbnailPath } = fileInfo;

  const onInputChange = (e) => {
    const { value, name } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const onDrop = async (files) => {
    let formData = new FormData();
    const config = {
      header: { "content-type": "multipart/form-data" },
    };

    // 여기 name이랑 multer().single의 필드 이름은 "반드시" 같아야한다!
    formData.append("file", files[0]);

    console.log(files);

    const resUpload = await Axios.post(
      "/api/video/uploadfiles",
      formData,
      config
    );
    if (resUpload.data.success) {
      console.log(resUpload.data);

      const { filePath, fileName } = resUpload.data;

      setFileInfo((fileInfo) => ({ ...fileInfo, filePath }));

      const resThumbnail = await Axios.post("/api/video/thumbnail", {
        filePath,
        fileName,
      });
      if (resThumbnail.data.success) {
        console.log(resThumbnail.data);

        const { fileDuration, thumbnailPath } = resThumbnail.data;
        setFileInfo((fileInfo) => ({
          ...fileInfo,
          duration: fileDuration,
          thumbnailPath,
        }));

        // 이유는 모르겠지만 setState를 함수형 업데이트로 바꾸기 전에는 fileInfo가 mongoDB에 반영이 안됐었음
      } else {
        alert("썸네일 생성에 실패했습니다");
      }
    } else {
      console.log(resUpload.data);
      alert("비디오 업로드에 실패했습니다");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const variables = {
      writer: user.userData._id,
      title: videoTitle,
      description,
      privacy: isPrivate,
      filePath,
      category,
      duration,
      thumbnail: thumbnailPath,
    };

    const response = await Axios.post("/api/video/uploadVideo", variables);
    if (response.data.success) {
      console.log(response.data);
      message.success("성공적으로 업로드를 했습니다");
      setTimeout(() => {
        props.history.push("/");
      }, 3000);
    } else {
      alert("비디오 업로드에 실패했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Title level={2}>Upload Video</Title>
      </div>

      <Form onSubmit={onSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Drop zone */}

          <Dropzone onDrop={onDrop} multiple={false} maxSize={100000000000000}>
            {({ getRootProps, getInputProps }) => (
              <div
                style={{
                  width: "300px",
                  height: "240px",
                  border: "1px solid lightgray",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Icon type="plus" style={{ fontSize: "3rem" }} />
              </div>
            )}
          </Dropzone>

          {/* Thumbnail */}
          {thumbnailPath && (
            <div>
              <img
                src={`http://localhost:5000/${thumbnailPath}`}
                alt="thumbnail"
              />
            </div>
          )}
        </div>
        <br />
        <br />
        <label>Title</label>
        <Input name="videoTitle" onChange={onInputChange} value={videoTitle} />
        <br />
        <br />
        <label>Description</label>
        <TextArea
          name="description"
          onChange={onInputChange}
          value={description}
        />
        <br />
        <br />

        <select name="isPrivate" onChange={onInputChange} value={isPrivate}>
          {PrivateOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <br />
        <br />
        <select name="category" onChange={onInputChange} value={category}>
          {CategoryOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        <br />
        <br />
        <Button type="primary" size="large" onClick={onSubmit}>
          Submit
        </Button>
      </Form>
    </div>
  );
}

export default VideoUploadPage;
