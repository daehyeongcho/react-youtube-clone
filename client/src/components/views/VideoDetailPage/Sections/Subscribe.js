import React, { useEffect, useState } from "react";
import Axios from "axios";

export default function Subscribe({ userTo, userFrom }) {
  const [subscribeNumber, setSubscribeNumber] = useState(0);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    Axios.post("/api/subscribe/subscribeNumber", { userTo }).then(
      (response) => {
        if (response.data.success) {
          setSubscribeNumber(response.data.subscribeNumber);
        } else {
          alert("구독자 수 정보를 받아오지 못했습니다.");
        }
      }
    );

    Axios.post("/api/subscribe/subscribed", {
      userTo,
      userFrom,
    }).then((response) => {
      if (response.data.success) {
        setSubscribed(response.data.subscribed);
      } else {
        alert("정보를 받아오지 못했습니다.");
      }
    });
  }, [userTo, userFrom]);

  const onSubscribe = () => {
    // 이미 구독중이라면
    if (subscribed) {
      Axios.post("/api/subscribe/unSubscribe", {
        userTo,
        userFrom,
      }).then((response) => {
        if (response.data.success) {
          setSubscribeNumber(subscribeNumber - 1);
          setSubscribed(!subscribed);
        } else {
          console.log(response.data);
          alert("구독 취소에 실패했습니다");
        }
      });

      // 아직 구독중이 아니라면
    } else {
      Axios.post("/api/subscribe/subscribe", {
        userTo,
        userFrom,
      }).then((response) => {
        if (response.data.success) {
          setSubscribeNumber(subscribeNumber + 1);
          setSubscribed(!subscribed);
        } else {
          alert("구독하는데 실패했습니다");
        }
      });
    }
  };

  return (
    <div>
      <button
        style={{
          backgroundColor: `${subscribed ? "#AAAAAA" : "#CC0000"}`,
          borderRadius: "4px",
          color: "white",
          padding: "10px 16px",
          fontWeight: "500",
          fontSize: "1rem",
          textTransform: "uppercase",
        }}
        onClick={onSubscribe}
      >
        {subscribeNumber} {subscribed ? "Subscribed" : "Subscribe"}
      </button>
    </div>
  );
}
