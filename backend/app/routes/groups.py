from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.group import Group
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse
from app.auth import get_current_user, get_current_active_admin

router = APIRouter()


@router.get("/", response_model=List[GroupResponse])
async def get_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha guruhlar ro'yxati"""
    query = db.query(Group)
    
    if department:
        query = query.filter(Group.department == department)
    if status:
        is_active = status.lower() == 'active'
        query = query.filter(Group.is_active == is_active)
    
    groups = query.offset(skip).limit(limit).all()
    return groups


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Guruh ma'lumotlari"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("/", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Yangi guruh qo'shish"""
    # Name va code tekshirish
    existing_name = db.query(Group).filter(Group.name == group_data.name).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Group name already exists")
    
    existing_code = db.query(Group).filter(Group.code == group_data.code).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Group code already exists")
    
    group = Group(**group_data.model_dump())
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Guruh ma'lumotlarini yangilash"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Name va code tekshirish
    if group_data.name and group_data.name != group.name:
        existing_name = db.query(Group).filter(Group.name == group_data.name).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Group name already exists")
    
    if group_data.code and group_data.code != group.code:
        existing_code = db.query(Group).filter(Group.code == group_data.code).first()
        if existing_code:
            raise HTTPException(status_code=400, detail="Group code already exists")
    
    update_data = group_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    return group


@router.delete("/{group_id}")
async def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Guruhni o'chirish"""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    db.delete(group)
    db.commit()
    return {"message": "Group deleted successfully"}

