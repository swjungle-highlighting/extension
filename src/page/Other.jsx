/*global chrome*/

import React from 'react';

import './Other.scss'

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
        // <div className='youtube-box'>
        // <span className='youtube-message'>하이라이트를 보고 싶은 영상을 고르세요!</span>
        // <div className='other-box'>
        //     <span className='other-message'>유튜브가 아닙니다. 유튜브로 이동하세요.</span>
        //     <button className='other-button' onClick={newTab}>유튜브 바로가기</button>
        <div className='other-box'>
            <span className='other-message'>여기는 유튜브 또는 트위치가 아닙니다. 유튜브 또는 트위치로 이동하세요.</span>
            <div>
                <button className='other-button' onClick={goYoutube}>유튜브 바로가기</button>
            </div>
            <div>
                <button className='other-button' onClick={gotwitch}>트위치 바로가기</button>
            </div>
        </div>
    );
}

export default Other;
