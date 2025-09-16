import { PrismaClient } from '@prisma/client';
import { type Request, type Response } from 'express';
const prisma = new PrismaClient();

export const registerFMID = async (req: Request, res: Response) => {
  try {
    const { FMID, IDNumber, date, pendingAmount } = req.body;
    if (!FMID || !IDNumber || !date || pendingAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const existingFM = await prisma.fM.findUnique({
      where: { FMID }
    });
    if (existingFM) {
      return res.status(400).json({ error: 'FMID already exists' });
    }
    const fm = await prisma.fM.create({
      data: {
        FMID,
        IDNumber,
        date,
        pendingAmount: parseFloat(pendingAmount),
      },
    });
    return res.status(201).json({ message: 'FMID registered successfully', fm });
  } catch (error) {
    console.error('Error registering FMID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPayments = async (req: Request, res: Response) => {
  try {
    const { payments } = req.body;
    const results = [];
    for (const payment of payments) {
      const { FMID, amount } = payment;
      const fm = await prisma.fM.findUnique({
        where: { FMID },
      });
      if (!fm) {
        results.push({ FMID, status: 'error', message: 'FMID not found' });
        continue;
      }
      if (amount > fm.pendingAmount) {
        results.push({
          FMID,
          status: 'error',
          message: 'Payment amount exceeds pending amount',
        });
        continue;
      }
      const updatedFM = await prisma.fM.update({
        where: { FMID },
        data: {
          pendingAmount: fm.pendingAmount - amount,
          paymentRecords: {
            create: {
              IDNumber: fm.IDNumber,
              date: new Date().toISOString(),
              customerName: `Customer ${Date.now()}`,
              amount: amount,
              amountInWords: amount.toString(),
              pendingAmount: fm.pendingAmount - amount,
              transactionNumber: `TXN-${Date.now()}`,
              paymentMode: 'Online',
              remarks: 'Payment processed',
            },
          },
        },
      });
      results.push({
        FMID,
        status: 'success',
        message: 'Payment recorded',
        pendingAmount: updatedFM.pendingAmount,
      });
    }
    return res.status(201).json({ results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

