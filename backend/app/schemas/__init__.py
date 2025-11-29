from app.schemas.user import UserCreate, UserResponse, Token, TokenData
from app.schemas.teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from app.schemas.student import StudentCreate, StudentUpdate, StudentResponse
from app.schemas.department import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.schemas.schedule import ScheduleCreate, ScheduleUpdate, ScheduleResponse
from app.schemas.attendance import AttendanceCreate, AttendanceUpdate, AttendanceResponse
from app.schemas.book import BookCreate, BookUpdate, BookResponse, BookBorrowCreate
from app.schemas.audit_log import AuditLogResponse, AuditLogCreate
from app.schemas.lesson_material import LessonMaterialCreate, LessonMaterialUpdate, LessonMaterialResponse

__all__ = [
    "UserCreate",
    "UserResponse",
    "Token",
    "TokenData",
    "TeacherCreate",
    "TeacherUpdate",
    "TeacherResponse",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentResponse",
    "ScheduleCreate",
    "ScheduleUpdate",
    "ScheduleResponse",
    "AttendanceCreate",
    "AttendanceUpdate",
    "AttendanceResponse",
    "BookCreate",
    "BookUpdate",
    "BookResponse",
    "BookBorrowCreate",
    "AuditLogResponse",
    "AuditLogCreate",
    "LessonMaterialCreate",
    "LessonMaterialUpdate",
    "LessonMaterialResponse",
]

