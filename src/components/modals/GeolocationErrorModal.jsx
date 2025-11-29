import { AlertTriangle, MapPin, X, Navigation } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

export function GeolocationErrorModal({ isOpen, onClose, distance, allowedRadius, institutionName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose} />
      
      <Card className="relative z-10 w-full max-w-2xl mx-4 shadow-2xl border-2 border-red-500/50 animate-in zoom-in-95 duration-300 transform max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header Section - Horizontal Layout */}
          <div className="flex items-start gap-4 mb-6">
            {/* Icon */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative bg-red-500/10 rounded-full p-3 border-4 border-red-500/30">
                <AlertTriangle className="h-10 w-10 text-red-500" />
              </div>
            </div>

            {/* Title and Description */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-2 text-red-600 dark:text-red-400">
                Joylashuv Cheklovi
              </h2>
              <p className="text-sm text-muted-foreground">
                Davomat olish uchun muassasa radius ichida bo'lishingiz kerak
              </p>
            </div>
          </div>

          {/* Distance Info - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {/* Current Distance */}
            <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />
                <p className="text-xs font-medium text-red-800 dark:text-red-200">
                  Sizning joylashuvingiz
                </p>
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400">
                {distance ? `${Math.round(distance).toLocaleString('uz-UZ')} m` : 'Noma\'lum'}
              </p>
            </div>

            {/* Allowed Radius */}
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Ruxsat etilgan radius
                </p>
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {allowedRadius ? `${Math.round(allowedRadius).toLocaleString('uz-UZ')} m` : 'Noma\'lum'}
              </p>
            </div>

            {/* Difference */}
            {distance && allowedRadius && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Farq
                </p>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {Math.round(distance - allowedRadius).toLocaleString('uz-UZ')} m
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  uzoqdasiz
                </p>
              </div>
            )}
          </div>

          {/* Institution Name - Compact */}
          {institutionName && (
            <div className="text-center mb-4 pb-4 border-b">
              <p className="text-sm text-muted-foreground">
                <strong>Muassasa:</strong> {institutionName}
              </p>
            </div>
          )}

          {/* Instructions - Compact Grid */}
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium mb-3">Nima qilish kerak?</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <p className="text-xs text-muted-foreground">Muassasa binosi yoki belgilangan joyga yaqinroq bo'ling</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <p className="text-xs text-muted-foreground">Brauzer sozlamalarida joylashuvga ruxsat bering</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <p className="text-xs text-muted-foreground">GPS yoki Wi-Fi yoqilganligini tekshiring</p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                <p className="text-xs text-muted-foreground">Agar muammo davom etsa, admin bilan bog'laning</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={onClose}
            className="w-full"
            variant="destructive"
            size="lg"
          >
            Tushundim
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

