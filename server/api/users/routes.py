import os
from flask import render_template, url_for, flash, redirect, request, Blueprint, current_app
from flask_login import login_user, current_user, logout_user, login_required
from api import db, bcrypt
from api.models import User, Post
from api.users.forms import (RegistrationForm, LoginForm, UpdateAccountForm,
                                   RequestResetForm, ResetPasswordForm)
from api.users.utils import save_picture, send_reset_email


users = Blueprint('users', __name__)


@users.route("/register", methods=['POST'])
def register():
	if current_user.is_authenticated:
		return redirect(url_for('main.home'))
	form = RegistrationForm()
	if form.validate_on_submit():
		hashed_password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
		user = User(name=form.name.data, email=form.email.data, password=hashed_password)
		db.session.add(user)
		db.session.commit()
		flash(f'Successfully registered, {form.name.data}. Please log in.', 'success')
		return redirect(url_for('users.login'))
	return render_template('register.html', title='Register', form=form)


@users.route("/login", methods=['POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('main.home'))
	form = LoginForm()
	if form.validate_on_submit():
		user = User.query.filter_by(email=form.email.data).first()
		if user and bcrypt.check_password_hash(user.password, form.password.data):
			login_user(user, remember=form.remember.data)
			next_page = request.args.get('next')
			return redirect(next_page) if next_page else redirect(url_for('main.home'))
		else:
			flash('Login unsuccessful, please check email and/or password.', 'danger')
	return render_template('login.html', title='Login', form=form)


@users.route("/logout")
def logout():
	logout_user()
	return redirect(url_for('main.home'))


@users.route("/account", methods=['GET', 'POST'])
@login_required
def account():
	form = UpdateAccountForm()
	if form.validate_on_submit():
		if form.picture.data:
			if current_user.image_file != 'default.png':
				os.remove(os.path.join(current_app.root_path, 'static/profile_pics', current_user.image_file))
			current_user.image_file = save_picture(form.picture.data)
		current_user.name = form.name.data
		current_user.email = form.email.data
		db.session.commit()
		flash('Account info updated', 'success')
		return redirect(url_for('users.account'))
	elif request.method == 'GET':
		form.name.data = current_user.name
		form.email.data = current_user.email
	image_file = url_for('static', filename='profile_pics/' + current_user.image_file)
	return render_template('account.html', title='Account', image_file=image_file, form=form)


@users.route("/user/<string:name>")
def user_posts(name):
	page = request.args.get('page', 1, type=int)
	user = User.query.filter_by(name=name).first_or_404()
	posts = Post.query.filter_by(author=user).order_by(Post.date_posted.desc()).paginate(page=page, per_page=10)
	return render_template('user_posts.html', posts=posts, user=user)


@users.route("/reset_password", methods=['GET', 'POST'])
def reset_request():
	if current_user.is_authenticated:
		send_reset_email(current_user)
		flash('An email has been sent with instructions to reset your password', 'info')
		return redirect(url_for('users.account'))
	form = RequestResetForm()
	if form.validate_on_submit():
		send_reset_email(User.query.filter_by(email=form.email.data).first())
		flash('An email has been sent with instructions to reset your password', 'info')
		return redirect(url_for('users.login'))
	return render_template('reset_request.html', title='Reset Password', form=form)


@users.route("/reset_password/<token>", methods=['GET', 'POST'])
def reset_token(token):
	user = User.verify_reset_token(token)
	if user is None:
		flash('Password reset token invalid or expired', 'warning')
		if current_user.is_authenticated:
			return redirect(url_for('users.account'))
		return redirect(url_for('users.reset_request'))
	form = ResetPasswordForm()
	if form.validate_on_submit():
		user.password = bcrypt.generate_password_hash(form.password.data).decode('utf-8')
		db.session.commit()
		if current_user.is_authenticated:
			flash('Your password has been updated.', 'success')
			return redirect(url_for('main.home'))
		flash('Your password has been updated. Please log in.', 'success')
		return redirect(url_for('users.login'))
	return render_template('reset_token.html', title='Reset Password', form=form)

