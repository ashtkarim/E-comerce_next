import React, { useState } from "react";
import AdminMaxWidthWrapper from "./AdminMaxWidthWrapper";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IoMdAddCircleOutline } from "react-icons/io";
import AdminNewProductDialog from "./AdminNewProductDialog";
import { trpc } from "@/app/_trpc/client";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // replaced loader
import { MdOutlineEdit } from "react-icons/md"; // replaced edit icon
import { RiDeleteBinLine } from "react-icons/ri";
import { toast } from "@/hooks/use-toast";
import AdminProductEditDialog from "./AdminProductEditDialog";
import { productType } from "@/types/types";

const AdminProductsList = () => {
  const utils = trpc.useUtils();
  const [editState, setEditState] = useState(false);
  const [productOnEdit, setProductOnEdit] = useState<productType | undefined>();
  const { data: products, isLoading } = trpc.getAdminProducts.useQuery();
  const { mutate: deleteProduct } = trpc.deleteProduct.useMutation({
    onSuccess: () => {
      utils.getAdminProducts.invalidate();
      toast({
        title: "Product deleted.",
        description: "The product has been deleted.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Operation failed.",
        description: "Please refresh the page and retry.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteProduct({ id });
  };
  const handleEdit = (product: productType) => {
    setProductOnEdit(product);
    setEditState(true);
  };

  return (
    <AdminMaxWidthWrapper>
      {editState && productOnEdit ? (
        <AdminProductEditDialog
          dialogState={editState}
          product={productOnEdit}
          setEditState={setEditState}
          setProductOnEdit={setProductOnEdit}
        />
      ) : null}
      <div className="flex flex-col w-full text-primary-foreground items-center justify-center">
        <div className="flex flex-row gap-2 w-full items-start justify-between">
          <div className="flex flex-col w-full bg-muted border border-primary-foreground rounded-lg p-4 text-muted-foreground min-h-96">
            <div className="flex flex-row w-full items-start justify-between">
              <div className="flex flex-col w-full">
                <h2 className="font-bold text-xl text-primary">Product list</h2>
                <h2 className="text-muted-foreground text-sm font-normal mb-4">
                  Browse all products
                </h2>
              </div>
              <div className="flex flex-row gap-2">
                <AdminNewProductDialog>
                  <div className="flex bg-primary text-secondary cursor-pointer rounded-lg px-2 items-center justify-center">
                    <IoMdAddCircleOutline className="w-6 h-6" />
                  </div>
                </AdminNewProductDialog>

                {/* Filter select placeholder, no action yet */}
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>States</SelectLabel>
                      <SelectItem value="actif">Active products</SelectItem>
                      <SelectItem value="hidden">Hidden products</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <thead>
                <TableRow>
                  <TableHead className="w-full font-semibold">Product title</TableHead>
                  <TableHead className="text-nowrap min-w-[100px] text-center font-semibold">
                    Price
                  </TableHead>
                  <TableHead className="text-nowrap min-w-[100px] text-center font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-nowrap min-w-[100px] text-center font-semibold">
                    Show in home page
                  </TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell className="font-medium">{product.title}</TableCell>
                    <TableCell className="text-center">{product.price}</TableCell>
                    <TableCell className="text-center">
                      {product.state ? "active" : "hidden"}
                    </TableCell>
                    <TableCell className="text-center">
                      {product.showcase ? "Yes" : "No"}
                    </TableCell>
                    {/* <TableCell className="text-center">{product._count?.orders ?? 0}</TableCell> */}

                    <TableCell className="text-right">
                      <div className="flex flex-row gap-2 items-center justify-end">
                        <MdOutlineEdit
                          aria-label="Edit product"
                          className="w-6 h-6 cursor-pointer text-blue-500"
                          onClick={() => handleEdit(product)}
                        />
                        <RiDeleteBinLine
                          aria-label="Delete product"
                          className="w-6 h-6 cursor-pointer text-red-500"
                          onClick={() => handleDelete(product._id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {isLoading && (
              <div className="flex flex-col w-full items-center justify-center p-4">
                <AiOutlineLoading3Quarters className="w-16 h-16 animate-spin" />
                <h3 className="text-muted-foreground text-xs">Loading...</h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminMaxWidthWrapper>
  );
};

export default AdminProductsList;
