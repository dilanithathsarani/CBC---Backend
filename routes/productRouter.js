import express from "express";
import { createProduct, deleteProduct, getProducts, updateProduct, getProductId, searchProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.post("/",createProduct);
productRouter.get("/",getProducts);
productRouter.get("/search/:id", searchProduct);
productRouter.get("/:productId", getProductId);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct)

export default productRouter;