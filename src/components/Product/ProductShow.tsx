import React, { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart, Package, MessageCircle } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import ProductNewOrderDialog from "./ProductNewOrderDialog";

const ProductShow = (props: { productId: string }) => {
  const { data: product } = trpc.getProductData.useQuery({
    id: props.productId,
  });

  // Fetch comments for this product
  const { data: comments, refetch: refetchComments, isLoading: commentsLoading } = trpc.getComments.useQuery(
    { productId: props.productId },
    { enabled: !!props.productId }
  );

  // Local state for new comment form
  const [productId, setProductId] = useState(props.productId)
  const [userName, setUserName] = useState("");
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);

  const addCommentMutation = trpc.addComment.useMutation({
    onSuccess() {
      setUserName("");
      setText("");
      refetchComments();
      setAdding(false);
    },
    onError() {
      alert("Failed to add comment");
      setAdding(false);
    },
  });

  const handleAddComment = () => {
    if (!userName.trim() || !text.trim()) {
      alert("Please enter your name and comment");
      return;
    }
    setAdding(true);
    addCommentMutation.mutate({
      productId: props.productId,
      userName: userName.trim(),
      text: text.trim(),
    });
  };

  return (
    <Card className="max-w-4xl mx-auto">
      {product ? (
        <CardContent className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative aspect-square">
              <Image
                src={product.imageLink}
                alt="Product Image"
                layout="fill"
                objectFit="cover"
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Badge variant="secondary">
                        {product.catId?.title}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{product.price} MAD</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{product.desc}</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {/* <span>Total orders: {product._count.orders}</span> */}
                </div>
                <ProductNewOrderDialog productId={props.productId}>
                  <Button className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" /> Buy now
                  </Button>
                </ProductNewOrderDialog>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <section className="mt-10">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Comments
            </h3>

            {/* Add Comment Form */}
            <div className="mb-6 space-y-3">
              <input
                type="text"
                placeholder="Your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full border rounded px-3 py-2"
                disabled={adding}
              />
              <textarea
                placeholder="Write your comment..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                className="w-full border rounded px-3 py-2"
                disabled={adding}
              />
              <Button onClick={handleAddComment} disabled={adding}>
                {adding ? "Adding..." : "Add Comment"}
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-80 overflow-y-auto border-t pt-4">
              {commentsLoading ? (
                <p>Loading comments...</p>
              ) : comments && comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className="border rounded p-3 bg-gray-50 dark:bg-gray-800"
                  >
                    <p className="font-semibold">{comment.userName}</p>
                    <p className="whitespace-pre-wrap">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p>No comments yet. Be the first to comment!</p>
              )}
            </div>
          </section>
        </CardContent>
      ) : null}
    </Card>
  );
};

export default ProductShow;
