import pytest
import io


@pytest.mark.asyncio
async def test_create_space(client, auth_headers):
    res = await client.post("/api/spaces", json={"name": "Test Space"}, headers=auth_headers)
    assert res.status_code == 201
    assert res.json()["name"] == "Test Space"


@pytest.mark.asyncio
async def test_list_spaces(client, auth_headers):
    await client.post("/api/spaces", json={"name": "Space A"}, headers=auth_headers)
    res = await client.get("/api/spaces", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_upload_invalid_type(client, auth_headers):
    space_res = await client.post("/api/spaces", json={"name": "Upload Test"}, headers=auth_headers)
    space_id = space_res.json()["id"]

    res = await client.post(
        f"/api/spaces/{space_id}/documents",
        files={"file": ("test.exe", io.BytesIO(b"data"), "application/octet-stream")},
        headers=auth_headers,
    )
    assert res.status_code == 422
