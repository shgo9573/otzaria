export interface BookItem {
  id: number;
  title: string;
  categoryPath: string;
  author?: string;
  heCategories?: string;
  heEra?: string;
  fileType: string;
  order?: number;
  hasToc?: boolean;
  hasLinks?: boolean;
}

export interface CategoryNode {
  id: string;
  name: string;
  path: string;
  children?: CategoryNode[];
  books?: BookItem[];
}

export interface CatalogData {
  categories: CategoryNode[];
  books: BookItem[];
}

export interface TocNode {
  title: string;
  index: number;
  children?: TocNode[];
}

export interface CommentaryLink {
  sourceBook: string;
  category: string;
  line: number;
  text: string;
}

export interface SearchResultItem {
  bookId: number;
  bookTitle: string;
  categoryPath: string;
  lineIndex: number;
  snippet: string;
}

export interface SearchResponse {
  query: string;
  resultsCount: number;
  results: SearchResultItem[];
}

export interface ServerStatus {
  status: 'initializing' | 'downloading' | 'ready' | 'error';
  progress: number;
  downloadedBytes: number;
  totalBooks: number;
  storageUsageMB: number;
  lastUpdated: string;
}

export interface TabItem {
  id: string;
  type: 'library' | 'search' | 'book' | 'bookmarks' | 'settings';
  title: string;
  bookId?: number;
  bookTitle?: string;
  initialLine?: number;
}

export interface BookmarkItem {
  id: string;
  bookId: number;
  bookTitle: string;
  lineIndex: number;
  snippet: string;
  note?: string;
  createdAt: string;
}

export interface ReaderSettings {
  fontFamily: 'Frank Ruhl Hofshi' | 'David Libre' | 'Heebo';
  fontSize: number;
  lineHeight: number;
  showNikud: boolean;
  theme: 'light' | 'sepia' | 'dark';
}
