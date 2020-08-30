import os
import secrets
from flask import url_for, current_app
from flask_mail import Message
from api import mail


def send_reset_email(user):
	token = user.get_reset_token()
	msg = Message('Password Reset Request', sender='noreply10665@gmail.com', recipients=[user.email])
	msg.body = f'''To reset your password, go to the following link:
{url_for('users.reset_token', token=token, _external=True)}

If you did not make this password reset request, ignore this email.
'''
	mail.send(msg)

