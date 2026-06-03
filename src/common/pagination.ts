function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

function paginated(data, total, page, limit) {
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
}

export { getPagination, paginated };

