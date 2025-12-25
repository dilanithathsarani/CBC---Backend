import express from 'express';
import { createOrder, deleteOrder, getOrders, updateOrder } from '../controllers/orderController.js';

const orderRouter = express.Router();

orderRouter.post("/",createOrder);
orderRouter.get("/",getOrders);
orderRouter.put("/:orderId", updateOrder);
orderRouter.delete("/:orderId", deleteOrder);

export default orderRouter;