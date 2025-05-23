"use client";
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
import { trpc } from "@/app/_trpc/client";
import { GiCancel, GiConfirmed } from "react-icons/gi";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // updated loader icon
import { toast } from "@/hooks/use-toast";

const AdminOrders: React.FC = () => {
  const [filtre, setFiltre] = useState("new");
  const utils = trpc.useUtils();
  const { data: orders, isLoading } = trpc.getOrders.useQuery({ filtre });
  const { mutate: update } = trpc.updateOrder.useMutation({
    onSuccess: () => {
      utils.getOrders.invalidate();

      toast({
        title: "Order updated.",
        description: "The order has been updated.",
        variant: "success",
      });
    },
    onError: () => {
      toast({
        title: "Operation failed",
        variant: "destructive",
      });
    },
  });

  const handleOrder = (id: string, newState: string) => {
    update({ id, newState });
  };

  return (
    <AdminMaxWidthWrapper>
      <div className="flex flex-col w-full text-primary-foreground items-center justify-center">
        <div className="flex flex-row gap-2 w-full items-start justify-between">
          <div className="flex flex-col w-full border border-primary rounded-lg p-4 bg-muted text-muted-foreground min-h-96">
            <div className="flex flex-row w-full items-start justify-between">
              <div className="flex flex-col w-full">
                <h2 className="text-primary font-bold text-xl">Order list</h2>
                <h2 className="text-muted-foreground text-sm font-normal mb-4">
                  Browse {filtre} orders
                </h2>
              </div>
              <Select onValueChange={setFiltre}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>States</SelectLabel>
                    <SelectItem value="new">New orders</SelectItem>
                    <SelectItem value="confirmed">Confirmed orders</SelectItem>
                    <SelectItem value="canceled">Canceled orders</SelectItem>
                    <SelectItem value="all">All orders</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <thead>
                <TableRow className="font-semibold">
                  <TableHead className="min-w-[100px] font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Client name</TableHead>
                  <TableHead className="font-semibold">Client phone</TableHead>
                  <TableHead className="font-semibold">Client address</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </thead>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium whitespace-nowrap">
                      {order.productId?.title}
                    </TableCell>
                    <TableCell>{order.clientName}</TableCell>
                    <TableCell>{order.clientPhone}</TableCell>
                    <TableCell>{order.clientAdress}</TableCell>
                    <TableCell>
                      <div
                        className={`text-primary font-semibold flex rounded-lg px-2 py-1 items-center justify-center w-[120px] whitespace-nowrap ${order.state === "new"
                          ? "bg-blue-500"
                          : order.state === "canceled"
                            ? "bg-red-500"
                            : "bg-green-500"
                          }`}
                      >
                        {order.state}
                      </div>
                    </TableCell>
                    <TableCell className="text-right flex flex-row gap-2 justify-end">
                      <GiConfirmed
                        onClick={() => handleOrder(order._id, "confirmed")}
                        className="w-6 h-6 text-green-500 cursor-pointer"
                      />
                      <GiCancel
                        onClick={() => handleOrder(order._id, "canceled")}
                        className="w-6 h-6 text-red-500 cursor-pointer"
                      />
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

export default AdminOrders;
