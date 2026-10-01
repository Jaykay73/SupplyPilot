from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.core.security import decode_access_token
from backend.app.db.session import get_db
from backend.app.models.users import User, Role

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    # If no token provided in demo mode, return default Procurement Officer
    if not token:
        res = await session.execute(
            select(User).options(selectinload(User.roles)).where(User.email == "procurement@demo.local")
        )
        user = res.scalar_one_or_none()
        if user:
            return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    email = payload["sub"]
    res = await session.execute(
        select(User).options(selectinload(User.roles)).where(User.email == email)
    )
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_roles(allowed_roles: List[str]):
    async def role_checker(user: User = Depends(get_current_user)) -> User:
        user_role_names = [r.name for r in user.roles]
        if "admin" in user_role_names:
            return user
        if not any(r in user_role_names for r in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of roles: {', '.join(allowed_roles)}. Caller has: {', '.join(user_role_names)}"
            )
        return user
    return role_checker
