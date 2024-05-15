import axios from "axios";

const Api=axios.create({
    baseURL: "http://localhost:8000", //for localhost connection with FastAPI backend 
})

export default Api