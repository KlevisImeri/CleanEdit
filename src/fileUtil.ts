import {
	selectedProject,
	selectedVideo,
	videoUrl,
	tracks,
	projectVideoName,
	fps,
	totalDuration,
	MINCUTWIDTH,
  resetVariables,
  secToFps,
} from "@/variables";

import type {
	Segment,
	Track
} from "@/types";



export const openVideo = () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = 'video/*';
	input.onchange = (event) => {
		const files = (event.target as HTMLInputElement).files;
		if (files && files.length > 0) {
      //Update variables first 
      resetVariables();
      //Put Vidoe on screen and it updats needed variables
			selectedVideo.value = files[0];
      videoUrl.value = URL.createObjectURL(files[0]);
			console.log('Selected file:', selectedVideo.value.name);
		}
	};
	input.click();
};



export const openProject = () => {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.fcpxml, .ce'; 
	input.onchange = async (event) => {
		const files = (event.target as HTMLInputElement).files;
		if (files && files.length > 0) {
			const file = files[0];
			selectedProject.value = file;
			console.log('Selected file:', file.name);
			const content = await file.text();

      resetVariables();
			if (file.name.endsWith('.fcpxml')) {
				tracks.value[0]=await parseFCPXML(content);  
			} else if (file.name.endsWith('.txt')){
				tracks.value[0]=parseTextFile(content);
			} else if (file.name.endsWith('.ce')){
        tracks.value[0] = parseProjectFile(content);
      }
      //console.log(tracks.value[0])
		}
	};
	input.click();
};

export const inflateSegments = (goodSegments: Segment[]) => {
  const segments: Segment[] = [];
  if (!goodSegments.length) {
    // throw Error("There are no segments!");
    segments.push({ 
      id: segments.length,
      start: 0, 
      end: totalDuration.value, 
      removed: false 
    });
    return segments;
  }
  if (goodSegments[0].start != 0) {
    segments.push({
      id: segments.length,
      start: 0,
      end: goodSegments[0].start,
      removed: true
    });
  }
  for (let i = 0; i < goodSegments.length; i++) {
    const start = goodSegments[i].end + 1;
    let end = 0;
    if (i == goodSegments.length - 1) {
      end = totalDuration.value;
    } else {
      end = goodSegments[i + 1].start - 1;
    }
    if (i<goodSegments.length-1 && start >= end || (Math.abs(start - end) <= MINCUTWIDTH)) { //skip segment
      goodSegments[i + 1].start = goodSegments[i].start;
      continue;
    }
    goodSegments[i].id=segments.length;
    segments.push(goodSegments[i]);
    const removed = true;
    segments.push({id:segments.length, start, end, removed })
  }

  console.log(segments);

  return segments;
}
const parseProjectFile = (jsonString: string) => {
  try {
    const parsedData = JSON.parse(jsonString); 
    console.log('Parsed .ce project:', parsedData);
    
    return parsedData;  
  } catch (error) {
    console.error("Failed to parse .ce file. Please check the format.", error);
    return null;
  }
};


const parseTextFile = (text: string): Track => {
	const lines = text.split('\n').map(line => line.trim()).filter(line => line);
	const segments: Segment[] = [];
  // console.log(lines);
	for (let i = 0; i < lines.length-3; i += 3) {
		const fileLine = lines[i];
		const inpointLine = lines[i + 1];
		const outpointLine = lines[i + 2];
    
		const fileMatch = fileLine.match(/file '(.*?)'/);
		const inpointMatch = inpointLine.match(/inpoint (\d+(\.\d+)?)/);
		const outpointMatch = outpointLine.match(/outpoint (\d+(\.\d+)?)/);
    
    // console.log("File Match:", fileMatch);
    // console.log("Inpoint Match:", inpointMatch);
    // console.log("Outpoint Match:", outpointMatch);

    //TODO: add more information for parsing in the future
		if (fileMatch && inpointMatch && outpointMatch) {
      // const currentFile = fileMatch[1]; 
      console.log(secToFps(parseFloat(inpointMatch[1])));
      segments.push({ 
        id: segments.length,
        start: secToFps(parseFloat(inpointMatch[1])),
        end: secToFps(parseFloat(outpointMatch[1])), 
        removed: false,
      });
		} else {
			throw new Error("Invalid format");
		}
	}
  console.log(segments);
  // segments = inflateSegments(segments);
	return { segments };
};


const parseFCPXML = (xmlString: string): Promise<Track> => {
	return new Promise((resolve, reject) => {
		const parser = new DOMParser();
		const xmlDoc = parser.parseFromString(xmlString, "text/xml");

		// Extract the FPS from the format element
		const formatElement = xmlDoc.querySelector('format');
		if (formatElement) {
			const frameDurationAttr = formatElement.getAttribute('frameDuration') || '1/60s';
			fps.value = parseFPS(frameDurationAttr);
			console.log('Frames Per Second:', fps.value);
		} else {
			throw Error('Format element not found in project xml!');
		}

		const assetElem = xmlDoc.querySelector('asset');
		if (assetElem) {
			const duration = assetElem.getAttribute('duration') || '18000/60s';
			totalDuration.value = parseFrames(duration);
			console.log('Total number of frames:', totalDuration.value);
		} else {
			throw Error('No assets path found in the fcpxml file.');
		}

		// Extract the video file name
		const pathurlElement = xmlDoc.querySelector('media-rep');
		if (pathurlElement) {
			const projectVideoPath = pathurlElement.getAttribute('src') || "";
			projectVideoName.value = projectVideoPath.split(/[/\\]/).pop();
			console.log('Project Video Name:', projectVideoName.value);
		} else {
			throw Error('No video path found in the fcpxml file.');
		}

		// Extract asset clips
		const assetClips = xmlDoc.querySelectorAll('spine > asset-clip');

		let segments: Segment[] = [];
		assetClips.forEach((clip: Element) => {
			const start = parseFrames(clip.getAttribute('start') || '0s');
			const duration = parseFrames(clip.getAttribute('duration') || '0s');
			const end = start + duration;
			const removed = false;
			segments.push({id: segments.length, start, end, removed });
		});

    segments = inflateSegments(segments);
		resolve({ segments });
	});
};

const parseFPS = (frameDuration: string): number => {
	const parts = frameDuration.trim().split('/');
	if (parts.length === 2) {
		const fps = Number(parts[1].replace('s', '').trim());
		return fps;
	}
	throw new Error('Invalid frameDuration format');
};

const parseFrames = (duration: string): number => {
	if ('0s' === duration) return 0;
	const [frames] = duration.split('/').map(Number);
	return frames;
};

export const saveProject = () => {
  if(selectedVideo.value){
    const data = JSON.stringify(tracks.value[0]);
    exportFile(data, `${selectedVideo.value.name}.ce`);
  }
}

export const exportProject = () => {
  exportCutPoints();
}

// Export the cut points to a format that FFmpeg can use
const exportCutPoints = () => {
	if (!selectedVideo.value || !tracks.value[0].segments.length) {
		console.error("No video or segments to export.");
		return;
	}

	const segments = tracks.value[0].segments;
	const ffmpegSegments = [];

	//FFmpeg concat demuxe
	for (const segment of segments) {
    if (segment.removed) continue;
		
    const start = (segment.start / fps.value).toFixed(2);
    const end = (segment.end / fps.value).toFixed(2);
    ffmpegSegments.push(
      `file '${selectedVideo.value.name}'\n` +
      `inpoint ${start}\n` +
      `outpoint ${end}\n`
    );
	}

	// Create the content of the FFmpeg input file
	const content = ffmpegSegments.join('\n');

  exportFile(content, 'cut_segments.txt', 'text/plain');
};


const exportFile = (data: string, filename = 'project.json', type = 'application/json') => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);  // Clean up after click
};

