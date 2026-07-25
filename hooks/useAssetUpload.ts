import { useState } from 'react';
import type { AdminAsset } from '@/lib/content/admin-data';
import { readJsonRecord, readJsonString } from '@/lib/http/json-response';

interface UseAssetUploadProps {
  onUploaded: (newAssets: AdminAsset[]) => void;
  showToast: (msg: string, type: 'success' | 'error') => void;
}

export function useAssetUpload({ onUploaded, showToast }: UseAssetUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFilesSelected(e.target.files);
    }
  };

  // Concurrency controlled file uploader (Max 4 parallel uploads)
  const handleFilesSelected = async (fileList: FileList) => {
    const filesArray = Array.from(fileList);
    if (filesArray.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    const failedFiles: string[] = [];
    const uploadedAssets: AdminAsset[] = [];

    const queue = [...filesArray];

    const uploadSingleFile = async (file: File) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const defaultTitle = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const defaultAssetType = file.type.startsWith('image/') ? 'image' : 'misc';

        formData.append('title', defaultTitle);
        formData.append('altText', '');
        formData.append('assetType', defaultAssetType);
        formData.append('folder', 'misc');

        const response = await fetch('/api/admin/assets/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await readJsonRecord(response);
          throw new Error(
            readJsonString(errData, 'error') || '上传请求失败'
          );
        }

        const result = await readJsonRecord(response);
        successCount++;

        const newAsset: AdminAsset = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          bucket: 'public-assets',
          object_path: readJsonString(result, 'objectPath') || '',
          asset_type: defaultAssetType,
          title: defaultTitle,
          alt_text: '',
          file_name: file.name,
          public_url: readJsonString(result, 'publicUrl') || '',
          source_path: '',
          file_size_bytes: file.size,
          created_at: new Date().toISOString(),
        };
        uploadedAssets.push(newAsset);
      } catch (err: any) {
        console.error(err);
        failedFiles.push(`${file.name} (${err.message || '未知错误'})`);
      }
    };

    const worker = async () => {
      while (queue.length > 0) {
        const file = queue.shift();
        if (file) {
          await uploadSingleFile(file);
        }
      }
    };

    // Spawn 4 concurrent upload workers
    const workers = Array.from({ length: Math.min(4, filesArray.length) }, () => worker());
    await Promise.all(workers);

    // Refresh display
    if (uploadedAssets.length > 0) {
      onUploaded(uploadedAssets);
    }

    setIsUploading(false);

    if (failedFiles.length === 0) {
      showToast(`成功上传了 ${successCount} 个文件`, 'success');
    } else {
      showToast(
        `${successCount} 个文件上传成功，${failedFiles.length} 个失败。\n失败原因: ${failedFiles.join(', ')}`,
        'error'
      );
    }
  };

  return {
    isUploading,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileInput,
  };
}
export default useAssetUpload;
