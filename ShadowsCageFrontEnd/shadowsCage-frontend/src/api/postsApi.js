
import api from "./axios";

export const getPosts = async (search = "") => {
  const response = await api.get("posts/public/", {
    params: search.trim() ? { search: search.trim() } : {},
  });

  return response.data.results || response.data;
};

export const getPost = async (id) => {
  const response = await api.get(`posts/${id}/`);
  return response.data;
};
