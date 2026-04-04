export const ownStoreMiddleware = (req, res, next) => {
  const storeId = req.params.storeId || req.body.store
  if (req.user.role === 'superadmin') return next()
  if (req.user.role === 'store_owner') {
    const userStore =
      req.user.store?._id?.toString() || req.user.store?.toString()
    if (storeId && userStore !== storeId) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied to this store' })
    }
    return next()
  }
  return res.status(403).json({ success: false, message: 'Not authorized' })
}
