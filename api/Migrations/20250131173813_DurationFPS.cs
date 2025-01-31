using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class DurationFPS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Track_ProjectId",
                table: "Track");

            migrationBuilder.AddColumn<int>(
                name: "DurationFPS",
                table: "Videos",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Track_ProjectId",
                table: "Track",
                column: "ProjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Track_ProjectId",
                table: "Track");

            migrationBuilder.DropColumn(
                name: "DurationFPS",
                table: "Videos");

            migrationBuilder.CreateIndex(
                name: "IX_Track_ProjectId",
                table: "Track",
                column: "ProjectId",
                unique: true);
        }
    }
}
