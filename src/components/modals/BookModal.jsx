import { X, BookOpen, Download, Eye, BookMarked, Calendar, FileText, Globe, User, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function BookModal({ book, onClose, onBorrow }) {
  if (!book) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="relative">
          {/* Header with cover */}
          <div className={`${book.coverColor} h-48 sm:h-56 md:h-64 relative overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 hover:bg-white touch-manipulation h-7 w-7 sm:h-8 sm:w-8"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-3 sm:p-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 truncate">{book.title}</h2>
                <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                  <span className="truncate">{book.author}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Quick Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Yil</p>
                  <p className="font-medium">{book.year}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Sahifalar</p>
                  <p className="font-medium">{book.pages}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Til</p>
                  <p className="font-medium">{book.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Reyting</p>
                  <p className="font-medium">{book.rating}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Tavsif</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Availability */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 text-sm sm:text-base">Mavjudlik</h3>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-2 sm:p-3 bg-muted/50 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold">{book.totalCopies}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Jami nusxalar</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{book.availableCopies}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Mavjud</p>
                </div>
                <div className="text-center p-2 sm:p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <p className="text-xl sm:text-2xl font-bold text-orange-600">{book.borrowedCopies}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Olingan</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t">
              {book.hasDigital && (
                <>
                  <Button
                    className="flex-1 touch-manipulation"
                    onClick={() => {
                      alert(`"${book.title}" kitobini o'qish rejimi ochilmoqda...`);
                      onClose();
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Elektron o'qish
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 touch-manipulation"
                    onClick={() => {
                      alert(`"${book.title}" kitobi yuklab olinmoqda...`);
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Yuklab olish
                  </Button>
                </>
              )}
              <Button
                variant={book.hasDigital ? 'outline' : 'default'}
                className="flex-1 touch-manipulation"
                onClick={() => {
                  if (book.availableCopies > 0) {
                    onBorrow(book);
                    onClose();
                  } else {
                    alert('Bu kitob hozir mavjud emas.');
                  }
                }}
                disabled={book.availableCopies === 0}
              >
                <BookMarked className="h-4 w-4 mr-2" />
                Band qilish
              </Button>
            </div>

            {/* Additional Info */}
            <div className="pt-4 border-t">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{book.category}</Badge>
                <Badge variant={book.status === 'available' ? 'default' : 'destructive'}>
                  {book.status === 'available' ? 'Mavjud' : 'Mavjud emas'}
                </Badge>
                {book.hasDigital && (
                  <Badge variant="outline">
                    <FileText className="h-3 w-3 mr-1" />
                    Elektron versiya
                  </Badge>
                )}
                <Badge variant="outline">
                  ISBN: {book.isbn}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
