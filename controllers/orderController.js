import Order from "../models/order.js";
import Product from "../models/product.js";

// ---------------- Create Order ----------------
export async function createOrder(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const body = req.body;
    const orderData = {
      orderId: "",
      email: req.user.email,
      name: body.name,
      address: body.address,
      phoneNumber: body.phoneNumber,
      billItems: [],
      total: 0
    };

    // Generate orderId
    const lastBill = await Order.find().sort({ date: -1 }).limit(1);
    if (lastBill.length === 0) {
      orderData.orderId = "ORD0001";
    } else {
      const lastOrderId = lastBill[0].orderId;
      const lastNumber = parseInt(lastOrderId.replace("ORD", ""), 10);
      const newNumber = (lastNumber + 1).toString().padStart(4, "0");
      orderData.orderId = "ORD" + newNumber;
    }

    // Build billItems array
    for (let i = 0; i < body.billItems.length; i++) {
      const item = body.billItems[i];
      const product = await Product.findOne({ productId: item.productId });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });

      orderData.billItems.push({
        productId: product.productId,
        productName: product.name,
        image: product.images && product.images.length > 0 ? product.images[0] : "",
        quantity: item.quantity,
        price: product.price
      });

      orderData.total += product.price * item.quantity;
    }

    const order = new Order(orderData);
    await order.save();
    res.json({ message: "Order saved successfully", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order not saved", error: err.message });
  }
}

// ---------------- Get Orders ----------------
export async function getOrders(req, res) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find().lean();
    } else {
      orders = await Order.find({ email: req.user.email }).lean();
    }

    // Ensure billItems array exists
    orders = orders.map(order => ({
      ...order,
      billItems: order.billItems || []
    }));

    res.json(orders);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Orders not found", error: err.message });
  }
}

// ---------------- Update Order ----------------
async function editOrderProducts(order, updatedBillItems) {
  let newBillItems = [];
  let newTotal = 0;

  for (let i = 0; i < updatedBillItems.length; i++) {
    const item = updatedBillItems[i];
    const product = await Product.findOne({ productId: item.productId });
    if (!product) throw new Error(`Product ${item.productId} not found`);

    newBillItems.push({
      productId: product.productId,
      productName: product.name,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      quantity: item.quantity,
      price: product.price
    });

    newTotal += product.price * item.quantity;
  }

  order.billItems = newBillItems;
  order.total = newTotal;
}

export async function updateOrder(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "You are not authorized" });

    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Update basic info
    order.name = req.body.name || order.name;
    order.address = req.body.address || order.address;
    order.phoneNumber = req.body.phoneNumber || order.phoneNumber;
    order.status = req.body.status || order.status;

    // Update billItems if provided
    if (req.body.billItems && req.body.billItems.length > 0) {
      await editOrderProducts(order, req.body.billItems);
    }

    await order.save();
    res.json({ message: "Order updated successfully", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order not updated", error: err.message });
  }
}

// ---------------- Delete Order ----------------
export async function deleteOrder(req, res) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ message: "You are not authorized" });

    const order = await Order.findOneAndDelete({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete order", error: err.message });
  }
}
