const express = require('express');
const Department = require('../models/Department');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
router.get('/', async (req, res) => {
    try {
        const departments = await Department.find()
            .populate('headId', 'name email')
            .sort({ name: 1 });
        res.json(departments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
router.get('/:id', async (req, res) => {
    try {
        const department = await Department.findById(req.params.id)
            .populate('headId', 'name email');
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Create department
// @route   POST /api/departments
// @access  Private/SuperAdmin
router.post('/', authorize('superadmin'), async (req, res) => {
    try {
        const { name, code, description, headId, status } = req.body;

        const deptExists = await Department.findOne({ $or: [{ name }, { code }] });
        if (deptExists) {
            return res.status(400).json({ message: 'Department with this name or code already exists' });
        }

        const department = await Department.create({
            name,
            code,
            description,
            headId,
            status
        });

        res.status(201).json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private/SuperAdmin
router.put('/:id', authorize('superadmin'), async (req, res) => {
    try {
        const { name, code, description, headId, status } = req.body;

        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        department.name = name || department.name;
        department.code = code || department.code;
        department.description = description !== undefined ? description : department.description;
        department.headId = headId !== undefined ? headId : department.headId;
        department.status = status || department.status;

        await department.save();
        res.json(department);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private/SuperAdmin
router.delete('/:id', authorize('superadmin'), async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);
        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
