<template>
	<video ref="videoElement" id="video" v-if="videoUrl" :src="videoUrl" controls class="mt-4 w-full" width="1280"
		height="720"></video>
	<!-- <canvas id="video-canvas"></canvas> -->
</template>

<script setup lang="ts">
import {
	onMounted,
} from 'vue'

import {
	videoUrl,
	currentFrame,
	tracks,
	fps,
	videoElement,
	curSeg,
	till,
} from '@/variables'

import type { Segment } from '@/types'
let segments: Segment[];



const onTimeUpdate = () => {
	if (!videoElement) throw Error("Can't update timeline because no video element is available!");
	const frame = Math.round(video.currentTime * fps.value);  // Convert time to frame

	// console.log("Redering frame!");
	// console.log(`till: ${till}`);
	// console.log(`currentFrame: ${currentFrame}`);
	// console.log(curSeg.value);


	//Stop at last frame;
	if (frame > till.value) {
		curSeg.value++;
		while (curSeg.value < segments.length && segments[curSeg.value].removed) curSeg.value++; //You can precompute before hand
		currentFrame.value = segments[curSeg.value].start;
		video.currentTime = segments[curSeg.value].start / fps.value; // WARNING: THIS IS SLOW
		// video.fastSeek(segments[curSeg.value].start / fps.value) //WARNING: Only for keyframes

		while (curSeg.value < segments.length && !segments[curSeg.value].removed) curSeg.value++;
		curSeg.value--;
		till.value = segments[curSeg.value].end;
	}

	currentFrame.value = frame;
	requestAnimationFrame(onTimeUpdate);
}


let video: HTMLVideoElement; //for speed reasons

onMounted(() => {
	video = document.getElementById('video') as HTMLVideoElement;
	videoElement.value = video;
	if (!videoElement) throw Error("No video selected!");
	segments = tracks.value[0].segments;
	curSeg.value = 0;
	console.log("Added EventListener to video!");
	onTimeUpdate();
});

</script>
