export interface ExportParams {
  version?: "3.0" | "4.0";
  scope: "single" | "selected" | "folder" | "tag" | "all";
  cardIds?: string[];
  folderId?: string;
  tagId?: string;
}
