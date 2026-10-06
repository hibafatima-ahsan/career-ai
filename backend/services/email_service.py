import os
import smtplib
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()


def send_verification_email(to_email, verification_link):
    msg = EmailMessage()

    msg["Subject"] = "Verify your CareerAI account"
    msg["From"] = os.getenv("MAIL_FROM")
    msg["To"] = to_email

    msg.set_content(
        f"""
Hello,

Welcome to CareerAI!

Please verify your email address by clicking the link below:

{verification_link}

If you did not create a CareerAI account, you can ignore this email.

Regards,
CareerAI Team
"""
    )

    with smtplib.SMTP(os.getenv("MAIL_SERVER"), int(os.getenv("MAIL_PORT"))) as server:
        server.starttls()
        server.login(
            os.getenv("MAIL_USERNAME"),
            os.getenv("MAIL_PASSWORD")
        )
        server.send_message(msg)