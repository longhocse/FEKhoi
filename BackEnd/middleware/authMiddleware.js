const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    console.log("Authorization header:", authHeader);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Chưa đăng nhập" });
    }

    const token = authHeader.split(" ")[1];
    console.log("Token nhận được:", token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded:", decoded);
        req.user = decoded;
        next();
    } catch (err) {
        console.log("JWT ERROR:", err.message);   // 🔥 QUAN TRỌNG
        return res.status(401).json({ message: "Token không hợp lệ" });
    }
};

module.exports = authMiddleware;