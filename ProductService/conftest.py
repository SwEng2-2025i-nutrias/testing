import os
import pytest
from flask import Flask
from app import create_app, db as _db
from sqlalchemy import event
from sqlalchemy.engine import Engine

# Opcional: forzar SQLite foreign keys si usas SQLite en testing
@event.listens_for(Engine, "connect")
def _enable_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

@pytest.fixture(scope="session")
def app():
    """Crea una instancia de la app Flask en modo testing."""
    # Establece configuración para tests
    os.environ['FLASK_ENV'] = 'testing'
    app = create_app({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'SQLALCHEMY_TRACK_MODIFICATIONS': False,
    })
    # Con el contexto de app activo podemos crear la BD
    with app.app_context():
        _db.create_all()
        yield app
        _db.drop_all()

@pytest.fixture(scope="function")
def db_session(app):
    """
    Cada test funciona en una transacción que se revierte al finalizar,
    para aislar el estado de la base de datos.
    """
    connection = _db.engine.connect()
    transaction = connection.begin()

    options = dict(bind=connection, binds={})
    session = _db.create_scoped_session(options=options)

    _db.session = session
    yield session

    transaction.rollback()
    connection.close()
    session.remove()

@pytest.fixture(scope="function")
def client(app, db_session):
    """
    Cliente de test para simular peticiones HTTP.
    Usa la app y la sesión de BD del fixture anterior.
    """
    return app.test_client()

@pytest.fixture(scope="function")
def runner(app):
    """Cliente para comandos de Flask CLI (flask cli)."""
    return app.test_cli_runner()
