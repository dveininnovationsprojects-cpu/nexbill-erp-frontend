// Returns a sliding window of 3 page numbers centered around current page
export function getPageNumbers(currentPage, totalPages, windowSize = 3) {
  if (totalPages <= windowSize) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  let end = start + windowSize - 1;
  if (end > totalPages) {
    end = totalPages;
    start = end - windowSize + 1;
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
