<template>
	<canvas id="video-canvas"></canvas>
</template>

<script setup lang="ts">
//WARNING: NOT BEING USED (LEFTOVERS)
import {
	onMounted,
} from 'vue'

import {
	videoUrl,
	currentFrame,
	tracks,
	fps,
	videoElement,
} from '@/variables'

import type { Segment } from '@/types'

let segments: Segment[] = [];
let VIDEO_CANVAS: HTMLCanvasElement;
const FRAME_RATE = 60;
let video: HTMLVideoElement;
let context: CanvasRenderingContext2D | null = null;
const SCALE = 3;

function load(): HTMLVideoElement {
	video = initializeVideo();
	VIDEO_CANVAS = document.getElementById('video-canvas') as HTMLCanvasElement;
	if (VIDEO_CANVAS === null) {
		throw Error("Could not get the canvas to display the video");
	}

	video.addEventListener('loadeddata', () => {
		if (VIDEO_CANVAS === null) return;
		context = VIDEO_CANVAS.getContext("2d");
		if (context === null) {
			throw Error("Could not get the context for video!");
		}
		context.canvas.width = video.videoWidth / SCALE;
		context.canvas.height = video.videoHeight / SCALE;
		processVideos();
	});

	return video;
}

function initializeVideo() {
	const video = document.createElement('video');
	if (videoUrl.value === null) {
		throw Error("Video URL does not exist!");
	}
	video.src = videoUrl.value;
	video.load();
	return video;
}

let till = 0;
let curSeg = 0;
let isProcessing = false;

function processVideos() {
	if (isProcessing) return;
	isProcessing = true;

	context = VIDEO_CANVAS.getContext("2d");
	if (!context) {
		console.error("Canvas context is not available");
		isProcessing = false;
		return;
	}

	if (currentFrame.value > till) {
		curSeg++;
		while (curSeg < segments.length && segments[curSeg].removed) curSeg++;
		till = segments[curSeg].end;
		currentFrame.value = segments[curSeg].start;
	}

	showVideoFrame();
	currentFrame.value++;
	requestAnimationFrame(() => processVideos());
}

function showVideoFrame() {
	if (!context) {
		console.error("Canvas context is not available");
		return;
	}

	let time = currentFrame.value / FRAME_RATE;
	video.currentTime = time;
	context.clearRect(0, 0, VIDEO_CANVAS.width, VIDEO_CANVAS.height); // Clear canvas before drawing
	context.drawImage(video, 0, 0, VIDEO_CANVAS.width, VIDEO_CANVAS.height);
	console.log("Rendered Frame!");
}

onMounted(() => {
	videoElement.value = load();
	if (!videoElement) throw Error("No video selected!");
	segments = tracks.value[0].segments;
});

</script>
