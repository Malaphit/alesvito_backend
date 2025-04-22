const express = require('express');
const addressModel = require('../models/addressModel');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/', authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await addressModel.getAddressesByUser(userId);
    res.json(addresses);
  } catch (error) {
    console.error('Ошибка в getAddresses:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.post('/', authMiddleware(), async (req, res) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;
    const address = await addressModel.createAddress(userId, addressData);
    res.status(201).json(address);
  } catch (error) {
    console.error('Ошибка в createAddress:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

router.put('/:addressId', authMiddleware(), async (req, res) => {
  try {
    const { addressId } = req.params;
    const addressData = req.body;
    const updatedAddress = await addressModel.updateAddress(addressId, addressData);
    res.json(updatedAddress);
  } catch (error) {
    console.error('Ошибка в updateAddress:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;