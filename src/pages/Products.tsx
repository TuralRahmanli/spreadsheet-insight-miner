import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Products = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to products-list as this is the main products page
    navigate("/products-list", { replace: true });
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <p className="text-muted-foreground">Məhsullar səhifəsinə yönləndirilir...</p>
      </div>
    </div>
  );
};

export default Products;