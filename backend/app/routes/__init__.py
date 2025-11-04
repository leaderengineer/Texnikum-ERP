from fastapi import APIRouter
from app.routes import auth, teachers, students, groups, departments, schedules, attendance, books, dashboard, audit

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["Teachers"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit Logs"])

