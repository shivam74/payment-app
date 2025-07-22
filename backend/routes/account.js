const express = require('express');
const { authMiddleware } = require('../middleware');
const { User, Account } = require('../db');
const mongoose = require('mongoose');
const zod = require('zod');

const router = express.Router();

// GET account balance
router.get('/balance', authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({
            userId: req.userId
        });
        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }
        res.json({
            balance: account.balance
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Transaction input validation
const transactionSchema = zod.object({
    amount: zod.number().positive(),
    to: zod.string().length(24) // MongoDB ObjectId length
});

// POST transaction (transfer balance)
router.post('/balance', authMiddleware, async (req, res) => {
    const { success } = transactionSchema.safeParse(req.body);
    if (!success) {
        return res.status(400).json({ message: 'Invalid input' });
    }
    const { amount, to } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const account = await Account.findOne({
            userId: req.userId
        }).session(session);
        if (!account || account.balance < amount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: 'Insufficient balance'
            });
        }
        const toAccount = await Account.findOne({
            userId: to
        }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                message: 'Invalid account'
            });
        }
        await Account.updateOne({ userId: req.userId }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);
        await session.commitTransaction();
        session.endSession();
        res.json({
            message: 'Transaction successful'
        });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;