<template>
  <video 
    id = "video"
    v-if="videoBlobUrl"
    :src="videoBlobUrl"
    crossorigin="use-credentials" 
    class="mt-4 w-full max-w-full h-auto"
    style="max-height: 60vh;">
  </video>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import {
  selectedProject,
  currentFrame,
  fps,
  video,
  curSeg,
  till,
  secToFps,
  sel1,
  sel2,
} from '@/variables'

import {
  inflateSegments
} from '@/fileUtil';

import { videoApi } from '@/api/client';

const videoBlobUrl = ref<string | null>(null);

const videoSrc = computed(() => {
  if (!selectedProject.value?.video?.id) return '';
  return videoApi.getUrl(selectedProject.value.video.id);
});


const onTimeUpdate = () => {
  if (!video.value || !selectedProject.value) {
    requestAnimationFrame(onTimeUpdate);
    return;
  }
  let segments = selectedProject.value.tracks[0].segments;
  if (segments.length === 0) {
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
    if (curSeg.value == segments.length && segments.length != 0) {
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
  if (!selectedProject.value) return;
  const track = selectedProject.value.tracks?.[0];
  if (!track || !track.segments || track.segments.length === 0) return;
  
  const segments = track.segments;
  
  // Binary search to find segment at current frame
  const binarySearch = (time: number): number => {
    let low = 0;
    let high = segments.length - 1;
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const seg = segments[mid];
      if (time >= seg.start && time <= seg.end) {
        return mid;
      } else if (time < seg.start) {
        high = mid - 1;
      } else {
        low = mid + 1;
      }
    }
    return segments.length - 1;
  };

  if (event.key === 'w' || event.key === 'W') {
    const currentFrameValue = currentFrame.value;
    const segIndex = binarySearch(currentFrameValue);
    const seg = segments[segIndex];
    
    // Only split if not at segment boundaries
    if (currentFrameValue > seg.start && currentFrameValue < seg.end) {
      const newSegment = {
        id: Date.now(),
        start: currentFrameValue,
        end: seg.end,
        removed: seg.removed
      };
      seg.end = currentFrameValue;
      segments.splice(segIndex + 1, 0, newSegment);
    }
  } else if (event.key === 'e' || event.key === 'E') {
    if (sel1.value === -1 && sel2.value === -1) {
      segments[curSeg.value].removed = !segments[curSeg.value].removed;
    } else if (sel1.value !== -1 && sel2.value !== -1) {
      const start = Math.min(sel1.value, sel2.value);
      const end = Math.max(sel1.value, sel2.value);
      const removed = !segments[start].removed;
      for (let i = start; i <= end; i++) {
        segments[i].removed = removed;
      }
    } else if (sel1.value !== -1) {
      segments[sel1.value].removed = !segments[sel1.value].removed;
    } else if (sel2.value !== -1) {
      segments[sel2.value].removed = !segments[sel2.value].removed;
    }
  }
}


const fetchVideo = async () => {
  if (!selectedProject.value?.video?.id) return;
  try {
    const response = await fetch(videoApi.getUrl(selectedProject.value.video.id));

    if (!response.ok) throw new Error('Failed to fetch video');
    
    const blob = await response.blob();
    videoBlobUrl.value = URL.createObjectURL(blob); 
    
  } catch (error) {
    console.error('Video fetch error:', error);
  }
};

onMounted(async () => {
  await fetchVideo();
  video.value = document.getElementById('video') as HTMLVideoElement;
  if(video.value == null) throw Error("Cound not get video element: ", video.value);
  video.value?.addEventListener('loadedmetadata', () => {
    console.log("video.value:", video.value);
    window.addEventListener("keydown", onKeyDown);
    requestAnimationFrame(onTimeUpdate);
  });
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKeyDown);
});

</script>
