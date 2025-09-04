declare module 'cloudinary' {
  type CloudinaryConfig = {
    cloud_name: string
    api_key: string
    api_secret: string
    secure?: boolean
  }

  type UploadStreamOptions = {
    folder?: string
    resource_type?: 'image' | 'video' | 'raw' | 'auto'
    allowed_formats?: string[]
    transformation?: Array<Record<string, unknown>>
    [key: string]: unknown
  }

  type UploadResult = {
    public_id: string
    version: number
    signature: string
    width: number
    height: number
    format: string
    resource_type: string
    created_at: string
    tags: string[]
    bytes: number
    type: string
    etag: string
    placeholder: boolean
    url: string
    secure_url: string
    access_mode: string
    original_filename: string
    [key: string]: unknown
  }

  type DestroyResult = {
    result: 'ok' | 'not found' | string
    [key: string]: unknown
  }

  export const v2: {
    config: (config: CloudinaryConfig) => void

    uploader: {
      upload_stream: (
        options: UploadStreamOptions,
        callback: (error: Error | null, result: UploadResult) => void
      ) => NodeJS.WritableStream
      
      destroy: (
        publicId: string, 
        callback: (error: Error | null, result: DestroyResult) => void
      ) => void
    }
  }

  export interface UploadStream extends NodeJS.WritableStream {
    on(event: 'error', callback: (error: Error) => void): this
    on(event: 'end', callback: () => void): this
    on(event: string, callback: (...args: any[]) => void): this
  }
}
