from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.department import Department
from app.models.audit_log import ActionType
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.auth import get_current_user, get_current_active_admin
from app.utils.audit_log import create_audit_log

# Request type hint uchun
from fastapi import Request

router = APIRouter()


@router.get("/", response_model=List[DepartmentResponse])
async def get_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha yo'nalishlar ro'yxati"""
    departments = db.query(Department).filter(
        Department.institution_id == current_user.institution_id,
        Department.status == "active"
    ).all()
    return departments


@router.get("/{department_id}", response_model=DepartmentResponse)
async def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Yo'nalish ma'lumotlari"""
    department = db.query(Department).filter(Department.id == department_id).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.post("/", response_model=DepartmentResponse)
async def create_department(
    department_data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yangi yo'nalish qo'shish"""
    # Name va code tekshirish (faqat joriy institution'da)
    existing_name = db.query(Department).filter(
        Department.name == department_data.name,
        Department.institution_id == current_user.institution_id
    ).first()
    if existing_name:
        raise HTTPException(status_code=400, detail="Department name already exists")
    
    existing_code = db.query(Department).filter(
        Department.code == department_data.code,
        Department.institution_id == current_user.institution_id
    ).first()
    if existing_code:
        raise HTTPException(status_code=400, detail="Department code already exists")
    
    # Institution_id qo'shish
    department_data_dict = department_data.model_dump()
    department_data_dict['institution_id'] = current_user.institution_id
    department = Department(**department_data_dict)
    db.add(department)
    db.commit()
    db.refresh(department)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.CREATE,
        resource_type="department",
        resource_id=department.id,
        description=f"Yangi yo'nalish qo'shildi: {department.name} ({department.code})",
        request=request,
    )
    
    return department


@router.put("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: int,
    department_data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yo'nalish ma'lumotlarini yangilash"""
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.institution_id == current_user.institution_id
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    update_data = department_data.model_dump(exclude_unset=True)
    update_fields = list(update_data.keys())
    
    for field, value in update_data.items():
        setattr(department, field, value)
    
    db.commit()
    db.refresh(department)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.UPDATE,
        resource_type="department",
        resource_id=department_id,
        description=f"Yo'nalish ma'lumotlari yangilandi: {department.name} (o'zgartirilgan maydonlar: {', '.join(update_fields)})",
        request=request,
    )
    
    return department


@router.delete("/{department_id}")
async def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yo'nalishni o'chirish"""
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.institution_id == current_user.institution_id
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    
    department_name = department.name
    
    db.delete(department)
    db.commit()
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.DELETE,
        resource_type="department",
        resource_id=department_id,
        description=f"Yo'nalish o'chirildi: {department_name}",
        request=request,
    )
    
    return {"message": "Department deleted successfully"}

