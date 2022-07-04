import { Request } from 'express';

//los crea los links para la paginacion automatica-----------------------------
const create_links = (
  total_pages: number,
  complete_url: string,
  param: string,
): object => {
  const page_number: number = parseInt(param.split('=')[1] || '1');
  let next = '',
    last = '',
    prev = '',
    first = '';

  if (page_number > 0 && page_number < total_pages) {
    next = complete_url.replace(/page=\d{1,}/g, `page=${page_number + 1}`);
    last = complete_url.replace(/page=\d{1,}/g, `page=${total_pages}`);
  }
  if (page_number > 1) {
    prev = complete_url.replace(/page=\d{1,}/g, `page=${page_number - 1}`);
    first = complete_url.replace(/page=\d{1,}/g, `page=1`);
  }
  //los links
  return {
    next: next,
    last: last,
    prev: prev,
    self: complete_url,
    first: first,
  };
};

//PAGINAR LA DATA RECIBIDA--------------------------------------------------
export const paginated_data = (
  pag: number,
  siz: number,
  data_array: Array<any>,
  req: Request,
): any => {
  //si no me pasan el numero de pagina sera la 1
  const page = pag || 1,
    size = siz || 10,
    start = (page - 1) * size,
    estimated_pages = data_array.length / size;

  let total_pages: number;
  //hacemos los redondeos necesarios para el calculo de paginas totales
  if (estimated_pages > 0 && estimated_pages < 1)
    total_pages = Math.ceil(estimated_pages);
  else total_pages = Math.floor(estimated_pages);
  //modificamos la url para noseque con los parametros
  let url = req.url.replace(/^(\/([a-z]{1,})?(\?))/, '?'),
    complete_url = '',
    params: string[] = url.split('&'),
    links: object = {};
  //le pone a la url el parametro page si no lo tenia para las demas url de los links
  if (!params.some((element) => /page=\d{1,}/g.test(element))) {
    if (url.includes('?')) url = url.concat('&page=1');
    else url = url.concat('?page=1');
    params = url.split('&');
  }
  //creamos los links automaticamente
  for (let i = 0; i < params.length; i++) {
    if (
      (!params[i].includes('page') && i === params.length) ||
      params[i].includes('page')
    ) {
      complete_url = req.originalUrl.split('?')[0].concat(url);
      links = create_links(total_pages, complete_url, params[i]);
    }
  }
  //Tenemos echa la paginacion correctamente como lo manda Dios
  const msg = {
    data: data_array.slice(start, start + size),
    meta: {
      current_page: page,
      page_size: size,
      total_elements: data_array.length,
      total_pages,
      links,
    },
  };

  return msg;
};
