import mongoose from "mongoose";

const productShema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    altNames: {
        type: [String],
        default: []
    },
    price : {
        type: Number,
        required: true
    },
    labeledPrice: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images : {
        type: [String],
        required: true,
        default: ["https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"]
    },
    stock: {
        type: Number,
        required: true
    }
});

const Product = mongoose.model("products", productShema);
export default Product;