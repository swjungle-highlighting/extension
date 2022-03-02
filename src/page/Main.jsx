/*global chrome*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from './Chart';

function Main(props) {

    const server_addr = "http://143.248.193.175:5000";
    const [markers, setMarkers] = useState([]);
    const [check, setCheck] = useState(null);
    const [chat, setChat] = useState();
    const [audio, setAudio] = useState();
    const [video, setVideo] = useState();
    const [url, setUrl] = useState();


    function checkResult(url) {
        axios
            .post(server_addr + "/extension", {
                url: url,
            })
            .then((response) => {
                if (response.data.result === 1) {
                    requestResult(url)
                }
                else {
                    setCheck("하이라트가 없습니다!")
                }
            })
            .catch((error) => {
            });
    }

    function requestResult(url) {
        let temp = null;
        axios
            .post(server_addr + "/flask/hello", {
                url: url,
            })
            .then((response) => {
                console.log('result',response.data)

                Object.entries(response.data.bookmarker).forEach(([key, value]) => {
                    setMarkers(markers => [...markers, value])
                })

                temp = response.data.result.chat[0].map(
                    (value, index) => ({ x: index, y: value })
                  );
                setChat(temp)
                console.log('chat',temp)

                temp = response.data.result.audio.map(
                    (value, index) => ({ x: index, y: value })
                  );
                setAudio(temp)
                console.log('audio',temp)

                temp = response.data.result.video.map(
                    (value, index) => ({ x: index, y: value })
                  );
                setVideo(temp)
                console.log('video',temp)
                
            })
            .catch((error) => {
            });
    }

    useEffect(() => {
        checkResult(props.url)
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
        <div className='main'>
            {check !== null ? check :
                markers.map(marker => (
                    <div key={marker.id}>
                        <div>{format(marker.startPointer)}~{format(marker.endPointer)}</div>
                        <div>{marker.text}</div>
                    </div>
                ))
            }
            <Chart dataList={[chat, video, audio]} />
        </div>
    );
}

export default Main;
