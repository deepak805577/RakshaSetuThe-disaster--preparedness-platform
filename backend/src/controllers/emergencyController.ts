import { Request, Response } from 'express';
import EmergencyContact from '../models/EmergencyContact';
import { smsService } from '../services/smsService';

interface AuthRequest extends Request {
  user?: any;
}

// @desc    Get emergency contacts by district
// @route   GET /api/emergency/contacts
// @access  Public
export const getEmergencyContacts = async (req: Request, res: Response) => {
  try {
    const { district, type } = req.query;

    const query: any = { isActive: true };
    if (district) query.district = district;
    if (type) query.type = type;

    const contacts = await EmergencyContact.find(query).sort({ type: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });

  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching emergency contacts'
    });
  }
};

// @desc    Get contacts by district for quick access
// @route   GET /api/emergency/contacts/district/:district
// @access  Public
export const getContactsByDistrict = async (req: Request, res: Response) => {
  try {
    const { district } = req.params;

    const contacts = await EmergencyContact.find({
      district: district,
      isActive: true
    }).sort({ type: 1, name: 1 });

    // Group contacts by type for better organization
    const groupedContacts = contacts.reduce((acc, contact) => {
      if (!acc[contact.type]) {
        acc[contact.type] = [];
      }
      acc[contact.type].push(contact);
      return acc;
    }, {} as Record<string, typeof contacts>);

    res.status(200).json({
      success: true,
      district,
      count: contacts.length,
      data: groupedContacts
    });

  } catch (error) {
    console.error('Get contacts by district error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching district contacts'
    });
  }
};

// @desc    Send emergency SMS alert
// @route   POST /api/emergency/send-alert
// @access  Private (Admin/Teacher)
export const sendEmergencyAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { district, message, contactTypes, severity = 'high' } = req.body;

    if (!district || !message) {
      return res.status(400).json({
        success: false,
        message: 'District and message are required'
      });
    }

    // Get contacts based on criteria
    const query: any = {
      district,
      isActive: true
    };

    if (contactTypes && contactTypes.length > 0) {
      query.type = { $in: contactTypes };
    }

    const contacts = await EmergencyContact.find(query);

    if (contacts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No emergency contacts found for the specified criteria'
      });
    }

    // Send SMS alerts
    const smsResult = await smsService.sendBulkAlert(
      contacts.map(c => ({
        phone: c.phone,
        name: c.name,
        type: c.type
      })),
      message,
      severity
    );

    res.status(200).json({
      success: smsResult.success,
      message: `Alert sent to ${smsResult.sent} contacts, ${smsResult.failed} failed`,
      data: {
        totalContacts: contacts.length,
        sent: smsResult.sent,
        failed: smsResult.failed,
        district,
        severity
      }
    });

  } catch (error) {
    console.error('Send emergency alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending emergency alert'
    });
  }
};

// @desc    Create new emergency contact (Admin only)
// @route   POST /api/emergency/contacts
// @access  Private (Admin)
export const createEmergencyContact = async (req: Request, res: Response) => {
  try {
    const contactData = req.body;
    const contact = await EmergencyContact.create(contactData);

    res.status(201).json({
      success: true,
      message: 'Emergency contact created successfully',
      data: contact
    });

  } catch (error: any) {
    console.error('Create emergency contact error:', error);

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
      message: 'Error creating emergency contact'
    });
  }
};

// @desc    Update emergency contact (Admin only)
// @route   PUT /api/emergency/contacts/:id
// @access  Private (Admin)
export const updateEmergencyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const contact = await EmergencyContact.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact updated successfully',
      data: contact
    });

  } catch (error: any) {
    console.error('Update emergency contact error:', error);

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
      message: 'Error updating emergency contact'
    });
  }
};

// @desc    Delete emergency contact (Admin only)
// @route   DELETE /api/emergency/contacts/:id
// @access  Private (Admin)
export const deleteEmergencyContact = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contact = await EmergencyContact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Emergency contact not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Emergency contact deleted successfully'
    });

  } catch (error) {
    console.error('Delete emergency contact error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting emergency contact'
    });
  }
};

// @desc    Test SMS functionality
// @route   POST /api/emergency/test-sms
// @access  Private (Admin)
export const testSMS = async (req: Request, res: Response) => {
  try {
    const { phoneNumber, testMessage } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const message = testMessage || 'This is a test message from Punjab Disaster Preparedness System. SMS functionality is working correctly.';

    const result = await smsService.sendEmergencyAlert([phoneNumber], message, 'test');

    res.status(200).json({
      success: result.success,
      message: result.success ? 'Test SMS sent successfully' : 'Failed to send test SMS',
      data: result
    });

  } catch (error) {
    console.error('Test SMS error:', error);
    res.status(500).json({
      success: false,
      message: 'Error testing SMS functionality'
    });
  }
};
