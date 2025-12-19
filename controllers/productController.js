import Product from "../models/product.js";

export async function createProduct(req, res) {
  if (req.user == null) {
    return res.status(403).json({
      message: "You need to login first",
    });
    return;
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "You do not have permission to create a product",
    });
    return;
  }

  const product = new Product(req.body);

  try {
    await product.save();
    return res.json({
      message: "Product saved successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Product not saved",
    });
  }
}

export function getProducts(req, res) {
  const filter = {};
  if (req.query.category) {
    filter.category = req.query.category;
  }
  Product.find(filter)
    .then((products) => {
      res.json(products);
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product not found",
      });
    });
}

export function getProductId(req, res) {
  const productId = req.params.productId;

  Product.findOne({ productId: productId })
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      res.json(product);
    })
    .catch((err) => {
      res.status(500).json({
        message: "Error fetching product",
        error: err.message,
      });
    });
}

export function deleteProduct(req, res) {
  if (req.user == null) {
    res.status(403).json({
      message: "You need to login first",
    });
    return;
  }

  Product.findOneAndDelete({
    productId: req.params.productId,
  })
    .then(() => {
      res.json({
        message: "Product deleted successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product not deleted",
      });
    });
}

export function updateProduct(req, res) {
  if (req.user == null) {
    return res.status(403).json({
      message: "You need to login first",
    });
    return;
  }

  if (req.user.role !== "admin") {
    res.status(403).json({
      message: "You do not have permission to update a product",
    });
    return;
  }

  Product.findOneAndUpdate(
    {
      productId: req.params.productId,
    },
    req.body
  )
    .then(() => {
      res.json({
        message: "Product updated successfully",
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Product not updated",
      });
    });
}

export async function searchProduct(req, res) {
  const search = req.params.id;
  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { altNames: { $elemMatch: { $regex: search, $options: "i" } } },
      ],
    });
    res.json({
      products: products,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error in searching product",
    });
    return;
  }
}
