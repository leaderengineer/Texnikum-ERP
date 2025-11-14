from pydantic import BaseModel
from typing import List, TypeVar, Generic

T = TypeVar('T')


class PaginationMeta(BaseModel):
    """Pagination metadata"""
    total: int
    page: int
    limit: int
    total_pages: int
    has_next: bool
    has_prev: bool

    @classmethod
    def create(cls, total: int, page: int, limit: int):
        """Pagination metadata yaratish"""
        total_pages = (total + limit - 1) // limit if total > 0 else 0
        return cls(
            total=total,
            page=page,
            limit=limit,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        )


class PaginatedResponse(BaseModel, Generic[T]):
    """Pagination bilan response"""
    items: List[T]
    meta: PaginationMeta

