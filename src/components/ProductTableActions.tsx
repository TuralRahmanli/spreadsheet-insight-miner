import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { Product } from "@/types";

interface ProductTableActionsProps {
  product: Product;
  onEdit: (product: Product) => void;
}

export function ProductTableActions({ product, onEdit }: ProductTableActionsProps) {
  const { removeProduct } = useProductStore();
  const { toast } = useToast();

  const handleDeleteProduct = (productId: string) => {
    removeProduct(productId);
    toast({
      title: "Uğur",
      description: "Məhsul uğurla silindi"
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(product)}
        className="h-8 w-8 p-0"
        title="Məhsulu redaktə et"
        aria-label={`${product.name} məhsulunu redaktə et`}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            title="Məhsulu sil"
            aria-label={`${product.name} məhsulunu sil`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Məhsulu sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
              <br /><br />
              <strong>Məhsul:</strong> {product.name} ({product.article})
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteProduct(product.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}