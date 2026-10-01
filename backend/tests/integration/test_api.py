import pytest
from httpx import AsyncClient, ASGITransport
from backend.app.main import app


@pytest.mark.asyncio
async def test_auth_login_and_me():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login
        resp = await ac.post("/auth/login", json={"email": "procurement@demo.local", "password": "demo123"})
        assert resp.status_code == 200
        data = resp.json()
        token = data["access_token"]
        assert "procurement_officer" in data["roles"]

        # 2. Get me
        headers = {"Authorization": f"Bearer {token}"}
        me_resp = await ac.get("/auth/me", headers=headers)
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "procurement@demo.local"


@pytest.mark.asyncio
async def test_dashboard_and_orders_api():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Dashboard summary
        dash_resp = await ac.get("/dashboard/summary")
        assert dash_resp.status_code == 200
        dash_data = dash_resp.json()
        assert "kpis" in dash_data
        assert dash_data["kpis"]["orders_at_risk"] > 0

        # Orders list
        ord_resp = await ac.get("/orders")
        assert ord_resp.status_code == 200
        orders = ord_resp.json()
        assert len(orders) > 0

        # Specific order ORD-1847
        medix_resp = await ac.get("/orders/ORD-1847")
        assert medix_resp.status_code == 200
        medix_data = medix_resp.json()
        assert medix_data["order_number"] == "ORD-1847"
        assert medix_data["total_amount"] == 62500.0


@pytest.mark.asyncio
async def test_chat_agent_and_approval_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Login as Procurement Officer
        login_res = await ac.post("/auth/login", json={"email": "procurement@demo.local", "password": "demo123"})
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Ask question to Agent
        chat_res = await ac.post(
            "/chat/messages",
            json={"message": "Can we fulfill Medix's order by October 20?"},
            headers=headers,
        )
        assert chat_res.status_code == 200
        chat_data = chat_res.json()
        assert chat_data["approval_required"] is True
        assert chat_data["approval_id"] is not None
        assert "ORD-1847" in chat_data["response"]
        app_id = chat_data["approval_id"]

        # 3. Check approvals list
        app_list_res = await ac.get("/approvals?status_filter=PENDING", headers=headers)
        assert app_list_res.status_code == 200
        pending_list = app_list_res.json()
        assert any(a["id"] == app_id for a in pending_list)

        # 4. Approve request as Procurement Officer (value 8,400 EUR is in Tier 2)
        approve_res = await ac.post(f"/approvals/{app_id}/approve", headers=headers)
        assert approve_res.status_code == 200
        approve_data = approve_res.json()
        assert approve_data["status"] == "APPROVED"


@pytest.mark.asyncio
async def test_flagship_delay_cascade_event():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        event_res = await ac.post("/events/flagship-scenario")
        assert event_res.status_code == 200
        event_data = event_res.json()
        assert event_data["delay_code"] == "DELAY-2026-001"
        assert len(event_data["affected_batches"]) > 0
        assert len(event_data["affected_orders"]) > 0
        assert "reschedule_plan" in event_data
        assert "customer_communication_draft" in event_data
