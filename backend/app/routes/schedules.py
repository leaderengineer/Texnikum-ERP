from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.schedule import Schedule
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.auth import get_current_user, get_current_active_admin
from app.models.audit_log import ActionType
from app.utils.audit_log import create_audit_log

router = APIRouter()


@router.get("/", response_model=List[ScheduleResponse])
async def get_schedules(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    group: Optional[str] = None,
    day: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Barcha dars jadvallari"""
    query = db.query(Schedule).filter(Schedule.institution_id == current_user.institution_id)
    
    if group:
        query = query.filter(Schedule.group == group)
    if day:
        query = query.filter(Schedule.day == day)
    
    schedules = query.offset(skip).limit(limit).all()
    return schedules


@router.get("/{schedule_id}", response_model=ScheduleResponse)
async def get_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Dars jadvali ma'lumotlari"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.institution_id == current_user.institution_id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule


@router.get("/group/{group}", response_model=List[ScheduleResponse])
async def get_schedules_by_group(
    group: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Guruh bo'yicha dars jadvallari"""
    schedules = db.query(Schedule).filter(
        Schedule.group == group,
        Schedule.institution_id == current_user.institution_id
    ).all()
    return schedules


@router.post("/", response_model=ScheduleResponse)
async def create_schedule(
    schedule_data: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Yangi dars jadvali qo'shish"""
    schedule_dict = schedule_data.model_dump()
    schedule_dict['institution_id'] = current_user.institution_id
    schedule = Schedule(**schedule_dict)
    db.add(schedule)
    db.commit()
    db.refresh(schedule)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.CREATE,
        resource_type="schedule",
        resource_id=schedule.id,
        description=f"Yangi dars jadvali qo'shildi: {schedule.group} - {schedule.day} ({schedule.subject})",
        request=request,
    )
    
    return schedule


@router.put("/{schedule_id}", response_model=ScheduleResponse)
async def update_schedule(
    schedule_id: int,
    schedule_data: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Dars jadvalini yangilash"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.institution_id == current_user.institution_id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    update_data = schedule_data.model_dump(exclude_unset=True)
    update_fields = list(update_data.keys())
    
    for field, value in update_data.items():
        setattr(schedule, field, value)
    
    db.commit()
    db.refresh(schedule)
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.UPDATE,
        resource_type="schedule",
        resource_id=schedule_id,
        description=f"Dars jadvali yangilandi: {schedule.group} - {schedule.day} (o'zgartirilgan maydonlar: {', '.join(update_fields)})",
        request=request,
    )
    
    return schedule


@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_admin),
    request: Request = None,
):
    """Dars jadvalini o'chirish"""
    schedule = db.query(Schedule).filter(
        Schedule.id == schedule_id,
        Schedule.institution_id == current_user.institution_id
    ).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule_info = f"{schedule.group} - {schedule.day} ({schedule.subject})"
    
    db.delete(schedule)
    db.commit()
    
    # Audit log
    create_audit_log(
        db=db,
        user=current_user,
        action=ActionType.DELETE,
        resource_type="schedule",
        resource_id=schedule_id,
        description=f"Dars jadvali o'chirildi: {schedule_info}",
        request=request,
    )
    
    return {"message": "Schedule deleted successfully"}

