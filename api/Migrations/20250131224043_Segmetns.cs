using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace api.Migrations
{
    /// <inheritdoc />
    public partial class Segmetns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Segment_Track_TrackId",
                table: "Segment");

            migrationBuilder.DropForeignKey(
                name: "FK_Track_Projects_ProjectId",
                table: "Track");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Track",
                table: "Track");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Segment",
                table: "Segment");

            migrationBuilder.RenameTable(
                name: "Track",
                newName: "Tracks");

            migrationBuilder.RenameTable(
                name: "Segment",
                newName: "Segments");

            migrationBuilder.RenameIndex(
                name: "IX_Track_ProjectId",
                table: "Tracks",
                newName: "IX_Tracks_ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Segment_TrackId",
                table: "Segments",
                newName: "IX_Segments_TrackId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Tracks",
                table: "Tracks",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Segments",
                table: "Segments",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Segments_Tracks_TrackId",
                table: "Segments",
                column: "TrackId",
                principalTable: "Tracks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Tracks_Projects_ProjectId",
                table: "Tracks",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Segments_Tracks_TrackId",
                table: "Segments");

            migrationBuilder.DropForeignKey(
                name: "FK_Tracks_Projects_ProjectId",
                table: "Tracks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Tracks",
                table: "Tracks");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Segments",
                table: "Segments");

            migrationBuilder.RenameTable(
                name: "Tracks",
                newName: "Track");

            migrationBuilder.RenameTable(
                name: "Segments",
                newName: "Segment");

            migrationBuilder.RenameIndex(
                name: "IX_Tracks_ProjectId",
                table: "Track",
                newName: "IX_Track_ProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Segments_TrackId",
                table: "Segment",
                newName: "IX_Segment_TrackId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Track",
                table: "Track",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Segment",
                table: "Segment",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Segment_Track_TrackId",
                table: "Segment",
                column: "TrackId",
                principalTable: "Track",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Track_Projects_ProjectId",
                table: "Track",
                column: "ProjectId",
                principalTable: "Projects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
