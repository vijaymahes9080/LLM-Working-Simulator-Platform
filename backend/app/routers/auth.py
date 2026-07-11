from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.services.auth_service import get_password_hash, verify_password, create_access_token
import time

router = APIRouter(prefix="/auth", tags=["auth"])

class UserRegisterSchema(BaseModel):
    email: EmailStr
    password: str

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str
    email: str
    role: str

@router.post("/register", response_model=TokenSchema)
def register(user_data: UserRegisterSchema, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(email=user_data.email, hashed_password=hashed_pwd, role="user")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Generate token
    token_data = {"sub": new_user.email, "id": new_user.id, "role": new_user.role}
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": new_user.email,
        "role": new_user.role
    }

@router.post("/login", response_model=TokenSchema)
def login(credentials: UserLoginSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    token_data = {"sub": user.email, "id": user.id, "role": user.role}
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": user.email,
        "role": user.role
    }

@router.post("/guest", response_model=TokenSchema)
def guest_mode():
    # Issue a temporary guest token
    guest_email = f"guest_{int(time.time())}@llminside.local"
    token_data = {"sub": guest_email, "id": None, "role": "guest"}
    token = create_access_token(token_data)
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "email": guest_email,
        "role": "guest"
    }
