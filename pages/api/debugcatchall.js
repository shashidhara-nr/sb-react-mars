export default function handler(req, res) {
  res.status(200).json({
    url: req.url,
    method: req.method,
    headers: req.headers,
    message: "This is the debug catch-all route. If you see this, your rewrite is NOT working."
  });
}
