/*global chrome */

import React, { useEffect, useState } from "react";
import axios from "axios";

import "./youtube.scss";

function Youtube(props) {
  // const server_addr = "http://192.249.28.125:5000";
  const server_addr = "http://143.248.193.175:5000";
  const [markers, setMarkers] = useState([]);
  const [check, setCheck] = useState("loading");
  const [basicUrl, setBasicUrl] = useState("");

  function requestResult(url) {
    let command = "";
    let timeList = [];

    chrome.extension.onMessage.addListener(function (request, sender) {
      if (request.action == "getSource") {
        console.log(request.source);
      }
    });

    console.log(url);
    if (url.length > 44) {
      url = url.substr(0, 43);
    }
    console.log(url);
    axios
      .post(server_addr + "/extension", {
        url: url,
      })
      .then((response) => {
        if (response.data.status === "200") {
          console.log(response.data);
          Object.entries(response.data.bookmarker).forEach(([key, value]) => {
            setMarkers((markers) => [...markers, value]);
            timeList.push(
              (
                (value.startPointer / Number(response.data.duration)) *
                100
              ).toFixed(4)
            );
          });

          console.log(timeList);
          command = "var config = [".concat(timeList.toString(), "];");
          console.log(command);
          if (timeList.length !== 0) {
            chrome.tabs.executeScript(
              null,
              {
                code: command,
              },
              function () {
                chrome.tabs.executeScript(null, { file: "youtube.js" });
              }
            );
          }
        }
        setCheck(null);
      })
      .catch((error) => {});
  }

  useEffect(() => {
    console.log("props.url in Effect", props.url);
    const url = props.url.substr(0, 43);
    setBasicUrl(url);
    requestResult(url);
    console.log("props.url in Effect", url);
  }, []);

  function pad(string) {
    return ("0" + string).slice(-2);
  }

  function format(seconds) {
    const date = new Date(seconds * 1000);
    const hh = date.getUTCHours();
    const mm = date.getUTCMinutes();
    const ss = pad(date.getUTCSeconds());
    if (hh) {
      return `${hh}:${pad(mm)}:${ss}`;
    }
    return `${mm}:${ss}`;
  }

  function clickE(start) {
    console.log("clicked");
    const newURL = basicUrl + "&t=" + start + "s";
    chrome.tabs.update(undefined, { url: newURL });
  }

  return (
    <div
      className="main"
      style={{
        fontWeight: "bold",
        fontSize: "1.5rem",
      }}
    >
      {check === "loading"
        ? check
        : markers.map((marker) => (
            <div
              className="thumbnail-box"
              key={marker.id}
              onClick={() => {
                clickE(marker.startPointer);
              }}
            >
              {/* <button >go</button> */}
              <div
                className="thumbnail"
                style={{
                  background: `url(${server_addr}/${
                    basicUrl?.split("=")[1]
                  }.jpg)`,
                  width: "176px",
                  height: "100px",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: `  ${
                    -177 *
                      Math.floor(Math.floor(marker.startPointer % 60) / 10) -
                    1
                  }px  ${-100 * Math.floor(marker.startPointer / 60)}px`,
                }}
              />
              <div className="memo-box">
                <div>
                  {format(marker.startPointer)}~{format(marker.endPointer)}
                </div>
                <div>{marker.text}</div>
              </div>
            </div>
          ))}
    </div>
  );
}

export default Youtube;
