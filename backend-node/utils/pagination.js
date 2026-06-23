// ============================================================
// utils/pagination.js — Pagination Helper
// ============================================================

/**
 * Calculate pagination metadata
 * @param {number} page - Current page (1-indexed)
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {object} Pagination metadata
 */
const getPaginationMetadata = (page = 1, limit = 10, total = 0) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Cap at 100
  const skip = (pageNum - 1) * limitNum;
  const pages = Math.ceil(total / limitNum);
  const hasNext = pageNum < pages;
  const hasPrev = pageNum > 1;

  return {
    page: pageNum,
    limit: limitNum,
    skip,
    total,
    pages,
    hasNext,
    hasPrev,
  };
};

module.exports = {
  getPaginationMetadata,
};
