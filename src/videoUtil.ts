//WARNING: NOT BEING USED (LEFTOVERS)

import {
	videoUrl,
} from '@/variables'


let VIDEO_CANVAS: HTMLCanvasElement;
const FRAME_RATE = 60;
let video: HTMLVideoElement;

export function show() {
	video = initializeVideo();
	VIDEO_CANVAS = document.getElementById('video-canvas') as HTMLCanvasElement;
	if (VIDEO_CANVAS === null) {
		throw Error("Could not get the canvas to display the video");
	}
	video.addEventListener('loadeddata', (event) => {
		if (VIDEO_CANVAS === null) return;
		const context = VIDEO_CANVAS.getContext("2d"); if (VIDEO_CANVAS === null) return;
		if (context === null) {
			throw Error("Cound not get the context for video!");
		}
		context.canvas.width = video.videoWidth;
		context.canvas.height = video.videoHeight;
		// processVideos();
	});
}

function initializeVideo() {
	var video = document.createElement('video');
	if (videoUrl.value === null) {
		throw Error("Video url does not exits!");
	}
	video.src = videoUrl.value;
	video.load();
	return video;
}

// function processVideos() {
// 	const context = VIDEO_CANVAS.getContext("2d");
//
// 	if (frame1 <= 130) {
// 		showVideoFrame(video1, frame1);
// 		if (frame1 < 10) {
// 			darkenScene(1 - (frame1 / 10));
// 		}
// 		frame1++;
// 	}
//
// 	if (frame1 >= 127) {
// 		switch (frame2) {
// 			case 70: context.globalAlpha = 0.33; break;
// 			case 71: context.globalAlpha = 0.66; break;
// 			default: context.globalAlpha = 1; break;
// 		}
// 		var shake = false;
// 		if (frame2 > 625) {
// 			shake = true;
// 		}
// 		showVideoFrame(video2, frame2, true, shake);
//
// 		if (frame2 > 700) {
// 			darkenScene((frame2 - 700) / 10);
// 		}
// 		if (frame2 == 107) {
// 			frame2 = 333;
// 		}
// 		if (frame2 > 364 && frame2 < 394) {
// 			frame2++;
// 		}
// 		if (frame2 > 476 && frame2 < 503) {
// 			frame2++;
// 		}
// 		if (frame2 > 589 && frame2 < 624) {
// 			frame2 += 2;
// 		}
// 		frame2++;
// 	}
// 	showFrameNumbers(frame1, frame2);
// 	showFrameAroundContent();
// 	setTimeout(function() {
// 		processVideos(video1, video2, frame1, frame2);
// 	}, FRAME_RATE);
// }
//
// function showFrameAroundContent() {
// 	const context = VIDEO_CANVAS.getContext("2d");
// 	context.beginPath();
// 	context.fillStyle = "black";
// 	context.fillRect(0, 0, VIDEO_CANVAS.width, 5);
// 	context.fillRect(0, 0, 5, VIDEO_CANVAS.height);
// 	context.fillRect(0, VIDEO_CANVAS.height - 5, VIDEO_CANVAS.width, 5);
// 	context.fillRect(VIDEO_CANVAS.width - 5, 0, 5, VIDEO_CANVAS.height);
// }
//
// function showFrameNumbers(frame1, frame2) {
// 	const context = VIDEO_CANVAS.getContext("2d");
// 	context.font = "30px Arial";
// 	context.textAlign = "left";
// 	context.textBaseline = "top";
// 	context.fillStyle = "black";
// 	context.fillText(frame1 + ", " + frame2, 5, 5);
// }
//
// function showVideoFrame(video, frame, isReverse = false, shake = false) {
// 	var time = frame / FRAME_RATE;
// 	if (isReverse) {
// 		time = video.duration - time;
// 	}
// 	video.currentTime = time;
// 	var offsetX = 0;
// 	var offsetY = 0;
// 	if (shake == true) {
// 		offsetX = Math.floor(Math.random() * 10 - 5);
// 		offsetY = Math.floor(Math.random() * 10 - 5);
// 	}
// 	var context = VIDEO_CANVAS.getContext("2d");
// 	context.drawImage(video, offsetX, offsetY, VIDEO_CANVAS.width, VIDEO_CANVAS.height);
// }
//
//
// function darkenScene(opacity) {
// 	const context = VIDEO_CANVAS.getContext("2d");
// 	context.fillStyle = "rgba(0,0,0," + opacity + ")";
// 	context.fillRect(0, 0, VIDEO_CANVAS.width, VIDEO_CANVAS.height);
// 	context.fill();
// }
//
