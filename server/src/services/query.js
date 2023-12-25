//If default page limit is 0, it returns all the data
const DEFAULT_PAGE_LIMIT = 0;

const getPagination = (query) => {
  const page = Math.abs(query.page) || 1;
  const limit = Math.abs(query.limit) || DEFAULT_PAGE_LIMIT;
  const skip = (page - 1) * limit;
  return {
    skip: skip,
    limit: limit,
  };
};

module.exports = { getPagination };
