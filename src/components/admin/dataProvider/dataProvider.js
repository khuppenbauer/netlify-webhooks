import { fetchUtils } from 'react-admin';
import { stringify } from 'query-string';

const apiUrl = process.env.REACT_APP_API_BASE_URL;
const httpClient = fetchUtils.fetchJson;

export default {
  getList: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const sort = order === 'DESC' ? `-${field}` : field;
    const query = {
      sort,
      page,
      perPage,
      filter: JSON.stringify(params.filter),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => {
      if (!headers.has('X-Total-Count')) {
        throw new Error(
          'The X-Total-Count header is missing in the HTTP Response.',
        );
      }
      return {
        data: json.map(record => ({ id: record._id, ...record })),
        total: parseInt(
          headers
            .get('X-Total-Count')
            .split('/')
            .pop(),
          10,
        ),
      };
    });

  },

  getOne: (resource, params) => httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => ({
    data: json,
  })),

  getAggregation: (resource, params) => {
    const { query } = params;
    const url = `${apiUrl}/${resource}?query=${encodeURIComponent(JSON.stringify(query))}`;
    return httpClient(url).then(({ headers, json }) => {
      if (!headers.has('X-Total-Count')) {
        throw new Error(
          'The X-Total-Count header is missing in the HTTP Response.',
        );
      }
      return {
        data: json.map(record => ({ id: record._id, ...record })),
        total: parseInt(
          headers
            .get('X-Total-Count')
            .split('/')
            .pop(),
          10,
        ),
      };
    });
  },

  getMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;
    return httpClient(url).then(({ json }) => ({ data: json }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const query = {
      sort: order === 'desc' ? `-${field}` : field,
      page,
      perPage,
      filter: JSON.stringify({
        ...params.filter,
        [params.target]: params.id,
      }),
    };
    const url = `${apiUrl}/${resource}?${stringify(query)}`;

    return httpClient(url).then(({ headers, json }) => ({
      data: json,
      total: parseInt(headers.get('x-total-count').split('/').pop(), 10),
    }));
  },

  update: (resource, params) => httpClient(`${apiUrl}/${resource}/${params.id}`, {
    method: 'PUT',
    body: JSON.stringify(params.data),
  }).then(({ json }) => ({ data: json })),

  updateMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'PUT',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },

  create: (resource, params) => httpClient(`${apiUrl}/${resource}`, {
    method: 'POST',
    body: JSON.stringify(params.data),
  }).then(({ json }) => ({
    data: { ...params.data, id: json.id },
  })),

  delete: (resource, params) => httpClient(`${apiUrl}/${resource}/${params.id}`, {
    method: 'DELETE',
  }).then(({ json }) => ({ data: json })),

  deleteMany: (resource, params) => {
    const query = {
      filter: JSON.stringify({ id: params.ids }),
    };
    return httpClient(`${apiUrl}/${resource}?${stringify(query)}`, {
      method: 'DELETE',
      body: JSON.stringify(params.data),
    }).then(({ json }) => ({ data: json }));
  },
};
