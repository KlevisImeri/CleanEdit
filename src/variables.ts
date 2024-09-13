import {
	ref,
	computed,
} from 'vue';

import type {
	Track,
} from '@/types'

export const selectedVideo = ref<File | null>(null);
export const videoUrl = ref<string | null>(null);
export const selectedProject = ref<File | null>(null);
export const projectVideoName = ref<string | undefined>();
export const cutPoints = ref<number[]>([]);
export const videoElement = ref<HTMLVideoElement | null>(null);
export const tracks = ref<Track[]>([]);
export const totalDuration = ref<number>(18000);
export const fps = ref<number>(60);
export const zoomLevel = ref<number>(1);
export const currentFrame = ref<number>(0);
export const till = ref<number>(0);
export const curSeg = ref<number>(0);

export const UNITSEC = 100; //bigger this is the more easy it is to render closely
export const UNITMARKER = 1;
export const UNITTICK = 0.1;
export const ZOOMMIX = 0.001;
export const ZOOMMAX = 10;
export const ZOOMSPEED = 0.5;
export const MINCUTWIDTH = 20; //fps

export const fpsToPx = computed(() => 1 / fps.value * UNITSEC * zoomLevel.value);
export const secToPos = computed(() => 60 * fpsToPx.value);
