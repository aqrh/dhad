import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { randomUUID } from 'node:crypto';

@Injectable()
export class R2StorageService {
  private readonly bucket =
    this.requireEnv('R2_BUCKET');

  private readonly publicBaseUrl =
    this.requireEnv(
      'R2_PUBLIC_BASE_URL',
    ).replace(/\/+$/, '');

  private readonly client =
    new S3Client({
      region: 'auto',

      endpoint:
        `https://${this.requireEnv(
          'R2_ACCOUNT_ID',
        )}.r2.cloudflarestorage.com`,

      credentials: {
        accessKeyId:
          this.requireEnv(
            'R2_ACCESS_KEY_ID',
          ),

        secretAccessKey:
          this.requireEnv(
            'R2_SECRET_ACCESS_KEY',
          ),
      },
    });

  async uploadProductImage(
    productId: number,
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Image file is required',
      );
    }

    const extension =
      this.extensionForMime(
        file.mimetype,
      );

    if (!extension) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed',
      );
    }

    const key =
      `products/${productId}/${randomUUID()}.${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType:
          file.mimetype,

        CacheControl:
          'public, max-age=31536000, immutable',
      }),
    );

    return {
      key,
      url:
        `${this.publicBaseUrl}/${key}`,
    };
  }

  async deleteByPublicUrl(
    url: string,
  ) {
    const prefix =
      `${this.publicBaseUrl}/`;

    /*
     * Old local/external images should
     * not be deleted from R2.
     */
    if (
      !url.startsWith(prefix)
    ) {
      return;
    }

    const key =
      url.slice(
        prefix.length,
      );

    if (!key) {
      return;
    }

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private extensionForMime(
    mime: string,
  ) {
    switch (mime) {
      case 'image/jpeg':
        return 'jpg';

      case 'image/png':
        return 'png';

      case 'image/webp':
        return 'webp';

      default:
        return null;
    }
  }

  private requireEnv(
    name: string,
  ) {
    const value =
      process.env[name];

    if (!value) {
      throw new Error(
        `${name} is not configured`,
      );
    }

    return value;
  }
}