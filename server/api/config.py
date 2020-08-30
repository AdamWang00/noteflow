from os import environ

class Config:
	DEBUG = environ["DEBUG"].lower() == "true" if "DEBUG" in environ else False
	SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
	SECRET_KEY = environ['SECRET_KEY']