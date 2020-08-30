from datetime import datetime
from flask import current_app
from api import db, login_manager
from flask_login import UserMixin


@login_manager.user_loader
def load_user(user_id):
	return User.query.get(int(user_id))


class User(db.Model, UserMixin):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(20), unique=True, nullable=False)
	email = db.Column(db.String(120), unique=True, nullable=False)
	password = db.Column(db.String(20), nullable=False)
	posts = db.relationship('Post', backref='author', lazy=True)

	def 

	def __repr__(self):
		return f"User('{self.name}', '{self.email}', '{self.image_file}')"


class Post(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(100), nullable=False)
	date_posted = db.Column(db.DateTime, nullable=False, default=datetime.now)
	content = db.Column(db.Text, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
	melody_data = db.Column(db.JSON, nullable=False)

	def __repr__(self):
		return f"Post('{self.title}', '{self.date_posted}', '{self.melody_data}')"