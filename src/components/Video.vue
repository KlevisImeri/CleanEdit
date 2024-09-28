<!-- eslint-disable vue/multi-word-component-names -->
<template>
	<video ref="video" id="video" v-if="videoUrl" :src="videoUrl" controls class="mt-4 w-full" width="1280"
		height="720"></video>
	<!-- <canvas id="video-canvas"></canvas> -->
</template>

<script setup lang="ts">
import {
	onMounted,
	onUnmounted,
} from 'vue'

import {
	videoUrl,
	currentFrame,
	tracks,
	fps,
	video,
	curSeg,
	till,
	totalDuration,
  secToFps,
  sel1,
  sel2,
} from '@/variables'

import { 
  inflateSegments 
} from '@/fileUtil'; 


const onTimeUpdate = () => {
	if (!video.value) throw Error("Can't update timeline because no video element is available!");
  let segments = tracks.value[0].segments;
  if (segments.length===0) {
    requestAnimationFrame(onTimeUpdate);
    return;
  }
  // Just a check not really needed though (dont make it equal cause then video does the reload thing)
  if (video.value.currentTime > video.value.duration) {
    video.value.currentTime = video.value.duration;
    video.value.pause();
    requestAnimationFrame(onTimeUpdate);
    return;
  }
	// console.log("Redering frame!");

  currentFrame.value = secToFps(video.value.currentTime);
  // console.log(video.value.currentTime)

	if (currentFrame.value > till.value) {
		curSeg.value++;
		while (curSeg.value < segments.length && segments[curSeg.value].removed) curSeg.value++; //You can precompute before hand
    if(curSeg.value == segments.length && segments.length!=0){
      curSeg.value--;
      currentFrame.value = segments[curSeg.value].end;
      video.value.currentTime = segments[curSeg.value].end / fps.value; // WARNING: THIS IS SLOW
    } else {
      currentFrame.value = segments[curSeg.value].start;  
      video.value.currentTime = segments[curSeg.value].start / fps.value; // WARNING: THIS IS SLOW
      // video.fastSeek(segments[curSeg.value].start / fps.value) //WARNING: Only for keyframes
    }

		while (curSeg.value < segments.length && !segments[curSeg.value].removed) curSeg.value++;
		curSeg.value--;
		till.value = segments[curSeg.value].end;
	}
  // console.log(`till: ${till.value}`)
	// console.log(`currentFrame: ${currentFrame.value}`);
	// console.log(`currentSeg: ${curSeg.value}`);
	requestAnimationFrame(onTimeUpdate);
}

const onKeyDown = (event: KeyboardEvent) => {
  let segments = tracks.value[0].segments;
	if (event.key === 'e' || event.key === 'E') {
    if(sel1.value===-1 && sel2.value===-1){
      segments[curSeg.value].removed = !segments[curSeg.value].removed;
    } else if (sel1.value!==-1 && sel2.value!==-1) {
      const start = Math.min(sel1.value, sel2.value);
      const end = Math.max(sel1.value, sel2.value);
      const removed = !segments[start].removed;
      for (let i = start; i <= end; i++) {
        segments[i].removed = removed;
      }
    } else if(sel1.value!==-1){
      segments[sel1.value].removed = !segments[sel1.value].removed;
    } else if(sel2.value!==-1){
      segments[sel2.value].removed = !segments[sel2.value].removed;
    }
		// console.log(`Segment ${curSeg.value} removed status:`, segments[curSeg.value].removed);
	}
}


onMounted(() => {
	video.value = document.getElementById('video') as HTMLVideoElement;
  video.value.addEventListener('loadedmetadata',() => {
    if (!video.value) throw Error("No video selected!");
    totalDuration.value = Math.round(video.value.duration * fps.value);
    console.log('Total number of frames:', totalDuration.value);
    tracks.value[0].segments = inflateSegments(tracks.value[0].segments);
  })
  window.addEventListener("keydown", onKeyDown);
  console.log("Added EventListener to video!");
  onTimeUpdate();
});

onUnmounted(() => {
	window.removeEventListener("keydown", onKeyDown);
});

</script>
