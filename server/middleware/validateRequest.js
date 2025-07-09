export default function validateRequest(req, res, next) {
    const { items, length } = req.body;
  
    if (!items) {
      return res.status(400).json({ error: "items are missing" });
    }
  
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: "items must be an array" });
    }
  
    if (length === undefined) {
      return res.status(400).json({ error: "length is missing" });
    }
  
    if (typeof length !== "number" || length <= 0) {
      return res.status(400).json({ error: "length must be a positive number" });
    }
  
    next();
  }
  