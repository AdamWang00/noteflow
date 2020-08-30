from flask import current_app
from api.models import User
import jwt

def auth_user(token):
    try:
        print(token)
        token_data = jwt.decode(token, current_app.config['SECRET_KEY'])
    except:
        print("[AUTH ERROR] 1")
        return None

    name = token_data.get('name')
    password = token_data.get('password')
    if name is None or password is None:
        print("[AUTH ERROR] 2")
        return None

    user = User.query.filter_by(name=name).first()
    if user and user.verify_password(password):
        return user

    print("[AUTH ERROR] 3")
    return None