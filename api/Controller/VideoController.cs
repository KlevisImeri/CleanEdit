using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VideoController : ControllerBase {

  private readonly ApplicationDbContext db;

  public VideoController(ApplicationDbContext context) {
    db = context;
  }

  [HttpPost("uploadvideo")]
  public async Task<IActionResult> UploadVideo([FromForm] IFormFile video) {
    if (video == null || video.Length == 0) {
      return BadRequest("Video file is required");
    }

    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
      return Unauthorized("User ID not found in token");
    }

    var videoPath = Path.Combine(Directory.GetCurrentDirectory(), "videos", video.FileName);
    var videoDir = Path.GetDirectoryName(videoPath);
    if (videoDir == null) {
      return StatusCode(500, "Failed to create video directory");
    }
    Directory.CreateDirectory(videoDir);


    using (var stream = new FileStream(videoPath, FileMode.Create)) {
      await video.CopyToAsync(stream);
    }

    var videoEntity = new Video {
      FileName = video.FileName,
      FilePath = videoPath,
      UserId = int.Parse(userId) 
    };

    db.Videos.Add(videoEntity);
    await db.SaveChangesAsync();

    return Ok(new { path = videoPath });
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
