import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
   if(req.user == null) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
        return;
    }

    const body= req.body;

    const orderData = {
        orderId: "",
        email:req.user.email,
        name: body.name,
        address: body.address,
        phoneNumber: body.phoneNumber,
        billItems:[],
        total:0
    };

    const lastBills =Order.find().sort({ 
        date: -1 
    }).limit(1).then(async(lastBills) => {
        if(lastBills.length==0) {
        orderData.orderId = "ORD-0001";
    }else {
        const lastBill =lastBills[0];
        const lastOrderId = lastBill.orderId;
        const lastOrderNumber = lastOrderId.replace("ORD-", "");
        const lastOrderNumberInt = parseInt(lastOrderNumber);
        const newOrderNumberInt = lastOrderNumberInt + 1;
        const newOrderNumberStr = newOrderNumberInt.toString().padStart(4, "0");
        orderData.orderId = "ORD-" +newOrderNumberStr;
    }

    for(let i=0; i<body.billItems.length; i++) {
       const product = await Product.findOne({
           productId: body.billItems[i].productId,
         });
         if(product == null) {
            return res.status(400).json({
                message: "Product with product id " + body.billItems[i].productId + " not found"
            });
            return;
        }

        orderData.billItems[i] = {
            productId: product.productId,
            name: product.name,
            image: product.images[0],
            price: product.price,
            quantity: body.billItems[i].quantity
        };

        orderData.total = orderData.total + product.price* body.billItems[i].quantity;
    }

    const order = new Order(orderData);

    order.save().then(() => {
        res.json({
            message: "Order saved successfully",
        });
    }).catch((err) => {
        console.error(err);
        res.status(500).json({
            message: "Order not saved"
        });
    });

    });
}

export function getOrders(req, res) {
    if(req.user == null) {
        return res.status(401).json({
            message: "Unauthorized access"
        });
    }
    
    if(req.user.role == "admin") {
        Order.find().then((orders) => {
            res.json(orders);
        }).catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "Order not found"
            });
        });
    }else{
        Order.find({ email: req.user.email }).then((orders) => {
            res.json(orders);
        }).catch((err) => {
            console.error(err);
            res.status(500).json({
                message: "Order not found"
            });
        });
    }
}

export async function updateOrder(req,res){
	try{
		if(req.user == null){
			res.status(401).json({
				message : "Unauthorized"
			})
			return
		}

		if(req.user.role != "admin"){
			res.status(403).json({
				message : "You are not authorized to update an order"
			})
			return
		}

		const orderId = req.params.orderId
		const order = await Order.findOneAndUpdate({orderId : orderId},req.body)

		res.json({
			message : "Order updated successfully"
		})
	}catch(err){
		res.status(500).json({
			message : "Order not updated"
		})
	}
}