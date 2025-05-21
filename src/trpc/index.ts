import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "./trpc";
import { TRPCError } from "@trpc/server";
import { db } from "@/db/prisma"; // Prisma for admin only
import { connectMongo } from "@/db/mongoose";
import Categories from "@/models/category";
import Products from "@/models/product";
import Orders from "@/models/order";
import Sliders from "@/models/slider";
import Comments from "@/models/comments";
import mongoose from "mongoose";


import { hashPassword } from "@/constants/functions";
connectMongo();


export const appRouter = router({
  getProducts: publicProcedure.query(async () => {
    const products = await Products.find({ state: true })
      .populate("catId")
      .sort({ createdAt: -1 });
    return products;
  }),
  
  
  // --- Admin password update with Prisma ---
  updatePassword: adminProcedure
    .input(z.object({ password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.user.name)
        throw new TRPCError({ code: "UNAUTHORIZED" });
      if (!input.password) throw new TRPCError({ code: "BAD_REQUEST" });

      const hashNewPassword = await hashPassword(input.password);
      const updatePass = await db.admin.update({
        where: { username: ctx.user.name },
        data: { password: hashNewPassword },
      });
      if (!updatePass) throw new TRPCError({ code: "BAD_REQUEST" });
      return { success: true };
    }),

  // --- Products CRUD with Mongoose ---
createProduct: adminProcedure
  .input(
    z.object({
      title: z.string(),
      desc: z.string().optional(),
      image: z.string(),
      price: z.number(),
      state: z.boolean(),
      showcase: z.boolean(),
      category: z.string(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

  console.log("Received input:", input);
    const product = new Products({
      title: input.title,
      desc: input.desc,
      imageLink: input.image,
      price: input.price,
      state: input.state,
      showcase: input.showcase,
      catId: new mongoose.Types.ObjectId(input.category), 
      createdAt: new Date(),
    });

    await product.save();
    return { success: true };
  }),



getAdminProducts: adminProcedure.query(async ({ ctx }) => {
  if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

  // Use aggregation to join products with orders and count orders per product
  const productsWithOrderCount = await Products.aggregate([
    // Lookup category data (same as populate)
    {
      $lookup: {
        from: "categories",  // adjust if your collection is named differently
        localField: "catId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Lookup orders and count them
    {
      $lookup: {
        from: "orders",  // adjust to your orders collection name
        localField: "_id",
        foreignField: "productId",
        as: "orders",
      },
    },

    // Add order count field
    {
      $addFields: {
        _count: {
          orders: { $size: "$orders" },
        },
      },
    },

    // Optionally remove orders array to reduce data size
    {
      $project: {
        orders: 0,
      },
    },

    // Sort newest first
    {
      $sort: {
        createdAt: -1,
      },
    },
  ]);

  return productsWithOrderCount;
}),


  updateProducts: adminProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        desc: z.string().optional(),
        image: z.string(),
        price: z.number(),
        state: z.boolean(),
        showcase: z.boolean(),
        category: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const updated = await Products.findByIdAndUpdate(
        input.id,
        {
          title: input.title,
          desc: input.desc,
          imageLink: input.image,
          price: input.price,
          state: input.state,
          showcase: input.showcase,
          catId: input.category ? new mongoose.Types.ObjectId(input.category) : null
        },
        { new: true }
      );

      if (!updated) throw new TRPCError({ code: "BAD_REQUEST" });
      return { success: true };
    }),

  deleteProduct: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const deleted = await Products.findByIdAndDelete(input.id);
      if (!deleted) throw new TRPCError({ code: "BAD_REQUEST" });

      return { success: true };
    }),

  // --- Categories CRUD with Mongoose ---
getCategories: publicProcedure.query(async () => {
  // Aggregate categories with product counts
  const categoriesWithCounts = await Categories.aggregate([
    {
      $lookup: {
        from: "products", // use correct collection name!
        localField: "_id",
        foreignField: "catId",
        as: "products",
      },
    },
    {
      $addFields: {
        _count: { $size: "$products" },
      },
    },
    {
      $project: {
        products: 0,
      },
    },
  ]);



  return categoriesWithCounts;
}),


  createCategory: adminProcedure
    .input(
      z.object({
        title: z.string(),
        desc: z.string().optional(),
        state: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const category = new Categories({
        title: input.title,
        desc: input.desc,
        state: input.state,
      });

      await category.save();
      return { success: true };
    }),

  deleteCategory: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      // Remove category reference from products first to avoid orphan references
      await Products.updateMany({ catId: input.id }, { catId: null });

      const deleted = await Categories.findByIdAndDelete(input.id);
      if (!deleted) throw new TRPCError({ code: "BAD_REQUEST" });

      return { success: true };
    }),

  // --- Sliders CRUD ---
  getSliders: publicProcedure.query(async () => {
    const sliders = await Sliders.find();
    return sliders;
  }),

  createSlider: adminProcedure
    .input(z.object({ title: z.string(), image: z.string(), link: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const slider = new Sliders({
        title: input.title,
        imageLink: input.image,
        link: input.link,
      });

      await slider.save();
      return { success: true };
    }),

  deleteSlider: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const deleted = await Sliders.findByIdAndDelete(id);
      if (!deleted) throw new TRPCError({ code: "BAD_REQUEST" });

      return { success: true };
    }),

  // --- Orders CRUD ---
  createOrder: publicProcedure
    .input(
      z.object({
        productId: z.string(),
        name: z.string(),
        phone: z.string(),
        clientAdress: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (!input.name || !input.productId || !input.phone)
        throw new TRPCError({ code: "BAD_REQUEST" });

      const order = new Orders({
        clientName: input.name,
        clientPhone: input.phone,
        productId: input.productId, // must be mongoose ObjectId ref
        clientAdress: input.clientAdress || "null",
        state: "new",
        createdAt: new Date(),
      });

      await order.save();
      return { success: true };
    }),

  getOrders: adminProcedure
    .input(z.object({ filtre: z.string() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const filter: any = {};
      if (input.filtre === "new") filter.state = "new";
      else if (input.filtre === "confirmed") filter.state = "confirmed";
      else if (input.filtre === "canceled") filter.state = "canceled";

      const orders = await Orders.find(filter)
        .populate("productId") // populate product info in order
        .exec();
      return orders;
    }),

  updateOrder: adminProcedure
    .input(z.object({ id: z.string(), newState: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

      const updated = await Orders.findByIdAndUpdate(
        input.id,
        { state: input.newState },
        { new: true }
      );
      if (!updated) throw new TRPCError({ code: "BAD_REQUEST" });
      return { success: true };
    }),
    
getProductByCat: publicProcedure
  .input(z.object({ catId: z.string() }))
  .query(async ({ input }) => {
    const { catId } = input;

    if (!catId || typeof catId !== 'string') {
      throw new Error("Invalid categoryId");
    }

    const products = await Products.find({ 
      catId: new mongoose.Types.ObjectId(catId), 
      state: true 
    })
    .populate("catId")
    .sort({ createdAt: -1 });

    return products;
  }),


getProductData: publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    const product = await Products.findById(input.id).populate("catId");

    if (!product) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
    }

    return product;
  }),

  getHomeProducts: publicProcedure
  .input(z.object({ cat: z.string().optional() }))
  .query(async ({ input }) => {
    const filter: any = { state: true };

    if (input.cat && input.cat !== "all") {
      filter.catId = new mongoose.Types.ObjectId(input.cat);
    }

    const products = await Products.find(filter)
      .populate("catId")
      .sort({ createdAt: -1 });

    return products;
  }),




  addComment: publicProcedure
  .input(
    z.object({
      productId: z.string(),
      userName: z.string(),
      text: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    // Validate productId format?
    if (!input.productId || !input.userName || !input.text) {
      throw new TRPCError({ code: "BAD_REQUEST" });
    }

    const comment = new Comments({
      productId: new mongoose.Types.ObjectId(input.productId),
      userName: input.userName,
      text: input.text,
      createdAt: new Date(),
    });

    await comment.save();
    return { success: true };
  }),

deleteComment: adminProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });

    const deleted = await Comments.findByIdAndDelete(input.id);
    if (!deleted) throw new TRPCError({ code: "BAD_REQUEST" });

    return { success: true };
}),


  getComments: publicProcedure
  .input(z.object({ productId: z.string() }))
  .query(async ({ input }) => {
    if (!input.productId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Product ID required" });
    }

    const comments = await Comments.find({ 
      productId: new mongoose.Types.ObjectId(input.productId) 
    })
    .sort({ createdAt: -1 }); // newest first

    return comments;
  }),


  
getRecentComments: publicProcedure.query(async () => {
  const recentComments = await Comments.find()
    .sort({ createdAt: -1 }) // newest first
    .limit(5)
    .populate({
      path: "productId",
      select: "title", // only fetch the title
      model: "Product",
    });

  return recentComments.map((comment) => {
    const product = comment.productId as { _id: string; title: string };

    return {
      _id: comment._id,
      text: comment.text,
      userName: comment.userName,
      createdAt: comment.createdAt,
      product: {
        id: product._id,
        title: product.title,
      },
    };
  });
})





  });





export type AppRouter = typeof appRouter;
