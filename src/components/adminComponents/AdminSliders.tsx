import React from "react";
import AdminMaxWidthWrapper from "./AdminMaxWidthWrapper";
import { IoMdAddCircleOutline } from "react-icons/io";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/app/_trpc/client";
import { RiDeleteBinLine } from "react-icons/ri";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // <-- new spinner import
import AdminNewSliderDialog from "./AdminNewSliderDialog";
import { toast } from "@/hooks/use-toast";

const AdminSliders = () => {
  const utils = trpc.useUtils();
  const { data: sliders, isLoading } = trpc.getSliders.useQuery();
  const { mutate: deleteSlider } = trpc.deleteSlider.useMutation({
    onSuccess: () => {
      utils.getSliders.invalidate();

      return toast({
        title: "Slider deleted.",
        description: "The slider has been deleted.",
        variant: "success",
      });
    },
    onError: () => {
      return toast({
        title: "Operation failed",
        variant: "destructive",
      });
    },
  });
  const handleDelete = (id: string) => {
    deleteSlider({ id: id });
  };
  return (
    <AdminMaxWidthWrapper>
      <div className="flex flex-col w-full text-primary-foreground items-center justify-center">
        <div className="flex flex-row gap-2 w-full items-start justify-between">
          <div className="flex flex-col w-full bg-muted text-muted-foreground min-h-96 border border-primary-foreground rounded-lg p-4">
            <div className="flex flex-row w-full items-start justify-between">
              <div className="flex flex-col w-full">
                <h2 className="text-primary text-xl font-bold">Sliders list</h2>
                <h2 className="text-sm font-normal mb-4">Browse all sliders</h2>
              </div>
              <AdminNewSliderDialog>
                <div className="flex flex-row gap-1 bg-primary text-secondary cursor-pointer rounded-lg p-2 items-center justify-center text-nowrap font-medium">
                  <IoMdAddCircleOutline className="size-6" />
                </div>
              </AdminNewSliderDialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-full font-semibold">
                    Slider title
                  </TableHead>
                  <TableHead className="text-right min-w-[100px] font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sliders
                  ? sliders.map((slider) => (
                    <TableRow key={slider._id}>
                      <TableCell className="font-medium">
                        {slider.title}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-row gap-2 items-center justify-end">
                          <RiDeleteBinLine
                            className="size-6  cursor-pointer text-red-500"
                            onClick={() => handleDelete(slider.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                  : null}
              </TableBody>
            </Table>
            {isLoading ? (
              <div className="flex flex-col w-full items-center justify-center p-4">
                <AiOutlineLoading3Quarters className="size-16 animate-spin" />
                <h3 className="text-muted-foreground text-xs">Loading...</h3>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminMaxWidthWrapper>
  );
};

export default AdminSliders;
