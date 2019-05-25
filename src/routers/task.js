const express = require('express');
const router = new express.Router();
const Task = require('../models/task');
const {ObjectID} = require('mongodb');
const auth = require('../middleware/auth');

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send();
    }
});

//GET /tasks?completed=true
//GET /tasks?limit=2&skip=2
//GET /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    try {
        //const tasks = await Task.find({owner: req.user._id});
        const match = {};
        const sort = {};
        if(req.query.completed) {
            match.completed = req.query.completed === 'true';
        }
        if(req.query.sortBy) {
            const parts = req.query.sortBy.split(':');
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }
        await req.user.populate({
            path: 'userTasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.status(200).send(req.user.userTasks); 
    } catch (e) {
        res.status(500).send();
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    if(!ObjectID.isValid(_id)) {
        res.status(400).send();
    }

    try {
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task) {
            res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send();
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    if(!ObjectID.isValid(req.params.id)) {
        return res.status(400).send();
    }
    const updates = Object.keys(req.body);
    const validUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every(update => validUpdates.includes(update));
    if(!isValidUpdate) {    
        res.status(400).send();
    }
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            res.status(404).send();
        }
        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
        res.status(200).send(task);
    } catch (e) {
        res.status(400).send();
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    if(!ObjectID.isValid(req.params.id)) {
        return res.status(400).send();
    }
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task) {
            res.status(404).send();
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send();
    }
});

module.exports = router;
