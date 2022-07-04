/* eslint-disable @typescript-eslint/no-var-requires */
import * as fs from 'fs';
const mime = require('mime');

//file sera la cadena de base64 del archivo
export const from_base64_to = (
  auth0_id: string,
  file: string,
): object | undefined => {
  try {
    const matches = file.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/); //me retorna la cadena de base65 dividida en array para poder manejarla
    console.log(matches!.length);
    if (matches!.length != 3) throw new Error('Invalid format');

    const file_params = {
        type: matches![1], //el tipo de archivo: JPG,PNG etc
        data: Buffer.from(matches![2], 'base64'), //la base64
      },
      extension = mime.extension(file_params.type),
      //le ponemos el id del usuario como nombre + la fecha del cambio
      file_name = `${auth0_id}-${Date.now()}.` + extension, //12124232.jpg
      file_path = './src/uploads/' + file_name; //tomo como base la carpeta del proyecto aunque este archivo no esté en ella

    fs.writeFileSync(file_path, file_params.data, 'utf8');

    return {
      //objeto con la ubicacion dentro del servidor y al nombre del archivo
      file_path,
      file_name,
    };
  } catch (err) {
    console.log(err);
  }
};
