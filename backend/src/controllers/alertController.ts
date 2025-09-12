import { Request, Response } from 'express';
import PunjabAlert from '../models/PunjabAlert';
import { io } from '../server';

// @desc    Get active alerts
// @route   GET /api/alerts
// @access  Public
export const getActiveAlerts = async (req: Request, res: Response) => {
  try {
    const { district, type, severity } = req.query;

    const query: any = {
      isActive: true,
      validUntil: { $gt: new Date() }
    };

    if (district) query.affectedDistricts = district;
    if (type) query.type = type;
    if (severity) query.severity = severity;

    const alerts = await PunjabAlert.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching alerts'
    });
  }
};

// @desc    Create a new alert (Admin)
// @route   POST /api/alerts
// @access  Private (Admin)
export const createAlert = async (req: Request, res: Response) => {
  try {
    const alertData = req.body;

    const alert = await PunjabAlert.create(alertData);

    // Broadcast to affected districts via Socket.io
    if (alert.affectedDistricts && alert.affectedDistricts.length > 0) {
      alert.affectedDistricts.forEach((district: string) => {
        io.to(`alerts-${district}`).emit('emergency-alert', {
          _id: alert._id,
          title: alert.title,
          description: alert.description,
          severity: alert.severity,
          type: alert.type,
          validUntil: alert.validUntil,
          createdAt: alert.createdAt
        });
      });
    }

    res.status(201).json({
      success: true,
      message: 'Alert created and broadcasted successfully',
      data: alert
    });

  } catch (error: any) {
    console.error('Create alert error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating alert'
    });
  }
};

// @desc    Deactivate an alert (Admin)
// @route   PUT /api/alerts/:id/deactivate
// @access  Private (Admin)
export const deactivateAlert = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const alert = await PunjabAlert.findByIdAndUpdate(id, {
      isActive: false
    }, { new: true });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Alert deactivated successfully',
      data: alert
    });

  } catch (error) {
    console.error('Deactivate alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating alert'
    });
  }
};

