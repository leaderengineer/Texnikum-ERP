import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select } from '../ui/Select';

const bookSchema = z.object({
  title: z.string().min(2, 'Kitob nomi kamida 2 ta belgi bo\'lishi kerak'),
  author: z.string().min(2, 'Muallif nomi kiritilishi kerak'),
  isbn: z.string().min(1, 'ISBN kiritilishi kerak'),
  category: z.string().min(1, 'Kategoriya tanlanishi kerak'),
  year: z.string().min(4, 'Yil kiritilishi kerak'),
  pages: z.string().min(1, 'Sahifalar soni kiritilishi kerak'),
  language: z.string().min(1, 'Til tanlanishi kerak'),
  description: z.string().min(10, 'Tavsif kamida 10 ta belgi bo\'lishi kerak'),
  totalCopies: z.string().min(1, 'Nusxalar soni kiritilishi kerak'),
  hasDigital: z.string().optional(),
});

const categories = ['Dasturlash', 'Ma\'lumotlar bazasi', 'Web dizayn', 'Algoritmlar', 'Tarmoq', 'Boshqalar'];
const languages = ['O\'zbek', 'Ingliz', 'Rus', 'Qozoq'];
const coverColors = [
  'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600',
  'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-700',
  'bg-gradient-to-br from-green-400 via-green-500 to-green-700',
  'bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600',
  'bg-gradient-to-br from-purple-400 via-purple-500 to-purple-700',
  'bg-gradient-to-br from-pink-400 via-pink-500 to-red-600',
];

export function BookAddModal({ book, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(bookSchema),
    defaultValues: book || {
      title: '',
      author: '',
      isbn: '',
      category: '',
      year: new Date().getFullYear().toString(),
      pages: '',
      language: 'O\'zbek',
      description: '',
      totalCopies: '1',
      hasDigital: 'false',
    },
  });

  useEffect(() => {
    if (book) {
      reset({
        ...book,
        year: book.year?.toString() || new Date().getFullYear().toString(),
        pages: book.pages?.toString() || '',
        totalCopies: book.totalCopies?.toString() || '1',
        hasDigital: book.hasDigital ? 'true' : 'false',
      });
    }
  }, [book, reset]);

  const onSubmit = async (data) => {
    try {
      const bookData = {
        ...data,
        year: parseInt(data.year),
        pages: parseInt(data.pages),
        totalCopies: parseInt(data.totalCopies),
        availableCopies: parseInt(data.totalCopies),
        borrowedCopies: 0,
        hasDigital: data.hasDigital === 'true',
        status: parseInt(data.totalCopies) > 0 ? 'available' : 'unavailable',
        rating: 0,
        coverColor: coverColors[Math.floor(Math.random() * coverColors.length)],
      };
      await onSave(bookData);
      onClose();
    } catch (error) {
      console.error('Saqlashda xatolik:', error);
      alert('Saqlashda xatolik yuz berdi');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg shrink-0">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold truncate">
              {book ? 'Kitobni tahrirlash' : 'Yangi kitob qo\'shish'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation ml-2">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kitob nomi *</Label>
              <Input id="title" {...register('title')} />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Muallif *</Label>
              <Input id="author" {...register('author')} />
              {errors.author && (
                <p className="text-sm text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN *</Label>
              <Input id="isbn" {...register('isbn')} placeholder="978-0-596-80552-4" />
              {errors.isbn && (
                <p className="text-sm text-destructive">{errors.isbn.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategoriya *</Label>
              <Select id="category" {...register('category')}>
                <option value="">Tanlang...</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Yil *</Label>
              <Input id="year" type="number" {...register('year')} />
              {errors.year && (
                <p className="text-sm text-destructive">{errors.year.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Sahifalar soni *</Label>
              <Input id="pages" type="number" {...register('pages')} />
              {errors.pages && (
                <p className="text-sm text-destructive">{errors.pages.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Til *</Label>
              <Select id="language" {...register('language')}>
                {languages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
              {errors.language && (
                <p className="text-sm text-destructive">{errors.language.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Tavsif *</Label>
            <textarea
              id="description"
              {...register('description')}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Kitob haqida batafsil ma'lumot..."
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalCopies">Jami nusxalar soni *</Label>
              <Input id="totalCopies" type="number" {...register('totalCopies')} min="1" />
              {errors.totalCopies && (
                <p className="text-sm text-destructive">{errors.totalCopies.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasDigital">Elektron versiya</Label>
              <Select id="hasDigital" {...register('hasDigital')}>
                <option value="false">Yo'q</option>
                <option value="true">Ha</option>
              </Select>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto touch-manipulation">
              Bekor qilish
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto touch-manipulation">
              {isSubmitting ? 'Saqlanmoqda...' : book ? 'Saqlash' : 'Qo\'shish'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

