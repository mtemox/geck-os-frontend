import axios from "axios";
import { sileo } from "sileo";

export function useFetch() {

    const fetchDataBackend = async (url, data = null, method = "GET", headers = {}) => {
        
        const options = {
            method,
            url,
            headers: {
                ...headers, 
            },
        };

        if (data && Object.keys(data).length > 0) {
            options.headers["Content-Type"] = "application/json";
            options.data = data;
        }

        // 1. Creamos la promesa
        const fetchPromise = new Promise(async (resolve, reject) => {
            try {
                const response = await axios(options);
                resolve(response);
            } catch (error) {
                console.error("Error en useFetch:", error);
                const errorMsg = error.response?.data?.msg || "Error de conexión con el servidor";
                reject(new Error(errorMsg));
            }
        });

        // 2. Le inyectamos Sileo
        sileo.promise(fetchPromise, {
            loading: { title: "Procesando solicitud..." },
            // Extrae el mensaje de respuesta de Axios, si existe.
            success: (res) => ({ title: res.data?.msg || "Operación exitosa" }),
            error: (err) => ({ title: err.message })
        });

        try {
            const response = await fetchPromise;
            return response?.data;
        } catch (error) {
            throw error; // Lanzamos para que los componentes lo atrapen si lo necesitan
        }
    }
    
    return fetchDataBackend;
}