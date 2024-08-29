import {
  selectedProject,
  selectedVideo,
  videoUrl,
  tracks,
  projectVideoName,
  fps,
  totalDuration,
} from "@/variables";
import type {
  Segment,
  Track
} from "@/types";
import { time } from "console";

export const openVideo = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  input.onchange = (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      selectedVideo.value = files[0];
      videoUrl.value = URL.createObjectURL(selectedVideo.value);
      tracks.value = [];
      console.log('Selected file:', selectedVideo.value.name);
    }
  };
  input.click();
};

export const openProject = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xml';
  input.onchange = async (event) => {
    const files = (event.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      const file = files[0];
      selectedProject.value = file;
      console.log('Selected file:', file.name);
      const content = await file.text();
      const parsedTrack = await parseFCPXML(content);
      tracks.value.push(parsedTrack);
    }
  };
  input.click();
};


const parseFCPXML = (xmlString: string): Promise<Track> => {
  return new Promise((resolve, reject) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");

    // Extract the FPS from the format element
    const formatElement = xmlDoc.querySelector('format');
    if (formatElement) {
      const frameDurationAttr = formatElement.getAttribute('frameDuration') || '1/60s';
      const duration = formatElement.getAttribute('duration') || '18000/60s';
      fps.value = parseFPS(frameDurationAttr);
      totalDuration.value = parseFrames(duration);
    }
    console.log('Frames Per Second:', fps);
    console.log('Total number of frames:', totalDuration);

    // Extract the video file name
    const pathurlElement = xmlDoc.querySelector('media-rep');
    if (pathurlElement) {
      const projectVideoPath = pathurlElement.getAttribute('src') || "";
      projectVideoName.value = projectVideoPath.split(/[/\\]/).pop();
      console.log('Project Video Name:', projectVideoName.value);
    } else {
      console.log('No video path found in the fcpxml file.');
    }

    // Extract asset clips
    const assetClips = xmlDoc.querySelectorAll('spine > asset-clip');
    const segments: Segment[] = [];

    const goodSegments: Segment[] = [];
    assetClips.forEach((clip: Element) => {
      const start = parseFrames(clip.getAttribute('start') || '0s');
      const duration = parseFrames(clip.getAttribute('duration') || '0s');
      const end = start + duration;
      const removed = false;
      goodSegments.push({ start, end, removed });
    });

    for(let i=0; i<goodSegments.length; i++){
      segments.push(goodSegments[i]);
      const start = goodSegments[i].end+1;
      let end = 0;
      if(i==goodSegments.length-1) {
        end = totalDuration.value;
      } else {
        end = goodSegments[i+1].start-1;
      }
      if(start==end) continue;
      const removed = true;
      segments.push({start, end, removed })
    }

    resolve({ segments });
  });
};

const parseFPS = (frameDuration: string): number => {
  const [,fps] = frameDuration.split('/').map(Number);
  return fps; 
};

const parseFrames = (duration: string): number => {
  const [frames] = duration.split('/').map(Number);
  return frames; 
};


// Export the cut points to a format that FFmpeg can use
export const exportCutPoints = () => {
  if (!selectedVideo.value || !tracks.value[0].segments.length) {
    console.error("No video or segments to export.");
    return;
  }

  const segments = tracks.value[0].segments;
  const ffmpegSegments = [];

  for (const segment of segments) {
    if (!segment.removed) {
      const start = segment.start.toFixed(2);
      const end = segment.end.toFixed(2);
      ffmpegSegments.push(
        `file '${selectedVideo.value.name}'\n` +
        `inpoint ${start}\n` +
        `outpoint ${end}`
      );
    }
  }

  // Create the content of the FFmpeg input file
  const content = ffmpegSegments.join('\n');

  // Create a blob and trigger a download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'cut_segments.txt';
  document.body.appendChild(link);  // Append to the body
  link.click();
  document.body.removeChild(link);  // Clean up after click
};