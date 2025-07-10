export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    console.log(userRole);

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: "Forbidden: You are not allowed to perform this action",
      });
    }
    next();
  };
};
