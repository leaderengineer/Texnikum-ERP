from fastapi import APIRouter
from app.routes import auth, institutions, teachers, students, groups, departments, schedules, attendance, grades, books, dashboard, audit, lesson_materials, upload, exams

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(institutions.router, prefix="/institutions", tags=["Institutions"])
api_router.include_router(teachers.router, prefix="/teachers", tags=["Teachers"])
api_router.include_router(students.router, prefix="/students", tags=["Students"])
api_router.include_router(groups.router, prefix="/groups", tags=["Groups"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["Schedules"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(grades.router, prefix="/grades", tags=["Grades"])
api_router.include_router(books.router, prefix="/books", tags=["Books"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(audit.router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(lesson_materials.router, prefix="/lesson-materials", tags=["Lesson Materials"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(exams.router, prefix="/exams", tags=["Exams"])

