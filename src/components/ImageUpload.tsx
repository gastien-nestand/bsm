"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
    value?: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
}

export default function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image must be less than 5MB");
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Upload failed");
            }

            const data = await response.json();
            onChange(data.url);
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to upload image");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            {value ? (
                <div className="relative">
                    <img
                        src={value}
                        alt="Product"
                        className="w-full h-64 object-cover rounded-lg border"
                    />
                    {onRemove && (
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={onRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-muted/50">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                        Upload product image (JPG, PNG, WebP - max 5MB)
                    </p>
                    <Input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                        id="image-upload"
                    />
                    <label htmlFor="image-upload">
                        <Button type="button" disabled={uploading} asChild>
                            <span className="cursor-pointer">
                                {uploading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Choose Image
                                    </>
                                )}
                            </span>
                        </Button>
                    </label>
                </div>
            )}
        </div>
    );
}
