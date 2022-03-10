/*global chrome*/

import React from 'react';

import './Other.scss'

function Other() {

    function newTab(activeTab)
    {
        const newURL = 'https://www.youtube.com/'
        chrome.tabs.create({ url: newURL });
    }

    return (
        <div className='other-box'>
            <span className='other-message'>유튜브가 아닙니다. 유튜브로 이동하세요.</span>
            <button className='other-button' onClick={newTab}>유튜브 바로가기</button>
        </div>
    );
}

export default Other;
