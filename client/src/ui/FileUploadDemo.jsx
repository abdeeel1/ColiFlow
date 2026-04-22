import { FileUpload } from "@/components/ui/file-upload";

export function FileUploadDemo({ header, description, value, onChange }) {

  const handleFileUpload = (uploadedFiles) => {
    onChange?.(uploadedFiles);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white rounded-lg">
      <FileUpload
        onChange={handleFileUpload}
        header={header}
        description={description}
      />
    </div>
  );
}