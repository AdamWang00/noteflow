import os
from flask import jsonify, current_app, abort, Blueprint
from flask_login import current_user, login_required
from api import db
from api.models import Post
from api.posts.forms import PostForm


posts = Blueprint('posts', __name__)


@posts.route("/post/new", methods=['POST'])
@login_required
def new_post():
	form = PostForm()
	if form.validate_on_submit():
		post = Post(title=form.title.data, content=form.content.data, melody_data=form.melody_data.data, author=current_user)
		db.session.add(post)
		db.session.commit()
	return jsonify(success=True)


@posts.route("/post/<int:post_id>")
def post(post_id):
	post = Post.query.get_or_404(post_id)
	return jsonify(post)


@posts.route("/post/<int:post_id>/delete", methods=['POST'])
@login_required
def delete_post(post_id):
	post = Post.query.get_or_404(post_id)
	if post.author != current_user:
		abort(403)
	db.session.delete(post)
	db.session.commit()
	return jsonify(success=True)

