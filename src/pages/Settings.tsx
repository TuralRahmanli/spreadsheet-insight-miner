import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, Save, Download, Upload } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Parametrlər</h1>
        <Button>
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
              <Input id="company-name" placeholder="Şirkət adınızı daxil edin" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Valyuta</Label>
              <Select defaultValue="azn">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="azn">Azərbaycan Manatı (₼)</SelectItem>
                  <SelectItem value="usd">ABŞ Dolları ($)</SelectItem>
                  <SelectItem value="eur">Avro (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select defaultValue="az">
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
              <Select defaultValue="baku">
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
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email bildirişləri</Label>
                <p className="text-sm text-muted-foreground">
                  Email vasitəsilə xəbərdarlıq al
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Günlük hesabat</Label>
                <p className="text-sm text-muted-foreground">
                  Hər gün inventar hesabatı al
                </p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email ünvanı</Label>
              <Input id="email" type="email" placeholder="email@example.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="low-stock-limit">Az qalma həddi</Label>
              <Input id="low-stock-limit" type="number" placeholder="10" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Məlumatların İdarə Edilməsi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Download className="h-6 w-6" />
              <span>Məlumatları İxrac Et</span>
            </Button>

            <Button variant="outline" className="flex flex-col items-center gap-2 h-20">
              <Upload className="h-6 w-6" />
              <span>Məlumatları İdxal Et</span>
            </Button>

            <Button variant="destructive" className="flex flex-col items-center gap-2 h-20">
              <SettingsIcon className="h-6 w-6" />
              <span>Sistemə Sıfırla</span>
            </Button>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Məlumat Təhlükəsizliyi</h4>
            <p className="text-sm text-muted-foreground">
              Bütün məlumatlarınız yerli cihazınızda saxlanılır və heç bir xarici serverlə paylaşılmır. 
              Məlumatlarınızın təhlükəsizliyi bizim əsas prioritetimizdir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}