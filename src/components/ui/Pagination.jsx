import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ 
  currentPage, 
  totalPages, 
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '' 
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Barcha sahifalarni ko'rsatish
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Faqat bir qismini ko'rsatish
      if (currentPage <= 3) {
        // Boshida
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Oxirida
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // O'rtada
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Ma'lumotlar */}
      <div className="text-sm text-muted-foreground">
        {totalItems > 0 ? (
          <>
            <span className="font-medium text-foreground">{startItem}</span> -{' '}
            <span className="font-medium text-foreground">{endItem}</span> /{' '}
            <span className="font-medium text-foreground">{totalItems}</span> ta
          </>
        ) : (
          'Ma\'lumotlar topilmadi'
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Birinchi sahifa */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || totalPages === 0}
          className="h-8 w-8"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Oldingi sahifa */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Sahifa raqamlari */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 min-w-8"
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Keyingi sahifa */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Oxirgi sahifa */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="h-8 w-8"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Har sahifada:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="h-8 px-2 py-1 text-sm border rounded-md bg-background"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

