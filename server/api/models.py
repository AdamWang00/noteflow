from datetime import datetime
from api import db, bcrypt


class User(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String(20), unique=True, nullable=False)
	password = db.Column(db.String(20), nullable=False)
	posts = db.relationship('Post', backref='author', lazy=True)

	def verify_password(self, password):
		return bcrypt.check_password_hash(self.password, password)


class Post(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	title = db.Column(db.String(100), nullable=False)
	date_posted = db.Column(db.DateTime, nullable=False, default=datetime.now)
	melody_data = db.Column(db.JSON, nullable=False)
	user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)