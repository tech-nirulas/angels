export interface Media {
  id: string;
  filename: string;
  key: string;
  url: string;
  thumbnailUrl: string;
  size: number;
  mimeType: string;
  type: string;
  alt: string | null;
  title: string | null;
  description: string | null;
  width: number;
  height: number;
  uploadedBy: string;
  uploadedAt: string;
  isActive: boolean;
  isPublic: boolean;
  tags: string[];
  folder: string;
  referenceId: string | null;
  createdAt: string;
  updatedAt: string;
}