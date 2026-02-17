const express = require('express');
const router = express.Router();

// --- YOUR MOCK DATA ---
let POSTS = [
  {
    id: '1',
    user: { id: 'u1', username: 'MeowCatto', avatar: 'https://i.pravatar.cc/150?img=64' },
    image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
    caption: 'I made a delicious Sri Lankan curry...',
    likes: 124,
    saved: false
  },
  {
    id: '2',
    user: { id: 'u2', username: 'ChipiGuy', avatar: 'https://i.pravatar.cc/150?img=11' },
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87',
    caption: 'Sunday Ratatouille!',
    likes: 89,
    saved: true
  }
];

// --- ROUTES ---
router.get('/', (req, res) => {
  res.json(POSTS);
});

router.post('/:id/like', (req, res) => {
  const { id } = req.params;
  const post = POSTS.find(p => p.id === id);
  if (post) {
    post.likes += 1;
    res.json({ success: true, newLikes: post.likes });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});

router.post('/:id/save', (req, res) => {
  const { id } = req.params;
  const post = POSTS.find(p => p.id === id);
  if (post) {
    post.saved = !post.saved;
    res.json({ success: true, isSaved: post.saved });
  } else {
    res.status(404).json({ error: "Not found" });
  }
});


module.exports = router;