import axios from "axios";

const baseUrl = "/api/persons";

const getAll = async () => {
  const resp = await axios.get(baseUrl);
  return resp.data;
};

const create = async data => {
  const resp = await axios.post(baseUrl, data);
  return resp.data;
};

const del = id => axios.delete(baseUrl + "/" + id);

const put = async (id, data) => {
  const resp = await axios.put(baseUrl + "/" + id, data);
  return resp.data;
};

export default { getAll, create, del, put };
