import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Log 404 error for debugging
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-16 w-16 mx-auto text-destructive" />
            <div>
              <h1 className="text-4xl font-bold mb-2">404</h1>
              <p className="text-xl text-muted-foreground mb-4">Səhifə tapılmadı</p>
              <p className="text-sm text-muted-foreground mb-6">
                Axtardığınız səhifə mövcud deyil və ya silinib.
              </p>
            </div>
            <Button asChild className="w-full">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" />
                Ana Səhifəyə Qayıt
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
