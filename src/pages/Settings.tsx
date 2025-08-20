import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Download, Upload, Cloud, HardDrive, CheckCircle, Share } from "lucide-react";
import { useStorageProvider } from "@/hooks/useStorageProvider";
import { useDataExport } from "@/hooks/useDataExport";
import { useAutoImport } from "@/hooks/useAutoImport";
import { useSystemRestore } from "@/hooks/useSystemRestore";
import { toast } from "@/hooks/use-toast";

interface AppSettings {
  companyName: string;
  language: string;
  timezone: string;
  lowStockAlert: boolean;
  emailNotifications: boolean;
  dailyReport: boolean;
  email: string;
  lowStockLimit: number;
}

export default function Settings() {
  const { config, switchToLocal, switchToGoogleDrive, connectGoogleDrive, disconnectGoogleDrive } = useStorageProvider();
  const { exportToFile, shareData } = useDataExport();
  const { triggerFileSelect } = useAutoImport();
  const { triggerSystemRestore } = useSystemRestore();

  // Settings state
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "",
    language: "az",
    timezone: "baku",
    lowStockAlert: true,
    emailNotifications: false,
    dailyReport: true,
    email: "",
    lowStockLimit: 10,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed && typeof parsed === 'object') {
          setSettings(parsed);
        }
      }
    } catch (error) {
      // Ignore parse errors
    }
  }, []);

  const saveSettings = () => {
    try {
      localStorage.setItem('app-settings', JSON.stringify(settings));
      toast({
        title: "Parametrlər saxlanıldı",
        description: "Bütün dəyişikliklər uğurla saxlanıldı",
      });
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Parametrlər saxlanılarkən xəta baş verdi",
        variant: "destructive",
      });
    }
  };

  const updateSetting = (key: keyof AppSettings, value: string | boolean | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Parametrlər</h1>
        <Button aria-label="Dəyişiklikləri saxla" onClick={saveSettings}>
          <Save className="mr-2 h-4 w-4" />
          Dəyişiklikləri saxla
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Ümumi Parametrlər
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company-name">Şirkət Adı</Label>
              <Input 
                id="company-name" 
                placeholder="Şirkət adınızı daxil edin"
                value={settings.companyName}
                onChange={(e) => updateSetting('companyName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select value={settings.language} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="az">Azərbaycan</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Vaxt Zonası</Label>
              <Select value={settings.timezone} onValueChange={(value) => updateSetting('timezone', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baku">Bakı (UTC+4)</SelectItem>
                  <SelectItem value="moscow">Moskva (UTC+3)</SelectItem>
                  <SelectItem value="istanbul">İstanbul (UTC+3)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bildirişlər</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Az qalan məhsul xəbərdarlığı</Label>
                <p className="text-sm text-muted-foreground">
                  Məhsul azaldıqda bildiriş göndər
                </p>
              </div>
              <Switch 
                checked={settings.lowStockAlert}
                onCheckedChange={(checked) => updateSetting('lowStockAlert', checked)}
                aria-label="Az qalan məhsul xəbərdarlığını aç/bağla"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email bildirişləri</Label>
                <p className="text-sm text-muted-foreground">
                  Email vasitəsilə xəbərdarlıq al
                </p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                aria-label="Email bildirişlərini aç/bağla"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Günlük hesabat</Label>
                <p className="text-sm text-muted-foreground">
                  Hər gün inventar hesabatı al
                </p>
              </div>
              <Switch 
                checked={settings.dailyReport}
                onCheckedChange={(checked) => updateSetting('dailyReport', checked)}
                aria-label="Günlük hesabatı aç/bağla"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email ünvanı</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="email@example.com"
                value={settings.email}
                onChange={(e) => updateSetting('email', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock-limit">Az qalma həddi</Label>
              <Input 
                id="low-stock-limit" 
                type="number" 
                placeholder="10"
                value={settings.lowStockLimit}
                onChange={(e) => updateSetting('lowStockLimit', parseInt(e.target.value) || 0)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Məlumat Saxlama
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Saxlama Növü</Label>
            <p className="text-sm text-muted-foreground">
              Məlumatlarınızı harada saxlamaq istədiyinizi seçin
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Button
              variant={config.provider === 'local' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-20"
              onClick={switchToLocal}
              aria-label="Lokal cihazda saxla"
            >
              <HardDrive className="h-6 w-6" />
              <span>Lokal Cihaz</span>
              {config.provider === 'local' && <CheckCircle className="h-4 w-4" />}
            </Button>

            <Button
              variant={config.provider === 'google-drive' ? 'default' : 'outline'}
              className="flex flex-col items-center gap-2 h-20"
              onClick={config.googleDriveConnected ? switchToGoogleDrive : connectGoogleDrive}
              disabled={config.provider === 'google-drive' && config.googleDriveConnected}
              aria-label={config.googleDriveConnected ? 'Google Drive istifadə et' : 'Google Drive-a qoşul'}
            >
              <Cloud className="h-6 w-6" />
              <span>
                {config.googleDriveConnected ? 'Google Drive' : 'Google Drive-a Qoşul'}
              </span>
              {config.provider === 'google-drive' && <CheckCircle className="h-4 w-4" />}
            </Button>
          </div>

          {config.googleDriveConnected && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Google Drive bağlandı</p>
                <p className="text-xs text-muted-foreground">
                  Məlumatlarınız Google Drive-da saxlanılır
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectGoogleDrive}
                aria-label="Google Drive bağlantısını ayır"
              >
                Ayır
              </Button>
            </div>
          )}

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Saxlama Seçimləri</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Lokal Cihaz:</strong> Məlumatlar yalnız sizin cihazınızda saxlanılır</p>
              <p><strong>Google Drive:</strong> Məlumatlar cloud-da saxlanılır və bütün cihazlarda sinxronlaşır</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sistem Yedeyi və Bərpası</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={exportToFile}
              aria-label="Tam sistem yedeyini hazırla"
            >
              <Download className="h-6 w-6" />
              <span>Sistem Yedeyi</span>
            </Button>

            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={shareData}
              aria-label="Sistem yedeyini digər cihazlara paylaş"
            >
              <Share className="h-6 w-6" />
              <span>Yedeyi Paylaş</span>
            </Button>

            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={triggerSystemRestore}
              aria-label="Sistem yedeyindən bərpa et"
            >
              <Upload className="h-6 w-6" />
              <span>Sistem Bərpası</span>
            </Button>

            <Button 
              variant="destructive" 
              className="flex flex-col items-center gap-2 h-20"
              aria-label="Bütün məlumatları sil və sistemi sıfırla"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  const confirmed = window.confirm?.("Sistemi sıfırlamaq istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz!");
                  if (confirmed) {
                    try {
                      localStorage.clear();
                      window.location.reload();
                    } catch (error) {
                      // System reset failed - ignore error
                    }
                  }
                }
              }}
            >
              <SettingsIcon className="h-6 w-6" />
              <span>Sistemə Sıfırla</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Sistem Yedeyi Xüsusiyyətləri</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Sistem Yedeyi:</strong> Bütün məlumatlar, parametrlər və ayarlar daxil olmaqla tam sistem yedeyi</p>
              <p><strong>Yedeyi Paylaş:</strong> Quick Share, Bluetooth və ya WiFi ilə başqa cihaza göndər</p>
              <p><strong>Sistem Bərpası:</strong> Sistem yedeyini seçərək bütün məlumatları bərpa et</p>
              <p><strong>Upgrade Funksiyası:</strong> Başqa cihazdan gələn yedeyi quraşdıraraq sistemi yenilə</p>
            </div>
          </div>

          <div className="mt-4 p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-2 text-primary">Diqqət</h4>
            <div className="text-sm text-muted-foreground">
              <p>Sistem bərpası mövcud bütün məlumatları əvəzləyəcək. Bərpa etməzdən əvvəl sistem yedeyini hazırlayın.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Məhsul Məlumatları İmport</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-1">
            <Button 
              variant="outline" 
              className="flex flex-col items-center gap-2 h-20"
              onClick={triggerFileSelect}
              aria-label="Excel faylından məhsul məlumatlarını idxal et"
            >
              <Upload className="h-6 w-6" />
              <span>Excel İmport</span>
            </Button>
          </div>

          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Excel İmport</h4>
            <div className="text-sm text-muted-foreground">
              <p>Yalnız məhsul məlumatlarını Excel faylından idxal etmək üçün istifadə edin. Tam sistem bərpası üçün yuxarıdakı "Sistem Bərpası" düyməsini istifadə edin.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}