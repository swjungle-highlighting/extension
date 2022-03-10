function get_source(timeList) {
    console.log('timeList ', timeList);

    var elements = document.getElementsByClassName('ytp-progress-bar-container')[0];
    
    timeList.map((value, index) =>{
        const div_elem = document.createElement("div");
        const textnode = document.createTextNode('★');
        let style_attr = "bottom: 5px; left: calc(" +
        value +
        "% - 8px);color: #FAFA7F;;display:flex; align-items: center; justify-content:center;  user-select: auto; position: absolute ; width: 12px ; height: 17px ; padding-top: 30px ; background-size: cover ; background-position: bottom ; background-repeat: no-repeat ; cursor: pointer ; z-index: 27 ;font-size: 26px;text-shadow: -1px 0 #fafa7f, 0 1px #fafa7f, 1px 0 #fafa7f, 0 -1px #fafa7f;";
        div_elem.setAttribute('style', style_attr);
        div_elem.appendChild(textnode);
        elements.appendChild(div_elem);
    })
    
    return timeList;
}


chrome.extension.sendMessage({
    action: "getSource",
    source: get_source(config)
});
