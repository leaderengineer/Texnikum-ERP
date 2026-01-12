from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.group import Group
from app.schemas.group import GroupCreate, GroupUpdate, GroupResponse
from app.auth import get_current_user, get_current_active_admin
from app.models.audit_log import ActionType
from app.utils.audit_log import create_audit_log

router = APIRouter()


@router.get("/", response_model=List[GroupResponse])
async def get_groups(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha guruhlar ro'yxati"""
    query = db.query(Group).filter(Group.institution_id == current_user.institution_id)
    
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
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.institution_id == current_user.institution_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group


@router.post("/", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yangi guruh qo'shish"""
    # Name va code tekshirish (faqat joriy institution'da)
    existing_name = db.query(Group).filter(
        Group.name == group_data.name,
        Group.institution_id == current_user.institution_id
    ).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Group name already exists")
    
    existing_code = db.query(Group).filter(
        Group.code == group_data.code,
        Group.institution_id == current_user.institution_id
    ).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Group code already exists")
    
    # Institution_id qo'shish
    group_data_dict = group_data.model_dump()
    group_data_dict['institution_id'] = current_user.institution_id
    group = Group(**group_data_dict)
    db.add(group)
    db.commit()
    db.refresh(group)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.CREATE,
        resource_type="group",
        resource_id=group.id,
        description=f"Yangi guruh qo'shildi: {group.name} ({group.code})",
        request=request,
    )
    
    return group


@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: int,
    group_data: GroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Guruh ma'lumotlarini yangilash"""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.institution_id == current_user.institution_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Name va code tekshirish (faqat joriy institution'da)
    if group_data.name and group_data.name != group.name:
        existing_name = db.query(Group).filter(
            Group.name == group_data.name,
            Group.institution_id == current_user.institution_id
        ).first()
        if existing_name:
            raise HTTPException(status_code=400, detail="Group name already exists")
    
    if group_data.code and group_data.code != group.code:
        existing_code = db.query(Group).filter(
            Group.code == group_data.code,
            Group.institution_id == current_user.institution_id
        ).first()
        if existing_code:
            raise HTTPException(status_code=400, detail="Group code already exists")
    
    update_data = group_data.model_dump(exclude_unset=True)
    update_fields = list(update_data.keys())
    
    for field, value in update_data.items():
        setattr(group, field, value)
    
    db.commit()
    db.refresh(group)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.UPDATE,
        resource_type="group",
        resource_id=group_id,
        description=f"Guruh ma'lumotlari yangilandi: {group.name} (o'zgartirilgan maydonlar: {', '.join(update_fields)})",
        request=request,
    )
    
    return group


@router.delete("/{group_id}")
async def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
):
    """Guruhni o'chirish"""
    group = db.query(Group).filter(
        Group.id == group_id,
        Group.institution_id == current_user.institution_id
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    group_name = group.name
    
    db.delete(group)
    db.commit()
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.DELETE,
        resource_type="group",
        resource_id=group_id,
        description=f"Guruh o'chirildi: {group_name}",
        request=request,
    )
    
    return {"message": "Group deleted successfully"}

