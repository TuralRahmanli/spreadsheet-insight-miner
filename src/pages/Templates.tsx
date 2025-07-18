import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Download, Edit } from "lucide-react";

const templates = [
  {
    id: 1,
    name: "Qəbul Şablonu",
    description: "Məhsulların anbara daxil olması üçün standart şablon",
    lastUsed: "2 gün əvvəl",
    usageCount: 15,
  },
  {
    id: 2,
    name: "Qəbul Şablonu 2",
    description: "İkinci növ məhsulların qəbulu üçün şablon",
    lastUsed: "1 həftə əvvəl", 
    usageCount: 8,
  },
  {
    id: 3,
    name: "Rulonlar Şablonu",
    description: "Rulon məhsullarının qeydiyyatı üçün xüsusi şablon",
    lastUsed: "3 gün əvvəl",
    usageCount: 12,
  },
];

export default function Templates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Şablonlar</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Şablon
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <FileText className="h-8 w-8 text-primary" />
                <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Son istifadə: {template.lastUsed}</span>
                <span>{template.usageCount} dəfə</span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="mr-2 h-3 w-3" />
                  İxrac
                </Button>
                <Button size="sm" className="flex-1">
                  İstifadə et
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Şablon Yaradın</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Yeni şablon yaratmaq üçün aşağıdakı addımları izləyin:
          </p>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">1</div>
              <span>Şablon adını və təsvirini daxil edin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">2</div>
              <span>Lazımi sahələri təyin edin</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">3</div>
              <span>Şablonu yadda saxlayın və istifadə edin</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}