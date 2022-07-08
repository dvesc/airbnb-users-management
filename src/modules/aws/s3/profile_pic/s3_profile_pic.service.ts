/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
require('dotenv').config();

@Injectable()
export class S3_profile_pic_services {
  private bucket_name: string;
  private s3: AWS.S3;

  //CONSTURCTOR----------------------------------------------------------------
  constructor(private config_service: ConfigService) {
    this.bucket_name = this.config_service.get(
      'aws.s3.buckets.profile_pic.name',
    );
    this.s3 = new AWS.S3({
      region: this.config_service.get('aws.credentials.region'),
      accessKeyId: this.config_service.get('aws.credentials.key'),
      secretAccessKey: this.config_service.get('aws.credentials.secret_key'),
    });
  }

  upload_to_bucket = async (file: any): Promise<any> => {
    const file_stream = await fs.createReadStream(file.file_path),
      upload_params = {
        Bucket: this.bucket_name,
        Body: file_stream,
        Key: file.file_name,
      } as AWS.S3.PutObjectRequest;
    console.log(this.bucket_name);
    const file_uploaded = await this.s3.upload(upload_params).promise(); //subimos el archivo al bucket

    console.log(file_uploaded);
    fs.unlink(file.file_path, (err) => {
      //y luego eliminamos dicho archivo del servidor
      if (err) console.log('');
    });

    return file_uploaded;
  };

  //OBTENER UN ARCHIVO DEL BUCKET----------------------------------------------------
  get_signed_url = async (file_key: string): Promise<string> => {
    const url_params = {
      Bucket: this.bucket_name,
      Expires: 60, //en segundos OJO
      Key: file_key,
    };

    const signed_url = await this.s3.getSignedUrlPromise(
      'getObject',
      url_params,
    ); //la url firmada temporal

    return signed_url;
  };

  //ELIMINAR UN ARCHIVO DEL BUCKET--------------------------------------------------
  delete_file = async (file_key): Promise<boolean> => {
    let deleted_flag = false;
    const delete_params = {
      Bucket: this.bucket_name,
      Key: file_key,
    };

    try {
      await this.s3.headObject(delete_params).promise();
      console.log('File Found in S3');
      try {
        await this.s3.deleteObject(delete_params).promise();
        console.log('file deleted Successfully');
        deleted_flag = true;
      } catch (err) {
        console.log('ERROR in file Deleting : ' + JSON.stringify(err));
      }
    } catch (err) {
      console.log('File not Found ERROR : ' + err.code);
    }

    console.log(deleted_flag);

    return deleted_flag;
  };
}
