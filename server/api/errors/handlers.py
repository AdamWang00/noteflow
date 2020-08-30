from flask import jsonify, Blueprint


errors = Blueprint('errors', __name__)


@errors.app_errorhandler(403)
def error_403(error):
	return jsonify(error=403)


@errors.app_errorhandler(404)
def error_404(error):
	return jsonify(error=404)


@errors.app_errorhandler(500)
def error_500(error):
	return jsonify(error=500)

