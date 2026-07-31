import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { FiUploadCloud } from "react-icons/fi";
import { notifyError } from "@utils/toast";

const Uploader = ({ setImageUrl, imageUrl, multiple }) => {
  const [files, setFiles] = useState([]);
  const uploadUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL;
  const upload_Preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // console.log("imageUrl", imageUrl);
  // console.log("uploadUrl", uploadUrl);
  // console.log("upload_Preset", upload_Preset);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    multiple: multiple || false,
    maxSize: 1000000, //the size of image,
    onDrop: (acceptedFiles) => {
      // console.log("acceptedFiles", acceptedFiles);

      setFiles(
        acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
    },
  });

  const thumbs = files.map((file) => (
    <div key={file.name}>
      <div>
        <img
          className="inline-flex border-2 border-border w-24 max-h-24"
          src={file.preview}
          alt={file.name}
        />
      </div>
    </div>
  ));

  useEffect(() => {
    const uploadURL = uploadUrl;
    const uploadPreset = upload_Preset;
    if (files) {
      if (multiple && imageUrl?.length + files?.length > 4) {
        return notifyError(`Maximum 4 Image Can be Upload!`);
      }
      files.forEach((file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        axios({
          url: uploadURL,
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: formData,
        })
          .then((res) => {
            if (multiple) {
              setImageUrl((imgUrl) => [...imgUrl, res.data.secure_url]);
            } else {
              setImageUrl(res.data.secure_url);
            }
          })
          .catch((err) => console.log(err));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  return (
    <div className="w-full text-center">
      <div
        className="px-6 pt-5 pb-6 border-2 border-border border-dashed rounded-md cursor-pointer"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <span className="mx-auto flex justify-center">
          <FiUploadCloud className="text-3xl text-primary" />
        </span>
        <p className="text-sm mt-2">Drag your image here</p>
        <em className="text-xs text-muted-foreground">
          (Only *.jpeg and *.png images will be accepted)
        </em>
      </div>
      <aside className="flex flex-row flex-wrap mt-4">
        {multiple && imageUrl ? (
          imageUrl?.map((img, index) => (
            <img
              key={index + 1}
              className="inline-flex border rounded-md border-border w-24 max-h-24 p-2"
              src={img}
              alt="product"
            />
          ))
        ) : imageUrl ? (
          <img
            className="inline-flex border rounded-md border-border w-24 max-h-24 p-2"
            src={imageUrl}
            alt="product"
          />
        ) : (
          thumbs
        )}
      </aside>
    </div>
  );
};

export default Uploader;
