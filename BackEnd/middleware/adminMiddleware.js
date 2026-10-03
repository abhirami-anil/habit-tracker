const jwt = require("jsonwebtoken");

const adminMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Access Denied. No Token Provided."
            });
        }

        // Support both "Bearer <token>" and raw "<token>"
        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid Token Format."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
        req.admin = decoded;
        next();
    } catch (error) {
        console.log("Admin middleware auth error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token."
        });
    }
};

module.exports = adminMiddleware;