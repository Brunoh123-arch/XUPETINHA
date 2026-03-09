import { createClient } from '@/lib/supabase/client'

export interface UploadOptions {
  bucket?: string
  folder?: string
  fileName?: string
  contentType?: string
  cacheControl?: string
  upsert?: boolean
}

export interface UploadResult {
  url: string | null
  path: string | null
  error: string | null
}

class StorageService {
  private supabase = createClient()
  private defaultBucket = 'uppi-storage'

  async uploadFile(file: File, options?: UploadOptions): Promise<UploadResult> {
    try {
      const bucket = options?.bucket || this.defaultBucket
      const folder = options?.folder || ''
      const fileName = options?.fileName || this.generateFileName(file)
      const path = folder ? `${folder}/${fileName}` : fileName

      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(path, file, {
          contentType: options?.contentType || file.type,
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert ?? false,
        })

      if (error) {
        console.error('Upload error:', error)
        return { url: null, path: null, error: error.message }
      }

      const { data: urlData } = this.supabase.storage.from(bucket).getPublicUrl(path)
      return { url: urlData.publicUrl, path: data.path, error: null }
    } catch (error: any) {
      console.error('Upload file error:', error)
      return { url: null, path: null, error: error.message }
    }
  }

  async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      folder: `avatars/${userId}`,
      fileName: `avatar_${Date.now()}.${this.getFileExtension(file)}`,
      upsert: true,
    })
  }

  async uploadRideRecording(file: File, rideId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      folder: `recordings/${rideId}`,
      fileName: `recording_${Date.now()}.${this.getFileExtension(file)}`,
    })
  }

  async uploadDriverDocument(file: File, driverId: string, documentType: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      folder: `documents/${driverId}`,
      fileName: `${documentType}_${Date.now()}.${this.getFileExtension(file)}`,
      upsert: true,
    })
  }

  async uploadChatImage(file: File, rideId: string): Promise<UploadResult> {
    return this.uploadFile(file, {
      bucket: this.defaultBucket,
      folder: `chat/${rideId}`,
      fileName: `image_${Date.now()}.${this.getFileExtension(file)}`,
    })
  }

  async deleteFile(path: string, bucket?: string): Promise<{ error: string | null }> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket || this.defaultBucket)
        .remove([path])
      if (error) {
        console.error('Delete error:', error)
        return { error: error.message }
      }
      return { error: null }
    } catch (error: any) {
      console.error('Delete file error:', error)
      return { error: error.message }
    }
  }

  getPublicUrl(path: string, bucket?: string): string {
    const { data } = this.supabase.storage
      .from(bucket || this.defaultBucket)
      .getPublicUrl(path)
    return data.publicUrl
  }

  async downloadFile(path: string, bucket?: string): Promise<Blob | null> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket || this.defaultBucket)
        .download(path)
      if (error) {
        console.error('Download error:', error)
        return null
      }
      return data
    } catch (error: any) {
      console.error('Download file error:', error)
      return null
    }
  }

  async listFiles(folder?: string, bucket?: string) {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket || this.defaultBucket)
        .list(folder || '', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        })
      if (error) {
        console.error('List files error:', error)
        return { files: [], error: error.message }
      }
      return { files: data, error: null }
    } catch (error: any) {
      console.error('List files error:', error)
      return { files: [], error: error.message }
    }
  }

  private generateFileName(file: File): string {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const extension = this.getFileExtension(file)
    return `${timestamp}_${randomString}.${extension}`
  }

  private getFileExtension(file: File): string {
    const parts = file.name.split('.')
    return parts.length > 1 ? parts[parts.length - 1] : 'jpg'
  }

  validateFileSize(file: File, maxSize: number = 5 * 1024 * 1024): boolean {
    return file.size <= maxSize
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.split('/')[0] + '/')
      }
      return file.type === type
    })
  }
}

export const storageService = new StorageService()
