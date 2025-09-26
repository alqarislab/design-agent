export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'super_admin';
}

export interface BrandElements {
  colorPalette: string[];
  logo?: string;
  fonts: string[];
  brandGuidelines?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  userId: string;
  brandElements: BrandElements;
  designType: 'social_media' | 'print' | 'thumbnail' | 'logo';
  createdAt: string;
  updatedAt: string;
}

export interface DesignContent {
  title?: string;
  copy?: string;
  description?: string;
  cta?: string;
  footerContent?: string;
}

export interface Design {
  _id: string;
  projectId: string;
  userId: string;
  baseReferenceImage?: string;
  content: DesignContent;
  generatedImages: string[];
  currentVersion: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
