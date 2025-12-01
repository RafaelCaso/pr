import { useQuery } from '@tanstack/react-query';

// API Configuration
const BIBLE_API_BASE_URL = 'https://rest.api.bible';
const BIBLE_API_KEY = '383G6tO_wGtahPbRToejy';

// Types for API.Bible responses
export interface BibleVersion {
  id: string;
  dblId: string;
  abbreviation: string;
  abbreviationLocal: string;
  name: string;
  nameLocal: string;
  description: string;
  descriptionLocal: string;
  language: {
    id: string;
    name: string;
    nameLocal: string;
    script: string;
    scriptDirection: string;
  };
  countries: Array<{
    id: string;
    name: string;
    nameLocal: string;
  }>;
  type: string;
  updatedAt: string;
  audioBibles: Array<unknown>;
}

export interface BibleVersionsResponse {
  data: BibleVersion[];
}

export interface BibleBook {
  id: string;
  bibleId: string;
  abbreviation: string;
  name: string;
  nameLong: string;
  chapters?: Array<{
    id: string;
    bibleId: string;
    bookId: string;
    number: string;
    content?: string;
  }>;
}

export interface BibleBooksResponse {
  data: BibleBook[];
}

export interface BibleChapter {
  id: string;
  bibleId: string;
  number: string;
  bookId: string;
  content: string;
  verseCount: number;
  next?: {
    id: string;
    number: string;
    bookId: string;
  };
  previous?: {
    id: string;
    number: string;
    bookId: string;
  };
}

export interface BibleChapterResponse {
  data: BibleChapter;
}

// Custom fetch function for Bible API
const fetchBibleAPI = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const url = `${BIBLE_API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'api-key': BIBLE_API_KEY,
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.statusText}`);
  }

  return response.json();
};

// API Functions
export const getBibleVersions = async (): Promise<BibleVersion[]> => {
  const response = await fetchBibleAPI<BibleVersionsResponse>('/v1/bibles');
  return response.data || [];
};

export const getBibleBooks = async (bibleId: string): Promise<BibleBook[]> => {
  const response = await fetchBibleAPI<BibleBooksResponse>(`/v1/bibles/${encodeURIComponent(bibleId)}/books`);
  return response.data || [];
};

export const getBibleChapter = async (bibleId: string, chapterId: string): Promise<BibleChapter> => {
  const response = await fetchBibleAPI<BibleChapterResponse>(`/v1/bibles/${encodeURIComponent(bibleId)}/chapters/${encodeURIComponent(chapterId)}`);
  return response.data;
};

// React Query Hooks
export const useGetBibleVersions = () => {
  return useQuery({
    queryKey: ['bibleVersions'],
    queryFn: getBibleVersions,
  });
};

export const useGetBibleBooks = (bibleId: string) => {
  return useQuery({
    queryKey: ['bibleBooks', bibleId],
    queryFn: () => getBibleBooks(bibleId),
    enabled: !!bibleId,
  });
};

export const useGetBibleChapter = (bibleId: string, chapterId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['bibleChapter', bibleId, chapterId],
    queryFn: () => getBibleChapter(bibleId, chapterId),
    enabled: !!bibleId && !!chapterId && enabled,
  });
};

