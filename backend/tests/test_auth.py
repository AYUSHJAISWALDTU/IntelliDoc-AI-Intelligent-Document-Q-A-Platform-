import pytest


@pytest.mark.asyncio
async def test_signup(client):
    res = await client.post("/api/auth/signup", json={
        "email": "newuser@example.com",
        "password": "securepass123",
        "name": "New User",
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_signup_duplicate_email(client):
    payload = {"email": "dupe@example.com", "password": "pass1234", "name": "Dupe"}
    await client.post("/api/auth/signup", json=payload)
    res = await client.post("/api/auth/signup", json=payload)
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client):
    await client.post("/api/auth/signup", json={
        "email": "login@example.com", "password": "password123", "name": "Login User"
    })
    res = await client.post("/api/auth/login", json={
        "email": "login@example.com", "password": "password123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/auth/signup", json={
        "email": "wrong@example.com", "password": "correct", "name": "User"
    })
    res = await client.post("/api/auth/login", json={
        "email": "wrong@example.com", "password": "incorrect"
    })
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_profile(client, auth_headers):
    res = await client.get("/api/settings/profile", headers=auth_headers)
    assert res.status_code == 200
    assert "email" in res.json()
