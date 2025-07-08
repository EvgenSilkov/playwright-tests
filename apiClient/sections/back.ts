import { APIRequestContext, APIResponse } from "@playwright/test";

// wrapper to ease unwrapping of responses
import { jsonOrRawResponse } from "../wrappers";

// imported from developers code directly
import { ICategory } from "../../git_module_shared/types/category.types";
import { IProduct } from "../../git_module_shared/types/product.types";

export function getBackClient(context: APIRequestContext, backURL: string, token: string) {
  return {
    favorites: {
      get: function (options = {}) {
        return context
          .get(`${backURL}/favorite-products`, {
            headers: { Authorization: `Bearer ${token}` },
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
      deleteAll: function (options = {}) {
        return context
          .delete(`${backURL}/favorite-products`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {},
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
      delete: function ({ id, ...options }) {
        return context
          .delete(`${backURL}/favorite-products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {},
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
      add: function ({ id, ...options }) {
        return context
          .post(`${backURL}/favorite-products`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { productId: id },
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
    },
    categories: {
      getCategories: function (options = {}): Promise<ICategory[] | APIResponse> {
        return context
          .post(`${backURL}/categories/get-categories`, {
            data: {},
            headers: { Authorization: `Bearer ${token}` },
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
    },
    produts: {
      get: function ({ url, ...options }: { url: string }) {
        return context
          .get(`${backURL}/products/${url}`, {
            headers: { Authorization: `Bearer ${token}` },
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
      getNew: function (options = {}): Promise<IProduct[]> {
        return context
          .post(`${backURL}/products/new-products`, {
            data: {},
            headers: { Authorization: `Bearer ${token}` },
            ...options,
          })
          .then(jsonOrRawResponse(arguments));
      },
    },
  };
}
