from flask import jsonify, Blueprint

main = Blueprint('main', __name__)

@main.route("/")
def home():
	return jsonify(hello="hello")