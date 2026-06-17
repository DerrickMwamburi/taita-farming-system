# backend/management/sms.py
import africastalking
import logging

logger = logging.getLogger(__name__)

# 1. Sandbox Credentials Configuration
# In Africa's Talking, the username for testing is ALWAYS exactly "sandbox"
SMS_USERNAME = "sandbox"
SMS_API_KEY = "atsk_01ea09d441f58390c3c629f5b5bc77bae5c07f8f07dc0ebba47aa594ea904ddb3d8c81af"

def send_registration_sms(farmer_name, phone_number, acreage, subcounty):
    """
    Connects to the Africa's Talking Sandbox API and sends a customized
    onboarding confirmation message to a newly registered farmer.
    """
    # 2. Initialize the SDK
    africastalking.initialize(SMS_USERNAME, SMS_API_KEY)
    sms = africastalking.SMS

    # 3. Craft the localized message
    message = (
        f"Thank you, {farmer_name}. Your {acreage}-acre farm in {subcounty.title()} "
        f"is officially registered with the Taita-Taveta Agri-System."
    )
    
    # 4. Recipients must be passed as a list
    recipients = [phone_number]

    try:
        # 5. Fire the asynchronous API call
        response = sms.send(message, recipients)
        logger.info(f"SMS Status: {response}")
        return response
    except Exception as e:
        logger.error(f"Failed to send sandbox SMS: {str(e)}")
        return None