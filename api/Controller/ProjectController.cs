using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectController : ControllerBase {
  private readonly ApplicationDbContext db;

  public ProjectController(ApplicationDbContext context) {
    db = context;
  }

  [HttpGet]
  public async Task<IActionResult> GetProjects() {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
      return Unauthorized("User ID not found in token");
    }

    var projects = await db.Projects
      .Where(p => p.UserId == int.Parse(userId))
      .Include(p => p.Video)
      .Select(p => new {
          p.Id,
          p.Name,
          p.UserId,
          p.VideoId,
          p.Tracks,
          Video = p.Video != null ? new { p.Video.Id, p.Video.FileName } : null
      })
      .ToListAsync();

    return Ok(projects);
  }

  [HttpPost("create")]  
  public async Task<IActionResult> CreateProject([FromForm] string name) {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
      return Unauthorized("User ID not found in token");
    }

    var project = new Project {
      Name = name,
      UserId = int.Parse(userId),
      VideoId = null
    };

    db.Projects.Add(project);
    await db.SaveChangesAsync();

    return Ok(new { message = "Project created successfully", project });
  }

  [HttpDelete("{id}")]
  public async Task<IActionResult> DeleteProject(int id) {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (userId == null) {
      return Unauthorized("User ID not found in token");
    }

    var project = await db.Projects
      .Where(p => p.Id == id && p.UserId == int.Parse(userId))
      .FirstOrDefaultAsync();

    if (project == null) {
      return NotFound("Project not found");
    }

    db.Projects.Remove(project);
    await db.SaveChangesAsync();

    return Ok(new { message = "Project deleted successfully" });
  }
}
