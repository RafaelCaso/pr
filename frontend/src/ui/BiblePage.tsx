import { useState, useEffect } from 'react';
import { useRequireAuth } from '../hooks/useRequireAuth';
import { 
  useGetBibleVersions, 
  useGetBibleBooks, 
  useGetBibleChapter,
  type BibleVersion,
  type BibleBook
} from '../api/bible.api';

interface BiblePageProps {
  onBack: () => void;
}

export const BiblePage = ({ onBack }: BiblePageProps) => {
  // Redirect to home if user logs out
  useRequireAuth(onBack);

  const [selectedBibleId, setSelectedBibleId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [selectedChapterNumber, setSelectedChapterNumber] = useState<string>('1');
  const [chapterId, setChapterId] = useState<string>('');

  const { data: bibleVersions, isLoading: isLoadingVersions, error: versionsError } = useGetBibleVersions();
  const { data: bibleBooks, isLoading: isLoadingBooks, error: booksError } = useGetBibleBooks(selectedBibleId);
  const { data: bibleChapter, isLoading: isLoadingChapter, error: chapterError } = useGetBibleChapter(
    selectedBibleId,
    chapterId,
    !!chapterId && !!selectedBibleId
  );

  // Reset book and chapter when Bible version changes
  useEffect(() => {
    setSelectedBookId('');
    setSelectedChapterNumber('1');
    setChapterId('');
  }, [selectedBibleId]);

  // Reset chapter when book changes
  useEffect(() => {
    setSelectedChapterNumber('1');
    setChapterId('');
  }, [selectedBookId]);

  // Build chapter ID when book and chapter number are selected
  useEffect(() => {
    if (selectedBookId && selectedChapterNumber) {
      // Chapter ID format is typically: {bookId}.{chapterNumber}
      setChapterId(`${selectedBookId}.${selectedChapterNumber}`);
    } else {
      setChapterId('');
    }
  }, [selectedBookId, selectedChapterNumber]);

  const handleBibleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBibleId(e.target.value);
  };

  const handleBookChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBookId(e.target.value);
  };

  const handleChapterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(Number(value)) && Number(value) > 0)) {
      setSelectedChapterNumber(value);
    }
  };

  const selectedBook = bibleBooks?.find(book => book.id === selectedBookId);
  const selectedBible = bibleVersions?.find(bible => bible.id === selectedBibleId);

  return (
    <div className="page-wrapper">
      <div className="container-content">
        <div className="page-header">
          <button className="btn btn-back" onClick={onBack}>← Back</button>
          <h1 className="page-title">Bible</h1>
          <p className="page-description">
            Read and explore the Bible
          </p>
        </div>

        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-base)' }}>
            {/* Bible Version Selector */}
            <div className="form-group">
              <label htmlFor="bibleVersion" className="form-label">
                Bible Version
              </label>
              {isLoadingVersions ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                  <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading versions...</span>
                </div>
              ) : versionsError ? (
                <div className="error-message">
                  Error loading Bible versions. Please try again later.
                </div>
              ) : (
                <select
                  id="bibleVersion"
                  className="form-input"
                  value={selectedBibleId}
                  onChange={handleBibleChange}
                >
                  <option value="">Select a Bible version</option>
                  {bibleVersions?.map((bible: BibleVersion) => (
                    <option key={bible.id} value={bible.id}>
                      {bible.name} ({bible.abbreviation})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Book Selector */}
            {selectedBibleId && (
              <div className="form-group">
                <label htmlFor="bibleBook" className="form-label">
                  Book
                </label>
                {isLoadingBooks ? (
                  <div className="loading">
                    <div className="loading-spinner"></div>
                    <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading books...</span>
                  </div>
                ) : booksError ? (
                  <div className="error-message">
                    Error loading books. Please try again later.
                  </div>
                ) : (
                  <select
                    id="bibleBook"
                    className="form-input"
                    value={selectedBookId}
                    onChange={handleBookChange}
                  >
                    <option value="">Select a book</option>
                    {bibleBooks?.map((book: BibleBook) => (
                      <option key={book.id} value={book.id}>
                        {book.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Chapter Selector */}
            {selectedBookId && (
              <div className="form-group">
                <label htmlFor="bibleChapter" className="form-label">
                  Chapter
                </label>
                <input
                  id="bibleChapter"
                  type="number"
                  className="form-input"
                  value={selectedChapterNumber}
                  onChange={handleChapterChange}
                  placeholder="Enter chapter number"
                  min="1"
                  style={{ maxWidth: '200px' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bible Content Display */}
        {chapterId && selectedBibleId && (
          <div className="card">
            {isLoadingChapter ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <span style={{ marginLeft: 'var(--spacing-sm)' }}>Loading chapter...</span>
              </div>
            ) : chapterError ? (
              <div className="error-message">
                Error loading chapter. Please try again later.
              </div>
            ) : bibleChapter ? (
              <div>
                <div style={{ 
                  marginBottom: 'var(--spacing-base)',
                  paddingBottom: 'var(--spacing-base)',
                  borderBottom: '1px solid var(--color-border-light)'
                }}>
                  <h2 style={{ 
                    fontSize: 'var(--font-size-lg)', 
                    fontWeight: 'var(--font-weight-semibold)',
                    marginBottom: 'var(--spacing-xs)',
                    color: 'var(--color-text-primary)'
                  }}>
                    {selectedBook?.name} {bibleChapter.number}
                  </h2>
                  {selectedBible && (
                    <p style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--color-text-secondary)'
                    }}>
                      {selectedBible.name}
                    </p>
                  )}
                </div>
                <div 
                  style={{ 
                    fontSize: 'var(--font-size-base)',
                    lineHeight: 'var(--line-height-relaxed)',
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'pre-wrap'
                  }}
                  dangerouslySetInnerHTML={{ __html: bibleChapter.content || '' }}
                />
              </div>
            ) : null}
          </div>
        )}

        {/* Empty State */}
        {!selectedBibleId && !isLoadingVersions && !versionsError && (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">📖</div>
              <div className="empty-state-title">Select a Bible version to begin</div>
              <div className="empty-state-message">Choose a Bible version from the dropdown above to start reading.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

