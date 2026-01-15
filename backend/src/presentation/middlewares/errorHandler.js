function errorHandler(err, req, res, next) {
  console.error(err.message);

  if (err.message.includes("Invalid") || err.message.includes("required")) {
    return res.status(400).json({ error: err.message });
  }

  if (err.message.includes("not found")) {
    return res.status(404).json({ error: err.message });
  }

  if (err.message.includes("already")) {
    return res.status(409).json({ error: err.message });
  }

  res.status(500).json({ error: err.message || "Internal server error" });
}

module.exports = errorHandler;
