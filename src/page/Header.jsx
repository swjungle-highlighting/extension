/*global chrome*/

import React from 'react';
import "./Header.scss";

function Header() {

    return (
        <div className="navbar">
            <div id="Home">
                <img className="Logo" src={require("./icon.png")} alt="HT!" />
                <span className='Logoe-text'>HIGHLIGHTING</span>
            </div>
        </div>
    );
}

export default Header;
