"use client";
import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { trpc } from "@/app/_trpc/client";
import HomeProductsCards from "./HomeProductsCards";
import LoaderPage from "./LoaderPage";

const HomeProducts = () => {
  const { data: categories, isLoading } = trpc.getCategories.useQuery();
  return (
    <section className="py-12 md:py-16 lg:py-20 space-y-8">
      {categories ? (
        categories
          // .filter((c) => c._count.products !== 0)
          .map((cat) => (
            <div
              key={cat.id}
              className="container px-4 md:px-6 items-center justify-center mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">{cat.title} Products</h2>
                  <p className="text-muted-foreground">
                    Discover our latest and greatest products.
                  </p>
                </div>
                <Link
                  href={`/category/${cat._id}`}
                  className="mt-4 md:mt-0"
                  prefetch={false}
                >
                  <Button variant="outline">View More</Button>
                </Link>
              </div>
              <HomeProductsCards cat={cat._id} />
            </div>
          ))
      ) : isLoading ? (
        <LoaderPage />
      ) : null}
    </section>
  );
};

export default HomeProducts;
