from flask import jsonify, request, current_app, Blueprint
from api import db, bcrypt
from api.models import User, Post
import jwt
import datetime


users = Blueprint('users', __name__)


@users.route("/register", methods=['POST'])
def register():
	name = request.json.get('name')
	password = request.json.get('password')
	if not name or not password:
		return jsonify(error="Missing name/password")

	user = User.query.filter_by(name=name).first()
	if user:
		return jsonify(error=f'Sorry, the name {name} has been taken.')
	
	hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
	user = User(name=name, password=hashed_password)
	db.session.add(user)
	db.session.commit()

	token = jwt.encode({'name': name, 'password': password, 'exp': datetime.datetime.utcnow()
		+ datetime.timedelta(minutes=15)}, current_app.config['SECRET_KEY'])
	return jsonify(token=token.decode('utf-8'))


@users.route("/login", methods=['POST'])
def login():
	name = request.json.get('name')
	password = request.json.get('password')
	if not name or not password:
		return jsonify(error="Missing name/password")

	user = User.query.filter_by(name=name).first()
	if user and user.verify_password(password):
		token = jwt.encode({'name': name, 'password': password, 'exp': datetime.datetime.utcnow()
		+ datetime.timedelta(minutes=15)}, current_app.config['SECRET_KEY'])
		return jsonify(token=token.decode('utf-8'))

	return jsonify(error="Invalid credentials")


@users.route("/account", methods=['POST'])
def account():
	token = request.json.get('token')
	if not token:
		return jsonify(error="Missing token")

	try:
		token_data = jwt.decode(token, current_app.config['SECRET_KEY'])
	except:
		return jsonify(error="Token invalid or expired")

	name = token_data.get('name')
	password = token_data.get('password')
	if name is None or password is None:
		return jsonify(error="Missing token name/password")

	user = User.query.filter_by(name=name).first()
	if user and user.verify_password(password):
		return jsonify(name=name)

	return jsonify(error="Invalid token credentials")


@users.route("/user/<string:name>", methods=['GET'])
def user_posts(name):
	user = User.query.filter_by(name=name).first()
	if not user:
		return jsonify(error="Invalid user")

	posts = Post.query.filter_by(author=user).order_by(Post.date_posted.desc()).all()
	f = lambda post: {
		"id":post.id,
		"title":post.title,
		"melody_data":post.melody_data,
		"author":post.author.name,
		"date":post.date_posted.strftime('%m-%d-%Y'),
	}
	
	return jsonify(posts=list(map(f, posts)))