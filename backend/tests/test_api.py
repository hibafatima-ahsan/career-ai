import sys
import os

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

import pytest
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True

    with app.test_client() as client:
        yield client


def test_home(client):
    response = client.get("/")
    assert response.status_code == 200


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200


def test_internships(client):
    response = client.get("/api/internships/")
    assert response.status_code == 200


def test_career_recommendation_requires_token(client):
    response = client.post(
        "/api/ai/career-recommendation",
        json={
            "question": "I know Python and Flask"
        }
    )

    assert response.status_code == 401