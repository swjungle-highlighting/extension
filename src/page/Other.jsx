/*global chrome*/

import React from 'react';

function Other() {

    function goYoutube(activeTab)
    {
        const newURL = 'https://www.youtube.com/'
        chrome.tabs.create({ url: newURL });
    }

    function gotwitch(activeTab)
    {
        const newURL = 'https://www.twitch.tv/'
        chrome.tabs.create({ url: newURL });
    }

    return (
        <div>
            여기는 유튜브 또는 트위치가 아닙니다. 유튜브 또는 트위치로 이동하세요.
            <div>
                <button onClick={goYoutube}>유튜브 바로가기</button>
            </div>
            <div>
                <button onClick={gotwitch}>트위치 바로가기</button>
            </div>
        </div>
    );
}

export default Other;
