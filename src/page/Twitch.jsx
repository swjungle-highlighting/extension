/*global chrome*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Twitch(props) {

    // const server_addr = "http://143.248.193.175:5000";
    const server_addr = "http://192.249.28.30:5000";
    const [markers, setMarkers] = useState([]);
    const [check, setCheck] = useState(null);

    function requestResult(url) {
        let command = '';
        let timeList = [];

        chrome.extension.onMessage.addListener(function (request, sender) {
            if (request.action == "getSource") {
                console.log(request.source);
            }
        });

        console.log(url)
        if (url.length > 44) {
            url = url.substr(0, 43)
        }
        console.log(url)
        axios
            .post(server_addr + "/extension", {
                url: url,
            })
            .then((response) => {
                if (response.data.status === "200") {
                    console.log(response.data)
                    Object.entries(response.data.bookmarker).forEach(([key, value]) => {
                        setMarkers(markers => [...markers, value])
                        timeList.push(((value.startPointer / Number(response.data.result.duration)) * 100).toFixed(4))
                    })

                    console.log(timeList);
                    command = 'var config = ['.concat(timeList.toString(), '];');
                    console.log(command)
                    if (timeList.length !== 0) {
                        chrome.tabs.executeScript(null, {
                            code: command
                        }, function () {
                            chrome.tabs.executeScript(null, { file: 'youtube.js' });
                        });
                    }

                } else {
                    setCheck("북마커가 없습니다!")
                }
            })
            .catch((error) => {
            });
    }

    useEffect(() => {
        requestResult(props.url)
    }, [])

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

    return (
        <div className='main' style={{
            fontWeight: "bold",
            fontSize: "1.5rem",
        }}
        >
            {check !== null ? check : (
                markers.map(marker => (
                    <div key={marker.id}>
                        {/* <button >go</button> */}
                        <div>● {format(marker.startPointer)}~{format(marker.endPointer)}</div>
                        <div>{marker.text}</div>
                        <hr />
                    </div>
                )))
            }
        </div>
    );
}

export default Twitch;
