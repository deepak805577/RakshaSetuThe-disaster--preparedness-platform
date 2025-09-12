import { Twilio } from 'twilio';

class SMSService {
  private client: Twilio | undefined;
  private fromPhoneNumber: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.fromPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. SMS functionality will be disabled.');
      return;
    }

    this.client = new Twilio(accountSid, authToken);
  }

  async sendEmergencyAlert(
    phoneNumbers: string[],
    message: string,
    alertType: string = 'emergency'
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    if (!this.client) {
      return {
        success: false,
        sent: 0,
        failed: phoneNumbers.length,
        errors: ['SMS service not configured']
      };
    }

    const results = {
      success: true,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    const messageBody = `🚨 PUNJAB EMERGENCY ALERT 🚨\n\n${message}\n\nStay safe and follow official instructions.\n\n- Punjab Disaster Management`;

    // Send SMS to each phone number
    for (const phoneNumber of phoneNumbers) {
      try {
        // Format Indian phone numbers for international format
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        
        await this.client.messages.create({
          body: messageBody,
          from: this.fromPhoneNumber,
          to: formattedNumber
        });

        results.sent++;
        console.log(`Emergency SMS sent to ${phoneNumber}`);
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Failed to send to ${phoneNumber}: ${error.message}`);
        console.error(`SMS failed for ${phoneNumber}:`, error.message);
      }
    }

    if (results.failed > 0) {
      results.success = false;
    }

    return results;
  }

  async sendDrillNotification(
    phoneNumber: string,
    studentName: string,
    drillType: string,
    score: number
  ): Promise<boolean> {
    if (!this.client) {
      console.warn('SMS service not configured');
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = `📚 Disaster Preparedness Update\n\n${studentName} completed a ${drillType} drill with a score of ${score}%.\n\nGreat job on learning emergency safety!\n\n- Punjab Schools Disaster Prep`;

      await this.client.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: formattedNumber
      });

      console.log(`Drill notification sent to ${phoneNumber}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send drill notification to ${phoneNumber}:`, error.message);
      return false;
    }
  }

  async sendModuleCompletionNotification(
    phoneNumber: string,
    studentName: string,
    moduleTitle: string,
    score: number
  ): Promise<boolean> {
    if (!this.client) {
      console.warn('SMS service not configured');
      return false;
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const message = `🎓 Learning Achievement\n\n${studentName} completed "${moduleTitle}" with ${score}% score.\n\n${score >= 80 ? 'Excellent work!' : 'Keep learning and improving!'}\n\n- Punjab Schools Disaster Prep`;

      await this.client.messages.create({
        body: message,
        from: this.fromPhoneNumber,
        to: formattedNumber
      });

      console.log(`Module completion notification sent to ${phoneNumber}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to send module notification to ${phoneNumber}:`, error.message);
      return false;
    }
  }

  async sendBulkAlert(
    contacts: Array<{ phone: string; name: string; type: string }>,
    alertMessage: string,
    alertSeverity: 'low' | 'medium' | 'high' | 'critical' = 'high'
  ): Promise<{ success: boolean; sent: number; failed: number }> {
    if (!this.client) {
      return { success: false, sent: 0, failed: contacts.length };
    }

    const severityEmoji = {
      low: '⚠️',
      medium: '🟡',
      high: '🔴',
      critical: '🚨'
    };

    const phoneNumbers = contacts.map(c => c.phone);
    const message = `${severityEmoji[alertSeverity]} PUNJAB ALERT - ${alertSeverity.toUpperCase()}\n\n${alertMessage}\n\nThis message was sent to ${contacts.map(c => c.type).join(', ')} contacts.\n\n- Punjab Emergency Management`;

    return await this.sendEmergencyAlert(phoneNumbers, message, 'bulk_alert');
  }

  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // If it's a 10-digit Indian number, add +91 prefix
    if (cleaned.length === 10 && cleaned.match(/^[6-9]/)) {
      return `+91${cleaned}`;
    }
    
    // If it already has country code, use as is
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return `+${cleaned}`;
    }
    
    // Default to Indian format
    return `+91${cleaned.slice(-10)}`;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Test by fetching account info
      await this.client.api.accounts.list({ limit: 1 });
      return true;
    } catch (error) {
      console.error('Twilio connection test failed:', error);
      return false;
    }
  }
}

export const smsService = new SMSService();

// Export individual functions for backward compatibility
export const sendSMS = (phoneNumber: string, message: string): Promise<boolean> => {
  return smsService.sendEmergencyAlert([phoneNumber], message).then(result => result.success);
};

export const sendEmergencyAlert = smsService.sendEmergencyAlert.bind(smsService);
export const sendDrillNotification = smsService.sendDrillNotification.bind(smsService);
export const sendModuleCompletionNotification = smsService.sendModuleCompletionNotification.bind(smsService);
