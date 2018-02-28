const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');

// Stories Index
router.get('/', async (req, res) => {
  const stories = await Story.find({status: 'public'}).populate('user');
  res.render('stories/index', { stories: stories });
});

// Show single story
router.get('/show/:id', async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id }).populate('user');
  res.render('stories/show', { story: story });
});

// Add Story Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

// Edit Story Form
router.get('/edit/:id', ensureAuthenticated, async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id });
  res.render('stories/edit', { story: story });
});

// Delete Story
router.delete('/:id', async (req, res) => {
  await Story.remove({ _id: req.params.id });
  res.redirect('/dashboard');
});

// Process Add Story
router.post('/', async (req, res) => {
  mapAllowComments(req);
  const newStory = {
    ...req.body,
    user: req.user.id
  }
  const story = await new Story(newStory).save();
  res.redirect(`/stories/show/${story.id}`);
});

// Process Edit Form
router.put('/:id', async (req, res) => {
  const story = await Story.findOne({ _id: req.params.id });
  mapAllowComments(req);
  story.title = req.body.title;
  story.body = req.body.body;
  story.status = req.body.status;
  story.allowComments = req.body.allowComments;
  await story.save();
  res.redirect('/dashboard');
});

function mapAllowComments(req) {
  if (req.body.allowComments) {
    req.body.allowComments = true;
  } else {
    req.body.allowComments = false;
  }
}

module.exports = router;
