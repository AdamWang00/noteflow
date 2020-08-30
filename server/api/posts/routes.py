from flask import jsonify, request, Blueprint
from api import db
from api.models import Post
from api.users.utils import auth_user


posts = Blueprint('posts', __name__)


@posts.route("/post/new", methods=['POST'])
def new_post():
	token = request.json.get('token')
	if not token:
		return jsonify(error="Missing token")

	user = auth_user(token)
	if not user:
		return jsonify(error="Invalid token")

	title = request.json.get('title')
	melody_data = request.json.get('melody_data')
	if title == None or melody_data == None:
		return jsonify(error="Missing title/melody_data")

	post = Post(title=title, melody_data=melody_data, author=user)
	db.session.add(post)
	db.session.commit()

	return jsonify(post={
		"id":post.id,
		"title":post.title,
		"melody_data":post.melody_data,
		"author":post.author.name,
		"date":post.date_posted.strftime('%m-%d-%Y'),
	})


@posts.route("/post/<int:post_id>", methods=['GET'])
def post(post_id):
	post = Post.query.get(post_id)
	if not post:
		return jsonify(error="Post not found")

	return jsonify(post={
		"id":post.id,
		"title":post.title,
		"melody_data":post.melody_data,
		"author":post.author.name,
		"date":post.date_posted.strftime('%m-%d-%Y'),
	})


@posts.route("/post/<int:post_id>/delete", methods=['POST'])
def delete_post(post_id):
	token = request.json.get('token')
	if not token:
		return jsonify(error="Missing token")

	post = Post.query.get(post_id)
	if not post:
		return jsonify(error="Post not found")

	user = auth_user(token)
	if not user or post.author != auth_user(token):
		return jsonify(error="Permission denied")

	db.session.delete(post)
	db.session.commit()

	return jsonify(success=True)


@posts.route("/posts", methods=['GET'])
def recent_posts():
	posts = Post.query.order_by(Post.date_posted.desc()).limit(5).all()
	f = lambda post: {
		"id":post.id,
		"title":post.title,
		"melody_data":post.melody_data,
		"author":post.author.name,
		"date":post.date_posted.strftime('%m-%d-%Y'),
	}
	
	return jsonify(posts=list(map(f, posts)))