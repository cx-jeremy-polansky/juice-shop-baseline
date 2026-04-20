router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = md5(password);
    const sql = `SELECT id, username, email, role FROM users WHERE username = '${username}' AND password = '${hashed}'`;
    const user = db.prepare(sql).get();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

router.post('/login2', (req, res) => {
  try {
    const { username, password } = req.body;
    const hashed = md5(password);
    const sql = `SELECT id, username, email, role FROM users WHERE username = ` + username + `AND password = ` + hashed;
    const user = db.prepare(sql).get();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});


