using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VideoController : ControllerBase {

  private readonly ApplicationDbContext db;
  private readonly ILogger<VideoController> log;

  public VideoController(
      ApplicationDbContext context,
      ILogger<VideoController> logger
  ) {
    db = context;
    log = logger;
  }

  [HttpPost("uploadvideo")]
  public async Task<IActionResult> UploadVideo(
      [FromForm] IFormFile video,
      [FromForm] int durationFPS,
      [FromForm] int projectId
  ){

    if (video == null || video.Length == 0) {
        return BadRequest("Video file is required");
    }

    if (durationFPS <= 0) {
      return BadRequest("Invalid duration");
    }

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
        return Unauthorized("User ID not found in token");
    }
    
    log.LogInformation($"ProjectID: {projectId}");
    var project = await db.Projects
        .FirstOrDefaultAsync(p => p.Id == projectId);
    if (project == null) {
        return NotFound("Project not found!");
    }

    log.LogInformation($"UserId: {int.Parse(userId)}");
    if(project.UserId != int.Parse(userId)) {
        return Unauthorized("You do not have access to this project!");
    }

    var videoDirectory = Path.Combine(Directory.GetCurrentDirectory(), "videos");
    if (!Directory.Exists(videoDirectory)) {
        Directory.CreateDirectory(videoDirectory);
    }

    var videoPath = Path.Combine(videoDirectory, video.FileName);
    using (var stream = new FileStream(videoPath, FileMode.Create)) {
      await video.CopyToAsync(stream);
    }

    var videoItem = new Video {
      FileName = video.FileName,
      FilePath = videoPath,
      UserId = int.Parse(userId),
      DurationFPS = durationFPS,
    };

    var track = new Track() {
      ProjectId = projectId,
    };
    
    var segment = new Segment() {
      Start = 0,
      End = durationFPS,
      Removed = false,
      TrackId = track.Id,
    };
    
    db.Videos.Add(videoItem);
    db.Tracks.Add(track);
    track.Segments.Add(segment);

    project.Video = videoItem;

    await db.SaveChangesAsync();

    return Ok(new { project });
  }

  [HttpGet("{ID}")]
  public IActionResult GetVideo(int ID) {
    log.LogInformation($"Requested Video with id={ID}");

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
      return Unauthorized("User ID not found in token");
    }
    
    var video = db.Videos.SingleOrDefault(v => v.Id == ID && v.UserId == int.Parse(userId));
    if (video == null) {
      return NotFound("Video not found or you do not have access to this video");
    }
    log.LogInformation($"Rquested Video is at {video.FilePath}");

    var videoPath = video.FilePath;
    if (!System.IO.File.Exists(videoPath)) {
      return NotFound("Video file not found");
    }

    var videoStream = new FileStream(videoPath, FileMode.Open, FileAccess.Read);
    return File(videoStream, "video/mp4");
  }
  
  [HttpGet]
  public IActionResult AutoCutVideo([FromQuery] string videoPath, [FromQuery] string exportTo) {
    if (string.IsNullOrEmpty(videoPath)) {
      return BadRequest("Video path is required");
    }

    if (string.IsNullOrEmpty(exportTo)) {
      return BadRequest("Export path is required");
    }

    var processInfo = new ProcessStartInfo("auto-editor", $"{videoPath} --export {exportTo}") {
      RedirectStandardOutput = true,
      RedirectStandardError = true,
      UseShellExecute = false,
      CreateNoWindow = true
    };

    try {
      using (var process = Process.Start(processInfo)) {
        process.WaitForExit();
        var output = process.StandardOutput.ReadToEnd();
        var error = process.StandardError.ReadToEnd();

        if (process.ExitCode == 0) {
          var filePath = Path.Combine(Directory.GetCurrentDirectory(), exportTo); //this is wrong
          if (System.IO.File.Exists(filePath)) {
            var fileBytes = System.IO.File.ReadAllBytes(filePath);
            return File(fileBytes, "application/octet-stream", Path.GetFileName(filePath));
          } else {
            return NotFound("Exported file not found");
          }
        } else {
          return StatusCode(500, error);
        }
      }
    } catch (Exception ex) {
      return StatusCode(500, ex.Message);
    }
  }
}
