/*global chrome*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './Main.scss'

function Main(props) {

	const server_addr = "http://143.248.193.175:5000";
	const [markers, setMarkers] = useState([]);
	const [check, setCheck] = useState(null);
	const [basicUrl, setBasicUrl] = useState('');

	console.log('Main', props.url)

	function checkResult(url) {
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
				if (response.data.result === 1) {
					requestResult(url)
				}
				else {
					setCheck("하이라이트가 없습니다!")
				}
			})
			.catch((error) => {
			});
	}

	function getLinkedInHrefs() {
		var first = document.createElement('div');
		first.createTextNode('hello');
		var target = document.getElementsByClassName("ytp-timed-markers-container")[0];
		target.appendChild(first);
		alert("test");
	}


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
		console.log('requestUrl', url)
		axios
			.post(server_addr + "/flask/hello", {
				url: url,
			})
			.then((response) => {
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
						chrome.tabs.executeScript(null, { file: 'script.js' });
					});
				}

			})
			.catch((error) => {
			});
	}

	useEffect(() => {
		console.log('url', props.url)
		if (props.url.length > 44) {
			const url = props.url.substr(0, 43)
			setBasicUrl(url);
		}
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

	function clickE(start) {
		console.log("clicked", props.url)
		const newURL = "https://www.youtube.com/watch?v=gdZLi9oWNZg&t=" + start + "s";
		chrome.tabs.update(undefined, { url: newURL });
	}

	return (
		<div className='main' style={{
			fontWeight: "bold",
			fontSize: "1.5rem",
		}}
		>
			{check !== null ? check : (
				markers.length === 0 ? "북마크가 없습니다" :
					markers.map(marker => (
						<div className="marker" key={marker.id} onClick={() => { clickE(marker.startPointer) }}>
							{/* <button >go</button> */}
							<div
								className="thumbnail"
								style={{
									background: `url(${server_addr}/${basicUrl?.split("=")[1]
										}.jpg)`,
									width: "176px",
									height: "100px",
									backgroundRepeat: "no-repeat",
									backgroundPosition: `  ${-177 *
										Math.floor(
											Math.floor(marker.startPointer % 60) / 10
										) -
										1
										}px  ${-100 * Math.floor(marker.startPointer / 60)}px`,
								}}
							/>
							<div className='marker-right'>
								<div className="marker-time">● {format(marker.startPointer)}~{format(marker.endPointer)}</div>
								<div calssName="marker-memo">{marker.text}</div>
							</div>
							{/* <hr /> */}
						</div>
					)))
			}
		</div>
	);
}

export default Main;
