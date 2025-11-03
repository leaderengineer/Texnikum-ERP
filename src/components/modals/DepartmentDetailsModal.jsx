import { X, Building2, GraduationCap, Users, TrendingUp, Calendar, User, Award } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card, CardContent } from '../ui/Card';

export function DepartmentDetailsModal({ department, onClose }) {
  if (!department) return null;

  const getDepartmentColor = (code) => {
    const colors = {
      'AT': 'from-blue-500 to-blue-700',
      'M': 'from-purple-500 to-purple-700',
      'I': 'from-green-500 to-green-700',
      'T': 'from-orange-500 to-orange-700',
      'SD': 'from-pink-500 to-pink-700',
    };
    return colors[code] || 'from-gray-500 to-gray-700';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-3 sm:p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto m-0 sm:m-4">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${getDepartmentColor(department.code)} h-32 sm:h-40 md:h-48 relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
          <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 bg-white/90 hover:bg-white touch-manipulation"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
              <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 sm:px-4 sm:py-3 shadow-lg shrink-0">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {department.code}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 truncate">
                  {department.name}
                </h2>
                <p className="text-white/90 text-xs sm:text-sm line-clamp-2">
                  {department.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Description */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Tavsif
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {department.description}
              </p>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap className="h-6 w-6 text-primary opacity-70" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Talabalar</p>
                <p className="text-2xl font-bold">{department.studentsCount}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-6 w-6 text-blue-600 opacity-70" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">O'qituvchilar</p>
                <p className="text-2xl font-bold text-blue-600">{department.teachersCount}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="h-6 w-6 text-purple-600 opacity-70" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Guruhlar</p>
                <p className="text-2xl font-bold text-purple-600">{department.groupsCount}</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600 opacity-70" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Fanlar</p>
                <p className="text-2xl font-bold text-green-600">{department.coursesCount}</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Qo'shimcha ma'lumotlar
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rahbar</p>
                    <p className="font-semibold">{department.head || 'Belgilanmagan'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tashkil etilgan yil</p>
                    <p className="font-semibold">{department.establishedYear || 'Belgilanmagan'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Yo'nalish kodi</p>
                    <p className="font-semibold font-mono">{department.code}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Holat</p>
                    <Badge
                      variant={department.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {department.status === 'active' ? 'Faol' : 'Nofaol'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="w-full sm:w-auto touch-manipulation">
              Yopish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

