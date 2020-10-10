const YOUTUBE_API_KEY = "AIzaSyCBh7t43IXl8pzgITKTqD6fuTXCEJjh3is";

const GetPlaylist = async id => {
	let videoArray = [];
	let videosCollected = 0;
	let playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=49&playlistId=${id}&key=${YOUTUBE_API_KEY}`;
	let finishedCollectingPlaylistData = false;
	for (let i = 0; i < 5 && !finishedCollectingPlaylistData; i++) {
		await fetch(playlistUrl).then(response => response.json()).then(data => {
			// actual fetching of data
			videoArray = videoArray.concat(data.items);
			videosCollected += data.items.length;
			if (videosCollected >= data.pageInfo.totalResults) {
				finishedCollectingPlaylistData = true;
			} else {
				playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=49&pageToken=${data.nextPageToken}&playlistId=${id}&key=${YOUTUBE_API_KEY}`;
			}
		});
	}
	return videoArray;
}

var videoArray;
var sortedVideoArray = [];
var currentVideoId = -1;
const ExecuteSearch = async _ => {
	currentVideoId = -1;
	sortedVideoArray = [];
	// get video arrary
	let url = document.querySelector("#urlInput").value;
	url = url.split("list=").pop();
	videoArray = await GetPlaylist(url);

	// sort video array using sort type
	let trueRandom = document.getElementById("trueRandom").checked;
	let smartRandom = document.getElementById("smartRandom").checked;
	let loop = document.getElementById("loop").checked;
	if (trueRandom) {
		SortVideoArray("trueRandom");
	} else if (smartRandom) {
		SortVideoArray("smartRandom");
	} else {
		SortVideoArray("loop");
	}
	PlayNextVideo();
}

var player = null;
function PlayNextVideo() {
	currentVideoId++;
	if (currentVideoId === sortedVideoArray.length) {
		currentVideoId = 0;
	}

	// create new player
	if (player === null)
	{
		player = new YT.Player("player", {
			width: "640",
			height: "360",
			videoId: sortedVideoArray[currentVideoId],
			events: {
				onReady: OnPlayerReady,
				onStateChange: OnPlayerStateChange
			}
		});
	}
	else {
		player.loadVideoById(sortedVideoArray[currentVideoId],0);
	}
}

function SortVideoArray(sortType) {
	if (sortType == "trueRandom") {
		for (let i = 0; i < videoArray.length * 5; i++) {
			let randInt = Math.floor(Math.random() * videoArray.length);
			sortedVideoArray[i] = videoArray[randInt].snippet.resourceId.videoId;
		}
	} else if (sortType == "smartRandom") {
		Shuffle(videoArray);
		for (let i = 0; i < videoArray.length; i++) {
			sortedVideoArray[i] = videoArray[i].snippet.resourceId.videoId;
		}
	} else if (sortType == "loop") {
		for (let i = 0; i < videoArray.length; i++) {
			sortedVideoArray[i] = videoArray[i].snippet.resourceId.videoId;
		}
	}
}

function Shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function OnPlayerReady(event) {
	event.target.playVideo();
}

function OnPlayerStateChange(event) {
	if (event.data === 0) {
		PlayNextVideo();
	}
}
