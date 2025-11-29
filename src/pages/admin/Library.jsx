import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  BookOpen, 
  Download, 
  Eye,
  BookMarked,
  Filter,
  Grid3x3,
  List,
  Star,
  Calendar,
  FileText,
  Globe,
  User,
  Library as LibraryIcon,
  TrendingUp
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { BookModal } from '../../components/modals/BookModal';
import { BookAddModal } from '../../components/modals/BookAddModal';
import { libraryAPI } from '../../services/api';
import useAuthStore from '../../store/authStore';

const categories = [
  'Barcha',
  'Dasturlash',
  'Ma\'lumotlar bazasi',
  'Web dizayn',
  'Algoritmlar',
  'Tarmoq',
  'Boshqalar',
];

const viewModes = {
  grid: 'grid',
  list: 'list',
};

export function Library() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Barcha');
  const [viewMode, setViewMode] = useState(viewModes.grid);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await libraryAPI.getAll();
      const booksData = response.data || [];
      
      // Backend formatidan frontend formatiga o'tkazish
      const formattedBooks = booksData.map((book) => ({
        id: book.id,
        title: book.title || '',
        author: book.author || '',
        isbn: book.isbn || '',
        category: book.category || 'Boshqalar',
        year: book.year || new Date().getFullYear(),
        pages: book.pages || 0,
        language: book.language || 'O\'zbek',
        description: book.description || '',
        totalCopies: book.total_copies || 0,
        availableCopies: book.available_copies || 0,
        borrowedCopies: book.borrowed_copies || 0,
        status: book.available_copies > 0 ? 'available' : 'unavailable',
        rating: book.rating || 0,
        hasDigital: book.has_digital || false,
        coverColor: `bg-gradient-to-br from-${['blue', 'green', 'purple', 'orange', 'pink'][book.id % 5]}-400 via-${['blue', 'green', 'purple', 'orange', 'pink'][book.id % 5]}-500 to-${['blue', 'green', 'purple', 'orange', 'pink'][book.id % 5]}-700`,
      }));
      
      setBooks(formattedBooks);
    } catch (error) {
      console.error('Kitoblarni yuklashda xatolik:', error);
      // Fallback to mock data
      setBooks([
      {
        id: 1,
        title: 'JavaScript: The Definitive Guide',
        author: 'David Flanagan',
        isbn: '978-0-596-80552-4',
        category: 'Dasturlash',
        year: 2020,
        pages: 1096,
        language: 'Ingliz',
        description: 'JavaScript dasturlash tilining to\'liq qo\'llanmasi. Asosiy kontseptsiyalar, DOM, async dasturlash va zamonaviy JavaScript.',
        totalCopies: 10,
        availableCopies: 7,
        borrowedCopies: 3,
        status: 'available',
        rating: 4.8,
        hasDigital: true,
        coverColor: 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600',
      },
      {
        id: 2,
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0-13-235088-4',
        category: 'Dasturlash',
        year: 2008,
        pages: 464,
        language: 'Ingliz',
        description: 'Toza kod yozish san\'ati. Professional dasturchilar uchun kod yozish standartlari va best practices.',
        totalCopies: 5,
        availableCopies: 2,
        borrowedCopies: 3,
        status: 'available',
        rating: 4.9,
        hasDigital: true,
        coverColor: 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700',
      },
      {
        id: 3,
        title: 'Node.js Design Patterns',
        author: 'Mario Casciaro',
        isbn: '978-1-783-28456-6',
        category: 'Dasturlash',
        year: 2020,
        pages: 664,
        language: 'Ingliz',
        description: 'Node.js uchun dizayn pattern\'lari va arxitektura yondashuvlari. Backend dasturlash uchun qo\'llanma.',
        totalCopies: 8,
        availableCopies: 0,
        borrowedCopies: 8,
        status: 'unavailable',
        rating: 4.6,
        hasDigital: true,
        coverColor: 'bg-gradient-to-br from-green-400 via-green-500 to-green-700',
      },
      {
        id: 4,
        title: 'React: Up & Running',
        author: 'Stoyan Stefanov',
        isbn: '978-1-491-91402-8',
        category: 'Dasturlash',
        year: 2020,
        pages: 328,
        language: 'Ingliz',
        description: 'React.js framework\'ining amaliy qo\'llanmasi. Komponentlar, hooks va state management.',
        totalCopies: 6,
        availableCopies: 4,
        borrowedCopies: 2,
        status: 'available',
        rating: 4.7,
        hasDigital: true,
        coverColor: 'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600',
      },
      {
        id: 5,
        title: 'Database Design Fundamentals',
        author: 'Stephanie Hernandez',
        isbn: '978-0-123-45678-9',
        category: 'Ma\'lumotlar bazasi',
        year: 2019,
        pages: 512,
        language: 'Ingliz',
        description: 'Ma\'lumotlar bazasi dizayni va normalizatsiya. SQL va NoSQL database\'lar bilan ishlash.',
        totalCopies: 7,
        availableCopies: 5,
        borrowedCopies: 2,
        status: 'available',
        rating: 4.5,
        hasDigital: false,
        coverColor: 'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700',
      },
      {
        id: 6,
        title: 'Web Design Mastery',
        author: 'Jennifer Smith',
        isbn: '978-0-987-65432-1',
        category: 'Web dizayn',
        year: 2021,
        pages: 432,
        language: 'Ingliz',
        description: 'Zamonaviy web dizayn prinsiplari, UX/UI dizayn va responsive design.',
        totalCopies: 9,
        availableCopies: 6,
        borrowedCopies: 3,
        status: 'available',
        rating: 4.6,
        hasDigital: true,
        coverColor: 'bg-gradient-to-br from-pink-400 via-pink-500 to-red-600',
      },
    ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      `${book.title} ${book.author} ${book.isbn} ${book.category}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Barcha' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRead = (book) => {
    if (book.hasDigital) {
      // Elektron o'qish funksiyasi
      window.open(`/books/${book.id}/read`, '_blank');
      alert(`"${book.title}" kitobini o'qish rejimi ochilmoqda...`);
    } else {
      alert('Bu kitobning elektron versiyasi mavjud emas.');
    }
  };

  const handleDownload = (book) => {
    if (book.hasDigital) {
      // Yuklab olish funksiyasi
      const link = document.createElement('a');
      link.href = `/api/books/${book.id}/download`;
      link.download = `${book.title}.pdf`;
      link.click();
      alert(`"${book.title}" kitobi yuklab olinmoqda...`);
    } else {
      alert('Bu kitobning elektron versiyasi mavjud emas.');
    }
  };

  const handleBorrow = async (book) => {
    if (book.availableCopies > 0) {
      try {
        await libraryAPI.borrow({
          book_id: book.id,
          student_id: 1, // TODO: Get from auth store
          borrow_date: new Date().toISOString().split('T')[0],
        });
        await loadBooks();
        alert(`"${book.title}" kitobi muvaffaqiyatli band qilindi!`);
      } catch (error) {
        console.error('Band qilishda xatolik:', error);
        const errorMessage = error.response?.data?.detail || error.message || 'Band qilishda xatolik yuz berdi';
        alert(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      }
    } else {
      alert('Bu kitob hozir mavjud emas. Barcha nusxalar olingan.');
    }
  };

  const handleAdd = () => {
    setEditingBook(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setIsAddModalOpen(true);
  };

  const handleSaveBook = async (bookData) => {
    try {
      // Backend API formatiga o'tkazish
      const payload = {
        title: bookData.title,
        author: bookData.author,
        isbn: bookData.isbn || '',
        category: bookData.category || 'Boshqalar',
        year: bookData.year || new Date().getFullYear(),
        pages: bookData.pages || 0,
        language: bookData.language || 'O\'zbek',
        description: bookData.description || '',
        total_copies: bookData.totalCopies || 0,
        available_copies: bookData.availableCopies || 0,
        borrowed_copies: bookData.borrowedCopies || 0,
        has_digital: bookData.hasDigital || false,
      };

      if (editingBook) {
        await libraryAPI.update(editingBook.id, payload);
      } else {
        await libraryAPI.create(payload);
      }
      await loadBooks();
      setIsAddModalOpen(false);
      setEditingBook(null);
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Saqlashda xatolik yuz berdi';
      alert(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    }
  };

  const handleDeleteBook = async (id) => {
    const book = books.find((b) => b.id === id);
    if (window.confirm(`"${book.title}" kitobini o'chirishni tasdiqlaysizmi?`)) {
      try {
        await libraryAPI.delete(id);
        await loadBooks();
      } catch (error) {
        console.error('O\'chirishda xatolik:', error);
        alert('O\'chirishda xatolik yuz berdi');
      }
    }
  };

  const totalBooks = books.length;
  const totalAvailable = books.reduce((sum, book) => sum + book.availableCopies, 0);
  const totalBorrowed = books.reduce((sum, book) => sum + book.borrowedCopies, 0);
  const digitalBooks = books.filter((book) => book.hasDigital).length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <LibraryIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
            <span className="truncate">Elektron kutubxona</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Kitoblar bazasi, elektron o'qish va boshqaruv
          </p>
        </div>
        {isAdmin && (
          <Button onClick={handleAdd} className="w-full sm:w-auto touch-manipulation">
            <Plus className="mr-2 h-4 w-4" />
            Kitob qo'shish
          </Button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jami kitoblar</p>
                <p className="text-2xl font-bold">{totalBooks}</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mavjud nusxalar</p>
                <p className="text-2xl font-bold text-green-600">{totalAvailable}</p>
              </div>
              <BookMarked className="h-8 w-8 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-orange-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Olingan kitoblar</p>
                <p className="text-2xl font-bold text-orange-600">{totalBorrowed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Elektron kitoblar</p>
                <p className="text-2xl font-bold text-purple-600">{digitalBooks}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Kitob nomi, muallif, ISBN yoki kategoriya bo'yicha qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-48"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button
                variant={viewMode === viewModes.grid ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode(viewModes.grid)}
                className="h-8 w-8"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === viewModes.list ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode(viewModes.list)}
                className="h-8 w-8"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Books Display */}
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Yuklanmoqda...</div>
      ) : filteredBooks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">Kitoblar topilmadi</p>
            <p className="text-sm text-muted-foreground mt-2">
              Qidiruv so'zini yoki filterni o'zgartiring
            </p>
          </CardContent>
        </Card>
      ) : viewMode === viewModes.grid ? (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBooks.map((book) => (
            <Card
              key={book.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Book Cover */}
              <div className={`${book.coverColor} h-48 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-3">
                    <h3 className="font-bold text-lg line-clamp-2 text-gray-900 dark:text-gray-100">
                      {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {book.author}
                    </p>
                  </div>
                </div>
                {book.hasDigital && (
                  <Badge className="absolute top-3 right-3 bg-white/90 text-primary">
                    <FileText className="h-3 w-3 mr-1" />
                    Elektron
                  </Badge>
                )}
              </div>

              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Book Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {book.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{book.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {book.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{book.year}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{book.pages} sahifa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{book.language}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>ISBN: {book.isbn}</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className={`h-2 w-2 rounded-full ${book.availableCopies > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-xs font-medium">
                          {book.availableCopies} mavjud
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant={book.status === 'available' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {book.status === 'available' ? 'Mavjud' : 'Mavjud emas'}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    {book.hasDigital && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleRead(book)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          O'qish
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDownload(book)}
                        >
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Yuklab olish
                        </Button>
                      </>
                    )}
                    <Button
                      variant={book.hasDigital ? 'outline' : 'default'}
                      size="sm"
                      className={book.hasDigital ? 'flex-1' : 'w-full'}
                      onClick={() => handleBorrow(book)}
                      disabled={book.availableCopies === 0}
                    >
                      <BookMarked className="h-3.5 w-3.5 mr-1" />
                      {book.hasDigital ? 'Band qilish' : 'Olish'}
                    </Button>
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(book)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Tahrirlash
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteBook(book.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        O'chirish
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="p-6 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className={`${book.coverColor} w-24 h-32 rounded-lg flex-shrink-0 shadow-lg`}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-1">{book.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {book.author}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {book.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {book.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {book.pages} sahifa
                            </span>
                            <span className="flex items-center gap-1">
                              <Globe className="h-3 w-3" />
                              {book.language}
                            </span>
                            <Badge variant="secondary">{book.category}</Badge>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {book.rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 ml-4">
                          <Badge
                            variant={book.status === 'available' ? 'default' : 'destructive'}
                          >
                            {book.status === 'available' ? 'Mavjud' : 'Mavjud emas'}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{book.availableCopies}</span> / {book.totalCopies}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {book.hasDigital && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleRead(book)}>
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              O'qish
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDownload(book)}>
                              <Download className="h-3.5 w-3.5 mr-1" />
                              Yuklab olish
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleBorrow(book)}
                          disabled={book.availableCopies === 0}
                        >
                          <BookMarked className="h-3.5 w-3.5 mr-1" />
                          Band qilish
                        </Button>
                        {isAdmin && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(book)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteBook(book.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Book View Modal */}
      {isModalOpen && selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBook(null);
          }}
          onBorrow={handleBorrow}
        />
      )}

      {/* Book Add/Edit Modal */}
      {isAddModalOpen && (
        <BookAddModal
          book={editingBook}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingBook(null);
          }}
          onSave={handleSaveBook}
        />
      )}
    </div>
  );
}