import { CatalogData, SearchResponse, ServerStatus, TocNode, CommentaryLink } from '../types/otzaria';

const API_BASE = '/api';

export async function getServerStatus(): Promise<ServerStatus> {
  const res = await fetch(`${API_BASE}/status`);
  if (!res.ok) throw new Error('Failed to fetch server status');
  return res.json();
}

export async function triggerLibraryDownload(): Promise<{ message: string; state: ServerStatus }> {
  const res = await fetch(`${API_BASE}/library/download`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to trigger download');
  return res.json();
}

export async function getLibraryTree(): Promise<CatalogData> {
  const res = await fetch(`${API_BASE}/library/tree`);
  if (!res.ok) throw new Error('Failed to fetch library tree');
  return res.json();
}

export async function getBookContent(bookId: number): Promise<{ id: number; title: string; content: string }> {
  const res = await fetch(`${API_BASE}/books/${bookId}/content`);
  if (!res.ok) throw new Error('Failed to fetch book content');
  return res.json();
}

export async function getBookToc(bookId: number): Promise<{ id: number; toc: TocNode[] }> {
  const res = await fetch(`${API_BASE}/books/${bookId}/toc`);
  if (!res.ok) throw new Error('Failed to fetch table of contents');
  return res.json();
}

export async function getBookLinks(bookId: number, lineIndex: number): Promise<{ id: number; line: number; links: CommentaryLink[] }> {
  const res = await fetch(`${API_BASE}/books/${bookId}/links?line=${lineIndex}`);
  if (!res.ok) throw new Error('Failed to fetch commentary links');
  return res.json();
}

export async function searchLibrary(
  query: string,
  category: string = 'all',
  exactMatch: boolean = false,
  gematriaSearch: boolean = false
): Promise<SearchResponse> {
  const res = await fetch(`${API_BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, category, exactMatch, gematriaSearch })
  });
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}
