from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import verify_password, create_access_token
from backend.app.db.session import get_db
from backend.app.models.users import User
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class LoginRequest(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    email: str
    full_name: str
    department: str
    roles: list[str]


@router.post("/login", response_model=LoginResponse)
async def login(request: Request, session: AsyncSession = Depends(get_db)):
    email = None
    password = None
    content_type = request.headers.get("content-type", "")

    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception:
            pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing email or password",
        )

    res = await session.execute(
        select(User).options(selectinload(User.roles)).where(User.email == email)
    )
    user = res.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    roles = [r.name for r in user.roles]
    token = create_access_token(data={"sub": user.email, "roles": roles, "uid": user.id})

    return LoginResponse(
        access_token=token,
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        department=user.department,
        roles=roles,
    )


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "department": user.department,
        "roles": [r.name for r in user.roles],
    }
