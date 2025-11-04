import { X, Users, GraduationCap, Calendar, UserCheck, Building2, BookOpen } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/Card';
import { Badge } from '../ui/Badge';

const groupColors = [
  { bg: 'bg-gradient-to-br from-blue-500 to-cyan-500' },
  { bg: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  { bg: 'bg-gradient-to-br from-green-500 to-emerald-500' },
  { bg: 'bg-gradient-to-br from-orange-500 to-red-500' },
  { bg: 'bg-gradient-to-br from-indigo-500 to-blue-500' },
  { bg: 'bg-gradient-to-br from-teal-500 to-green-500' },
];

function getGroupColor(index) {
  return groupColors[index % groupColors.length];
}

export function GroupDetailsModal({ group, onClose }) {
  if (!group) return null;

  const color = getGroupColor(group.id || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg sm:text-xl font-semibold">Guruh ma'lumotlari</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0 touch-manipulation">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Header with gradient */}
          <div className={`${color.bg} h-32 sm:h-40 md:h-48 rounded-lg relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-white p-4 sm:p-6">
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2">{group.code}</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-semibold">{group.name}</div>
              {group.department && (
                <div className="text-sm sm:text-base md:text-lg mt-2 opacity-90">{group.department}</div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Talabalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">{group.studentsCount || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Yil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <p className="text-2xl font-bold">{group.year || new Date().getFullYear()}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">Holat</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant={group.status === 'active' ? 'default' : 'secondary'} className="text-xs sm:text-sm">
                  {group.status === 'active' ? 'Faol' : 'Nofaol'}
                </Badge>
              </CardContent>
            </Card>
            {group.curator && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">Kurator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <p className="text-sm sm:text-base font-semibold truncate">{group.curator}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Description */}
          {group.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Tavsif</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">{group.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Qo'shimcha ma'lumotlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <span className="text-sm sm:text-base text-muted-foreground">Yo'nalish:</span>
                </div>
                <p className="text-sm sm:text-base font-semibold">{group.department || 'Belgilanmagan'}</p>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <span className="text-sm sm:text-base text-muted-foreground">Guruh kodi:</span>
                </div>
                <p className="text-sm sm:text-base font-semibold font-mono">{group.code}</p>
              </div>
              {group.curator && (
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    <span className="text-sm sm:text-base text-muted-foreground">Kurator:</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold">{group.curator}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto touch-manipulation">
              Yopish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

