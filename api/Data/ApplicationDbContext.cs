using Microsoft.EntityFrameworkCore;

public class ApplicationDbContext : DbContext {
  public DbSet<Video> Videos { get; set; } = null!;
  public DbSet<Project> Projects { get; set; } = null!;
  public DbSet<User> Users { get; set; } = null!;

  public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

  protected override void OnModelCreating(ModelBuilder modelBuilder) {
    base.OnModelCreating(modelBuilder);
    
    modelBuilder.Entity<User>()
      .HasMany(u => u.Projects)
      .WithOne(p => p.User)
      .HasForeignKey(p => p.UserId);

    modelBuilder.Entity<Project>()
      .HasOne(p => p.Video)
      .WithMany()
      .HasForeignKey(p => p.VideoId);
  }
}