function get_source(time_percent) {
    console.log('time_percent ', time_percent);


    const div_elem = document.createElement("div");
    const textnode = document.createTextNode('★');
    let style_attr = 'bottom: 11px; left: calc('+time_percent+'% - 8px); user-select: auto; position: absolute !important; width: 12px !important; height: 17px !important; padding-top: 30px !important; background-size: cover !important; background-position: bottom !important; background-repeat: no-repeat !important; cursor: pointer !important; z-index: 2000 !important;';
    div_elem.setAttribute('style',style_attr);
    div_elem.appendChild(textnode);

    var elements = document.getElementsByClassName('ytp-progress-bar-container')[0];
    elements.appendChild(div_elem);


    return time_percent;
}
chrome.extension.sendMessage({
    action: "getSource",
    source: get_source(config)
});
