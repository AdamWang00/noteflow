from flask import Flask
from api.config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=Config):
	app = Flask(__name__)
	app.config.from_object(Config)

	db.init_app(app)
	bcrypt.init_app(app)

	from api.users.routes import users
	from api.posts.routes import posts
	from api.main.routes import main
	app.register_blueprint(users)
	app.register_blueprint(posts)
	app.register_blueprint(main)

	@app.after_request
	def apply_caching(response):
	    response.headers['Access-Control-Allow-Origin'] = '*'
	    return response

	return app